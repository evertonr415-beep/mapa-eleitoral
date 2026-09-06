#!/usr/bin/env python3
import concurrent.futures
import json
import re
import sys
import threading
import unicodedata
import urllib.error
import urllib.request
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

import asn1tools

BASE = 'https://resultados.tse.jus.br/oficial'
MUNICIPIO = '74276'
ZONA = '0061'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36'

# Current 2024 voting-location grouping. These are the sections that the current
# 29-location mobile map represents. They are used as the display grouping for
# both 2024 municipal votes and 2022 deputy votes.
SECTION_GROUPS = [
    ('ESCOLA ANTONICA GIROLDO FRANCIOSI', [1,4,7,61,64,74,83,148,365]),
    ('ESCOLA JOSE BERNARDO DOS SANTOS', [9,10,161,169,175,183,188,191]),
    ('COLEGIO FRANCISCO PEREIRA BASTOS', [11,12,66,162,167,360,368]),
    ('ESCOLA PROF ALZIRA HORVATICH', [14,15,16,17,163,164,166,170,172,176,180,182,355]),
    ('COLEGIO ANTONIO GARCEZ NOVAES', [18,52,53,54,55,56,57,58,59,147,192]),
    ('ESCOLA HELOIZA GIANCRISTOFARO', [69,72,165,171,181,362]),
    ('COLEGIO PROF NADIR MENDES MONTANHA', [76,150,174,178,179,184,187,190,193,198]),
    ('CENTRO PASTORAL IGREJA STO ANTONIO', [77,78,79,134,152]),
    ('ESCOLA PRESIDENTE GETULIO VARGAS', [80,81,82,85,86,151,153,155,185,189]),
    ('CLUBE COMERCIAL', [109,110,126,127,128,129,130,131,132,133]),
    ('COLEGIO ANTONIO RACANELLO SAMPAIO', [112,113,114,156,158,159,168,173,357]),
    ('ESCOLA WALFREDO SILVEIRA CORREA', [135,136,137,138,139,160,186]),
    ('ESCOLA ENZO BATISTA DALEFFE PEREIRA', [196,199,201,204,206,225,226,227,228,229,230,231,232,349]),
    ('ESCOLA PROF ALEYDAH OLIVEIRA', [197,200,202,203,205,207,316,369]),
    ('ESCOLA PROF JOSE DE CARVALHO', [233,234,235,236,237]),
    ('ESCOLA PROF NEREIDE DE CAMARGO', [238,239,240,241,242,243,244,352]),
    ('ESCOLA DES CLOTARIO PORTUGAL', [245,246,247,248,249]),
    ('COLEGIO IVANILDE NORONHA', [250,251,252,253,254,255,256,257]),
    ('ESCOLA PROF DIOMAR DE O PEGORER', [258,259,260,261,356]),
    ('ESCOLA DR ANTONIO GRASSANO JR', [262,263,264,265,266,267,268]),
    ('ESCOLA MARIA HERCILIO STAWINSKI', [269,270,271,272,273,351]),
    ('COLEGIO EMILIO DE MENEZES', list(range(274,288))),
    ('ESCOLA PAPA JOAO PAULO II', list(range(288,299))),
    ('COLEGIO UNIDADE POLO', list(range(299,312))),
    ('COLEGIO MAE DO DIVINO AMOR', list(range(312,322))),
    ('COLEGIO MARQUES DE CARAVELAS', list(range(322,332)) + [367]),
    ('ESCOLA DE ARICANDUVA', list(range(332,337))),
    ('ESCOLA PADRE GERMANO MAYER', list(range(337,349))),
    ('COLEGIO IRONDI MANTOVANI PUGLIESE', [364]),
]

_lock = threading.Lock()
_download_count = 0


def norm(value):
    value = unicodedata.normalize('NFKD', str(value or ''))
    value = ''.join(c for c in value if not unicodedata.combining(c)).upper()
    value = re.sub(r'[^A-Z0-9]+', ' ', value)
    return re.sub(r'\s+', ' ', value).strip()


