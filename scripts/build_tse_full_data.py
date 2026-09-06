#!/usr/bin/env python3
import csv, io, json, os, re, sys, unicodedata, urllib.request, zipfile
from collections import defaultdict

CKAN='https://dadosabertos.tse.jus.br/api/3/action/resource_show?id='
RES={
 'votes2022':'ac7bb6a5-68e4-4852-a690-dd2b526c92ee',
 'votes2024':'8cef9a19-a495-4ac1-bb11-ebf2a252a76d',
 'places2022':'3b003555-c69f-49cb-9c15-2700279520c7',
 'places2024':'56348b87-e07c-4569-9c60-9cf6ccb10206',
}
TARGET_CITY='ARAPONGAS'
TARGET_UF='PR'

# Canonical keys already used by the app.
CANDIDATES={
 # 2024 municipal
 'pref_cita':(2024,'RAFAEL CITA'), 'pref_milani':(2024,'JAIR MILANI'),
 '20220':(2024,'DECIO ROSANELLI'), '55155':(2024,'LEVI DO HANDEBOL'), '11234':(2024,'PAULO GRASSANO'),
 '44044':(2024,'TONINHO DA AMBULANCIA'), '70000':(2024,'JOAO GRACA'), '40133':(2024,'MARCIO NICKE'),
 '20120':(2024,'AROLDO PAGAN'), '11555':(2024,'PROFESSOR MARCELO'), '44567':(2024,'ALEXANDRE JULIANI SORRISO'),
 '55555':(2024,'SIMONE SPONTON MAE DE AUTISTA'), '55147':(2024,'LUISINHO DA SAUDE'), '22777':(2024,'DIRETORA MARILSA STAUB'),
 '44190':(2024,'PARDINI'), '55120':(2024,'CECEU'), '12500':(2024,'MEIRY FARIAS PROTECAO ANIMAL'),
 '11500':(2024,'MARCOS ANTONIO DE SOUZA'), '11444':(2024,'SILVANO DOS SANTOS ALVES'), '13100':(2024,'MARCIO DINIZ'),
 '55456':(2024,'MILTON XAVIER'), '10123':(2024,'RODRIGO DE DEUS'), '22622':(2024,'RUBENS FRANZIN'), '22123':(2024,'RICARDO BOTELHO'),
 # 2022 federal
 'dep_fed_lupion':(2022,'PEDRO LUPION'), 'dep_fed_filipe':(2022,'FILIPE BARROS'), 'dep_fed_beto':(2022,'BETO PRETO'),
 'dep_fed_angelica':(2022,'ANGELICA ENFERMEIRA'), 'dep_fed_deltan':(2022,'DELTAN DALLAGNOL'), 'dep_fed_luisa':(2022,'LUISA CANZIANI'),
 'dep_fed_fahur':(2022,'SARGENTO FAHUR'), 'dep_fed_zeca':(2022,'ZECA DIRCEU'), 'dep_fed_aliel':(2022,'ALIEL MACHADO'),
 'dep_fed_francischini':(2022,'FELIPE FRANCISCHINI'), 'dep_fed_sperafico':(2022,'DILCEU SPERAFICO'),
 # 2022 state
 'dep_est_tiago':(2022,'TIAGO AMARAL'), 'dep_est_bazana':(2022,'PEDRO PAULO BAZANA'), 'dep_est_tercilio':(2022,'TERCILIO TURINI'),
 'dep_est_curi':(2022,'ALEXANDRE CURI'), 'dep_est_jacovos':(2022,'DELEGADO JACOVOS'), 'dep_est_cobra':(2022,'COBRA REPORTER'),
 'dep_est_pacheco':(2022,'MARCIO PACHECO'), 'dep_est_arilson':(2022,'ARILSON CHIORATO'),
}

ALIASES={
 'MEIRY FARIAS PROTECAO ANIMAL':['MEIRY FARIAS','MEIRY FARIAS PROTECAO ANIMAL'],
 'DIRETORA MARILSA STAUB':['MARILSA STAUB','DIRETORA MARILSA STAUB'],
 'SIMONE SPONTON MAE DE AUTISTA':['SIMONE SPONTON','SIMONE SPONTON MAE DE AUTISTA'],
 'TONINHO DA AMBULANCIA':['TONINHO DA AMBULANCIA','ANTONIO'],
 'PEDRO PAULO BAZANA':['PEDRO PAULO BAZANA','BAZANA'],
 'COBRA REPORTER':['COBRA REPORTER','COBRA REPÓRTER'],
 'DELEGADO JACOVOS':['DELEGADO JACOVOS','DELEGADO JACOVÓS'],
 'ANGELICA ENFERMEIRA':['ANGELICA ENFERMEIRA','ANGÉLICA ENFERMEIRA'],
}

def norm(s):
 s=str(s or '').strip().upper()
 s=''.join(c for c in unicodedata.normalize('NFD',s) if unicodedata.category(c)!='Mn')
 s=re.sub(r'[^A-Z0-9]+',' ',s)
 return re.sub(r'\s+',' ',s).strip()

