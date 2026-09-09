(function(){
  'use strict';
  if(window.__vfDesktopCollegesPolishV3115)return;
  window.__vfDesktopCollegesPolishV3115=true;

  var style=document.createElement('style');
  style.id='vf-desktop-colleges-polish-v31-15';
  style.textContent=`
    @media (min-width:901px){
      /* Fill the whole desktop width with the six real grid columns.
         v31.14 had a seventh flexible track with no content, which created the large empty area. */
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-row,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-row{
        grid-template-columns:52px minmax(390px,1.55fr) minmax(92px,.42fr) minmax(118px,.5fr) minmax(118px,.5fr) minmax(88px,.38fr)!important;
        width:100%!important;
      }

      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head > span,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-cell{
        min-width:0!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-name{
        padding-left:16px!important;
        padding-right:18px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-name strong{
        font-size:15.5px!important;
        line-height:1.22!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-sections{
        font-size:12.5px!important;
      }
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-votes,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-cita,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-milani{
        font-size:13.5px!important;
      }

      /* College info: desktop modal instead of the mobile bottom sheet. */
      body.vf-desktop-mobile-mirror .vf-mcg-overlay{
        position:fixed!important;
        inset:0!important;
        z-index:4980!important;
        background:rgba(2,6,23,.70)!important;
        backdrop-filter:blur(4px)!important;
        -webkit-backdrop-filter:blur(4px)!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet{
        position:fixed!important;
        z-index:4990!important;
        left:50%!important;
        right:auto!important;
        top:50%!important;
        bottom:auto!important;
        width:min(720px,calc(100vw - 120px))!important;
        max-width:720px!important;
        min-width:0!important;
        max-height:calc(100vh - 100px)!important;
        margin:0!important;
        padding:20px!important;
        border:1px solid rgba(96,165,250,.24)!important;
        border-radius:22px!important;
        background:linear-gradient(180deg,#142641,#0f1d31)!important;
        box-shadow:0 30px 90px rgba(0,0,0,.60)!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
        transform:translate(-50%,-46%) scale(.985)!important;
        transition:opacity .18s ease,transform .18s ease,visibility .18s ease!important;
      }
      body.vf-desktop-mobile-mirror.vf-mcg-sheet-open .vf-mcg-sheet{
        opacity:1!important;
        visibility:visible!important;
        pointer-events:auto!important;
        transform:translate(-50%,-50%) scale(1)!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-head{
        grid-template-columns:minmax(0,1fr) 44px!important;
        gap:14px!important;
        padding-bottom:14px!important;
        align-items:start!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-head span{
        font-size:9px!important;
        letter-spacing:.07em!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-head strong{
        margin-top:5px!important;
        font-size:20px!important;
        line-height:1.22!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-close{
        width:44px!important;
        height:44px!important;
        border-radius:12px!important;
        font-size:24px!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-grid{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:10px!important;
        margin-top:14px!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-grid div{
        padding:14px 15px!important;
        min-height:70px!important;
        border:1px solid rgba(148,163,184,.08)!important;
        border-radius:13px!important;
        background:rgba(24,43,69,.72)!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-grid span{
        font-size:9px!important;
        letter-spacing:.045em!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-grid strong{
        margin-top:6px!important;
        font-size:15px!important;
        line-height:1.25!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-address{
        margin-top:12px!important;
        padding:13px 15px!important;
        border:1px solid rgba(148,163,184,.08)!important;
        border-radius:12px!important;
        font-size:12px!important;
        line-height:1.4!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet-action{
        min-height:48px!important;
        margin-top:14px!important;
        border-radius:12px!important;
        font-size:13px!important;
      }
    }

    @media (min-width:901px) and (max-width:1180px){
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid #view-table-colegios .vf-mcg-row,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-head,
      body.vf-desktop-mobile-mirror.vf-mobile.vf-mobile-college-grid.vf-mcg-overview #view-table-colegios .vf-mcg-row{
        grid-template-columns:46px minmax(320px,1.45fr) minmax(72px,.38fr) minmax(94px,.46fr) minmax(94px,.46fr) minmax(72px,.34fr)!important;
      }
      body.vf-desktop-mobile-mirror .vf-mcg-sheet{
        width:min(680px,calc(100vw - 80px))!important;
        max-width:680px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
