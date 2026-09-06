#!/usr/bin/env python3
import csv
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
import zipfile

BASE = 'https://cdn.tse.jus.br/estatistica/sead'
SOURCES = {
    2024: {
        'candidates': BASE + '/odsele/consulta_cand/consulta_cand_2024.zip',
        'photos': BASE + '/eleicoes/eleicoes2024/fotos/foto_cand2024_PR_div.zip',
    },
    2022: {
        'candidates': BASE + '/odsele/consulta_cand/consulta_cand_2022.zip',
        'photos': BASE + '/eleicoes/eleicoes2022/fotos/foto_cand2022_PR_div.zip',
    },
}

OUT_DIR = os.path.join('assets', 'politicians')

TARGETS_2024_BY_NUMBER = {
    '20220':'20220','55155':'55155','11234':'11234','44044':'44044','70000':'70000',
    '40133':'40133','20120':'20120','11555':'11555','44567':'44567','55555':'55555',
    '55147':'55147','22777':'22777','44190':'44190','55120':'55120','12500':'12500',
    '11500':'11500','11444':'11444','13100':'13100','55456':'55456','10123':'10123',
    '22622':'22622','22123':'22123',
}
TARGETS_2024_BY_NAME = {
    'pref_cita':'RAFAEL CITA',
    'pref_milani':'JAIR MILANI',
}
TARGETS_2022_BY_NAME = {
    'dep_fed_lupion':'PEDRO LUPION',
    'dep_fed_filipe':'FILIPE BARROS',
    'dep_fed_beto':'BETO PRETO',
    'dep_fed_angelica':'ANGELICA ENFERMEIRA',
    'dep_fed_deltan':'DELTAN DALLAGNOL',
    'dep_fed_luisa':'LUISA CANZIANI',
    'dep_fed_fahur':'SARGENTO FAHUR',
    'dep_fed_zeca':'ZECA DIRCEU',
    'dep_fed_aliel':'ALIEL MACHADO',
    'dep_fed_francischini':'FELIPE FRANCISCHINI',
    'dep_fed_sperafico':'DILCEU SPERAFICO',
    'dep_est_tiago':'TIAGO AMARAL',
    'dep_est_bazana':'PEDRO PAULO BAZANA',
    'dep_est_tercilio':'TERCILIO TURINI',
    'dep_est_curi':'ALEXANDRE CURI',
    'dep_est_jacovos':'DELEGADO JACOVOS',
    'dep_est_cobra':'COBRA REPORTER',
    'dep_est_pacheco':'MARCIO PACHECO',
    'dep_est_arilson':'ARILSON CHIORATO',
}


def norm(value):
    value = unicodedata.normalize('NFD', str(value or ''))
    value = ''.join(ch for ch in value if unicodedata.category(ch) != 'Mn')
    value = re.sub(r'[^A-Z0-9]+', ' ', value.upper()).strip()
    return value


def download(url):
    print('Downloading', url)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Referer': 'https://dadosabertos.tse.jus.br/',
        'Accept': 'application/zip,application/octet-stream;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Upgrade-Insecure-Requests': '1',
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def read_rows(zip_bytes, year):
    z = zipfile.ZipFile(io.BytesIO(zip_bytes))
    wanted = None
    expected = f'consulta_cand_{year}_PR.csv'.lower()
    for name in z.namelist():
        if name.lower().endswith(expected):
            wanted = name
            break
    if not wanted:
        for name in z.namelist():
            low = name.lower()
            if f'consulta_cand_{year}' in low and low.endswith('.csv') and '_pr' in low:
                wanted = name
                break
    if not wanted:
        raise RuntimeError(f'PR candidate CSV not found for {year}. Entries: {z.namelist()[:20]}')
    raw = z.read(wanted)
    text = None
    for enc in ('utf-8-sig','latin-1','cp1252'):
        try:
            text = raw.decode(enc)
            break
        except UnicodeDecodeError:
            pass
    if text is None:
        raise RuntimeError('Could not decode candidate CSV')
    return list(csv.DictReader(io.StringIO(text), delimiter=';'))


def locate_photo(photo_zip, sq):
    sq = str(sq or '').strip()
    if not sq:
        return None
    candidates = []
    for name in photo_zip.namelist():
        base = os.path.basename(name)
        low = base.lower()
        if not low.endswith(('.jpg','.jpeg')):
            continue
        stem = os.path.splitext(base)[0]
        if stem == sq or stem.startswith(sq + '_') or sq in stem:
            candidates.append(name)
    if not candidates:
        return None
    candidates.sort(key=lambda n:(len(os.path.basename(n)), n))
    return candidates[0]


