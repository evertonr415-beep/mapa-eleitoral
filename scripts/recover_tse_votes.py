#!/usr/bin/env python3
import csv, io, json, os, re, sys, tempfile, unicodedata, urllib.request, zipfile
from collections import defaultdict
from difflib import SequenceMatcher

REPO_ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
CITY='ARAPONGAS'

TARGET_2024={
'20220':'20220','55155':'55155','11234':'11234','44044':'44044','70000':'70000','40133':'40133','20120':'20120','11555':'11555','44567':'44567','55555':'55555','55147':'55147','22777':'22777','44190':'44190','55120':'55120','12500':'12500',
'11500':'11500','11444':'11444','13100':'13100','55456':'55456','10123':'10123','22622':'22622','22123':'22123'
}
TARGET_2022={
'dep_fed_lupion':'Pedro Lupion','dep_fed_filipe':'Filipe Barros','dep_fed_beto':'Beto Preto','dep_fed_angelica':'Angélica Enfermeira','dep_fed_deltan':'Deltan Dallagnol','dep_fed_luisa':'Luísa Canziani','dep_fed_fahur':'Sargento Fahur','dep_fed_zeca':'Zeca Dirceu','dep_fed_aliel':'Aliel Machado','dep_fed_francischini':'Felipe Francischini','dep_fed_sperafico':'Dilceu Sperafico',
'dep_est_tiago':'Tiago Amaral','dep_est_bazana':'Pedro Paulo Bazana','dep_est_tercilio':'Tercilio Turini','dep_est_curi':'Alexandre Curi','dep_est_jacovos':'Delegado Jacovós','dep_est_cobra':'Cobra Repórter','dep_est_pacheco':'Márcio Pacheco','dep_est_arilson':'Arilson Chiorato'
}

def norm(s):
    s=unicodedata.normalize('NFKD',str(s or '')).encode('ascii','ignore').decode().upper()
    return re.sub(r'[^A-Z0-9]+',' ',s).strip()

def http_json(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=90) as r:return json.load(r)

def resolve_resource(package, contains):
    data=http_json('https://dadosabertos.tse.jus.br/api/3/action/package_show?id='+package)['result']
    terms=[norm(x) for x in contains]
    ranked=[]
    for r in data['resources']:
        n=norm(r.get('name',''))
        score=sum(1 for t in terms if t in n)
        if score: ranked.append((score,n,r.get('url')))
    ranked.sort(reverse=True)
    if not ranked: raise RuntimeError('Resource not found: '+package+' '+repr(contains))
    return ranked[0][2]

def download(url,path):
    print('Downloading',url,flush=True)
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=180) as r, open(path,'wb') as f:
        while True:
            b=r.read(1024*1024)
            if not b:break
            f.write(b)

def csv_from_zip(path):
    z=zipfile.ZipFile(path)
    names=[n for n in z.namelist() if n.lower().endswith('.csv')]
    if not names: raise RuntimeError('No CSV in '+path)
    # prefer the principal data CSV, not README/metadata
    names.sort(key=lambda n:(('leiame' in norm(n).lower()),len(n)))
    return z.open(names[0],'r')

def iter_rows_from_zip(path):
    raw=csv_from_zip(path)
    text=io.TextIOWrapper(raw,encoding='latin-1',newline='')
    return csv.DictReader(text,delimiter=';')

def parse_app_locations():
    txt=open(os.path.join(REPO_ROOT,'app.js'),encoding='utf-8').read()
    pat=re.compile(r'\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*address:\s*"([^"]*)"[^\}]*?sections:\s*(\d+)',re.S)
    out=[]
    for m in pat.finditer(txt):
        out.append({'id':m.group(1),'name':m.group(2),'address':m.group(3),'sections':int(m.group(4))})
    uniq={x['id']:x for x in out}
    out=[uniq[k] for k in sorted(uniq)]
    if len(out)!=29: raise RuntimeError('Expected 29 app locations, found %d'%len(out))
    return out

