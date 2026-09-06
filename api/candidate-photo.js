const CANDIDATES={
  pref_cita:{year:2024,scope:'arapongas',cargo:'prefeito',slug:'rafael-cita',party:'psd',number:'55'},
  pref_milani:{year:2024,scope:'arapongas',cargo:'prefeito',slug:'jair-milani',party:'pl',number:'22'},
  '20220':{year:2024,scope:'arapongas',cargo:'vereador',slug:'decio-rosanelli',party:'pode',number:'20220'},
  '55155':{year:2024,scope:'arapongas',cargo:'vereador',slug:'levi-do-handebol',party:'psd',number:'55155'},
  '11234':{year:2024,scope:'arapongas',cargo:'vereador',slug:'paulo-grassano',party:'pp',number:'11234'},
  '44044':{year:2024,scope:'arapongas',cargo:'vereador',slug:'toninho-da-ambulancia',party:'uniao',number:'44044'},
  '70000':{year:2024,scope:'arapongas',cargo:'vereador',slug:'joao-graca',party:'avante',number:'70000'},
  '40133':{year:2024,scope:'arapongas',cargo:'vereador',slug:'marcio-nicke',party:'psb',number:'40133'},
  '20120':{year:2024,scope:'arapongas',cargo:'vereador',slug:'aroldo-pagan',party:'pode',number:'20120'},
  '11555':{year:2024,scope:'arapongas',cargo:'vereador',slug:'professor-marcelo',party:'pp',number:'11555'},
  '44567':{year:2024,scope:'arapongas',cargo:'vereador',slug:'alexandre-juliani-sorriso',party:'uniao',number:'44567'},
  '55555':{year:2024,scope:'arapongas',cargo:'vereador',slug:'simone-sponton-mae-de-autista',party:'psd',number:'55555'},
  '55147':{year:2024,scope:'arapongas',cargo:'vereador',slug:'luisinho-da-saude',party:'psd',number:'55147'},
  '22777':{year:2024,scope:'arapongas',cargo:'vereador',slug:'diretora-marilsa-staub',party:'pl',number:'22777'},
  '44190':{year:2024,scope:'arapongas',cargo:'vereador',slug:'pardini',party:'uniao',number:'44190'},
  '55120':{year:2024,scope:'arapongas',cargo:'vereador',slug:'ceceu',party:'psd',number:'55120'},
  '12500':{year:2024,scope:'arapongas',cargo:'vereador',slug:'meiry-farias-protecao-animal',party:'pdt',number:'12500'},
  '11500':{year:2024,scope:'arapongas',cargo:'vereador',slug:'marcos-da-ass-algo-novo',party:'pp',number:'11500'},
  '11444':{year:2024,scope:'arapongas',cargo:'vereador',slug:'silvano-santos',party:'pp',number:'11444'},
  '13100':{year:2024,scope:'arapongas',cargo:'vereador',slug:'professor-marcio-diniz',party:'pt',number:'13100'},
  '55456':{year:2024,scope:'arapongas',cargo:'vereador',slug:'toxinha',party:'psd',number:'55456'},
  '10123':{year:2024,scope:'arapongas',cargo:'vereador',slug:'rodrigo-de-deus',party:'republicanos',number:'10123'},
  '22622':{year:2024,scope:'arapongas',cargo:'vereador',slug:'rubao',party:'pl',number:'22622'},
  '22123':{year:2024,scope:'arapongas',cargo:'vereador',slug:'ricardo-edmotta',party:'pl',number:'22123'},

  dep_fed_lupion:{year:2022,cargo:'deputado-federal',slug:'pedro-lupion',party:'pp',number:'1111'},
  dep_fed_filipe:{year:2022,cargo:'deputado-federal',slug:'filipe-barros',party:'pl',number:'2201'},
  dep_fed_beto:{year:2022,cargo:'deputado-federal',slug:'beto-preto',party:'psd',number:'5501'},
  dep_fed_angelica:{year:2022,cargo:'deputado-federal',slug:'angelica-enfermeira',party:'pros',number:'9020'},
  dep_fed_deltan:{year:2022,cargo:'deputado-federal',slug:'deltan-dallagnol',party:'pode',number:'1919'},
  dep_fed_luisa:{year:2022,cargo:'deputado-federal',slug:'luisa-canziani',party:'psd',number:'5511'},
  dep_fed_fahur:{year:2022,cargo:'deputado-federal',slug:'sargento-fahur',party:'psd',number:'5590'},
  dep_fed_zeca:{year:2022,cargo:'deputado-federal',slug:'zeca-dirceu',party:'pt',number:'1310'},
  dep_fed_aliel:{year:2022,cargo:'deputado-federal',slug:'aliel-machado',party:'pv',number:'4343'},
  dep_fed_francischini:{year:2022,cargo:'deputado-federal',slug:'felipe-francischini',party:'uniao',number:'4444'},
  dep_fed_sperafico:{year:2022,cargo:'deputado-federal',slug:'dilceu-sperafico',party:'pp',number:'1122'},

  dep_est_tiago:{year:2022,cargo:'deputado-estadual',slug:'tiago-amaral',party:'psd',number:'55155'},
  dep_est_bazana:{year:2022,cargo:'deputado-estadual',slug:'pedro-paulo-bazana',party:'psd',number:'55600'},
  dep_est_tercilio:{year:2022,cargo:'deputado-estadual',slug:'tercilio-turini',party:'psd',number:'55043'},
  dep_est_curi:{year:2022,cargo:'deputado-estadual',slug:'alexandre-curi',party:'psd',number:'55128'},
  dep_est_jacovos:{year:2022,cargo:'deputado-estadual',slug:'delegado-jacovos',party:'pl',number:'22038'},
  dep_est_cobra:{year:2022,cargo:'deputado-estadual',slug:'cobra-reporter',party:'psd',number:'55055'},
  dep_est_pacheco:{year:2022,cargo:'deputado-estadual',slug:'marcio-pacheco',party:'republicanos',number:'10100'},
  dep_est_arilson:{year:2022,cargo:'deputado-estadual',slug:'arilson-chiorato',party:'pt',number:'13000'}
};

