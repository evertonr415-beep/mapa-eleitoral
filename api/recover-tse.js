const zlib = require('zlib');

function norm(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function tokens(v){
  const stop=new Set(['DE','DA','DO','DAS','DOS','E','ESTADUAL','MUNICIPAL','ESCOLA','COLEGIO','CENTRO','PROFESSOR','PROFESSORA']);
  return new Set(norm(v).split(' ').filter(t=>t.length>1&&!stop.has(t)));
}
function jaccard(a,b){const A=tokens(a),B=tokens(b);let i=0;for(const x of A)if(B.has(x))i++;const u=new Set([...A,...B]).size;return u?i/u:0;}
function sim(a,b){const na=norm(a),nb=norm(b);if(!na||!nb)return 0;const contains=(na.includes(nb)||nb.includes(na))?1:0;return Math.min(1,0.82*jaccard(na,nb)+0.18*contains);}
function parseCsvLine(line){
  const out=[];let cur='',q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){
      if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;
    }else if(c===';'&&!q){out.push(cur);cur='';}else cur+=c;
  }
  out.push(cur);return out;
}
function parseCsv(text, onRow){
  const lines=text.split(/\r?\n/);if(!lines.length)return [];
  const headers=parseCsvLine(lines[0]).map(x=>x.replace(/^\uFEFF/,'').trim());
  for(let i=1;i<lines.length;i++){
    if(!lines[i])continue;const vals=parseCsvLine(lines[i]);const row={};
    for(let j=0;j<headers.length;j++)row[headers[j]]=vals[j]??'';
    onRow(row);
  }
  return headers;
}
function extractLargestCsv(buf){
  let eocd=-1;
  for(let i=buf.length-22;i>=Math.max(0,buf.length-66000);i--){if(buf.readUInt32LE(i)===0x06054b50){eocd=i;break;}}
  if(eocd<0)throw new Error('ZIP EOCD not found');
  const entries=buf.readUInt16LE(eocd+10);let p=buf.readUInt32LE(eocd+16),best=null;
  for(let n=0;n<entries;n++){
    if(buf.readUInt32LE(p)!==0x02014b50)throw new Error('Bad central directory');
    const method=buf.readUInt16LE(p+10),comp=buf.readUInt32LE(p+20),uncomp=buf.readUInt32LE(p+24);
    const fnLen=buf.readUInt16LE(p+28),exLen=buf.readUInt16LE(p+30),cmLen=buf.readUInt16LE(p+32),local=buf.readUInt32LE(p+42);
    const name=buf.slice(p+46,p+46+fnLen).toString('utf8');
    if(/\.csv$/i.test(name)&&(!best||uncomp>best.uncomp))best={name,method,comp,uncomp,local};
    p+=46+fnLen+exLen+cmLen;
  }
  if(!best)throw new Error('No CSV inside ZIP');
  const lp=best.local;if(buf.readUInt32LE(lp)!==0x04034b50)throw new Error('Bad local header');
  const fnLen=buf.readUInt16LE(lp+26),exLen=buf.readUInt16LE(lp+28),start=lp+30+fnLen+exLen;
  const raw=buf.slice(start,start+best.comp);
  let data;if(best.method===0)data=raw;else if(best.method===8)data=zlib.inflateRawSync(raw);else throw new Error('Unsupported ZIP method '+best.method);
  return {name:best.name,text:data.toString('latin1'),size:data.length};
}
async function fetchJson(url){const r=await fetch(url,{redirect:'follow'});if(!r.ok)throw new Error(url+' HTTP '+r.status);return r.json();}
async function fetchBuffer(url){const r=await fetch(url,{redirect:'follow'});if(!r.ok)throw new Error(url+' HTTP '+r.status);return Buffer.from(await r.arrayBuffer());}
async function ckan(slug){const j=await fetchJson('https://dadosabertos.tse.jus.br/api/3/action/package_show?id='+encodeURIComponent(slug));if(!j.success)throw new Error('CKAN '+slug);return j.result.resources;}
function pick(resources,year,kind){
  let best=null;
  for(const r of resources){
    const name=norm(r.name||r.description||'');let score=0;
    if(kind==='votes'){
      if(name.includes('VOTACAO POR SECAO ELEITORAL'))score+=100;
      if(name.startsWith('PR ')||(' '+name+' ').includes(' PR '))score+=60;
      if(name.includes(String(year)))score+=10;
      if(name.includes('HASH')||name.startsWith('BR '))score-=100;
    }else{
      if(name.includes('ELEITORADO POR LOCAL DE VOTACAO'))score+=100;
      if(name.includes(String(year)))score+=10;
    }
    if(r.url&&(!best||score>best.score))best={score,name,url:r.url,id:r.id};
  }
  if(!best||best.score<90)throw new Error('Resource not found '+kind+' '+year+' '+JSON.stringify(best));
  return best;
}
function parseApp(text){
  const candidates={};
  const cStart=text.indexOf('candidates: {'),lStart=text.indexOf('locais:',cStart);
  const block=text.slice(cStart,lStart);
  const re=/"([^"]+)"\s*:\s*\{\s*name:\s*"([^"]+)"\s*,\s*party:\s*"([^"]*)"\s*,\s*category:\s*"([^"]*)"\s*,\s*type:\s*"([^"]+)"/g;
  let m;while((m=re.exec(block)))candidates[m[1]]={name:m[2],party:m[3],category:m[4],type:m[5]};
  const locations=[];const locRe=/\{\s*id:\s*"(CLG-\d+)"\s*,\s*name:\s*"([^"]+)"\s*,\s*address:\s*"([^"]*)"/g;
  const locBlock=text.slice(lStart);while((m=locRe.exec(locBlock)))locations.push({id:m[1],name:m[2],address:m[3]});
  if(Object.keys(candidates).length<40||locations.length!==29)throw new Error('App parse failed candidates='+Object.keys(candidates).length+' locations='+locations.length);
  return {candidates,locations};
}
function field(row,...names){for(const n of names)if(Object.prototype.hasOwnProperty.call(row,n))return row[n];return '';}
function parseLocals(text){
  const found=new Map();
  parseCsv(text,row=>{
    if(norm(field(row,'NM_MUNICIPIO'))!=='ARAPONGAS')return;if(field(row,'SG_UF')&&norm(field(row,'SG_UF'))!=='PR')return;
    const nr=String(field(row,'NR_LOCAL_VOTACAO')||'').trim();if(!nr)return;
    const name=field(row,'NM_LOCAL_VOTACAO','DS_LOCAL_VOTACAO','NM_LOCAL')||'';
    const address=field(row,'DS_ENDERECO','DS_LOCAL_VOTACAO_ENDERECO','ENDERECO')||'';
    const old=found.get(nr);if(!old||String(name).length>old.name.length)found.set(nr,{nr,name:String(name),address:String(address)});
  });return [...found.values()];
}
function mapLocations(system,tse){
  const unused=new Map(tse.map(x=>[x.nr,x]));const out=[];
  for(const s of system){let exact=null;for(const [nr,t] of unused){if(norm(s.name)===norm(t.name)){exact=nr;break;}}
    if(exact){const t=unused.get(exact);unused.delete(exact);out.push({...s,nr:t.nr,tse_name:t.name,tse_address:t.address,score:1});}
    else out.push({...s,nr:null,score:0});
  }
  for(const m of out){if(m.nr)continue;let best=null,bs=-1;for(const [nr,t] of unused){const sc=0.85*sim(m.name,t.name)+0.15*sim(m.address,t.address);if(sc>bs){bs=sc;best=nr;}}
    if(best){const t=unused.get(best);unused.delete(best);Object.assign(m,{nr:t.nr,tse_name:t.name,tse_address:t.address,score:+bs.toFixed(4)});}
  }
  return {mapping:out,unused:[...unused.values()]};
}
function cargoKind(v){const n=norm(v);if(n.includes('DEPUTADO FEDERAL'))return'dep_federal';if(n.includes('DEPUTADO ESTADUAL'))return'dep_estadual';if(n.includes('VEREADOR'))return'vereador';if(n.includes('PREFEITO'))return'prefeito';return null;}
function parseVotes(text,allowed){
  const rec=new Map();
  parseCsv(text,row=>{
    if(norm(field(row,'NM_MUNICIPIO'))!=='ARAPONGAS')return;if(field(row,'SG_UF')&&norm(field(row,'SG_UF'))!=='PR')return;
    const type=cargoKind(field(row,'DS_CARGO','NM_CARGO'));if(!allowed.has(type))return;
    const local=String(field(row,'NR_LOCAL_VOTACAO')||'').trim();const nr=String(field(row,'NR_VOTAVEL','NR_CANDIDATO')||'').trim();const name=String(field(row,'NM_VOTAVEL','NM_URNA_CANDIDATO','NM_CANDIDATO')||'').trim();
    const votos=Number(String(field(row,'QT_VOTOS','QT_VOTOS_NOMINAIS')||'0').replace(/\D/g,''))||0;if(!local||!nr)return;
    const k=type+'|'+nr+'|'+norm(name);let x=rec.get(k);if(!x){x={type,nr,name,total:0,byLocal:{}};rec.set(k,x);}x.total+=votos;x.byLocal[local]=(x.byLocal[local]||0)+votos;
  });return [...rec.values()];
}
function candidateMatch(key,cand,records,year){
  const type=cand.type==='suplente'?'vereador':cand.type;const compatible=records.filter(r=>r.type===type);
  if(year===2024&&/^\d+$/.test(key)&&(cand.type==='vereador'||cand.type==='suplente')){const exact=compatible.filter(r=>String(r.nr).replace(/^0+/,'')===String(key).replace(/^0+/,''));if(exact.length)return {rec:exact.sort((a,b)=>b.total-a.total)[0],score:1};}
  let best=null,bs=-1;for(const r of compatible){const sc=sim(cand.name,r.name);if(sc>bs){best=r;bs=sc;}}return {rec:best,score:bs};
}
function build(candidates,systemLocs,records,map,year,wanted){
  const byClg=Object.fromEntries(map.filter(x=>x.nr).map(x=>[x.id,x.nr]));const recovered={},report={};
  for(const [key,cand] of Object.entries(candidates)){
    if(!wanted.has(cand.type))continue;const {rec,score}=candidateMatch(key,cand,records,year);if(!rec){report[key]={name:cand.name,status:'not_found'};continue;}
    const votes={};for(const loc of systemLocs){const nr=byClg[loc.id];votes[loc.id]=nr?(rec.byLocal[nr]||0):0;}
    const mapped=Object.values(votes).reduce((a,b)=>a+b,0),official=rec.total;
    recovered[key]={name:cand.name,matched_name:rec.name,matched_number:rec.nr,match_score:+score.toFixed(4),official_total:official,mapped_total:mapped,votes,year};
    report[key]={name:cand.name,matched_name:rec.name,matched_number:rec.nr,match_score:+score.toFixed(4),official_total:official,mapped_total:mapped,difference:official-mapped,status:(official===mapped&&score>=0.45)?'ok':'review'};
  }
  return {recovered,report};
}

module.exports = async function handler(req,res){
  try{
    const appUrl='https://raw.githubusercontent.com/evertonr415-beep/mapa-eleitoral/recovery-tse-full-data-20260906/app.js';
    const appResp=await fetch(appUrl);if(!appResp.ok)throw new Error('app.js '+appResp.status);const app=parseApp(await appResp.text());
    const [r24,r22,e24,e22]=await Promise.all([ckan('resultados-2024'),ckan('resultados-2022'),ckan('eleitorado-2024'),ckan('eleitorado-2022')]);
    const src={vote2024:pick(r24,2024,'votes'),vote2022:pick(r22,2022,'votes'),local2024:pick(e24,2024,'local'),local2022:pick(e22,2022,'local')};
    const [bV24,bV22,bL24,bL22]=await Promise.all([fetchBuffer(src.vote2024.url),fetchBuffer(src.vote2022.url),fetchBuffer(src.local2024.url),fetchBuffer(src.local2022.url)]);
    const [v24,v22,l24,l22]=[bV24,bV22,bL24,bL22].map(extractLargestCsv);
    const loc24=parseLocals(l24.text),loc22=parseLocals(l22.text);const m24=mapLocations(app.locations,loc24),m22=mapLocations(app.locations,loc22);
    const rec24=parseVotes(v24.text,new Set(['prefeito','vereador'])),rec22=parseVotes(v22.text,new Set(['dep_federal','dep_estadual']));
    const y24=build(app.candidates,app.locations,rec24,m24.mapping,2024,new Set(['prefeito','vereador','suplente']));
    const y22=build(app.candidates,app.locations,rec22,m22.mapping,2022,new Set(['dep_federal','dep_estadual']));
    const recovered={...y24.recovered,...y22.recovered},candidateReport={...y24.report,...y22.report};
    const mapOk24=m24.mapping.length===29&&m24.mapping.every(x=>x.nr&&x.score>=0.35),mapOk22=m22.mapping.length===29&&m22.mapping.every(x=>x.nr&&x.score>=0.35);
    const candidateCount=Object.keys(app.candidates).length;const candidateOk=Object.keys(recovered).length===candidateCount&&Object.values(candidateReport).every(x=>x.status==='ok');
    const ready=mapOk24&&mapOk22&&candidateOk;
    const compact={};for(const [k,x] of Object.entries(recovered))compact[k]={total:x.official_total,year:x.year,votes:x.votes};
    res.setHeader('content-type','application/json; charset=utf-8');
    res.status(200).json({ready,summary:{candidates: candidateCount,recovered:Object.keys(recovered).length,locations2024:loc24.length,locations2022:loc22.length,mapOk24,mapOk22,candidateOk},sources:src,zipSizes:{vote2024:bV24.length,vote2022:bV22.length,local2024:bL24.length,local2022:bL22.length},csvSizes:{vote2024:v24.size,vote2022:v22.size,local2024:l24.size,local2022:l22.size},mapping2024:m24.mapping,mapping2022:m22.mapping,candidates:candidateReport,data:compact});
  }catch(err){console.error(err);res.status(500).json({ready:false,error:String(err&&err.stack||err)});}
};

module.exports.config={maxDuration:300};
