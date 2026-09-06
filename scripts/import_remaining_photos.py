#!/usr/bin/env python3
import html as html_lib
import json
import os
import re
import urllib.parse
import urllib.request

OUT_DIR=os.path.join('assets','politicians')
MANIFEST=os.path.join(OUT_DIR,'photos.json')
REPORT=os.path.join(OUT_DIR,'remaining-import-report.json')

SOURCES={
  'pref_milani':('Jair Milani','22','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2024/pr/prefeito/jair-milani-160001929033.shtml','folha'),
  '70000':('João Graça','70000','https://tnonline.uol.com.br/eleicoes/2024/vereador/joao-graca---candidato-a-vereador-904609','tn'),
  '11500':('Marcos da Ass. Algo Novo','11500','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2024/pr/vereador/marcos-da-ass-algo-novo-160001933122.shtml','folha'),
  '55456':('Toxinha','55456','https://tnonline.uol.com.br/eleicoes/2024/vereador/toxinha---candidato-a-vereador-902537','tn'),
  '10123':('Rodrigo de Deus','10123','https://tnonline.uol.com.br/eleicoes/2024/vereador/rodrigo-de-deus---candidato-a-vereador-902490','tn'),
  '22622':('Rubão','22622','https://tnonline.uol.com.br/eleicoes/2024/vereador/rubao---candidato-a-vereador-904716','tn'),
  '22123':('Ricardo Edmotta','22123','https://tnonline.uol.com.br/eleicoes/2024/vereador/ricardo-edmotta---candidato-a-vereador-904697','tn'),
  'dep_fed_angelica':('Angelica Enfermeira','9020','https://tnonline.uol.com.br/eleicoes/2022/deputado-federal/angelica-enfermeira-candidata-a-deputada-federal-672695','tn'),
}

def get(url,binary=False,referer=None):
    headers={
      'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
      'Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' if binary else 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language':'pt-BR,pt;q=0.9,en;q=0.7',
      'Accept-Encoding':'identity',
    }
    if referer:headers['Referer']=referer
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as r:return r.read(),dict(r.headers),r.geturl()

def text_ok(html,name,number):
    plain=re.sub(r'<[^>]+>',' ',html_lib.unescape(html)).upper()
    tokens=[x for x in re.sub(r'[^A-Z0-9ÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+',' ',name.upper()).split() if len(x)>=4]
    return str(number) in plain and any(t in plain for t in tokens)

def find_folha(html):
    urls=re.findall(r'https?://f\.i\.uol\.com\.br/folha/eleicoes/[^"\'<>\\ ]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"\'<>\\ ]*)?',html,re.I)
    return html_lib.unescape(urls[0]).replace('\\/','/') if urls else ''

def find_tn(html,name):
    raw=html_lib.unescape(html).replace('\\/','/')
    urls=re.findall(r'https?://cdn\.tnonline\.com\.br/img/Artigo-Destaque/[^"\'<> ]+',raw,re.I)
    # candidate portraits on TN are under Artigo-Destaque and usually contain the candidate name or 'Candidato'.
    parts=[p.lower() for p in re.sub(r'[^A-Za-z0-9]+',' ',name).split() if len(p)>=4]
    ranked=[]
    for u in urls:
        low=urllib.parse.unquote(u).lower()
        if 'tnonline-share' in low or 'fallback=' in low and 'tnonline-share' in low:continue
        score=0
        if 'candidat' in low:score+=30
        score+=sum(8 for p in parts if p in low)
        if '/158x220/' in low:score+=10
        if 'fallback=' in low:score+=2
        ranked.append((score,u))
    ranked.sort(reverse=True)
    if ranked and ranked[0][0]>=20:return ranked[0][1]
    return ''

def ext_for(url,headers):
    ct=str(headers.get('Content-Type','')).lower()
    if 'webp' in ct:return '.webp'
    if 'png' in ct:return '.png'
    return '.jpg'

def main():
    os.makedirs(OUT_DIR,exist_ok=True)
    try:
        manifest=json.load(open(MANIFEST,encoding='utf-8'))
        if not isinstance(manifest,dict):manifest={}
    except Exception:manifest={}
    report={'found':{},'failed':{}}
    for key,(name,number,page,kind) in SOURCES.items():
        try:
            raw,h,final=get(page);html=raw.decode('utf-8','ignore')
            if not text_ok(html,name,number):raise RuntimeError('identity_validation_failed')
            image=find_folha(html) if kind=='folha' else find_tn(html,name)
            if not image:raise RuntimeError('candidate_image_not_found')
            data,ih,ifinal=get(image,binary=True,referer=final)
            if len(data)<1800:raise RuntimeError('candidate_image_too_small')
            ext=ext_for(ifinal,ih)
            for oldext in ('.jpg','.png','.webp'):
                old=os.path.join(OUT_DIR,key+oldext)
                if os.path.exists(old) and oldext!=ext:os.remove(old)
            path=os.path.join(OUT_DIR,key+ext)
            with open(path,'wb') as f:f.write(data)
            manifest[key]='/'+path.replace(os.sep,'/')
            report['found'][key]={'name':name,'number':number,'page':page,'image':image,'file':manifest[key],'bytes':len(data)}
            print('OK',key,manifest[key],len(data))
        except Exception as e:
            report['failed'][key]={'name':name,'number':number,'page':page,'error':str(e)}
            print('FAIL',key,e)
    with open(MANIFEST,'w',encoding='utf-8') as f:json.dump(manifest,f,ensure_ascii=False,indent=2,sort_keys=True)
    with open(REPORT,'w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2,sort_keys=True)
    print('TOTAL',len(manifest),'FOUND_NOW',len(report['found']),'FAILED_NOW',len(report['failed']))
    if len(manifest)!=43 or report['failed']:
        raise SystemExit(f'Photo gate failed: manifest={len(manifest)}/43 remaining_failures={len(report["failed"])}')

if __name__=='__main__':main()