def resource_url(rid):
 with urllib.request.urlopen(CKAN+rid, timeout=60) as r:
  data=json.load(r)
 return data['result']['url']

def download(rid, dst):
 url=resource_url(rid)
 print('download', url)
 req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(req, timeout=180) as r, open(dst,'wb') as f:
  while True:
   b=r.read(1024*1024)
   if not b: break
   f.write(b)
 return dst

def csv_member(path):
 z=zipfile.ZipFile(path)
 names=[n for n in z.namelist() if n.lower().endswith('.csv')]
 if not names: raise RuntimeError('no csv in '+path)
 # Prefer PR-specific CSV where present.
 name=next((n for n in names if '_PR' in n.upper()), names[0])
 return z, name

def detect_encoding(sample):
 for enc in ('latin-1','utf-8-sig','utf-8'):
  try: sample.decode(enc); return enc
  except: pass
 return 'latin-1'

def iter_zip_csv(path):
 z,name=csv_member(path)
 raw=z.open(name,'r')
 sample=raw.read(4096)
 enc=detect_encoding(sample)
 raw.close(); raw=z.open(name,'r')
 txt=io.TextIOWrapper(raw, encoding=enc, newline='')
 reader=csv.DictReader(txt, delimiter=';')
 for row in reader: yield row

def pick(row,*names):
 for n in names:
  if n in row and row[n] not in (None,''): return row[n]
 return ''

def load_places(path):
 # Maps (zone, section) and local code to official place names for Arapongas.
 sec_to_place={}; code_to_place={}
 rows=0
 for row in iter_zip_csv(path):
  uf=norm(pick(row,'SG_UF','UF'))
  city=norm(pick(row,'NM_MUNICIPIO','NM_LOCALIDADE','MUNICIPIO'))
  if uf and uf!=TARGET_UF: continue
  if city!=TARGET_CITY: continue
  zone=str(pick(row,'NR_ZONA','ZONA')).strip().lstrip('0') or '0'
  sec=str(pick(row,'NR_SECAO','SECAO')).strip().lstrip('0') or '0'
  code=str(pick(row,'NR_LOCAL_VOTACAO','CD_LOCAL_VOTACAO','LOCAL_VOTACAO')).strip().lstrip('0') or '0'
  name=pick(row,'NM_LOCAL_VOTACAO','DS_LOCAL_VOTACAO','LOCAL_VOTACAO_NOME')
  if name:
   name=name.strip(); rows+=1
   if sec!='0': sec_to_place[(zone,sec)]=name
   if code!='0': code_to_place[code]=name
 print('places rows',rows,'sections',len(sec_to_place),'codes',len(code_to_place))
 return sec_to_place,code_to_place

def build_name_match(year):
 exact={}
 for key,(yr,name) in CANDIDATES.items():
  if yr!=year: continue
  aliases=ALIASES.get(name,[name])
  for a in aliases: exact[norm(a)]=key
 return exact

def best_match(name, exact):
 n=norm(name)
 if n in exact:return exact[n]
 # Controlled fallback for TSE names with prefixes/suffixes.
 hits=[]
 for a,key in exact.items():
  if len(a)>=5 and (a in n or n in a): hits.append((len(a),key))
 if not hits:return None
 hits.sort(reverse=True)
 return hits[0][1]

def load_votes(path, year, sec_to_place, code_to_place):
 exact=build_name_match(year)
 by_place=defaultdict(lambda:defaultdict(int)); totals=defaultdict(int); matched_names=defaultdict(set)
 rows=0
 for row in iter_zip_csv(path):
  uf=norm(pick(row,'SG_UF','UF'))
  city=norm(pick(row,'NM_MUNICIPIO','NM_LOCALIDADE','MUNICIPIO'))
  if uf and uf!=TARGET_UF: continue
  if city!=TARGET_CITY: continue
  turn=str(pick(row,'NR_TURNO','TURNO')).strip()
  if turn and turn!='1': continue
  cargo=norm(pick(row,'DS_CARGO','DS_CARGO_PERGUNTA','NM_CARGO'))
  if year==2022 and cargo not in ('DEPUTADO FEDERAL','DEPUTADO ESTADUAL'): continue
  if year==2024 and cargo not in ('VEREADOR','PREFEITO'): continue
  name=pick(row,'NM_VOTAVEL','NM_CANDIDATO','NM_URNA_CANDIDATO')
  key=best_match(name,exact)
  if not key: continue
  q=pick(row,'QT_VOTOS','QT_VOTOS_NOMINAIS','QT_VOTOS_LEGENDA')
  try:q=int(str(q).replace('.','').replace(',',''))
  except:q=0
  zone=str(pick(row,'NR_ZONA','ZONA')).strip().lstrip('0') or '0'
  sec=str(pick(row,'NR_SECAO','SECAO')).strip().lstrip('0') or '0'
  lcode=str(pick(row,'NR_LOCAL_VOTACAO','CD_LOCAL_VOTACAO')).strip().lstrip('0') or '0'
  place=code_to_place.get(lcode) or sec_to_place.get((zone,sec))
  if not place:
   place='LOCAL '+lcode if lcode!='0' else 'SECAO '+sec
  by_place[place][key]+=q; totals[key]+=q; matched_names[key].add(name)
  rows+=1
 print('vote rows matched',year,rows,'places',len(by_place))
 for key in sorted(totals): print(year,key,totals[key],sorted(matched_names[key])[:3])
 return by_place,totals