def token_set(value):
    stop = {'DE','DA','DO','DAS','DOS','E','ESTADUAL','MUNICIPAL','ESCOLA','COLEGIO','PROF','PROFESSOR','PROFESSORA'}
    return {x for x in norm(value).split() if len(x) > 1 and x not in stop}


def similarity(a, b):
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return 0.0
    ta, tb = token_set(a), token_set(b)
    jac = len(ta & tb) / max(1, len(ta | tb))
    seq = SequenceMatcher(None, na, nb).ratio()
    contains = 1.0 if na in nb or nb in na else 0.0
    return 0.58 * jac + 0.34 * seq + 0.08 * contains


def get_bytes(url, attempts=4):
    global _download_count
    last = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
            with _lock:
                _download_count += 1
            return data
        except Exception as e:
            last = e
            if attempt + 1 == attempts:
                raise
    raise last


def get_json(url):
    return json.loads(get_bytes(url).decode('utf-8'))


def parse_app(path):
    text = Path(path).read_text(encoding='utf-8')
    c0 = text.index('candidates: {')
    l0 = text.index('locais:', c0)
    block = text[c0:l0]
    candidate_re = re.compile(
        r'"([^"]+)"\s*:\s*\{\s*name:\s*"([^"]+)"\s*,\s*party:\s*"([^"]*)"\s*,\s*category:\s*"([^"]*)"\s*,\s*type:\s*"([^"]+)"',
        re.M,
    )
    candidates = {
        m.group(1): {'name': m.group(2), 'party': m.group(3), 'category': m.group(4), 'type': m.group(5)}
        for m in candidate_re.finditer(block)
    }
    loc_re = re.compile(r'\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*address:\s*"([^"]*)"', re.M)
    locations = [{'id':m.group(1),'name':m.group(2),'address':m.group(3)} for m in loc_re.finditer(text[l0:])]
    if len(candidates) != 43:
        raise RuntimeError(f'Expected 43 candidates, found {len(candidates)}')
    if len(locations) != 29:
        raise RuntimeError(f'Expected 29 locations, found {len(locations)}')
    return candidates, locations


def map_groups_to_app(locations):
    remaining = {loc['id']: loc for loc in locations}
    mapped = []
    for group_name, sections in SECTION_GROUPS:
        best_id = None
        best_score = -1
        for loc_id, loc in remaining.items():
            score = similarity(group_name, loc['name'])
            if score > best_score:
                best_id, best_score = loc_id, score
        if best_id is None or best_score < 0.34:
            raise RuntimeError(f'Could not map group {group_name}; best={best_id} score={best_score}')
        loc = remaining.pop(best_id)
        mapped.append({'source_name':group_name,'sections':sections,'id':loc['id'],'app_name':loc['name'],'score':round(best_score,4)})
    if remaining:
        raise RuntimeError(f'Unmapped app locations: {remaining}')
    return mapped


def find_municipality_section_list(config):
    found = []
    def walk(v):
        if isinstance(v, dict):
            if str(v.get('cd','')) == MUNICIPIO and isinstance(v.get('zon'), list):
                for z in v['zon']:
                    if str(z.get('cd','')).zfill(4) == ZONA and isinstance(z.get('sec'), list):
                        found.extend(int(str(s.get('ns'))) for s in z['sec'] if s.get('ns') is not None)
            for x in v.values(): walk(x)
        elif isinstance(v, list):
            for x in v: walk(x)
    walk(config)
    return sorted(set(found))


def section_config(year, pleito):
    url = f'{BASE}/ele{year}/arquivo-urna/{pleito}/config/pr/pr-p000{pleito}-cs.json'
    return find_municipality_section_list(get_json(url)), url


def find_bu_file(aux, year):
    groups = aux.get('hashes') or []
    if not groups:
        raise RuntimeError('aux without hashes')
    # Prefer first successfully transmitted official package.
    for g in groups:
        h = g.get('hash')
        if not h:
            continue
        if year == 2024:
            for a in g.get('arq') or []:
                if a.get('tp') == 'bu' or str(a.get('nm','')).endswith('-bu.dat'):
                    return h, a['nm']
        else:
            names = g.get('nmarq') or []
            for name in names:
                if str(name).lower().endswith('.bu'):
                    return h, str(name)
    raise RuntimeError('BU filename not found')


