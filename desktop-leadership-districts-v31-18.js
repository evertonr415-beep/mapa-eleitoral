(function(){
  'use strict';
  if(window.__vfDesktopLeadershipDistrictsV3118)return;
  window.__vfDesktopLeadershipDistrictsV3118=true;

  var style=document.createElement('style');
  style.id='vf-desktop-leadership-districts-v31-18';
  style.textContent=`
  @media (min-width:901px){
    /* LIDERANÇAS — mantém o desenho compacto, mas usa melhor a tela */
    body.vf-desktop-mobile-mirror #view-table-liderancas.vf28-leadership-ready{
      width:100vw!important;
      max-width:none!important;
      padding:22px 34px 42px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-shell{
      width:min(84vw,1400px)!important;
      max-width:none!important;
      margin:0 auto!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-tools{
      grid-template-columns:minmax(340px,1fr) minmax(190px,240px) auto!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-card{
      width:100%!important;
    }

    /* DISTRITOS — corrige o painel espremido à esquerda */
    body.vf-desktop-mobile-mirror #view-distritos-management{
      width:100vw!important;
      max-width:none!important;
      padding:22px 34px 44px!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child,
    body.vf-desktop-mobile-mirror .vf24-dashboard,
    body.vf-desktop-mobile-mirror #distritos-macro-cards{
      width:min(88vw,1460px)!important;
      max-width:none!important;
      margin-left:auto!important;
      margin-right:auto!important;
    }

    /* Cabeçalho da aba: título à esquerda e ação compacta à direita */
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) auto!important;
      align-items:end!important;
      column-gap:18px!important;
      row-gap:5px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child > :last-child,
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child .btn-primary{
      width:auto!important;
      min-width:190px!important;
      max-width:240px!important;
      justify-self:end!important;
      align-self:end!important;
      padding-left:18px!important;
      padding-right:18px!important;
    }

    /* Resumo e filtro territorial */
    body.vf-desktop-mobile-mirror .vf24-summary{
      grid-template-columns:repeat(4,minmax(145px,180px))!important;
      justify-content:center!important;
      gap:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-filter-card{
      width:100%!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-trigger{
      width:100%!important;
    }

    /* Cards de distrito — horizontais, largos e proporcionais */
    body.vf-desktop-mobile-mirror #distritos-macro-cards{
      display:grid!important;
      grid-template-columns:1fr!important;
      gap:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card{
      width:100%!important;
      max-width:none!important;
      border-radius:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-main{
      width:100%!important;
      display:grid!important;
      grid-template-columns:minmax(360px,1.15fr) minmax(410px,.85fr)!important;
      grid-template-areas:
        'head metrics'
        'status status'
        'chev chev'!important;
      align-items:center!important;
      column-gap:22px!important;
      row-gap:8px!important;
      padding:15px 18px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-head{
      grid-area:head!important;
      grid-template-columns:58px minmax(0,1fr) auto!important;
      gap:13px!important;
      align-items:center!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-icon{
      width:58px!important;
      height:58px!important;
      min-width:58px!important;
      border-radius:16px!important;
      font-size:28px!important;
      display:grid!important;
      place-items:center!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-title strong{
      font-size:16px!important;
      line-height:1.18!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-title span{
      margin-top:4px!important;
      font-size:9.5px!important;
      line-height:1.35!important;
    }
    body.vf-desktop-mobile-mirror .vf24-college-badge{
      padding:6px 9px!important;
      font-size:8.5px!important;
      white-space:nowrap!important;
    }

    body.vf-desktop-mobile-mirror .vf24-card-metrics{
      grid-area:metrics!important;
      display:grid!important;
      grid-template-columns:repeat(3,minmax(110px,1fr))!important;
      gap:9px!important;
      margin-top:0!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric{
      min-height:56px!important;
      padding:10px 11px!important;
      border-radius:11px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric strong{
      font-size:15px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric span{
      margin-top:4px!important;
      font-size:8px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-status-row{
      grid-area:status!important;
      margin-top:0!important;
      padding-top:1px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-status{
      padding:5px 9px!important;
      font-size:8.5px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-assigned{
      font-size:8.5px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-chevron{
      grid-area:chev!important;
      margin-top:0!important;
    }

    /* Detalhes abertos também usam toda a largura do card */
    body.vf-desktop-mobile-mirror .vf24-detail{
      width:100%!important;
      padding:0 18px 16px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-detail-block{
      width:100%!important;
    }
  }

  @media (min-width:901px) and (max-width:1180px){
    body.vf-desktop-mobile-mirror .vf28-leadership-shell{
      width:min(90vw,1120px)!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child,
    body.vf-desktop-mobile-mirror .vf24-dashboard,
    body.vf-desktop-mobile-mirror #distritos-macro-cards{
      width:92vw!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-main{
      grid-template-columns:minmax(300px,1fr) minmax(360px,.95fr)!important;
      column-gap:14px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-icon{
      width:52px!important;
      height:52px!important;
      min-width:52px!important;
      font-size:25px!important;
    }
  }
  `;
  document.head.appendChild(style);
})();