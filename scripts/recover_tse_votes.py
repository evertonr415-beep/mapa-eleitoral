#!/usr/bin/env python3
import json, os, re, urllib.request, time
from collections import defaultdict, Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
import asn1tools

ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
MUN='74276'; ZONE='0061'; UF='pr'
ELECTED=['20220','55155','11234','44044','70000','40133','20120','11555','44567','55555','55147','22777','44190','55120','12500']
TARGET24=ELECTED+['11500','11444','13100','55456','10123','22622','22123']
TARGET22={
'dep_fed_lupion':1111,'dep_fed_filipe':2201,'dep_fed_beto':5501,'dep_fed_angelica':9020,'dep_fed_deltan':1919,'dep_fed_luisa':5511,'dep_fed_fahur':5590,'dep_fed_zeca':1310,'dep_fed_aliel':4343,'dep_fed_francischini':4444,'dep_fed_sperafico':1122,
'dep_est_tiago':55155,'dep_est_bazana':55600,'dep_est_tercilio':55043,'dep_est_curi':55128,'dep_est_jacovos':22038,'dep_est_cobra':55055,'dep_est_pacheco':10100,'dep_est_arilson':13000}
UA={'User-Agent':'Mozilla/5.0'}

def get(url,binary=False,retries=4):
    err=None
    for i in range(retries):
        try:
            req=urllib.request.Request(url,headers=UA)
            with urllib.request.urlopen(req,timeout=60) as r:return r.read() if binary else json.load(r)
        except Exception as e: err=e; time.sleep(.4*(i+1))
    raise err

def parse_app():
    txt=open(os.path.join(ROOT,'app.js'),encoding='utf-8').read()
    pat=re.compile(r'\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*address:\s*"([^"]*)"\s*,\s*lat:[^,]+,\s*lng:[^,]+,\s*sections:\s*(\d+)\s*,\s*total_pref:[^,]+,\s*total_ver:[^,]+,\s*votes:\s*\{([^}]*)\}\s*\}',re.S)
    out=[]
    for m in pat.finditer(txt):
        vp={k:int(v) for k,v in re.findall(r'"([^"]+)"\s*:\s*(\d+)',m.group(5))}
        out.append({'id':m.group(1),'name':m.group(2),'address':m.group(3),'sections':int(m.group(4)),'votes':vp})
    out=list({x['id']:x for x in out}.values()); out.sort(key=lambda x:x['id'])
    if len(out)!=29: raise RuntimeError(f'Expected 29 app locations, found {len(out)}')
    return out

def section_list(year,pleito):
    cfg=get(f'https://resultados.tse.jus.br/oficial/ele{year}/arquivo-urna/{pleito}/config/pr/pr-p000{pleito}-cs.json')
    for abr in cfg.get('abr',[]):
        for mu in abr.get('mu',[]):
            if mu.get('cd')==MUN:
                for z in mu.get('zon',[]):
                    if z.get('cd')==ZONE:
                        secs=z.get('sec',[])
                        return [s['ns'] for s in secs] if year==2022 else [s['ns'] for s in secs if not s.get('nsp')]
    raise RuntimeError(f'Arapongas not found in {year} config')

def decode_one(year,pleito,sec,conv):
    base=f'https://resultados.tse.jus.br/oficial/ele{year}/arquivo-urna/{pleito}/dados/{UF}/{MUN}/{ZONE}/{sec}'
    aux=get(f'{base}/p000{pleito}-{UF}-m{MUN}-z{ZONE}-s{sec}-aux.json')
    hashes=[h for h in aux.get('hashes',[]) if 'totaliz' in str(h.get('st','')).lower()] or aux.get('hashes',[])
    if not hashes: raise RuntimeError(f'No hash {year} sec {sec}')
    h=hashes[0]
    files=[x.get('nm') for x in h.get('arq',[]) if x.get('tp')=='bu'] if year==2024 else [x for x in h.get('nmarq',[]) if x.endswith('.bu')]
    if not files: raise RuntimeError(f'No BU {year} sec {sec}')
    raw=get(f"{base}/{h['hash']}/{files[0]}",True)
    env=conv.decode('EntidadeEnvelopeGenerico',bytearray(raw)); bu=conv.decode('EntidadeBoletimUrna',env['conteudo'])
    ident=bu.get('identificacaoSecao') or env.get('identificacao',(None,{}))[1]; local=str(ident['local']); votes={}
    for e in bu.get('resultadosVotacaoPorEleicao',[]):
        for r in e.get('resultadosVotacao',[]):
            for c in r.get('totaisVotosCargo',[]):
                cargo=c.get('codigoCargo'); cargo=cargo[1] if isinstance(cargo,tuple) else str(cargo)
                if year==2024 and cargo!='vereador': continue
                if year==2022 and cargo not in ('deputadoFederal','deputadoEstadual'): continue
                for v in c.get('votosVotaveis',[]):
                    if v.get('tipoVoto')!='nominal': continue
                    iv=v.get('identificacaoVotavel') or {}; code=int(iv.get('codigo',-1)); q=int(v.get('quantidadeVotos',0)); votes[(cargo,code)]=votes.get((cargo,code),0)+q
    return sec,local,votes