def fetch_bu(year, pleito, section):
    sec = f'{section:04d}'
    base = f'{BASE}/ele{year}/arquivo-urna/{pleito}/dados/pr/{MUNICIPIO}/{ZONA}/{sec}'
    stem = f'p000{pleito}-pr-m{MUNICIPIO}-z{ZONA}-s{sec}'
    aux_url = f'{base}/{stem}-aux.json'
    aux = get_json(aux_url)
    h, name = find_bu_file(aux, year)
    url = f'{base}/{h}/{name}'
    return get_bytes(url), aux_url, url


# Minimal BER reader for the 2024 BU payload. The 2024 firmware evolved metadata
# fields, but candidate vote tuples remain BER TLVs. We only recognize tuples that
# contain a candidate identification + explicit vote quantity + signature.
def read_tlv(data, pos=0, limit=None):
    if limit is None: limit = len(data)
    start = pos
    if pos >= limit: raise ValueError('EOF tag')
    first = data[pos]; pos += 1
    cls = first >> 6
    constructed = bool(first & 0x20)
    tag = first & 0x1f
    if tag == 0x1f:
        tag = 0
        while True:
            b = data[pos]; pos += 1
            tag = (tag << 7) | (b & 0x7f)
            if not (b & 0x80): break
    if pos >= limit: raise ValueError('EOF length')
    lb = data[pos]; pos += 1
    if lb < 0x80:
        length = lb
    else:
        n = lb & 0x7f
        if n == 0: raise ValueError('indefinite length unsupported')
        length = int.from_bytes(data[pos:pos+n], 'big'); pos += n
    content_start = pos
    end = content_start + length
    if end > limit: raise ValueError(f'TLV overflow {end}>{limit}')
    node = {'cls':cls,'tag':tag,'constructed':constructed,'start':start,'content_start':content_start,'end':end,'children':[]}
    if constructed:
        p = content_start
        while p < end:
            child = read_tlv(data, p, end)
            node['children'].append(child)
            p = child['end']
        if p != end: raise ValueError('child boundary mismatch')
    return node


def node_int(data, node):
    return int.from_bytes(data[node['content_start']:node['end']], 'big', signed=False)


def recursive_ints(data, node):
    out = []
    if node['cls'] == 0 and node['tag'] in (2,10):
        out.append(node_int(data,node))
    for ch in node.get('children') or []:
        out.extend(recursive_ints(data,ch))
    return out


def extract_2024_candidate_votes(inner):
    root = read_tlv(inner,0,len(inner))
    votes = defaultdict(int)
    hits = 0
    def walk(node):
        nonlocal hits
        children = node.get('children') or []
        for i, ch in enumerate(children):
            # New 2024 VotoVotavel record observed in official BU:
            # [1] ..., [2] ..., [3] {partido INTEGER, codigo INTEGER},
            # quantidadeVotos INTEGER, assinatura OCTET STRING.
            if ch['cls'] == 2 and ch['tag'] == 3 and ch['constructed'] and i + 2 < len(children):
                q = children[i+1]
                sig = children[i+2]
                if q['cls'] == 0 and q['tag'] == 2 and sig['cls'] == 0 and sig['tag'] == 4:
                    ids = recursive_ints(inner,ch)
                    if len(ids) >= 2:
                        candidate = ids[-1]
                        qty = node_int(inner,q)
                        if 1 <= candidate <= 99999 and 0 <= qty <= 10000:
                            votes[str(candidate)] += qty
                            hits += 1
            walk(ch)
    walk(root)
    if hits < 10:
        raise RuntimeError(f'2024 generic parser found too few vote tuples: {hits}')
    return dict(votes), hits


def cargo_name(choice):
    if isinstance(choice, (list,tuple)) and len(choice) >= 2:
        return str(choice[1])
    if isinstance(choice, str): return choice
    return ''


