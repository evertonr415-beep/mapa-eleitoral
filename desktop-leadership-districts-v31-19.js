(function(){
  'use strict';
  if(window.__vfDesktopLeadershipDistrictsV3119)return;
  window.__vfDesktopLeadershipDistrictsV3119=true;

  var style=document.createElement('style');
  style.id='vf-desktop-leadership-districts-v31-19';
  style.textContent=`
  @media (min-width:901px){
    /* =====================================================
       LIDERANCAS - usa a largura REAL do navegador desktop
       ===================================================== */
    body.vf-desktop-mobile-mirror #view-table-liderancas.vf28-leadership-ready{
      width:100%!important;
      max-width:none!important;
      padding:22px 34px 42px!important;
      overflow-x:hidden!important;
    }
    body.vf-desktop-mobile-mirror #view-table-liderancas .vf28-leadership-shell{
      position:relative!important;
      left:50%!important;
      transform:translateX(-50%)!important;
      width:calc(100vw - 92px)!important;
      max-width:none!important;
      min-width:0!important;
      margin:0!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-stats,
    body.vf-desktop-mobile-mirror .vf28-leadership-tools,
    body.vf-desktop-mobile-mirror .vf28-leadership-list,
    body.vf-desktop-mobile-mirror .vf28-leader-card{
      width:100%!important;
      max-width:none!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leadership-head h2{font-size:29px!important}
    body.vf-desktop-mobile-mirror .vf28-leadership-head p{font-size:13.5px!important}
    body.vf-desktop-mobile-mirror .vf28-leadership-tools{
      grid-template-columns:minmax(420px,1fr) minmax(210px,260px) auto!important;
      gap:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf28-leader-info{
      grid-template-columns:1.15fr .8fr 1fr 1fr!important;
    }

    /* =====================================================
       DISTRITOS - remove limites mobile e ocupa o desktop
       ===================================================== */
    body.vf-desktop-mobile-mirror #view-distritos-management{
      width:100%!important;
      max-width:none!important;
      padding:22px 32px 46px!important;
      overflow-x:hidden!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child,
    body.vf-desktop-mobile-mirror #view-distritos-management .vf24-dashboard,
    body.vf-desktop-mobile-mirror #view-distritos-management #distritos-macro-cards{
      position:relative!important;
      left:50%!important;
      transform:translateX(-50%)!important;
      width:calc(100vw - 86px)!important;
      max-width:none!important;
      min-width:0!important;
      margin-left:0!important;
      margin-right:0!important;
    }

    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child{
      grid-template-columns:minmax(0,1fr) auto!important;
      align-items:center!important;
      margin-bottom:14px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child h2,
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child strong{
      font-size:29px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child p,
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child span{
      font-size:13px!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child .btn-primary{
      min-width:205px!important;
      min-height:44px!important;
      font-size:11px!important;
    }

    body.vf-desktop-mobile-mirror .vf24-summary{
      grid-template-columns:repeat(4,minmax(150px,200px))!important;
      justify-content:flex-start!important;
      gap:12px!important;
      margin-bottom:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-stat{
      min-height:68px!important;
      padding:11px 12px!important;
      border-radius:13px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-stat strong{font-size:22px!important}
    body.vf-desktop-mobile-mirror .vf24-stat span{font-size:8.5px!important}

    body.vf-desktop-mobile-mirror .vf24-filter-card{
      width:100%!important;
      padding:13px!important;
      border-radius:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-trigger{
      min-height:70px!important;
      padding:11px 54px 11px 14px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-avatar{
      flex-basis:50px!important;
      width:50px!important;
      height:50px!important;
      font-size:14px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-copy strong{font-size:16px!important}
    body.vf-desktop-mobile-mirror .vf24-candidate-copy span{font-size:10px!important}

    body.vf-desktop-mobile-mirror #distritos-macro-cards{
      display:grid!important;
      grid-template-columns:1fr!important;
      gap:13px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card{
      width:100%!important;
      max-width:none!important;
      border-radius:17px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-main{
      width:100%!important;
      display:grid!important;
      grid-template-columns:minmax(460px,1.25fr) minmax(420px,.9fr)!important;
      grid-template-areas:'head metrics' 'status status' 'chev chev'!important;
      align-items:center!important;
      column-gap:26px!important;
      row-gap:9px!important;
      padding:17px 20px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-head{
      grid-area:head!important;
      grid-template-columns:72px minmax(0,1fr) auto!important;
      gap:16px!important;
      align-items:center!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-icon{
      width:72px!important;
      height:72px!important;
      min-width:72px!important;
      border-radius:18px!important;
      font-size:34px!important;
      display:grid!important;
      place-items:center!important;
      background:color-mix(in srgb,var(--vf24-color,#3b82f6) 13%,rgba(148,163,184,.08))!important;
      border:1px solid color-mix(in srgb,var(--vf24-color,#3b82f6) 35%,transparent)!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-title strong{
      font-size:18px!important;
      line-height:1.2!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-title span{
      margin-top:5px!important;
      font-size:11px!important;
      line-height:1.35!important;
    }
    body.vf-desktop-mobile-mirror .vf24-college-badge{
      padding:7px 10px!important;
      font-size:9px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-metrics{
      grid-area:metrics!important;
      display:grid!important;
      grid-template-columns:repeat(3,minmax(125px,1fr))!important;
      gap:10px!important;
      margin-top:0!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric{
      min-height:64px!important;
      padding:11px 12px!important;
      border-radius:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-metric strong{font-size:17px!important}
    body.vf-desktop-mobile-mirror .vf24-metric span{font-size:8.5px!important}
    body.vf-desktop-mobile-mirror .vf24-status-row{
      grid-area:status!important;
      margin-top:0!important;
    }
    body.vf-desktop-mobile-mirror .vf24-status{font-size:9px!important;padding:6px 10px!important}
    body.vf-desktop-mobile-mirror .vf24-assigned{font-size:9px!important}
    body.vf-desktop-mobile-mirror .vf24-chevron{grid-area:chev!important;margin-top:0!important;font-size:13px!important}

    body.vf-desktop-mobile-mirror .vf24-detail{
      width:100%!important;
      padding:0 20px 18px!important;
    }
  }

  @media (min-width:901px) and (max-width:1180px){
    body.vf-desktop-mobile-mirror #view-table-liderancas .vf28-leadership-shell{
      width:calc(100vw - 58px)!important;
    }
    body.vf-desktop-mobile-mirror #view-distritos-management > div:first-child,
    body.vf-desktop-mobile-mirror #view-distritos-management .vf24-dashboard,
    body.vf-desktop-mobile-mirror #view-distritos-management #distritos-macro-cards{
      width:calc(100vw - 54px)!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-main{
      grid-template-columns:minmax(380px,1.15fr) minmax(360px,.9fr)!important;
      column-gap:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-head{
      grid-template-columns:64px minmax(0,1fr) auto!important;
    }
    body.vf-desktop-mobile-mirror .vf24-card-icon{
      width:64px!important;height:64px!important;min-width:64px!important;font-size:30px!important;
    }
  }
  `;
  document.head.appendChild(style);
})();