def collect(year,pleito,spec):
    secs=section_list(year,pleito); conv=asn1tools.compile_files(spec,codec='ber'); perlocal=defaultdict(lambda:defaultdict(int)); counts=defaultdict(int); sec_local={}; errors=[]
    with ThreadPoolExecutor(max_workers=14) as ex:
        fut={ex.submit(decode_one,year,pleito,s,conv):s for s in secs}; done=0
        for f in as_completed(fut):
            s=fut[f]
            try:
                _,local,v=f.result(); counts[local]+=1; sec_local[str(int(s))]=local
                for k,q in v.items(): perlocal[local][k]+=q
            except Exception as e: errors.append({'section':s,'error':str(e)})
            done+=1
            if done%40==0: print(year,'processed',done,'/',len(secs),flush=True)
    if errors: raise RuntimeError(f'{year}: {len(errors)} section failures, first={errors[:3]}')
    return dict(perlocal),dict(counts),secs,sec_local

def app_vector(a): return tuple(a['votes'].get(k,0) for k in ELECTED)
def tse_vector(v): return tuple(v.get(('vereador',int(k)),0) for k in ELECTED)

def map_2024(app,raw24,c24):
    remaining=set(raw24); mapping={}; details=[]
    for a in app:
        exact=[loc for loc in remaining if tse_vector(raw24[loc])==app_vector(a)]
        if len(exact)==1:
            loc=exact[0]; remaining.remove(loc); mapping[loc]=a['id']; details.append({'tse_local':loc,'app_id':a['id'],'name':a['name'],'method':'exact-15-candidate-vector','sections_app':a['sections'],'sections_tse':c24.get(loc)})
    if len(mapping)!=29: raise RuntimeError(f'Only {len(mapping)}/29 polling places matched exactly against the 15 elected-councillor vectors')
    if any(d['sections_app']!=d['sections_tse'] for d in details): raise RuntimeError('2024 section-count validation failed')
    return mapping,details

def map_2022(raw22,sec22,sec24,map24):
    mapping={}; details=[]
    by_old=defaultdict(list)
    for sec,old in sec22.items(): by_old[old].append(sec)
    for old in sorted(raw22):
        if old in map24:
            mapping[old]=map24[old]; details.append({'tse_local_2022':old,'app_id':map24[old],'method':'same-local-code','sections':len(by_old[old])}); continue
        dest=[]
        for sec in by_old[old]:
            newlocal=sec24.get(sec)
            if newlocal in map24: dest.append(map24[newlocal])
        counts=Counter(dest)
        if not counts: raise RuntimeError(f'Historical 2022 local {old} has no section continuity into 2024')
        app_id,n=counts.most_common(1)[0]
        if len(counts)>1 or n!=len(dest): raise RuntimeError(f'Ambiguous section continuity for 2022 local {old}: {dict(counts)}')
        mapping[old]=app_id; details.append({'tse_local_2022':old,'app_id':app_id,'method':'section-number-continuity','sections_2022':len(by_old[old]),'sections_with_2024_match':n})
    return mapping,details