def extract_2022_deputy_votes(conv, raw):
    env = conv.decode('EntidadeEnvelopeGenerico', raw)
    inner = conv.decode('EntidadeBoletimUrna', env['conteudo'])
    out = {'dep_federal':defaultdict(int),'dep_estadual':defaultdict(int)}
    for election in inner.get('resultadosVotacaoPorEleicao') or []:
        for result in election.get('resultadosVotacao') or []:
            for total in result.get('totaisVotosCargo') or []:
                cargo = cargo_name(total.get('codigoCargo'))
                typ = 'dep_federal' if cargo == 'deputadoFederal' else 'dep_estadual' if cargo == 'deputadoEstadual' else None
                if not typ: continue
                for voto in total.get('votosVotaveis') or []:
                    if str(voto.get('tipoVoto')) != 'nominal': continue
                    ident = voto.get('identificacaoVotavel') or {}
                    code = ident.get('codigo')
                    if code is None: continue
                    out[typ][str(int(code))] += int(voto.get('quantidadeVotos') or 0)
    return {k:dict(v) for k,v in out.items()}, env


def extract_envelope_location(conv, raw):
    env = conv.decode('EntidadeEnvelopeGenerico', raw)
    ident = env.get('identificacao')
    if isinstance(ident,(list,tuple)) and len(ident)>=2 and isinstance(ident[1],dict):
        return int(ident[1].get('local') or 0), env
    return 0, env


def category_total(category):
    m = re.search(r'(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:votos?|v\b)', str(category or ''), re.I)
    if not m: return None
    return int(m.group(1).replace('.',''))


def recursive_candidate_dicts(obj):
    found = []
    def walk(v):
        if isinstance(v,dict):
            keys = set(v)
            if ('nm' in keys or 'nmu' in keys or 'name' in keys) and ('n' in keys or 'nr' in keys) and ('vap' in keys or 'v' in keys):
                found.append(v)
            for x in v.values(): walk(x)
        elif isinstance(v,list):
            for x in v: walk(x)
    walk(obj)
    return found


def official_candidate_rows(url):
    data = get_json(url)
    rows = []
    for d in recursive_candidate_dicts(data):
        name = d.get('nm') or d.get('nmu') or d.get('name') or ''
        number = d.get('n') if d.get('n') is not None else d.get('nr')
        votes = d.get('vap') if d.get('vap') is not None else d.get('v')
        try: votes_i = int(str(votes).replace('.','').replace(',',''))
        except Exception: continue
        if number is None or not str(number).strip(): continue
        rows.append({'name':str(name),'number':str(number).lstrip('0') or '0','votes':votes_i,'raw':d})
    # Deduplicate same number/name/votes if nested structures repeat.
    unique = {}
    for r in rows: unique[(norm(r['name']),r['number'],r['votes'])] = r
    return list(unique.values()), data


def match_by_name(name, rows):
    best = None; best_score = -1
    for r in rows:
        score = similarity(name,r['name'])
        if score > best_score:
            best,best_score = r,score
    return best,best_score


def clg_for_section(section, group_map, old_local=None, fallback_local_map=None):
    sec = int(section)
    for g in group_map:
        if sec in g['sections']: return g['id']
    if old_local and fallback_local_map and old_local in fallback_local_map:
        return fallback_local_map[old_local]
    return None


def generate_overlay(recovered, output):
    payload = {k:{'total':v['total'],'year':v['year'],'votes':v['votes']} for k,v in recovered.items()}
    data_json = json.dumps(payload,ensure_ascii=False,separators=(',',':'))
    js = """(function(){\n  'use strict';\n  if(window.__vfTseFullDataV19)return;window.__vfTseFullDataV19=true;\n  var DATA=__DATA__;\n  try{\n    if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return;\n    Object.keys(DATA).forEach(function(key){\n      var item=DATA[key];\n      var cand=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[key];\n      if(cand){cand.officialTotal=item.total;cand.tseYear=item.year;cand.tseRecovered=true;}\n      ELEICAO_2024_DATA.locais.forEach(function(loc){\n        if(!loc.votes)loc.votes={};\n        if(Object.prototype.hasOwnProperty.call(item.votes,loc.id))loc.votes[key]=Number(item.votes[loc.id])||0;\n      });\n    });\n    window.__vfTseFullDataV19Ready=true;\n    window.dispatchEvent(new CustomEvent('vf:tse-full-data',{detail:{ready:true,candidates:Object.keys(DATA).length}}));\n  }catch(e){window.__vfTseFullDataV19Ready=false;console.error('[Voto Forte] Falha ao aplicar base TSE recuperada',e);}\n})();\n""".replace('__DATA__',data_json)
    Path(output).write_text(js,encoding='utf-8')


