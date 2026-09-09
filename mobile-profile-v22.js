(function(){
  'use strict';
  if(window.__vfMobileProfileV22)return;window.__vfMobileProfileV22=true;

  var U='https://aufsewqtybpothlrsjij.supabase.co';
  var K='sb_publishable_Xh-qzcyJY0-IzHHgri8XNw_f00aJ_sP';
  var supa=null,sheet=null,backdrop=null,current=null,profile=null,avatarObserver=null,avatarRepairQueued=false;

  function isMobile(){return document.body.classList.contains('vf-mobile')||matchMedia('(max-width:900px)').matches;}
  function initials(name){var a=String(name||'').trim().split(/\s+/).filter(Boolean);return ((a[0]||'?')[0]+(a.length>1?a[a.length-1][0]:'')).toUpperCase();}
  async function client(){if(supa)return supa;var m=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');supa=m.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return supa;}
  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]||ch;});}
  function roleLabel(r){r=String(r||'usuario');return r==='master'?'Master':r==='adm'?'Administrador':r==='vereador'?'Vereador':r;}
  function profileName(){return (profile&&profile.nome)||(current&&current.user_metadata&&current.user_metadata.nome)||(current&&current.email)||'Usuário';}
  function deviceLabel(){var ua=navigator.userAgent||'';if(/iPhone|iPad|iPod/i.test(ua))return 'iPhone / iPad';if(/Android/i.test(ua))return 'Android';if(/Mobile/i.test(ua))return 'Celular';return 'Computador';}
  async function audit(type,action,details){try{var s=await client();var u=(await s.auth.getUser()).data.user;if(!u)return;await s.from('audit_logs').insert({user_id:u.id,tipo:type||'sistema',acao:action||'Atividade',detalhes:details||null,dispositivo:deviceLabel()});}catch(_){}}
  function loadAuditLayer(){
    try{
      if(!document.querySelector('link[data-vf-audit32="1"]')){var css=document.createElement('link');css.rel='stylesheet';css.href=location.origin+'/audit-center-v32.css?v=32.1';css.dataset.vfAudit32='1';document.head.appendChild(css);}
      if(!document.querySelector('script[data-vf-audit32="1"]')){var js=document.createElement('script');js.src=location.origin+'/audit-center-v32.js?v=32.1';js.defer=true;js.dataset.vfAudit32='1';document.head.appendChild(js);}
    }catch(_){ }
  }

  function ensure(){
    if(sheet)return;
    backdrop=document.createElement('button');backdrop.type='button';backdrop.className='vf-profile-backdrop';backdrop.setAttribute('aria-label','Fechar perfil');
    sheet=document.createElement('section');sheet.className='vf-profile-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label','Minha conta');
    sheet.innerHTML='<div class="vf-profile-head"><div><strong>Minha conta</strong><span>Perfil e segurança</span></div><button type="button" class="vf-profile-close" aria-label="Fechar">×</button></div><div class="vf-profile-card"><div class="vf-profile-photo"><span class="vf-profile-photo-fallback">?</span><img hidden alt="Foto de perfil"><button type="button" class="vf-profile-photo-action">Alterar foto</button></div><div><div class="vf-profile-name">Carregando...</div><div class="vf-profile-email"></div><span class="vf-profile-role"></span></div></div><input class="vf-profile-file" type="file" accept="image/jpeg,image/png,image/webp"><section class="vf-profile-section"><div class="vf-profile-section-title">Foto do perfil</div><div class="vf-profile-section-sub">Escolha uma foto do aparelho. Ela será redimensionada e salva no seu perfil.</div><button type="button" class="vf-profile-secondary vf-profile-choose-photo">Escolher foto</button><div class="vf-profile-status vf-profile-photo-status"></div></section><section class="vf-profile-section"><div class="vf-profile-section-title">Alterar senha</div><div class="vf-profile-section-sub">A senha atual não pode ser exibida. Você pode definir uma nova senha diretamente enquanto estiver conectado.</div><div class="vf-profile-field"><label>Nova senha</label><div class="vf-profile-input-wrap"><input class="vf-profile-pass1" type="password" autocomplete="new-password" minlength="8" placeholder="Mínimo de 8 caracteres"><button type="button" class="vf-profile-eye" data-target=".vf-profile-pass1">◉</button></div></div><div class="vf-profile-field"><label>Confirmar nova senha</label><div class="vf-profile-input-wrap"><input class="vf-profile-pass2" type="password" autocomplete="new-password" minlength="8" placeholder="Digite novamente"><button type="button" class="vf-profile-eye" data-target=".vf-profile-pass2">◉</button></div></div><button type="button" class="vf-profile-primary vf-profile-save-pass">Atualizar senha</button><div class="vf-profile-status vf-profile-pass-status"></div></section><button type="button" class="vf-profile-danger vf-profile-logout">Sair da conta</button>';
    document.body.append(backdrop,sheet);
    backdrop.addEventListener('click',close);
    sheet.querySelector('.vf-profile-close').addEventListener('click',close);
    sheet.querySelector('.vf-profile-photo-action').addEventListener('click',choosePhoto);
    sheet.querySelector('.vf-profile-choose-photo').addEventListener('click',choosePhoto);
    sheet.querySelector('.vf-profile-file').addEventListener('change',uploadPhoto);
    sheet.querySelector('.vf-profile-save-pass').addEventListener('click',savePassword);
    sheet.querySelector('.vf-profile-logout').addEventListener('click',logout);
    sheet.querySelectorAll('.vf-profile-eye').forEach(function(b){b.addEventListener('click',function(){var i=sheet.querySelector(b.dataset.target);if(i)i.type=i.type==='password'?'text':'password';});});
  }
  function status(sel,msg,ok){var n=sheet&&sheet.querySelector(sel);if(!n)return;n.className='vf-profile-status '+(ok?'ok':'err')+' '+sel.slice(1);n.textContent=msg;}
  function clearStatus(sel){var n=sheet&&sheet.querySelector(sel);if(!n)return;n.className='vf-profile-status '+sel.slice(1);n.textContent='';}

  async function load(){
    try{
      var s=await client();var u=(await s.auth.getUser()).data.user;if(!u)throw new Error('Sessão não encontrada.');current=u;
      var pr=await s.from('perfis_usuarios').select('id,nome,email,role,avatar_url').eq('id',u.id).maybeSingle();profile=pr.data||{};
      render();
      ensureAvatarPersistence();
    }catch(e){status('.vf-profile-pass-status',e.message||'Não foi possível carregar o perfil.',false);}
  }
  function render(){
    if(!sheet||!current)return;var name=profileName();
    sheet.querySelector('.vf-profile-name').textContent=name;
    sheet.querySelector('.vf-profile-email').textContent=(profile&&profile.email)||current.email||'';
    sheet.querySelector('.vf-profile-role').textContent=roleLabel(profile&&profile.role);
    applyAvatar(profile&&profile.avatar_url,name);
  }

  function avatarNodeIsCorrect(el,url,name){
    if(!el)return true;
    if(url){
      var kids=el.children;
      return kids&&kids.length===1&&kids[0].tagName==='IMG'&&kids[0].getAttribute('src')===url;
    }
    return el.children.length===0&&el.textContent===initials(name);
  }
  function applyAvatarNodes(url,name){
    document.querySelectorAll('.vf-mobile-avatar,.vf-drawer-account-avatar').forEach(function(el){
      if(avatarNodeIsCorrect(el,url,name))return;
      el.innerHTML='';
      if(url){var i=document.createElement('img');i.src=url;i.alt='';i.decoding='async';el.appendChild(i);}else el.textContent=initials(name);
    });
  }
  function applyAvatar(url,name){
    applyAvatarNodes(url,name);
    var img=sheet&&sheet.querySelector('.vf-profile-photo img');var fb=sheet&&sheet.querySelector('.vf-profile-photo-fallback');
    if(!img||!fb)return;
    if(url){if(img.getAttribute('src')!==url)img.src=url;img.hidden=false;fb.hidden=true;}else{img.hidden=true;fb.hidden=false;fb.textContent=initials(name);}
  }
  function repairAvatarSoon(){
    if(avatarRepairQueued||!profile||!profile.avatar_url)return;
    avatarRepairQueued=true;
    requestAnimationFrame(function(){
      avatarRepairQueued=false;
      applyAvatarNodes(profile.avatar_url,profileName());
    });
  }
  function ensureAvatarPersistence(){
    if(avatarObserver||!document.body)return;
    avatarObserver=new MutationObserver(function(mutations){
      if(!profile||!profile.avatar_url)return;
      var needs=false;
      for(var i=0;i<mutations.length&&!needs;i++){
        var t=mutations[i].target;
        if(t&&t.nodeType===1&&(t.matches&&t.matches('.vf-mobile-avatar,.vf-drawer-account-avatar')||t.querySelector&&t.querySelector('.vf-mobile-avatar,.vf-drawer-account-avatar')))needs=true;
      }
      if(!needs){
        document.querySelectorAll('.vf-mobile-avatar,.vf-drawer-account-avatar').forEach(function(el){if(!avatarNodeIsCorrect(el,profile.avatar_url,profileName()))needs=true;});
      }
      if(needs)repairAvatarSoon();
    });
    avatarObserver.observe(document.body,{childList:true,subtree:true});
    repairAvatarSoon();
  }

  async function open(){if(!isMobile())return;ensure();document.body.classList.add('vf-profile-open');clearStatus('.vf-profile-pass-status');clearStatus('.vf-profile-photo-status');await load();}
  function close(){document.body.classList.remove('vf-profile-open');}
  function choosePhoto(){var f=sheet&&sheet.querySelector('.vf-profile-file');if(f)f.click();}

  function resize(file){return new Promise(function(resolve,reject){var img=new Image(),r=new FileReader();r.onload=function(){img.onload=function(){var max=512,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',.82));};img.onerror=reject;img.src=r.result;};r.onerror=reject;r.readAsDataURL(file);});}
  async function uploadPhoto(ev){
    var file=ev.target.files&&ev.target.files[0];if(!file)return;
    if(!/^image\//.test(file.type)){status('.vf-profile-photo-status','Escolha uma imagem válida.',false);return;}
    if(file.size>8*1024*1024){status('.vf-profile-photo-status','A imagem deve ter no máximo 8 MB.',false);return;}
    try{
      status('.vf-profile-photo-status','Salvando foto...',true);
      var data=await resize(file);var s=await client();
      var res=await s.from('perfis_usuarios').update({avatar_url:data,atualizado_em:new Date().toISOString()}).eq('id',current.id).select('avatar_url').single();
      if(res.error)throw res.error;profile.avatar_url=res.data.avatar_url;applyAvatar(profile.avatar_url,profile.nome||current.email);ensureAvatarPersistence();status('.vf-profile-photo-status','Foto atualizada.',true);audit('usuario','Foto de perfil atualizada','Alteração realizada em Minha conta');
    }catch(e){status('.vf-profile-photo-status',e.message||'Não foi possível salvar a foto.',false);}
    ev.target.value='';
  }
  async function savePassword(){
    var p1=sheet.querySelector('.vf-profile-pass1').value,p2=sheet.querySelector('.vf-profile-pass2').value;
    clearStatus('.vf-profile-pass-status');
    if(p1.length<8){status('.vf-profile-pass-status','Use pelo menos 8 caracteres.',false);return;}
    if(p1!==p2){status('.vf-profile-pass-status','As senhas não conferem.',false);return;}
    try{var s=await client();var r=await s.auth.updateUser({password:p1});if(r.error)throw r.error;await audit('senha','Senha alterada','Senha atualizada pelo próprio usuário em Minha conta');sheet.querySelector('.vf-profile-pass1').value='';sheet.querySelector('.vf-profile-pass2').value='';status('.vf-profile-pass-status','Senha atualizada com sucesso.',true);}catch(e){status('.vf-profile-pass-status',e.message||'Não foi possível atualizar a senha.',false);}
  }
  async function logout(){var target=location.origin+'/?login=1';try{var s=await client();await audit('login','Logout realizado','Sessão encerrada pelo usuário');await s.auth.signOut();location.replace(target);}catch(_){location.replace(target);}}

  function bind(){
    if(!isMobile())return;ensure();
    var b=document.querySelector('.vf-mobile-profile-button');if(!b){setTimeout(bind,120);return;}
    if(b.dataset.vfProfile22==='1'){ensureAvatarPersistence();repairAvatarSoon();return;}b.dataset.vfProfile22='1';
    var clean=b.cloneNode(true);clean.dataset.vfProfile22='1';b.parentNode.replaceChild(clean,b);clean.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();open();},true);
    ensureAvatarPersistence();
    setTimeout(load,80);
  }
  loadAuditLayer();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(bind,700)},{once:true});else setTimeout(bind,700);
  setTimeout(bind,1300);setTimeout(bind,2200);
})();
