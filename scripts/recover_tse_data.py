#!/usr/bin/env python3
import csv
import io
import json
import re
import sys
import unicodedata
import zipfile
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

MUNICIPIO = "ARAPONGAS"


def norm(value):
    value = str(value or "")
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.upper()
    value = re.sub(r"[^A-Z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def tokens(value):
    stop = {"DE", "DA", "DO", "DAS", "DOS", "E", "ESTADUAL", "MUNICIPAL", "ESCOLA", "COLEGIO", "CENTRO", "PROFESSOR", "PROFESSORA"}
    return {t for t in norm(value).split() if len(t) > 1 and t not in stop}


def sim(a, b):
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return 0.0
    seq = SequenceMatcher(None, na, nb).ratio()
    ta, tb = tokens(na), tokens(nb)
    jac = len(ta & tb) / max(1, len(ta | tb))
    contains = 1.0 if na in nb or nb in na else 0.0
    return 0.55 * seq + 0.35 * jac + 0.10 * contains


def first_csv_from_zip(path):
    zf = zipfile.ZipFile(path)
    names = [n for n in zf.namelist() if n.lower().endswith('.csv') and not n.startswith('__MACOSX/')]
    if not names:
        raise RuntimeError(f"Nenhum CSV encontrado em {path}")
    # Prefer the largest CSV if more than one file exists.
    name = max(names, key=lambda n: zf.getinfo(n).file_size)
    return zf, name


def csv_rows_from_zip(path):
    zf, name = first_csv_from_zip(path)
    raw = zf.open(name, 'r')
    text = io.TextIOWrapper(raw, encoding='latin-1', newline='')
    reader = csv.DictReader(text, delimiter=';')
    if not reader.fieldnames:
        raise RuntimeError(f"CSV sem cabeçalho em {path}")
    # Normalize BOM/spacing on header names while preserving values.
    reader.fieldnames = [str(h).replace('\ufeff', '').strip() for h in reader.fieldnames]
    for row in reader:
        yield {str(k).replace('\ufeff', '').strip(): v for k, v in row.items()}
    text.close()
    zf.close()


def get_field(row, *names):
    for name in names:
        if name in row:
            return row.get(name)
    normalized = {norm(k).replace(' ', '_'): k for k in row.keys()}
    for name in names:
        nk = norm(name).replace(' ', '_')
        if nk in normalized:
            return row.get(normalized[nk])
    return None


def int_value(value):
    s = re.sub(r'[^0-9-]', '', str(value or ''))
    try:
        return int(s or 0)
    except ValueError:
        return 0


def parse_app(path):
    text = Path(path).read_text(encoding='utf-8')
    c_start = text.index('candidates: {')
    l_start = text.index('locais:', c_start)
    candidate_block = text[c_start:l_start]
    cand_re = re.compile(
        r'"([^"]+)"\s*:\s*\{\s*name:\s*"([^"]+)"\s*,\s*party:\s*"([^"]*)"\s*,\s*category:\s*"([^"]*)"\s*,\s*type:\s*"([^"]+)"',
        re.M,
    )
    candidates = {}
    for key, name, party, category, typ in cand_re.findall(candidate_block):
        candidates[key] = {"name": name, "party": party, "category": category, "type": typ}

    loc_re = re.compile(r'\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*address:\s*"([^"]*)"', re.M)
    locations = [
        {"id": m.group(1), "name": m.group(2), "address": m.group(3)}
        for m in loc_re.finditer(text[l_start:])
    ]
    if len(locations) != 29:
        raise RuntimeError(f"Esperava 29 colégios no app.js, encontrei {len(locations)}")
    if len(candidates) < 40:
        raise RuntimeError(f"Lista de candidatos inesperadamente curta: {len(candidates)}")
    return candidates, locations


def load_tse_locations(zip_path):
    found = {}
    sample_headers = None
    for row in csv_rows_from_zip(zip_path):
        if sample_headers is None:
            sample_headers = list(row.keys())
        mun = get_field(row, 'NM_MUNICIPIO')
        if norm(mun) != MUNICIPIO:
            continue
        uf = get_field(row, 'SG_UF')
        if uf and norm(uf) != 'PR':
            continue
        nr = str(get_field(row, 'NR_LOCAL_VOTACAO') or '').strip()
        if not nr:
            continue
        name = get_field(row, 'NM_LOCAL_VOTACAO', 'DS_LOCAL_VOTACAO', 'NM_LOCAL') or ''
        address = get_field(row, 'DS_ENDERECO', 'DS_LOCAL_VOTACAO_ENDERECO', 'ENDERECO') or ''
        if nr not in found or len(str(name)) > len(found[nr]['name']):
            found[nr] = {"nr": nr, "name": str(name), "address": str(address)}
    return list(found.values()), sample_headers or []


def map_locations(system_locations, tse_locations):
    unused = {x['nr']: x for x in tse_locations}
    mappings = []
    # Exact normalized names first.
    for s in system_locations:
        exact = None
        for nr, t in unused.items():
            if norm(s['name']) == norm(t['name']):
                exact = nr
                break
        if exact:
            t = unused.pop(exact)
            mappings.append({**s, "nr": t['nr'], "tse_name": t['name'], "tse_address": t['address'], "score": 1.0})
        else:
            mappings.append({**s, "nr": None, "score": 0.0})

    for m in mappings:
        if m['nr'] is not None:
            continue
        best = None
        best_score = -1.0
        for nr, t in unused.items():
            name_score = sim(m['name'], t['name'])
            addr_score = sim(m['address'], t['address']) if m['address'] and t['address'] else 0.0
            score = 0.82 * name_score + 0.18 * addr_score
            if score > best_score:
                best_score = score
                best = nr
        if best is not None:
            t = unused.pop(best)
            m.update({"nr": t['nr'], "tse_name": t['name'], "tse_address": t['address'], "score": round(best_score, 4)})
    return mappings, list(unused.values())


def cargo_kind(ds):
    n = norm(ds)
    if 'DEPUTADO FEDERAL' in n:
        return 'dep_federal'
    if 'DEPUTADO ESTADUAL' in n:
        return 'dep_estadual'
    if 'VEREADOR' in n:
        return 'vereador'
    if 'PREFEITO' in n:
        return 'prefeito'
    return None


def aggregate_votes(zip_path, allowed_types):
    agg = {}
    sample_headers = None
    for row in csv_rows_from_zip(zip_path):
        if sample_headers is None:
            sample_headers = list(row.keys())
        if norm(get_field(row, 'NM_MUNICIPIO')) != MUNICIPIO:
            continue
        uf = get_field(row, 'SG_UF')
        if uf and norm(uf) != 'PR':
            continue
        kind = cargo_kind(get_field(row, 'DS_CARGO', 'NM_CARGO'))
        if kind not in allowed_types:
            continue
        nr_local = str(get_field(row, 'NR_LOCAL_VOTACAO') or '').strip()
        nr_votavel = str(get_field(row, 'NR_VOTAVEL', 'NR_CANDIDATO') or '').strip()
        nm_votavel = str(get_field(row, 'NM_VOTAVEL', 'NM_URNA_CANDIDATO', 'NM_CANDIDATO') or '').strip()
        votos = int_value(get_field(row, 'QT_VOTOS', 'QT_VOTOS_NOMINAIS'))
        if not nr_local or not nr_votavel:
            continue
        ident = (kind, nr_votavel, nm_votavel)
        if ident not in agg:
            agg[ident] = {"type": kind, "nr": nr_votavel, "name": nm_votavel, "total": 0, "by_local": defaultdict(int)}
        agg[ident]['total'] += votos
        agg[ident]['by_local'][nr_local] += votos
    return list(agg.values()), sample_headers or []


def match_candidate(candidate_key, candidate, records, year):
    typ = candidate['type']
    compatible = [r for r in records if r['type'] == ('vereador' if typ == 'suplente' else typ)]
    if year == 2024 and candidate_key.isdigit() and typ in {'vereador', 'suplente'}:
        exact = [r for r in compatible if str(r['nr']).lstrip('0') == str(candidate_key).lstrip('0')]
        if exact:
            return max(exact, key=lambda r: r['total']), 1.0
    best = None
    best_score = -1.0
    for r in compatible:
        score = sim(candidate['name'], r['name'])
        if score > best_score:
            best, best_score = r, score
    return best, best_score


def build_year(candidates, system_locations, vote_records, location_map, year, wanted_types):
    nr_by_clg = {m['id']: m['nr'] for m in location_map if m.get('nr')}
    recovered = {}
    report = {}
    for key, cand in candidates.items():
        if cand['type'] not in wanted_types:
            continue
        rec, score = match_candidate(key, cand, vote_records, year)
        if not rec:
            report[key] = {"name": cand['name'], "status": "not_found"}
            continue
        votes = {}
        for loc in system_locations:
            nr = nr_by_clg.get(loc['id'])
            votes[loc['id']] = int(rec['by_local'].get(nr, 0)) if nr else 0
        mapped_total = sum(votes.values())
        official_total = int(rec['total'])
        recovered[key] = {
            "name": cand['name'],
            "matched_name": rec['name'],
            "matched_number": rec['nr'],
            "match_score": round(score, 4),
            "official_total": official_total,
            "mapped_total": mapped_total,
            "votes": votes,
            "year": year,
        }
        report[key] = {
            "name": cand['name'],
            "matched_name": rec['name'],
            "matched_number": rec['nr'],
            "match_score": round(score, 4),
            "official_total": official_total,
            "mapped_total": mapped_total,
            "difference": official_total - mapped_total,
            "status": "ok" if official_total == mapped_total and score >= 0.55 else "review",
        }
    return recovered, report


def write_overlay(recovered, output_path, ready):
    compact = {}
    for key, item in recovered.items():
        compact[key] = {
            "total": item['official_total'],
            "year": item['year'],
            "votes": item['votes'],
        }
    data_json = json.dumps(compact, ensure_ascii=False, separators=(',', ':'))
    js = f"""(function(){{\n  'use strict';\n  if(window.__vfTseFullDataV19)return;window.__vfTseFullDataV19=true;\n  var READY={str(bool(ready)).lower()};\n  var DATA={data_json};\n  try{{\n    if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return;\n    Object.keys(DATA).forEach(function(key){{\n      var item=DATA[key];\n      var cand=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];\n      if(cand){{cand.officialTotal=item.total;cand.tseYear=item.year;cand.tseRecovered=true;}}\n      ELEICAO_2024_DATA.locais.forEach(function(loc){{\n        if(!loc.votes)loc.votes={{}};\n        if(Object.prototype.hasOwnProperty.call(item.votes,loc.id))loc.votes[key]=Number(item.votes[loc.id])||0;\n      }});\n    }});\n    window.__vfTseFullDataV19Ready=READY;\n    window.dispatchEvent(new CustomEvent('vf:tse-full-data',{{detail:{{ready:READY,candidates:Object.keys(DATA).length}}}}));\n  }}catch(e){{console.error('[Voto Forte] Falha ao aplicar base TSE recuperada',e);}}\n}})();\n"""
    Path(output_path).write_text(js, encoding='utf-8')


def main():
    if len(sys.argv) != 8:
        print('Uso: recover_tse_data.py app.js vote2024.zip vote2022.zip local2024.zip local2022.zip overlay.js report.json', file=sys.stderr)
        return 2
    app_path, v24, v22, l24, l22, overlay_path, report_path = sys.argv[1:]
    candidates, system_locations = parse_app(app_path)

    tse_loc24, headers_l24 = load_tse_locations(l24)
    tse_loc22, headers_l22 = load_tse_locations(l22)
    map24, unused24 = map_locations(system_locations, tse_loc24)
    map22, unused22 = map_locations(system_locations, tse_loc22)

    votes24, headers_v24 = aggregate_votes(v24, {'prefeito', 'vereador'})
    votes22, headers_v22 = aggregate_votes(v22, {'dep_federal', 'dep_estadual'})

    rec24, rep24 = build_year(candidates, system_locations, votes24, map24, 2024, {'prefeito', 'vereador', 'suplente'})
    rec22, rep22 = build_year(candidates, system_locations, votes22, map22, 2022, {'dep_federal', 'dep_estadual'})
    recovered = {**rec24, **rec22}

    mapping_ok_24 = len(map24) == 29 and all(m.get('nr') and m.get('score', 0) >= 0.45 for m in map24)
    mapping_ok_22 = len(map22) == 29 and all(m.get('nr') and m.get('score', 0) >= 0.40 for m in map22)
    candidate_reports = {**rep24, **rep22}
    candidates_ok = len(recovered) == len(candidates) and all(r.get('status') == 'ok' for r in candidate_reports.values())
    ready = mapping_ok_24 and mapping_ok_22 and candidates_ok

    report = {
        "source": {
            "vote_2024": "TSE - votacao_secao_2024_PR.zip",
            "vote_2022": "TSE - votacao_secao_2022_PR.zip",
            "locations_2024": "TSE - eleitorado_local_votacao_2024.zip",
            "locations_2022": "TSE - eleitorado_local_votacao_2022.zip",
        },
        "ready": ready,
        "system_candidate_count": len(candidates),
        "recovered_candidate_count": len(recovered),
        "system_location_count": len(system_locations),
        "tse_location_count_2024": len(tse_loc24),
        "tse_location_count_2022": len(tse_loc22),
        "mapping_2024": map24,
        "mapping_2022": map22,
        "unused_tse_locations_2024": unused24,
        "unused_tse_locations_2022": unused22,
        "candidates": candidate_reports,
        "headers": {
            "vote_2024": headers_v24,
            "vote_2022": headers_v22,
            "locations_2024": headers_l24,
            "locations_2022": headers_l22,
        },
    }
    Path(report_path).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    write_overlay(recovered, overlay_path, ready)

    print(json.dumps({
        "ready": ready,
        "recovered": len(recovered),
        "expected": len(candidates),
        "locations2024": len(tse_loc24),
        "locations2022": len(tse_loc22),
        "review": [k for k, v in candidate_reports.items() if v.get('status') != 'ok'],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
