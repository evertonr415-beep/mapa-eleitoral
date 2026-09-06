(function(){
  'use strict';
  if(window.__vfAvatarBootstrapV22)return;window.__vfAvatarBootstrapV22=true;

  var KEY='vf_profile_avatar_cache_v22';
  var AUTH_KEY='sb-aufsewqtybpothlrsjij-auth-token';
  var cache=null;
  var observer=null;
  var queued=false;

  function sessionUserId(){
    try{
      var raw=localStorage.getItem(AUTH_KEY);if(!raw)return '';
      var data=JSON.parse(raw);
      return String(data&&data.user&&data.user.id||data&&data.currentSession&&data.currentSession.user&&data.currentSession.user.id||'');
    }catch(_){return '';}
  }

  function read(){
    try{
      var raw=localStorage.getItem(KEY);if(!raw)return null;
      var data=JSON.parse(raw);
      if(!data||!data.url)return null;
      var uid=sessionUserId();
      if(uid&&data.userId&&String(data.userId)!==uid){localStorage.removeItem(KEY);return null;}
      return data;
    }catch(_){return null;}
  }

  function save(url,name,userId){
    if(!url){clear();return;}
    cache={url:String(url),name:String(name||''),userId:String(userId||sessionUserId()||''),savedAt:Date.now()};
    try{localStorage.setItem(KEY,JSON.stringify(cache));}catch(_){ }
    preload(cache.url);
    apply();
  }

  function clear(){
    cache=null;
    try{localStorage.removeItem(KEY);}catch(_){ }
  }

  function preload(url){
    if(!url)return;
    try{var p=new Image();p.decoding='sync';p.src=url;}catch(_){ }
  }

  function correct(el){
    if(!el||!cache||!cache.url)return true;
    var kids=el.children;
    return kids&&kids.length===1&&kids[0].tagName==='IMG'&&kids[0].getAttribute('src')===cache.url;
  }

  function paint(el){
    if(!el||!cache||!cache.url||correct(el))return;
    el.innerHTML='';
    var img=document.createElement('img');
    img.src=cache.url;
    img.alt='';
    img.decoding='sync';
    img.setAttribute('aria-hidden','true');
    el.appendChild(img);
  }

  function apply(){
    if(!cache||!cache.url)return;
    document.querySelectorAll('.vf-mobile-avatar,.vf-drawer-account-avatar').forEach(paint);
  }

  function queueApply(){
    if(queued)return;queued=true;
    Promise.resolve().then(function(){queued=false;apply();});
  }

  function discoverRenderedAvatar(){
    try{
      var img=document.querySelector('.vf-mobile-avatar img,.vf-drawer-account-avatar img,.vf-profile-photo img:not([hidden])');
      if(!img)return false;
      var src=img.getAttribute('src')||img.src||'';
      if(!src)return false;
      if(!cache||cache.url!==src)save(src,'',sessionUserId());
      return true;
    }catch(_){return false;}
  }

  function discoverSynchronousAvatar(){
    try{
      if(typeof state!=='undefined'&&state&&state.currentUser&&state.currentUser.avatar_url){
        if(!cache||cache.url!==String(state.currentUser.avatar_url))save(state.currentUser.avatar_url,state.currentUser.nome,state.currentUser.id);
        return true;
      }
    }catch(_){ }
    try{
      if(window.SupabaseService&&typeof window.SupabaseService.getCurrentUser==='function'){
        var u=window.SupabaseService.getCurrentUser();
        if(u&&u.avatar_url){
          if(!cache||cache.url!==String(u.avatar_url))save(u.avatar_url,u.nome,u.id);
          return true;
        }
      }
    }catch(_){ }
    return discoverRenderedAvatar();
  }

  cache=read();
  if(cache&&cache.url)preload(cache.url);

  window.VFAvatarCache={
    get:function(){return cache;},
    set:save,
    clear:clear,
    apply:apply
  };

  function install(){
    discoverSynchronousAvatar();
    apply();
    if(observer||!document.documentElement)return;
    observer=new MutationObserver(function(){discoverSynchronousAvatar();queueApply();});
    observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['src','hidden']});
  }

  install();
  document.addEventListener('DOMContentLoaded',function(){discoverSynchronousAvatar();apply();},{once:true});
})();