def parse_app_locations(path='app.js'):
 text=open(path,encoding='utf-8').read()
 # capture current 29 location names in order
 pat=re.compile(r'\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"')
 return pat.findall(text)

def fuzzy_place_match(app_name, official_names):
 a=norm(app_name)
 # manual-ish normalization words
 stop={'ESCOLA','MUNICIPAL','COLEGIO','ESTADUAL','PROFESSORA','PROFESSOR','C','E','EM','DE','DA','DO','DOS','DAS','ENSINO','FUNDAMENTAL'}
 aw=[w for w in a.split() if w not in stop and len(w)>2]
 best=None
 for off in official_names:
  o=norm(off); ow=[w for w in o.split() if w not in stop and len(w)>2]
  common=len(set(aw)&set(ow)); denom=max(1,len(set(aw)|set(ow))); score=common/denom
  if a==o:score=10
  elif a in o or o in a:score=max(score,5)
  if best is None or score>best[0]:best=(score,off)
 return best if best and best[0]>=0.18 else None

def main():
 os.makedirs('/tmp/tse',exist_ok=True)
 paths={}
 for k,rid in RES.items():
  p='/tmp/tse/'+k+'.zip'; download(rid,p); paths[k]=p
 p22,c22=load_places(paths['places2022']); p24,c24=load_places(paths['places2024'])
 v22,t22=load_votes(paths['votes2022'],2022,p22,c22)
 v24,t24=load_votes(paths['votes2024'],2024,p24,c24)
 app_locs=parse_app_locations()
 official=set(v22)|set(v24)|set(c22.values())|set(c24.values())
 mapping={}
 for lid,name in app_locs:
  m=fuzzy_place_match(name,official)
  if not m: print('UNMATCHED LOCATION',lid,name); continue
  mapping[lid]=m[1]; print('MAP',lid,name,'=>',m[1],m[0])
 merged={}
 for lid,name in app_locs:
  off=mapping.get(lid)
  if not off: continue
  votes={}
  for src in (v24,v22):
   for key,q in src.get(off,{}).items():votes[key]=q
  merged[lid]=votes
 # Validation: sums across the matched 29 app locations.
 sums=defaultdict(int); coverage=defaultdict(int)
 for lid,v in merged.items():
  for k,q in v.items(): sums[k]+=q; coverage[k]+=1
 validation={}
 for key,(yr,name) in CANDIDATES.items():
  official_total=(t24 if yr==2024 else t22).get(key,0)
  mapped_total=sums.get(key,0)
  validation[key]={'year':yr,'name':name,'officialTotal':official_total,'mappedTotal':mapped_total,'coverage':coverage.get(key,0),'ok':official_total==mapped_total and coverage.get(key,0)>0}
 # JS patch: only patch when official total equals mapped sum. Never fabricate.
 good={k for k,v in validation.items() if v['ok']}
 payload={lid:{k:q for k,q in votes.items() if k in good} for lid,votes in merged.items()}
 payload={lid:v for lid,v in payload.items() if v}
 out='''/* Generated from official TSE open data. Do not hand-edit. */\n(function(){\n'use strict';\nvar DATA=%s;\nvar TOTALS=%s;\ntry{\n if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return;\n ELEICAO_2024_DATA.locais.forEach(function(loc){var p=DATA[loc.id];if(!p)return;loc.votes=loc.votes||{};Object.keys(p).forEach(function(k){loc.votes[k]=p[k];});});\n window.__VF_TSE_FULL_DATA={source:'TSE Dados Abertos',generatedAt:%s,validation:TOTALS};\n}catch(e){console.error('TSE full-data patch failed',e);}\n})();\n'''%(json.dumps(payload,ensure_ascii=False,separators=(',',':')),json.dumps(validation,ensure_ascii=False,separators=(',',':')),json.dumps(__import__('datetime').datetime.utcnow().isoformat()+'Z'))
 open('tse-full-data-v19.js','w',encoding='utf-8').write(out)
 open('tse-full-data-validation.json','w',encoding='utf-8').write(json.dumps({'mapping':mapping,'validation':validation},ensure_ascii=False,indent=2))
 bad=[v for v in validation.values() if not v['ok']]
 print('validated complete',len(good),'of',len(validation),'candidates; bad',len(bad))
 # Do not fail if some names still cannot be validated; preview can show remaining partials transparently.

if __name__=='__main__': main()