def candidate_name(row):
    return norm(' '.join([
        row.get('NM_URNA_CANDIDATO',''), row.get('NM_CANDIDATO',''), row.get('NM_SOCIAL_CANDIDATO','')
    ]))


def is_arapongas(row):
    return norm(row.get('SG_UF')) == 'PR' and (
        norm(row.get('NM_UE')) == 'ARAPONGAS' or
        str(row.get('CD_MUNICIPIO','')).strip() == '74276'
    )


def choose_by_name(rows, target_name, cargo_prefix=None, municipality_only=False):
    target = norm(target_name)
    matches = []
    for row in rows:
        if norm(row.get('SG_UF')) != 'PR':
            continue
        if municipality_only and not is_arapongas(row):
            continue
        cargo = norm(row.get('DS_CARGO'))
        if cargo_prefix and norm(cargo_prefix) not in cargo:
            continue
        hay = candidate_name(row)
        if target in hay or hay in target:
            matches.append(row)
    if not matches:
        return None
    matches.sort(key=lambda r:(
        0 if norm(r.get('NM_URNA_CANDIDATO')) == target else 1,
        0 if 'DEFER' in norm(r.get('DS_SITUACAO_CANDIDATURA')) else 1,
        str(r.get('SQ_CANDIDATO',''))
    ))
    return matches[0]


def choose_2024_number(rows, number):
    matches=[]
    for row in rows:
        if not is_arapongas(row):
            continue
        if 'VEREADOR' not in norm(row.get('DS_CARGO')):
            continue
        if str(row.get('NR_CANDIDATO','')).strip() == str(number):
            matches.append(row)
    if not matches:
        return None
    matches.sort(key=lambda r:(0 if 'DEFER' in norm(r.get('DS_SITUACAO_CANDIDATURA')) else 1, str(r.get('SQ_CANDIDATO',''))))
    return matches[0]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {}
    report = {'found':{}, 'missing':{}}

    for year in (2024, 2022):
        cand_bytes = download(SOURCES[year]['candidates'])
        photo_bytes = download(SOURCES[year]['photos'])
        rows = read_rows(cand_bytes, year)
        pzip = zipfile.ZipFile(io.BytesIO(photo_bytes))
        print(year, 'rows', len(rows), 'photos', len(pzip.namelist()))

        targets = {}
        if year == 2024:
            for key, number in TARGETS_2024_BY_NUMBER.items():
                targets[key] = choose_2024_number(rows, number)
            for key, name in TARGETS_2024_BY_NAME.items():
                targets[key] = choose_by_name(rows, name, municipality_only=True)
        else:
            for key, name in TARGETS_2022_BY_NAME.items():
                cargo = 'DEPUTADO FEDERAL' if key.startswith('dep_fed_') else 'DEPUTADO ESTADUAL'
                targets[key] = choose_by_name(rows, name, cargo_prefix=cargo)

        for key, row in targets.items():
            if not row:
                report['missing'][key] = 'candidate_not_found'
                continue
            sq = str(row.get('SQ_CANDIDATO','')).strip()
            member = locate_photo(pzip, sq)
            if not member:
                report['missing'][key] = f'photo_not_found_sq_{sq}'
                continue
            data = pzip.read(member)
            ext = '.jpg' if member.lower().endswith('.jpg') else '.jpeg'
            path = os.path.join(OUT_DIR, key + ext)
            with open(path, 'wb') as f:
                f.write(data)
            url = '/' + path.replace(os.sep,'/')
            manifest[key] = url
            report['found'][key] = {
                'name': row.get('NM_URNA_CANDIDATO') or row.get('NM_CANDIDATO'),
                'number': row.get('NR_CANDIDATO'),
                'sq': sq,
                'file': url,
                'source_member': member,
            }

    with open(os.path.join(OUT_DIR, 'photos.json'), 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=True)
    with open(os.path.join(OUT_DIR, 'report.json'), 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2, sort_keys=True)

    print('FOUND', len(report['found']), 'MISSING', len(report['missing']))
    for k,v in report['missing'].items():
        print('MISSING', k, v)
    if not report['found']:
        raise SystemExit('No photos imported')

if __name__ == '__main__':
    main()
