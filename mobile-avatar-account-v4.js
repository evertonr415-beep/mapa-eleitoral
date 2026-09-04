(function(){
  'use strict';
  if(window.__vfAvatarAccountV4Loaded)return;
  window.__vfAvatarAccountV4Loaded=true;

  function install(){
    var body=document.body;
    var avatar=document.querySelector('.vf-mobile-profile-button');
    var drawerSecurity=document.querySelector('.vf-drawer-security');
    if(!body||!avatar||!drawerSecurity)return false;
    if(document.querySelector('.vf-avatar-account-menu'))return true;

    var menu=document.createElement('div');
    menu.className='vf-avatar-account-menu';
    menu.setAttribute('role','menu');
    menu.setAttribute('aria-label','Conta e segurança');

    var backdrop=document.createElement('button');
    backdrop.type='button';
    backdrop.className='vf-avatar-account-backdrop';
    backdrop.setAttribute('aria-label','Fechar menu da conta');

    var actions=[].slice.call(drawerSecurity.querySelectorAll('.btn-topbar'));
    actions.forEach(function(btn){menu.appendChild(btn);});

    document.body.appendChild(backdrop);
    document.body.appendChild(menu);

    function open(ev){
      if(ev){ev.preventDefault();ev.stopImmediatePropagation();}
      body.classList.remove('vf-drawer-open');
      body.classList.add('vf-avatar-account-open');
      avatar.setAttribute('aria-expanded','true');
    }
    function close(ev){
      if(ev){ev.preventDefault();ev.stopImmediatePropagation();}
      body.classList.remove('vf-avatar-account-open');
      avatar.setAttribute('aria-expanded','false');
    }
    function toggle(ev){
      if(body.classList.contains('vf-avatar-account-open'))close(ev); else open(ev);
    }

    avatar.setAttribute('aria-haspopup','menu');
    avatar.setAttribute('aria-expanded','false');
    avatar.addEventListener('click',toggle,true);
    backdrop.addEventListener('click',close,true);

    menu.addEventListener('click',function(ev){
      var button=ev.target.closest('.btn-topbar');
      if(button)setTimeout(close,30);
    });

    document.addEventListener('keydown',function(ev){if(ev.key==='Escape')close();});
    document.addEventListener('click',function(ev){
      if(!body.classList.contains('vf-avatar-account-open'))return;
      if(menu.contains(ev.target)||avatar.contains(ev.target))return;
      close();
    });

    return true;
  }

  if(!install()){
    var tries=0;
    var timer=setInterval(function(){tries+=1;if(install()||tries>80)clearInterval(timer);},50);
  }
})();
