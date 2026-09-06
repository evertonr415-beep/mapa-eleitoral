const TSE='https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/';

const ENDPOINTS=[
  {kind:'prefeito',url:TSE+'2024/74276/2045202024/11/candidatos'},
  {kind:'vereador',url:TSE+'2024/74276/2045202024/13/candidatos'},
  {kind:'federal',url:TSE+'2022/PR/2040602022/6/candidatos'},
  {kind:'estadual',url:TSE+'2022/PR/2040602022/7/candidatos'}
];

const NUMS_2022={
  dep_fed_lupion:'1111',dep_fed_filipe:'2201',dep_fed_beto:'5501',dep_fed_angelica:'9020',dep_fed_deltan:'1919',dep_fed_luisa:'5511',dep_fed_fahur:'5590',dep_fed_zeca:'1310',dep_fed_aliel:'4343',dep_fed_francischini:'4444',dep_fed_sperafico:'1122',
  dep_est_tiago:'55155',dep_est_bazana:'55600',dep_est_tercilio:'55043',dep_est_curi:'55128',dep_est_jacovos:'22038',dep_est_cobra:'55055',dep_est_pacheco:'10100',dep_est_arilson:'13000'
};

function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();}
function photoUrl(c){
  let u=c&&(c.fotoUrl||c.urlFoto||c.foto);
  if(!u)return '';
  u=String(u);
  if(/^https?:\/\//i.test(u))return u;
  if(u.startsWith('/'))return 'https://divulgacandcontas.tse.jus.br'+u;
  return 'https://divulgacandcontas.tse.jus.br/'+u.replace(/^\/+/, '');
}
function list(payload){return payload&&Array.isArray(payload.candidatos)?payload.candidatos:[];}
async function getJson(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const r=await fetch(url,{headers:{'accept':'application/json','user-agent':'VotoForte-Arapongas/1.0'},signal:controller.signal});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return await r.json();
  }finally{clearTimeout(timer);}
}

module.exports=async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=21600, stale-while-revalidate=86400');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});

  const photos={};
  const diagnostics=[];
  const results=await Promise.all(ENDPOINTS.map(async e=>{
    try{return {kind:e.kind,data:await getJson(e.url),ok:true};}
    catch(err){return {kind:e.kind,data:null,ok:false,error:String(err&&err.message||err)};}
  }));

  for(const x of results){
    const candidates=list(x.data);
    diagnostics.push({kind:x.kind,ok:x.ok,count:candidates.length,error:x.error||null});
    if(x.kind==='vereador'){
      for(const c of candidates){const n=String(c.numero||c.nrCandidato||'');const u=photoUrl(c);if(n&&u)photos[n]=u;}
      continue;
    }
    if(x.kind==='prefeito'){
      for(const c of candidates){
        const hay=norm((c.nomeUrna||'')+' '+(c.nomeCompleto||''));
        const u=photoUrl(c);if(!u)continue;
        if(hay.includes('RAFAEL CITA'))photos.pref_cita=u;
        if(hay.includes('JAIR MILANI'))photos.pref_milani=u;
      }
      continue;
    }
    const byNumber={};
    for(const c of candidates){const n=String(c.numero||c.nrCandidato||'');const u=photoUrl(c);if(n&&u)byNumber[n]=u;}
    for(const [key,num] of Object.entries(NUMS_2022)){
      if(x.kind==='federal'&&!key.startsWith('dep_fed_'))continue;
      if(x.kind==='estadual'&&!key.startsWith('dep_est_'))continue;
      if(byNumber[num])photos[key]=byNumber[num];
    }
  }

  return res.status(200).json({ok:true,photos,diagnostics,count:Object.keys(photos).length,source:'TSE DivulgaCandContas'});
};
