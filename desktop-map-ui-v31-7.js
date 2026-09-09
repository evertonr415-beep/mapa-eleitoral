(function(){
  'use strict';
  if(window.__vfDesktopMapUiV317)return;
  window.__vfDesktopMapUiV317=true;

  var style=document.createElement('style');
  style.id='vf-desktop-map-ui-v31-7';
  style.textContent=`
    @media (min-width:901px){
      body.vf-desktop-mobile-mirror #view-map-container .vf-map-toolbar{
        top:18px!important;
        left:20px!important;
        right:20px!important;
        align-items:flex-start!important;
      }

      body.vf-desktop-mobile-mirror #view-map-container .vf-map-toolbar .vf-map-filter{
        min-width:142px!important;
        min-height:52px!important;
        height:52px!important;
        padding:0 18px!important;
        gap:10px!important;
        border-radius:14px!important;
        font-size:14px!important;
        font-weight:850!important;
        box-shadow:0 10px 26px rgba(0,0,0,.28)!important;
      }
      body.vf-desktop-mobile-mirror #view-map-container .vf-map-toolbar .vf-map-filter svg{
        width:20px!important;
        height:20px!important;
        flex:0 0 20px!important;
      }

      body.vf-desktop-mobile-mirror #view-map-container .vf-map-toolbar .vf-map-add{
        min-width:166px!important;
        min-height:52px!important;
        height:52px!important;
        padding:0 18px!important;
        gap:9px!important;
        border-radius:14px!important;
        font-size:14px!important;
        font-weight:850!important;
        box-shadow:0 10px 26px rgba(0,0,0,.28)!important;
      }
      body.vf-desktop-mobile-mirror #view-map-container .vf-map-toolbar .vf-map-add svg{
        width:19px!important;
        height:19px!important;
      }

      body.vf-desktop-mobile-mirror .vf-map-filter-backdrop{
        inset:76px 0 0!important;
        background:rgba(2,6,23,.58)!important;
        backdrop-filter:blur(3px)!important;
        -webkit-backdrop-filter:blur(3px)!important;
      }

      body.vf-desktop-mobile-mirror .vf-map-filter-sheet{
        position:fixed!important;
        left:50%!important;
        right:auto!important;
        top:calc(50% + 28px)!important;
        bottom:auto!important;
        width:min(620px,calc(100vw - 96px))!important;
        max-width:620px!important;
        max-height:calc(100vh - 120px)!important;
        margin:0!important;
        padding:20px!important;
        border-radius:22px!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        transform:translate(-50%,-50%) scale(.985)!important;
        transform-origin:center center!important;
        box-shadow:0 30px 90px rgba(0,0,0,.58)!important;
        scrollbar-gutter:stable!important;
      }
      body.vf-desktop-mobile-mirror.vf-map-filter-sheet-open .vf-map-filter-sheet{
        transform:translate(-50%,-50%) scale(1)!important;
      }

      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-head{
        min-height:56px!important;
        gap:16px!important;
        padding:0 2px 13px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-title strong{
        font-size:20px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-title span{
        margin-top:5px!important;
        font-size:12px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-close{
        width:42px!important;
        height:42px!important;
        border-radius:12px!important;
        font-size:22px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-close svg{
        width:20px!important;
        height:20px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-body{
        padding-top:14px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet .vf-drawer-filters{
        gap:11px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet .layers-box-compact{
        min-height:50px!important;
        height:50px!important;
        padding:4px 10px!important;
        border-radius:12px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet .layer-item-label{
        min-height:38px!important;
        gap:8px!important;
        padding:0 8px!important;
        font-size:13px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet .layer-item-label input{
        width:18px!important;
        height:18px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-field-label{
        margin:4px 3px -1px!important;
        font-size:10.5px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-field-label small{
        font-size:10px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet .select-filter{
        min-height:50px!important;
        height:50px!important;
        line-height:50px!important;
        padding:0 42px 0 13px!important;
        border-radius:12px!important;
        font-size:14px!important;
      }
      body.vf-desktop-mobile-mirror .vf-map-filter-sheet-note{
        margin-top:12px!important;
        padding:10px 12px!important;
        border-radius:11px!important;
        font-size:11px!important;
        line-height:1.4!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