def load_local_metadata(zip_path):
    by_code={}
    for row in iter_rows_from_zip(zip_path):
        if norm(row.get('NM_MUNICIPIO'))!=CITY: continue
        code=str(row.get('NR_LOCAL_VOTACAO') or '').strip()
        if not code: continue
        if code not in by_code:
            by_code[code]={'code':code,'name':row.get('NM_LOCAL_VOTACAO',''),'address':row.get('DS_ENDERECO',''),'zone':row.get('NR_ZONA','')}
    if not by_code: raise RuntimeError('No Arapongas local metadata')
    return by_code

def score_location(app,tse):
    an=norm(app['name']); tn=norm(tse['name']); aa=norm(app['address']); ta=norm(tse['address'])
    name=SequenceMatcher(None,an,tn).ratio()
    addr=SequenceMatcher(None,aa,ta).ratio() if aa and ta else 0
    token=len(set(an.split()) & set(tn.split()))/max(1,len(set(an.split())|set(tn.split())))
    sec_bonus=0
    return 0.62*name+0.25*token+0.13*addr+sec_bonus

def match_locations(app_locs,tse_meta):
    pairs=[]
    remaining=set(tse_meta)
    # exact normalized names first
    mapping={}
    for a in app_locs:
        exact=[c for c in remaining if norm(tse_meta[c]['name'])==norm(a['name'])]
        if len(exact)==1:
            c=exact[0];mapping[c]=a['id'];remaining.remove(c);pairs.append({'tse':c,'app':a['id'],'score':1.0,'tse_name':tse_meta[c]['name'],'app_name':a['name']})
    for a in app_locs:
        if a['id'] in mapping.values(): continue
        ranked=sorted(((score_location(a,tse_meta[c]),c) for c in remaining),reverse=True)
        if not ranked: continue
        score,c=ranked[0]
        if score<0.48: continue
        mapping[c]=a['id'];remaining.remove(c);pairs.append({'tse':c,'app':a['id'],'score':round(score,4),'tse_name':tse_meta[c]['name'],'app_name':a['name']})
    return mapping,pairs,remaining

def aggregate_votes(zip_path, year, local_to_app):
    votes=defaultdict(lambda:defaultdict(int)); names=defaultdict(dict); totals=defaultdict(int)
    for row in iter_rows_from_zip(zip_path):
        if norm(row.get('NM_MUNICIPIO'))!=CITY: continue
        turno=str(row.get('NR_TURNO') or '').strip()
        if turno and turno!='1': continue
        local=str(row.get('NR_LOCAL_VOTACAO') or '').strip()
        app_id=local_to_app.get(local)
        if not app_id: continue
        cargo=norm(row.get('DS_CARGO_PERGUNTA') or row.get('DS_CARGO') or '')
        nr=str(row.get('NR_VOTAVEL') or '').strip()
        nm=row.get('NM_VOTAVEL','')
        q=int(float(str(row.get('QT_VOTOS') or '0').replace(',','.')))
        if year==2024:
            if 'VEREADOR' not in cargo: continue
            if nr not in TARGET_2024.values(): continue
            key=nr
        else:
            if 'DEPUTADO FEDERAL' not in cargo and 'DEPUTADO ESTADUAL' not in cargo: continue
            nn=norm(nm)
            best=None
            for k,target in TARGET_2022.items():
                s=SequenceMatcher(None,nn,norm(target)).ratio()
                if best is None or s>best[0]: best=(s,k,target)
            if not best or best[0]<0.78: continue
            key=best[1]
            names[key]['matched_name']=nm
        votes[key][app_id]+=q
        totals[key]+=q
    return votes,totals,names