def aggregate(raw,mapping,year,allids):
    out=defaultdict(lambda:defaultdict(int)); totals=defaultdict(int)
    for local,votes in raw.items():
        cid=mapping.get(local)
        if not cid: raise RuntimeError(f'No display mapping for {year} local {local}')
        targets=TARGET24 if year==2024 else TARGET22
        for key in targets:
            if year==2024: q=votes.get(('vereador',int(key)),0)
            else: q=votes.get(('deputadoFederal' if key.startswith('dep_fed_') else 'deputadoEstadual',TARGET22[key]),0)
            out[key][cid]+=q; totals[key]+=q
    for k in (TARGET24 if year==2024 else TARGET22):
        for cid in allids: out[k].setdefault(cid,0)
    return {k:dict(v) for k,v in out.items()},dict(totals)

def build_js(votes,totals,report):
    p=json.dumps({'votes':votes,'totals':totals,'report':report},ensure_ascii=False,separators=(',',':'))
    return """(function(){'use strict';var D=%s;function apply(){try{if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return setTimeout(apply,80);ELEICAO_2024_DATA.locais.forEach(function(loc){loc.votes=loc.votes||{};Object.keys(D.votes).forEach(function(k){loc.votes[k]=D.votes[k][loc.id]||0;});});Object.keys(D.totals).forEach(function(k){var c=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[k];if(c)c.tseOfficialTotal=D.totals[k];});window.__vfTseFullDataV19=D;window.__vfTseFullDataV19Ready=true;try{if(typeof renderMapColegios==='function')renderMapColegios();if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){} }catch(e){console.error('TSE v19 apply failed',e);}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,80)},{once:true});else setTimeout(apply,80);})();\n"""%p

def main():
    app=parse_app(); allids=[x['id'] for x in app]
    s24='/tmp/bu24.asn1'; s22='/tmp/bu22.asn1'; open(s24,'wb').write(get('https://raw.githubusercontent.com/doccaz/urnas-br/main/docv2/spec/bu.asn1',True)); open(s22,'wb').write(get('https://raw.githubusercontent.com/doccaz/urnas-br/main/doc/spec/bu.asn1',True))
    raw24,c24,secs24,sl24=collect(2024,'452',s24); print('2024 locals',len(raw24),'sections',sum(c24.values()),flush=True)
    m24,d24=map_2024(app,raw24,c24)
    raw22,c22,secs22,sl22=collect(2022,'406',s22); print('2022 locals',len(raw22),'sections',sum(c22.values()),flush=True)
    if not raw22: raise RuntimeError('No 2022 BU data')
    m22,d22=map_2022(raw22,sl22,sl24,m24)
    v24,t24=aggregate(raw24,m24,2024,allids); v22,t22=aggregate(raw22,m22,2022,allids)
    if set(t22)!=set(TARGET22) or any(t22[k]<=0 for k in TARGET22): raise RuntimeError('One or more 2022 target totals were not recovered')
    votes={**v24,**v22}; totals={**t24,**t22}; coverage={k:len(v) for k,v in votes.items()}
    if any(n!=29 for n in coverage.values()): raise RuntimeError('Coverage is not 29/29')
    app_tot={k:sum(a['votes'].get(k,0) for a in app) for k in ELECTED}; check={k:{'tse':t24[k],'previous_app':app_tot[k],'match':t24[k]==app_tot[k]} for k in ELECTED}
    if not all(x['match'] for x in check.values()): raise RuntimeError('Existing elected-councillor integrity check failed')
    report={'source':'Official TSE ballot-box BU files (resultados.tse.jus.br)','municipality_code':MUN,'zone':ZONE,'sections_2024':len(secs24),'sections_2024_processed':sum(c24.values()),'sections_2022':len(secs22),'sections_2022_processed':sum(c22.values()),'tse_locals_2024':len(raw24),'tse_locals_2022':len(raw22),'location_mapping_2024':d24,'location_mapping_2022':d22,'coverage':coverage,'totals_2024':t24,'totals_2022':t22,'elected_integrity_check':check,'candidate_numbers_2022':TARGET22}
    open(os.path.join(ROOT,'tse-full-data-v19.js'),'w',encoding='utf-8').write(build_js(votes,totals,report)); open(os.path.join(ROOT,'tse-full-data-v19-report.json'),'w',encoding='utf-8').write(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({'all_coverage_29':True,'totals_2024':t24,'totals_2022':t22,'mapping_2022':d22},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
