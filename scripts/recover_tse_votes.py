#!/usr/bin/env python3
import json, os, re, urllib.request, time
from collections import defaultdict
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
            with urllib.request.urlopen(req,timeout=60) as r:
                return r.read() if binary else json.load(r)
        except Exception as e:
            err=e; time.sleep(.4*(i+1))
    raise err

def download_text(url,path):
    open(path,'wb').write(get(url,True))

def parse_app():
    txt=open(os.path.join(ROOT,'app.js'),encoding='utf-8').read()
    pat=re.compile(r'\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*address:\s*"([^"]*)"\s*,\s*lat:[^,]+,\s*lng:[^,]+,\s*sections:\s*(\d+)\s*,\s*total_pref:[^,]+,\s*total_ver:[^,]+,\s*votes:\s*\{([^}]*)\}\s*\}',re.S)
    out=[]
    for m in pat.finditer(txt):
        vp={k:int(v) for k,v in re.findall(r'"([^"]+)"\s*:\s*(\d+)',m.group(5))}
        out.append({'id':m.group(1),'name':m.group(2),'address':m.group(3),'sections':int(m.group(4)),'votes':vp})
    uniq={x['id']:x for x in out}; out=[uniq[k] for k in sorted(uniq)]
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
                        # In 2022 nsp is populated even when it points to the same section.
                        # In 2024 nsp is used only for a truly replaced section (e.g. 0369 -> 0200).
                        if year==2022:
                            return [s['ns'] for s in secs]
                        return [s['ns'] for s in secs if not s.get('nsp')]
    raise RuntimeError(f'Arapongas not found in {year} config')

def decode_one(year,pleito,sec,conv):
    base=f'https://resultados.tse.jus.br/oficial/ele{year}/arquivo-urna/{pleito}/dados/{UF}/{MUN}/{ZONE}/{sec}'
    aux=get(f'{base}/p000{pleito}-{UF}-m{MUN}-z{ZONE}-s{sec}-aux.json')
    hashes=[h for h in aux.get('hashes',[]) if 'totaliz' in str(h.get('st','')).lower()] or aux.get('hashes',[])
    if not hashes: raise RuntimeError(f'No hash {year} sec {sec}')
    h=hashes[0]; hh=h['hash']
    if year==2024:
        files=[x.get('nm') for x in h.get('arq',[]) if x.get('tp')=='bu']
    else:
        files=[x for x in h.get('nmarq',[]) if x.endswith('.bu')]
    if not files: raise RuntimeError(f'No BU {year} sec {sec}')
    raw=get(f'{base}/{hh}/{files[0]}',True)
    env=conv.decode('EntidadeEnvelopeGenerico',bytearray(raw)); bu=conv.decode('EntidadeBoletimUrna',env['conteudo'])
    ident=bu.get('identificacaoSecao') or env.get('identificacao',(None,{}))[1]
    local=str(ident['local']); votes={}
    for e in bu.get('resultadosVotacaoPorEleicao',[]):
        for r in e.get('resultadosVotacao',[]):
            for c in r.get('totaisVotosCargo',[]):
                cargo=c.get('codigoCargo'); cargo=cargo[1] if isinstance(cargo,tuple) else str(cargo)
                if year==2024 and cargo!='vereador': continue
                if year==2022 and cargo not in ('deputadoFederal','deputadoEstadual'): continue
                for v in c.get('votosVotaveis',[]):
                    if v.get('tipoVoto')!='nominal': continue
                    iv=v.get('identificacaoVotavel') or {}; code=int(iv.get('codigo',-1)); q=int(v.get('quantidadeVotos',0))
                    votes[(cargo,code)]=votes.get((cargo,code),0)+q
    return sec,local,votes