function profileUrl(c){
  const prefix=`https://www.tribunapr.com.br/eleicoes/${c.year}/candidatos/pr/`;
  const location=c.scope?`${c.scope}/`:'';
  return `${prefix}${location}${c.cargo}/${c.slug}-${c.party}-${c.number}/`;
}

function candidateImageFromHtml(html,year){
  const direct=html.match(new RegExp(`https?:\\/\\/www\\.tribunapr\\.com\\.br\\/hermes-media\\/eleicoes\\/${year}\\/candidatos\\/pr\\/[0-9]+\\.jpg`,'i'));
  if(direct)return direct[0].replace(/\\u002F/g,'/');
  const relative=html.match(new RegExp(`\\/hermes-media\\/eleicoes\\/${year}\\/candidatos\\/pr\\/[0-9]+\\.jpg`,'i'));
  if(relative)return 'https://www.tribunapr.com.br'+relative[0];
  const sq=html.match(/\b16\d{10}\b/);
  if(sq)return `https://www.tribunapr.com.br/hermes-media/eleicoes/${year}/candidatos/pr/${sq[0]}.jpg`;
  return '';
}

async function fetchText(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),9000);
  try{
    const r=await fetch(url,{redirect:'follow',signal:controller.signal,headers:{
      'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language':'pt-BR,pt;q=0.9,en;q=0.7',
      'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1'
    }});
    if(!r.ok)throw new Error('profile_http_'+r.status);
    return await r.text();
  }finally{clearTimeout(timer);}
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=604800, stale-while-revalidate=2592000');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const key=String(req.query&&req.query.key||'');
  const c=CANDIDATES[key];
  if(!c)return res.status(404).json({ok:false,error:'candidate_not_mapped'});
  const profile=profileUrl(c);
  try{
    const html=await fetchText(profile);
    const url=candidateImageFromHtml(html,c.year);
    if(!url)return res.status(404).json({ok:false,error:'photo_not_found',key,profile});
    return res.status(200).json({ok:true,key,url,profile,source:'Tribuna do Paraná / dados eleitorais TSE'});
  }catch(err){
    return res.status(502).json({ok:false,error:String(err&&err.message||err),key,profile});
  }
};
