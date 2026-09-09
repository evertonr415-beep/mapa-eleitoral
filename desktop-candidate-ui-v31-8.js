(function(){
  'use strict';
  if(window.__vfDesktopCandidateUiV318)return;
  window.__vfDesktopCandidateUiV318=true;

  var style=document.createElement('style');
  style.id='vf-desktop-candidate-ui-v31-8';
  style.textContent=`
  @media (min-width:901px){
    /* Shared candidate picker: Map + Colleges and any trigger using the same component */
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-backdrop{
      background:rgba(2,6,23,.68)!important;
      backdrop-filter:blur(4px)!important;
      -webkit-backdrop-filter:blur(4px)!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-sheet{
      left:50%!important;
      top:50%!important;
      bottom:auto!important;
      width:min(940px,calc(100vw - 150px))!important;
      max-width:940px!important;
      max-height:calc(100vh - 100px)!important;
      border-radius:24px!important;
      border:1px solid rgba(148,163,184,.25)!important;
      box-shadow:0 32px 90px rgba(0,0,0,.58)!important;
      transform:translate(-50%,-47%) scale(.985)!important;
    }
    body.vf-desktop-mobile-mirror.vf-mobile-candidate-open .vf-mobile-candidate-sheet{
      transform:translate(-50%,-50%) scale(1)!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-head{
      min-height:72px!important;
      padding:15px 18px!important;
      gap:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-head strong{
      font-size:20px!important;
      line-height:1.2!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-head span{
      margin-top:4px!important;
      font-size:12px!important;
      line-height:1.25!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-close{
      width:46px!important;
      height:46px!important;
      border-radius:13px!important;
      font-size:25px!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-legend{
      gap:14px!important;
      padding:10px 18px!important;
      font-size:11px!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-legend i{
      width:9px!important;
      height:9px!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-data-note{
      margin:12px 16px 0!important;
      padding:12px 14px!important;
      border-radius:12px!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-data-note strong{font-size:13px!important}
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-data-note span{font-size:11px!important;line-height:1.4!important}
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-list{
      scrollbar-gutter:stable!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-group{
      padding:10px 18px!important;
      font-size:10px!important;
      letter-spacing:.075em!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-option{
      min-height:82px!important;
      padding:13px 18px 13px 88px!important;
      gap:18px!important;
      cursor:pointer!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-option:hover{
      background:rgba(255,255,255,.055)!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-option-text{
      font-size:17px!important;
      line-height:1.3!important;
      font-weight:650!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-option-meta{
      margin-top:6px!important;
      font-size:11.5px!important;
      line-height:1.25!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-status{
      min-width:62px!important;
      height:30px!important;
      padding:0 11px!important;
      font-size:10px!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-option .vf-photo-v277-list{
      left:16px!important;
      width:54px!important;
      height:54px!important;
      border-radius:14px!important;
      border-width:1px!important;
      box-shadow:0 5px 16px rgba(0,0,0,.28)!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-option.vf-photo-v277-option[aria-selected="true"] .vf-photo-v277-list{
      outline-width:3px!important;
      outline-offset:2px!important;
    }

    /* Candidate triggers wherever the shared picker is opened */
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-trigger{
      min-height:52px!important;
      padding:10px 46px 10px 15px!important;
      border-radius:13px!important;
      font-size:14px!important;
      line-height:1.3!important;
    }
    body.vf-desktop-mobile-mirror .vf-mobile-candidate-trigger:after{
      right:16px!important;
      font-size:20px!important;
    }

    /* Colleges candidate selector */
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-panel{
      padding:14px!important;
      border-radius:18px!important;
    }
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-kicker{
      margin:0 3px 9px!important;
      font-size:10px!important;
    }
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-open{
      min-height:76px!important;
      padding:11px 50px 11px 14px!important;
      gap:14px!important;
      border-radius:15px!important;
    }
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-open:after{
      right:18px!important;
      font-size:28px!important;
    }
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-avatar{
      flex-basis:52px!important;
      width:52px!important;
      height:52px!important;
      border-radius:14px!important;
      font-size:16px!important;
    }
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-name{
      font-size:16px!important;
      line-height:1.25!important;
    }
    body.vf-desktop-mobile-mirror #view-table-colegios .vf-college-candidate-meta{
      margin-top:5px!important;
      font-size:11px!important;
    }

    /* District candidate selector + district candidate sheet */
    body.vf-desktop-mobile-mirror .vf24-candidate-trigger{
      min-height:76px!important;
      padding:11px 52px 11px 14px!important;
      gap:14px!important;
      border-radius:15px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-trigger:after{
      right:18px!important;
      font-size:28px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-avatar{
      flex-basis:52px!important;
      width:52px!important;
      height:52px!important;
      border-radius:14px!important;
      font-size:16px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-copy strong{
      font-size:16px!important;
      line-height:1.25!important;
    }
    body.vf-desktop-mobile-mirror .vf24-candidate-copy span{
      margin-top:5px!important;
      font-size:11px!important;
    }
    body.vf-desktop-mobile-mirror .vf24-sheet{
      left:50%!important;
      right:auto!important;
      top:50%!important;
      bottom:auto!important;
      width:min(900px,calc(100vw - 150px))!important;
      max-width:900px!important;
      max-height:calc(100vh - 100px)!important;
      padding:18px!important;
      border:1px solid rgba(148,163,184,.22)!important;
      border-radius:24px!important;
      box-shadow:0 32px 90px rgba(0,0,0,.58)!important;
      opacity:0!important;
      visibility:hidden!important;
      pointer-events:none!important;
      transform:translate(-50%,-46%) scale(.985)!important;
      transition:opacity .18s ease,transform .18s ease,visibility .18s ease!important;
    }
    body.vf-desktop-mobile-mirror.vf24-sheet-open .vf24-sheet{
      opacity:1!important;
      visibility:visible!important;
      pointer-events:auto!important;
      transform:translate(-50%,-50%) scale(1)!important;
    }
    body.vf-desktop-mobile-mirror .vf24-sheet-head{margin-bottom:14px!important}
    body.vf-desktop-mobile-mirror .vf24-sheet-head strong{font-size:19px!important}
    body.vf-desktop-mobile-mirror .vf24-sheet-head span{margin-top:4px!important;font-size:11px!important}
    body.vf-desktop-mobile-mirror .vf24-sheet-close{width:46px!important;height:46px!important;border-radius:13px!important;font-size:24px!important}
    body.vf-desktop-mobile-mirror .vf24-group-label{margin:14px 4px 8px!important;font-size:10px!important}
    body.vf-desktop-mobile-mirror .vf24-option{
      min-height:76px!important;
      margin-bottom:8px!important;
      padding:11px 14px!important;
      gap:14px!important;
      border-radius:13px!important;
      cursor:pointer!important;
    }
    body.vf-desktop-mobile-mirror .vf24-option:hover{background:#18304f!important}
    body.vf-desktop-mobile-mirror .vf24-option strong{font-size:14px!important;line-height:1.25!important}
    body.vf-desktop-mobile-mirror .vf24-option span{margin-top:4px!important;font-size:10px!important}
    body.vf-desktop-mobile-mirror .vf24-option em{font-size:10px!important}
    body.vf-desktop-mobile-mirror .vf24-option .vf-photo-v278-district{
      flex-basis:52px!important;
      width:52px!important;
      height:52px!important;
      border-radius:14px!important;
    }

    /* Existing politician-photo containers in all desktop tabs */
    body.vf-desktop-mobile-mirror .vf-college-candidate-avatar.vf-photo-v277,
    body.vf-desktop-mobile-mirror .vf24-candidate-avatar.vf-photo-v277{
      width:52px!important;
      height:52px!important;
      flex-basis:52px!important;
    }
  }
  `;
  document.head.appendChild(style);
})();