def collect(year,pleito,spec):
    secs=section_list(year,pleito); conv=asn1tools.compile_files(spec,codec='ber')
    perlocal=defaultdict(lambda:defaultdict(int)); section_counts=defaultdict(int); errors=[]
    def worker(s): return decode_one(year,pleito,s,conv)
    with ThreadPoolExecutor(max_workers=14) as ex:
        fut={ex.submit(worker,s):s for s in secs}
        done=0
        for f in as_completed(fut):
            s=fut[f]
            try:
                _,local,v=f.result(); section_counts[local]+=1
                for k,q in v.items(): perlocal[local][k]+=q
            except Exception as e: errors.append({'section':s,'error':str(e)})
            done+=1
            if done%40==0: print(year,'processed',done,'/',len(secs),flush=True)
    if errors: raise RuntimeError(f'{year}: {len(errors)} section failures, first={errors[:3]}')
    return dict(perlocal),dict(section_counts),secs

def app_vector(a): return tuple(a['votes'].get(k,0) for k in ELECTED)
def tse_vector(v): return tuple(v.get(('vereador',int(k)),0) for k in ELECTED)

def map_locations(app,raw24,counts24):
    remaining=set(raw24); mapping={}; details=[]
    for a in app:
        av=app_vector(a); exact=[loc for loc in remaining if tse_vector(raw24[loc])==av]
        if len(exact)==1:
            loc=exact[0]; remaining.remove(loc); mapping[loc]=a['id']; details.append({'tse_local':loc,'app_id':a['id'],'name':a['name'],'method':'exact-15-candidate-vector','sections_app':a['sections'],'sections_tse':counts24.get(loc)})
    unresolved=[a for a in app if a['id'] not in mapping.values()]
    while unresolved:
        progress=False
        for a in list(unresolved):
            cand=[]; av=app_vector(a)
            for loc in remaining:
                tv=tse_vector(raw24[loc]); diff=sum(abs(x-y) for x,y in zip(av,tv)); sec_pen=0 if counts24.get(loc)==a['sections'] else 100000
                cand.append((sec_pen+diff,diff,loc))
            cand.sort()
            if not cand: continue
            best=cand[0]; second=cand[1] if len(cand)>1 else (10**9,10**9,'')
            if best[0]<100000 and (best[1]==0 or second[0]-best[0]>=40):
                loc=best[2]; remaining.remove(loc); mapping[loc]=a['id']; details.append({'tse_local':loc,'app_id':a['id'],'name':a['name'],'method':'validated-nearest-vector','l1_difference':best[1],'sections_app':a['sections'],'sections_tse':counts24.get(loc)}); unresolved.remove(a); progress=True
        if not progress: break
    if len(mapping)!=29:
        diag=[]
        for a in unresolved:
            ranked=sorted((sum(abs(x-y) for x,y in zip(app_vector(a),tse_vector(raw24[l]))),counts24.get(l),l) for l in remaining)[:4]
            diag.append({'app':a['id'],'name':a['name'],'sections':a['sections'],'closest':ranked})
        raise RuntimeError('Could not safely map all 29 locations: '+json.dumps(diag,ensure_ascii=False))
    return mapping,details

def aggregate_targets(raw,mapping,year):
    out=defaultdict(lambda:defaultdict(int)); totals=defaultdict(int)
    for local,votes in raw.items():
        cid=mapping.get(local)
        if not cid: continue
        if year==2024:
            for key in TARGET24:
                q=votes.get(('vereador',int(key)),0); out[key][cid]+=q; totals[key]+=q
        else:
            for key,num in TARGET22.items():
                ck='deputadoFederal' if key.startswith('dep_fed_') else 'deputadoEstadual'
                q=votes.get((ck,num),0); out[key][cid]+=q; totals[key]+=q
    allids=sorted(mapping.values())
    for k in (TARGET24 if year==2024 else TARGET22):
        for cid in allids: out[k].setdefault(cid,0)
    return {k:dict(v) for k,v in out.items()},dict(totals)

