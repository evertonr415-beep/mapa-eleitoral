#!/usr/bin/env python3
import html as html_lib
import json
import os
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from html.parser import HTMLParser

OUT_DIR=os.path.join('assets','politicians')
MANIFEST=os.path.join(OUT_DIR,'photos.json')
REPORT=os.path.join(OUT_DIR,'profile-import-report.json')

SOURCES={
  'pref_cita':('Rafael Cita','55','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/prefeito/rafael-cita-psd-55/'),
  'pref_milani':('Jair Milani','22','https://tnonline.uol.com.br/eleicoes/2024/prefeito/jair-milani---candidato-a-prefeito-901806'),
  '20220':('Décio Rosanelli','20220','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/decio-rosanelli-pode-20220/'),
  '55155':('Levi do Handebol','55155','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/levi-do-handebol-psd-55155/'),
  '11234':('Paulo Grassano','11234','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/paulo-grassano-pp-11234/'),
  '44044':('Toninho da Ambulância','44044','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/toninho-da-ambulancia-uniao-44044/'),
  '70000':('João Graça','70000','https://tnonline.uol.com.br/eleicoes/2024/vereador/joao-graca---candidato-a-vereador-902509'),
  '40133':('Márcio Nicke','40133','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/marcio-nicke-psb-40133/'),
  '20120':('Aroldo Pagan','20120','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/aroldo-pagan-pode-20120/'),
  '11555':('Professor Marcelo','11555','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/professor-marcelo-pp-11555/'),
  '44567':('Alexandre Juliani Sorriso','44567','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/alexandre-juliani-sorriso-uniao-44567/'),
  '55555':('Simone Sponton Mãe de Autista','55555','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/simone-sponton-mae-de-autista-psd-55555/'),
  '55147':('Luisinho da Saúde','55147','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/luisinho-da-saude-psd-55147/'),
  '22777':('Diretora Marilsa Staub','22777','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/diretora-marilsa-staub-pl-22777/'),
  '44190':('Pardini','44190','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/pardini-uniao-44190/'),
  '55120':('Cecéu','55120','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/ceceu-psd-55120/'),
  '12500':('Meiry Farias Proteção Animal','12500','https://www.tribunapr.com.br/eleicoes/2024/candidatos/pr/arapongas/vereador/meiry-farias-protecao-animal-pdt-12500/'),
  '11500':('Marcos da Ass. Algo Novo','11500','https://tnonline.uol.com.br/eleicoes/2024/vereador/marcos-da-ass-algo-novo---candidato-a-vereador-901979'),
  '11444':('Silvano Santos','11444','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2024/pr/vereador/silvano-santos-160001933127.shtml'),
  '13100':('Professor Márcio Diniz','13100','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2024/pr/vereador/professor-marcio-diniz-160002019911.shtml'),
  '55456':('Toxinha','55456','https://tnonline.uol.com.br/eleicoes/2024/vereador/toxinha---candidato-a-vereador-902537'),
  '10123':('Rodrigo de Deus','10123','https://tnonline.uol.com.br/eleicoes/2024/vereador/rodrigo-de-deus---candidato-a-vereador-902490'),
  '22622':('Rubão','22622','https://tnonline.uol.com.br/eleicoes/2024/vereador/rubao---candidato-a-vereador-904716'),
  '22123':('Ricardo Edmotta','22123','https://tnonline.uol.com.br/eleicoes/2024/vereador/ricardo-edmotta---candidato-a-vereador-904697'),
  'dep_fed_lupion':('Pedro Lupion','1111','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/pedro-lupion-160001603295.shtml'),
  'dep_fed_filipe':('Filipe Barros','2201','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/filipe-barros-160001622028.shtml'),
  'dep_fed_beto':('Beto Preto','5501','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/beto-preto-160001622285.shtml'),
  'dep_fed_angelica':('Angelica Enfermeira','9020','https://tnonline.uol.com.br/eleicoes/2022/deputado-federal/angelica-enfermeira-candidata-a-deputada-federal-672695'),
  'dep_fed_deltan':('Deltan Dallagnol','1919','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/deltan-dallagnol-160001654827.shtml'),
  'dep_fed_luisa':('Luísa Canziani','5511','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/luisa-canziani-160001622297.shtml'),
  'dep_fed_fahur':('Sargento Fahur','5590','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/sargento-fahur-160001622298.shtml'),
  'dep_fed_zeca':('Zeca Dirceu','1310','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/zeca-dirceu-160001614527.shtml'),
  'dep_fed_aliel':('Aliel Machado','4343','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/aliel-machado-160001614510.shtml'),
  'dep_fed_francischini':('Felipe Francischini','4444','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/felipe-francischini-160001654655.shtml'),
  'dep_fed_sperafico':('Dilceu Sperafico','1122','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-federal/dilceu-sperafico-160001603297.shtml'),
  'dep_est_tiago':('Tiago Amaral','55155','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/tiago-amaral-160001623115.shtml'),
  'dep_est_bazana':('Pedro Paulo Bazana','55600','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/pedro-paulo-bazana-160001623132.shtml'),
  'dep_est_tercilio':('Tercilio Turini','55043','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/tercilio-turini-160001623105.shtml'),
  'dep_est_curi':('Alexandre Curi','55128','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/alexandre-curi-160001623100.shtml'),
  'dep_est_jacovos':('Delegado Jacovos','22038','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/delegado-jacovos-160001654963.shtml'),
  'dep_est_cobra':('Cobra Repórter','55055','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/cobra-reporter-160001623099.shtml'),
  'dep_est_pacheco':('Marcio Pacheco','10100','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/marcio-pacheco-160001716110.shtml'),
  'dep_est_arilson':('Arilson Chiorato','13000','https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2022/pr/deputado-estadual/arilson-chiorato-160001615010.shtml'),
}