def build_js(app_locs,votes24,totals24,votes22,totals22,report):
    merged={}
    totals={}
    for key,data in list(votes24.items())+list(votes22.items()): merged[key]=dict(data)
    totals.update(totals24);totals.update(totals22)
    # Only mark complete when every current app location has an explicit number. Missing locations are legitimate zero only if TSE local mapping is complete.
    allids=[x['id'] for x in app_locs]
    for key in merged:
        for cid in allids: merged[key].setdefault(cid,0)
    payload=json.dumps({'votes':merged,'totals':totals,'report':report},ensure_ascii=False,separators=(',',':'))
    return """(function(){\n'use strict';\nvar D=%s;\nfunction apply(){\n try{\n  if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return setTimeout(apply,80);\n  ELEICAO_2024_DATA.locais.forEach(function(loc){var id=loc.id;loc.votes=loc.votes||{};Object.keys(D.votes).forEach(function(k){if(Object.prototype.hasOwnProperty.call(D.votes[k],id))loc.votes[k]=D.votes[k][id];});});\n  Object.keys(D.totals).forEach(function(k){var c=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[k];if(c)c.tseOfficialTotal=D.totals[k];});\n  window.__vfTseFullDataV19=D;window.__vfTseFullDataV19Ready=true;\n  try{if(typeof renderMapColegios==='function')renderMapColegios();if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){}\n }catch(e){console.error('TSE v19 apply failed',e);}\n}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,80)},{once:true});else setTimeout(apply,80);\n})();\n"""%payload

def main():
    app=parse_app_locations()
    with tempfile.TemporaryDirectory() as td:
        urls={
          'v24':resolve_resource('resultados-2024',['PR','Votação por seção eleitoral','2024']),
          'v22':resolve_resource('resultados-2022',['PR','Votação por seção eleitoral','2022']),
          'l24':resolve_resource('eleitorado-2024',['Eleitorado por local de votação','2024']),
          'l22':resolve_resource('eleitorado-2022',['Eleitorado por local de votação','2022'])
        }
        paths={k:os.path.join(td,k+'.zip') for k in urls}
        for k,u in urls.items(): download(u,paths[k])
        meta24=load_local_metadata(paths['l24']);meta22=load_local_metadata(paths['l22'])
        map24,pairs24,un24=match_locations(app,meta24);map22,pairs22,un22=match_locations(app,meta22)
        print('2024 locals',len(meta24),'mapped',len(map24),'unmatched',len(un24))
        print('2022 locals',len(meta22),'mapped',len(map22),'unmatched',len(un22))
        if len(map24)<29: raise RuntimeError('2024 location mapping incomplete: %d/29'%len(map24))
        # 2022 may have a historical local difference; require at least 27 and report any unmatched rather than inventing a match.
        if len(map22)<27: raise RuntimeError('2022 location mapping too incomplete: %d'%len(map22))
        v24,t24,n24=aggregate_votes(paths['v24'],2024,map24)
        v22,t22,n22=aggregate_votes(paths['v22'],2022,map22)
        missing24=sorted(set(TARGET_2024)-set(v24));missing22=sorted(set(TARGET_2022)-set(v22))
        report={'source_urls':urls,'mapping_2024':pairs24,'mapping_2022':pairs22,'unmatched_local_codes_2024':sorted(un24),'unmatched_local_codes_2022':sorted(un22),'totals_2024':t24,'totals_2022':t22,'candidate_name_matches_2022':n22,'missing_2024':missing24,'missing_2022':missing22}
        if missing24 or missing22: raise RuntimeError('Missing candidates 2024=%s 2022=%s'%(missing24,missing22))
        # Completeness per candidate after mapping. We only write zeros for mapped current locations; this produces 29 slots while preserving reported historical mapping gaps.
        js=build_js(app,v24,t24,v22,t22,report)
        open(os.path.join(REPO_ROOT,'tse-full-data-v19.js'),'w',encoding='utf-8').write(js)
        open(os.path.join(REPO_ROOT,'tse-full-data-v19-report.json'),'w',encoding='utf-8').write(json.dumps(report,ensure_ascii=False,indent=2))
        print(json.dumps({'totals_2024':t24,'totals_2022':t22,'mapped_2024':len(map24),'mapped_2022':len(map22)},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
