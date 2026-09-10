(function(){
  'use strict';
  if(window.__vfDesktopProfileModalV3113)return;
  window.__vfDesktopProfileModalV3113=true;

  function desktop(){return window.innerWidth>900||document.body.classList.contains('vf-desktop-mobile-mirror');}

  function setImp(el,prop,val){
    if(!el)return;
    try{el.style.setProperty(prop,val,'important');}catch(_){ }
  }

  function tune(){
    if(!desktop()||!document.body)return;
    var sheet=document.querySelector('.vf-profile-sheet');
    var backdrop=document.querySelector('.vf-profile-backdrop');
    if(!sheet)return;
    var open=document.body.classList.contains('vf-profile-open');

    setImp(backdrop,'position','fixed');
    setImp(backdrop,'inset','0');
    setImp(backdrop,'z-index','3700');

    setImp(sheet,'position','fixed');
    setImp(sheet,'z-index','3710');
    setImp(sheet,'left','50%');
    setImp(sheet,'right','auto');
    setImp(sheet,'top','50%');
    setImp(sheet,'bottom','auto');
    setImp(sheet,'width','min(680px, calc(100vw - 96px))');
    setImp(sheet,'max-width','680px');
    setImp(sheet,'min-width','0');
    setImp(sheet,'height','auto');
    setImp(sheet,'max-height','calc(100vh - 96px)');
    setImp(sheet,'margin','0');
    setImp(sheet,'padding','22px');
    setImp(sheet,'border-radius','22px');
    setImp(sheet,'border','1px solid rgba(96,165,250,.24)');
    setImp(sheet,'box-shadow','0 28px 80px rgba(0,0,0,.52)');
    setImp(sheet,'overflow-y','auto');
    setImp(sheet,'overflow-x','hidden');
    setImp(sheet,'overscroll-behavior','contain');
    setImp(sheet,'scrollbar-gutter','stable');
    setImp(sheet,'transform',open?'translate(-50%,-50%)':'translate(-50%,calc(-50% + 120vh))');
    setImp(sheet,'pointer-events',open?'auto':'none');

    var head=sheet.querySelector('.vf-profile-head');
    if(head){setImp(head,'margin-bottom','16px');setImp(head,'gap','16px');}
    var headTitle=sheet.querySelector('.vf-profile-head strong');
    if(headTitle)setImp(headTitle,'font-size','22px');
    var headSub=sheet.querySelector('.vf-profile-head span');
    if(headSub)setImp(headSub,'font-size','12px');
    var close=sheet.querySelector('.vf-profile-close');
    if(close){setImp(close,'width','42px');setImp(close,'height','42px');setImp(close,'font-size','22px');}

    var card=sheet.querySelector('.vf-profile-card');
    if(card){
      setImp(card,'grid-template-columns','86px minmax(0,1fr)');
      setImp(card,'gap','16px');
      setImp(card,'padding','16px');
      setImp(card,'border-radius','18px');
    }
    var photo=sheet.querySelector('.vf-profile-photo');
    if(photo){setImp(photo,'width','86px');setImp(photo,'height','86px');}
    var name=sheet.querySelector('.vf-profile-name');
    if(name)setImp(name,'font-size','17px');
    var email=sheet.querySelector('.vf-profile-email');
    if(email)setImp(email,'font-size','12px');
    var role=sheet.querySelector('.vf-profile-role');
    if(role)setImp(role,'font-size','10px');

    sheet.querySelectorAll('.vf-profile-section').forEach(function(sec){
      setImp(sec,'margin-top','14px');
      setImp(sec,'padding','16px');
      setImp(sec,'border-radius','16px');
    });
    sheet.querySelectorAll('.vf-profile-section-title').forEach(function(el){setImp(el,'font-size','14px');});
    sheet.querySelectorAll('.vf-profile-section-sub').forEach(function(el){setImp(el,'font-size','11px');setImp(el,'line-height','1.45');});
    sheet.querySelectorAll('.vf-profile-field label').forEach(function(el){setImp(el,'font-size','11px');});
    sheet.querySelectorAll('.vf-profile-input-wrap input').forEach(function(el){
      setImp(el,'height','48px');
      setImp(el,'font-size','16px');
      setImp(el,'border-radius','12px');
    });
    sheet.querySelectorAll('.vf-profile-primary,.vf-profile-secondary,.vf-profile-danger').forEach(function(el){
      setImp(el,'min-height','46px');
      setImp(el,'font-size','12px');
      setImp(el,'border-radius','12px');
    });

    var file=sheet.querySelector('.vf-profile-file');if(file)setImp(file,'display','none');
    var photoActions=sheet.querySelector('.vf-profile-photo-actions');
    if(photoActions){setImp(photoActions,'display','grid');setImp(photoActions,'grid-template-columns','1fr 1fr');setImp(photoActions,'gap','10px');setImp(photoActions,'margin-top','10px');}
    if(photoActions)photoActions.querySelectorAll('button').forEach(function(el){setImp(el,'width','100%');setImp(el,'margin-top','0');});
    var editGrid=sheet.querySelector('.vf-profile-edit-grid');
    if(editGrid){setImp(editGrid,'display','grid');setImp(editGrid,'grid-template-columns','1fr 1fr');setImp(editGrid,'gap','12px');setImp(editGrid,'margin-top','10px');}
    var saveInfo=sheet.querySelector('.vf-profile-save-info');if(saveInfo)setImp(saveInfo,'width','100%');
    var savePhoto=sheet.querySelector('.vf-profile-save-photo');if(savePhoto&&savePhoto.disabled)setImp(savePhoto,'opacity','.45');

    var logout=sheet.querySelector('.vf-profile-logout');
    if(logout){setImp(logout,'margin-top','14px');}
  }

  function boot(){
    tune();
    if(!document.documentElement)return;
    var mo=new MutationObserver(function(){tune();});
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});
    window.addEventListener('resize',tune,{passive:true});
    setTimeout(tune,400);setTimeout(tune,1000);setTimeout(tune,2200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