def main():
    app_path = sys.argv[1] if len(sys.argv)>1 else 'app.js'
    output_js = sys.argv[2] if len(sys.argv)>2 else 'tse-full-data-v19.js'
    output_report = sys.argv[3] if len(sys.argv)>3 else 'tse-full-data-report.json'
    candidates, locations = parse_app(app_path)
    group_map = map_groups_to_app(locations)
    section_to_clg = {sec:g['id'] for g in group_map for sec in g['sections']}

    # Compatible TSE 2022 BU schema mirror. Envelope remains compatible in 2024,
    # allowing us to read official local/section metadata there as well.
    schema_url = 'https://raw.githubusercontent.com/kuca-belludo/urnas/main/spec/bu.asn1'
    schema_path = '/tmp/tse-bu-2022.asn1'
    Path(schema_path).write_bytes(get_bytes(schema_url))
    conv = asn1tools.compile_files(schema_path, codec='ber')

    sections24, config24_url = section_config(2024,'452')
    sections22, config22_url = section_config(2022,'406')
    print('sections 2024',len(sections24),'sections 2022',len(sections22))

    # Download/decode section BUs in parallel.
    results24 = {}
    errors24 = {}
    def work24(sec):
        raw,aux,bu = fetch_bu(2024,'452',sec)
        local,_ = extract_envelope_location(conv,raw)
        votes,hits = extract_2024_candidate_votes(conv.decode('EntidadeEnvelopeGenerico',raw)['conteudo'])
        return sec,local,votes,hits,aux,bu
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        futs={ex.submit(work24,s):s for s in sections24}
        for fut in concurrent.futures.as_completed(futs):
            s=futs[fut]
            try:
                sec,local,votes,hits,aux,bu=fut.result();results24[sec]={'local':local,'votes':votes,'hits':hits,'aux':aux,'bu':bu}
            except Exception as e:
                errors24[s]=repr(e)
    if errors24:
        raise RuntimeError(f'2024 BU errors ({len(errors24)}): {list(errors24.items())[:10]}')

    results22 = {}; errors22 = {}
    def work22(sec):
        raw,aux,bu = fetch_bu(2022,'406',sec)
        votes,env = extract_2022_deputy_votes(conv,raw)
        ident=env.get('identificacao'); local=0
        if isinstance(ident,(list,tuple)) and len(ident)>=2 and isinstance(ident[1],dict): local=int(ident[1].get('local') or 0)
        return sec,local,votes,aux,bu
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
        futs={ex.submit(work22,s):s for s in sections22}
        for fut in concurrent.futures.as_completed(futs):
            s=futs[fut]
            try:
                sec,local,votes,aux,bu=fut.result();results22[sec]={'local':local,'votes':votes,'aux':aux,'bu':bu}
            except Exception as e:
                errors22[s]=repr(e)
    if errors22:
        raise RuntimeError(f'2022 BU errors ({len(errors22)}): {list(errors22.items())[:10]}')

    # For any historical 2022 section not explicitly present in the current-group
    # article, infer its current display location from overlap of its old local's
    # other sections with the current groups.
    old_local_sections=defaultdict(set)
    for sec,r in results22.items(): old_local_sections[r['local']].add(sec)
    fallback_local_map={}
    for local,secs in old_local_sections.items():
        best=None;score=0
        for g in group_map:
            overlap=len(secs & set(g['sections']))
            if overlap>score:best,score=g['id'],overlap
        if best: fallback_local_map[local]=best

    uncovered24=[s for s in sections24 if s not in section_to_clg]
    uncovered22=[s for s,r in results22.items() if clg_for_section(s,group_map,r['local'],fallback_local_map) is None]
    if uncovered24:
        raise RuntimeError(f'Current 2024 sections not mapped to 29 groups: {uncovered24}')
    if uncovered22:
        raise RuntimeError(f'Historical 2022 sections not mappable to current groups: {uncovered22}')

    recovered={}; audit={}

    # Rebuild all 22 municipal vereador/suplente candidates from 2024 section BUs.
    council={k:v for k,v in candidates.items() if v['type'] in ('vereador','suplente') and k.isdigit()}
    for key,cand in council.items():
        total=0;by_clg=defaultdict(int)
        for sec,r in results24.items():
            qty=int(r['votes'].get(str(int(key)),0));total+=qty
            clg=section_to_clg[sec];by_clg[clg]+=qty
        expected=category_total(cand['category'])
        ok=(expected is None or total==expected)
        audit[key]={'name':cand['name'],'year':2024,'number':key,'sum_sections':total,'category_total_before':expected,'difference_from_previous_label':None if expected is None else total-expected,'status':'ok' if ok else 'review'}
        if not ok:
            raise RuntimeError(f'2024 validation mismatch {cand["name"]}: BU={total} currentLabel={expected}')
        recovered[key]={'total':total,'year':2024,'votes':{loc['id']:int(by_clg.get(loc['id'],0)) for loc in locations}}

    # Official 2022 municipal result JSON gives candidate names/numbers/totals.
    fed_url=f'{BASE}/ele2022/546/dados/pr/pr{MUNICIPIO}-c0006-e000546-v.json'
    est_url=f'{BASE}/ele2022/546/dados/pr/pr{MUNICIPIO}-c0007-e000546-v.json'
    fed_rows,fed_raw=official_candidate_rows(fed_url)
    est_rows,est_raw=official_candidate_rows(est_url)
    if not fed_rows or not est_rows:
        raise RuntimeError(f'Could not parse official 2022 candidate JSON: fed={len(fed_rows)} est={len(est_rows)}')

    for key,cand in candidates.items():
        if cand['type'] not in ('dep_federal','dep_estadual'): continue
        rows=fed_rows if cand['type']=='dep_federal' else est_rows
        row,score=match_by_name(cand['name'],rows)
        if row is None or score<0.43:
            raise RuntimeError(f'Could not map deputy {cand["name"]}; best={row} score={score}')
        number=str(int(row['number']))
        total=0;by_clg=defaultdict(int)
        for sec,r in results22.items():
            qty=int(r['votes'][cand['type']].get(number,0));total+=qty
            clg=clg_for_section(sec,group_map,r['local'],fallback_local_map)
            by_clg[clg]+=qty
        official=int(row['votes'])
        audit[key]={'name':cand['name'],'year':2022,'number':number,'matched_name':row['name'],'name_score':round(score,4),'sum_sections':total,'official_json_total':official,'difference':total-official,'status':'ok' if total==official else 'review'}
        if total!=official:
            raise RuntimeError(f'2022 validation mismatch {cand["name"]}: BU={total} officialJSON={official} number={number}')
        recovered[key]={'total':total,'year':2022,'votes':{loc['id']:int(by_clg.get(loc['id'],0)) for loc in locations}}

    expected_recovered=22+19
    if len(recovered)!=expected_recovered:
        raise RuntimeError(f'Expected {expected_recovered} reconstructed candidates, got {len(recovered)}')
    for key,item in recovered.items():
        if len(item['votes'])!=29 or sum(item['votes'].values())!=item['total']:
            raise RuntimeError(f'Final matrix validation failed for {key}')

    generate_overlay(recovered,output_js)
    report={
        'ready':True,
        'source':'Official TSE static result service / official ballot-unit bulletins',
        'schema_url':schema_url,
        'config_2024':config24_url,
        'config_2022':config22_url,
        'candidate_json_2022':{'federal':fed_url,'estadual':est_url},
        'sections':{'2024':sections24,'2022':sections22,'count_2024':len(sections24),'count_2022':len(sections22)},
        'uncovered':{'2024':uncovered24,'2022':uncovered22},
        'group_mapping':group_map,
        'fallback_2022_local_map':{str(k):v for k,v in fallback_local_map.items()},
        'recovered_candidate_count':len(recovered),
        'audit':audit,
        'download_count':_download_count,
    }
    Path(output_report).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'ready':True,'recovered':len(recovered),'sections2024':len(sections24),'sections2022':len(sections22),'downloads':_download_count},ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