def build_js(votes,totals,report):
    payload=json.dumps({'votes':votes,'totals':totals,'report':report},ensure_ascii=False,separators=(',',':'))
    return """(function(){'use strict';var D=%s;function apply(){try{if(typeof ELEICAO_2024_DATA==='undefined'||!ELEICAO_2024_DATA||!Array.isArray(ELEICAO_2024_DATA.locais))return setTimeout(apply,80);ELEICAO_2024_DATA.locais.forEach(function(loc){loc.votes=loc.votes||{};Object.keys(D.votes).forEach(function(k){loc.votes[k]=D.votes[k][loc.id]||0;});});Object.keys(D.totals).forEach(function(k){var c=ELEICAO_2024_DATA.candidates&&ELEICAO_2024_DATA.candidates[k];if(c)c.tseOfficialTotal=D.totals[k];});window.__vfTseFullDataV19=D;window.__vfTseFullDataV19Ready=true;try{if(typeof renderMapColegios==='function')renderMapColegios();if(typeof renderTableColegios==='function')renderTableColegios();}catch(_){} }catch(e){console.error('TSE v19 apply failed',e);}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,80)},{once:true});else setTimeout(apply,80);})();\n"""%payload

def main():
    app=parse_app()
    spec24='/tmp/bu24.asn1'; spec22='/tmp/bu22.asn1'
    download_text('https://raw.githubusercontent.com/doccaz/urnas-br/main/docv2/spec/bu.asn1',spec24)
    download_text('https://raw.githubusercontent.com/doccaz/urnas-br/main/doc/spec/bu.asn1',spec22)
    raw24,c24,s24=collect(2024,'452',spec24)
    print('2024 local count',len(raw24),'section count',sum(c24.values()),flush=True)
    mapping,details=map_locations(app,raw24,c24)
    raw22,c22,s22=collect(2022,'406',spec22)
    print('2022 local count',len(raw22),'section count',sum(c22.values()),flush=True)
    if not s22 or not raw22: raise RuntimeError('2022 reconstruction returned no sections or locals')
    unknown22=sorted(set(raw22)-set(mapping))
    if unknown22: raise RuntimeError('2022 contains local numbers not mapped from 2024: '+repr(unknown22))
    missing2022locals=sorted(set(mapping)-set(raw22))
    if missing2022locals: raise RuntimeError('2022 is missing mapped polling places: '+repr(missing2022locals))
    v24,t24=aggregate_targets(raw24,mapping,2024); v22,t22=aggregate_targets(raw22,mapping,2022)
    if set(t22)!=set(TARGET22): raise RuntimeError('Missing 2022 candidate totals: '+repr(sorted(set(TARGET22)-set(t22))))
    zero22=[k for k,v in t22.items() if v<=0]
    if zero22: raise RuntimeError('Zero 2022 candidate totals: '+repr(zero22))
    votes={**v24,**v22}; totals={**t24,**t22}
    coverage={k:len(v) for k,v in votes.items()}
    bad=[k for k,n in coverage.items() if n!=29]
    if bad: raise RuntimeError('Not 29/29: '+repr(bad))
    app_tot={k:sum(a['votes'].get(k,0) for a in app) for k in ELECTED}
    elected_check={k:{'tse':t24[k],'previous_app':app_tot[k],'match':t24[k]==app_tot[k]} for k in ELECTED}
    report={'source':'Official TSE ballot-box BU files (resultados.tse.jus.br)','municipality_code':MUN,'zone':ZONE,'sections_2024':len(s24),'sections_2024_processed':sum(c24.values()),'sections_2022':len(s22),'sections_2022_processed':sum(c22.values()),'tse_locals_2024':len(raw24),'tse_locals_2022':len(raw22),'location_mapping':details,'coverage':coverage,'totals_2024':t24,'totals_2022':t22,'elected_integrity_check':elected_check,'candidate_numbers_2022':TARGET22}
    open(os.path.join(ROOT,'tse-full-data-v19.js'),'w',encoding='utf-8').write(build_js(votes,totals,report))
    open(os.path.join(ROOT,'tse-full-data-v19-report.json'),'w',encoding='utf-8').write(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps({'all_coverage_29':not bad,'totals_2024':t24,'totals_2022':t22,'elected_integrity_check':elected_check},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
