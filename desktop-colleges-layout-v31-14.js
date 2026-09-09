(function(){
  'use strict';
  if(window.__vfDesktopCollegesLayoutV3114)return;
  window.__vfDesktopCollegesLayoutV3114=true;

  var style=document.createElement('style');
  style.id='vf-desktop-colleges-layout-v31-14';
  style.textContent=`
    @media (min-width:901px){
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios{
        padding:16px 28px 34px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mobile-college-grid-wrap{
        width:100%!important;
        max-width:none!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-summary{
        min-height:58px!important;
        margin-bottom:10px!important;
        padding:11px 14px!important;
        border-radius:14px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-summary-copy strong{
        font-size:18px!important;
        line-height:1.2!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-summary-copy span{
        margin-top:5px!important;
        font-size:11px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-summary-total{
        font-size:13px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-table{
        width:100%!important;
        border-radius:14px!important;
        overflow:hidden!important;
      }

      /* Keep the school name and vote data grouped together on desktop.
         The final flexible column intentionally absorbs spare width at the right,
         instead of leaving a large visual gap between the school and its data. */
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-row,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-row{
        grid-template-columns:44px clamp(360px,42vw,620px) 86px 108px 108px 72px minmax(0,1fr)!important;
        width:100%!important;
        justify-content:start!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head{
        min-height:40px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head > span{
        padding:7px 6px!important;
        font-size:10px!important;
        line-height:1.1!important;
        letter-spacing:.03em!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head > span:nth-child(2){
        justify-content:flex-start!important;
        padding-left:12px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-row{
        min-height:62px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-cell{
        padding:9px 7px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-number{
        font-size:11px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-name{
        padding-left:12px!important;
        padding-right:14px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-name strong{
        font-size:15px!important;
        line-height:1.24!important;
        font-weight:800!important;
        -webkit-line-clamp:2!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-sections{
        font-size:12px!important;
        font-weight:800!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-votes,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-cita,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-milani{
        font-size:13px!important;
        font-weight:850!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-pct span{
        min-width:56px!important;
        min-height:28px!important;
        padding:5px 8px!important;
        border-radius:8px!important;
        font-size:11px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-actions{
        grid-template-columns:34px!important;
        padding:8px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-btn-leaders{
        width:34px!important;
        min-width:34px!important;
        height:34px!important;
        min-height:34px!important;
        border-radius:9px!important;
        font-size:13px!important;
      }
    }

    @media (min-width:901px) and (max-width:1180px){
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-row,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-row{
        grid-template-columns:40px clamp(320px,40vw,500px) 72px 92px 92px 64px minmax(0,1fr)!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-name strong{font-size:13.5px!important}
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-votes,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-cita,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-milani{font-size:12px!important}
    }
  `;
  document.head.appendChild(style);
})();