class ImageParser(HTMLParser):
    def __init__(self): super().__init__(); self.items=[]
    def handle_starttag(self,tag,attrs):
        d={str(k).lower():str(v or '') for k,v in attrs if k};t=tag.lower()
        if t=='meta':
            key=(d.get('property') or d.get('name') or '').lower()
            if key in ('og:image','og:image:url','twitter:image','twitter:image:src') and d.get('content'):self.items.append((d['content'],d.get('alt',''),'meta'))
        if t in ('img','source'):
            alt=d.get('alt') or d.get('title') or d.get('aria-label') or ''
            for a in ('src','data-src','data-lazy-src','data-original','data-image','srcset','data-srcset'):
                val=d.get(a,'')
                if not val:continue
                for chunk in [x.strip().split()[0] for x in val.split(',') if x.strip()]:self.items.append((chunk,alt,t))

def norm(s):
    s=unicodedata.normalize('NFD',str(s or ''));s=''.join(ch for ch in s if unicodedata.category(ch)!='Mn')
    return re.sub(r'[^A-Z0-9]+',' ',s.upper()).strip()

def get(url,binary=False,referer=None):
    headers={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36','Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' if binary else 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'pt-BR,pt;q=0.9,en;q=0.7','Accept-Encoding':'identity'}
    if referer:headers['Referer']=referer
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as r:return r.read(),dict(r.headers),r.geturl()

def identity_ok(html,name,number):
    text=norm(re.sub(r'<[^>]+>',' ',html_lib.unescape(html)));n=norm(name);parts=[p for p in n.split() if len(p)>=4]
    return str(number) in text and (sum(1 for p in parts if p in text)>=1 or n in text)

def page_candidate_id(page_url):
    m=re.search(r'(\d{12})',page_url);return m.group(1) if m else ''

def image_score(url,alt,name,page_url):
    u=html_lib.unescape(url).replace('\\/','/');low=u.lower();a=norm(alt);n=norm(name);score=0
    if not u or u.startswith('data:'):return -100
    if any(x in low for x in ('logo','favicon','sprite','tnonline-share','placeholder','default-avatar','avatar-default','banner')):return -100
    cid=page_candidate_id(page_url)
    if cid and cid in u:score+=100
    parts=[p for p in n.split() if len(p)>=4];score+=sum(12 for p in parts if p in a)
    if n and n in a:score+=40
    if 'CANDIDAT' in a:score+=15
    if any(x in low for x in ('candidat','eleicoes','eleicao','tse','divulga')):score+=10
    if re.search(r'\.(jpg|jpeg|png|webp)(?:\?|$)',low):score+=5
    if any(x in low for x in ('share.','/share','social','og-image','og_image')):score-=50
    return score

def find_image(html,page_url,name):
    m=re.search(r'https?://www\.tribunapr\.com\.br/hermes-media/eleicoes/20(?:22|24)/candidatos/pr/[0-9]+\.jpg',html,re.I)
    if m:return html_lib.unescape(m.group(0)).replace('\\/','/')
    p=ImageParser();p.feed(html);rank=[]
    for u,alt,kind in p.items:
        if u.startswith('//'):u='https:'+u
        u=urllib.parse.urljoin(page_url,u);s=image_score(u,alt,name,page_url)
        if s>0:rank.append((s,u,alt,kind))
    for u in re.findall(r'https?://[^"\'<>\\ ]+?(?:\.jpg|\.jpeg|\.png|\.webp)(?:\?[^"\'<>\\ ]*)?',html,re.I):
        u=html_lib.unescape(u).replace('\\/','/');s=image_score(u,'',name,page_url)
        if s>0:rank.append((s,u,'','raw'))
    rank.sort(key=lambda x:x[0],reverse=True)
    return rank[0][1] if rank and rank[0][0]>=10 else ''

def ext_for(url,headers):
    ct=str(headers.get('Content-Type','')).lower()
    if 'png' in ct:return '.png'
    if 'webp' in ct:return '.webp'
    if 'jpeg' in ct or 'jpg' in ct:return '.jpg'
    p=urllib.parse.urlparse(url).path.lower()
    for e in ('.jpg','.jpeg','.png','.webp'):
        if p.endswith(e):return '.jpg' if e=='.jpeg' else e
    return '.jpg'

def main():
    os.makedirs(OUT_DIR,exist_ok=True);manifest={};report={'found':{},'failed':{}}
    for i,(key,(name,number,page)) in enumerate(SOURCES.items(),1):
        print(f'[{i}/{len(SOURCES)}] {key} {name} {number}')
        try:
            raw,hdrs,final=get(page);html=raw.decode('utf-8','ignore')
            if not identity_ok(html,name,number):raise RuntimeError('identity_validation_failed')
            image=find_image(html,final,name)
            if not image:raise RuntimeError('candidate_image_not_found')
            data,ih,ifinal=get(image,binary=True,referer=final)
            if len(data)<4500:raise RuntimeError('image_too_small_or_generic')
            ext=ext_for(ifinal,ih)
            for oldext in ('.jpg','.png','.webp'):
                old=os.path.join(OUT_DIR,key+oldext)
                if os.path.exists(old) and oldext!=ext:os.remove(old)
            path=os.path.join(OUT_DIR,key+ext)
            with open(path,'wb') as f:f.write(data)
            manifest[key]='/'+path.replace(os.sep,'/')
            report['found'][key]={'name':name,'number':number,'page':page,'image':image,'file':manifest[key],'bytes':len(data)};print(' OK',manifest[key],len(data))
        except Exception as e:report['failed'][key]={'name':name,'number':number,'page':page,'error':str(e)};print(' FAIL',e)
        time.sleep(.3)
    with open(MANIFEST,'w',encoding='utf-8') as f:json.dump(manifest,f,ensure_ascii=False,indent=2,sort_keys=True)
    with open(REPORT,'w',encoding='utf-8') as f:json.dump(report,f,ensure_ascii=False,indent=2,sort_keys=True)
    print('FOUND',len(report['found']),'FAILED',len(report['failed']))
    if len(manifest)<43:raise SystemExit(f'Only {len(manifest)}/43 validated local photos available')
if __name__=='__main__':main()
