(function(){
  'use strict';
  if(window.__vfWhatsAppHubV29)return;window.__vfWhatsAppHubV29=true;

  var installed=false,originalOpen=null;
  function isMobile(){return window.matchMedia&&window.matchMedia('(max-width:900px)').matches;}
  function digits(v){return String(v||'').replace(/\D/g,'');}
  function normalizeBR(v){var d=digits(v);if(!d)return'';if(d.length===10||d.length===11)d='55'+d;return d;}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];});}

  function close(){var o=document.getElementById('vf29-wa-overlay');if(o)o.remove();}
  function openWhatsApp(number,message){
    var n=normalizeBR(number),m=String(message||'').trim();
    if(!n){alert('Informe o número do WhatsApp com DDD.');return;}
    var url='https://wa.me/'+n+(m?'?text='+encodeURIComponent(m):'');
    window.location.href=url;
  }

  function openLeadership(){
    close();
    try{if(typeof window.switchView==='function')window.switchView('liderancas');}
    catch(_){ }
  }

  function showAdvanced(){
    var box=document.getElementById('vf29-wa-advanced');if(!box)return;
    var show=box.hidden;box.hidden=!show;
    var btn=document.getElementById('vf29-wa-advanced-btn');if(btn)btn.textContent=show?'Ocultar opções avançadas':'Ver opções avançadas';
  }

  function openHub(){
    if(!isMobile()){if(typeof originalOpen==='function')return originalOpen();return;}
    close();
    var overlay=document.createElement('div');overlay.id='vf29-wa-overlay';overlay.className='vf29-wa-overlay';
    overlay.innerHTML='\
      <section class="vf29-wa-sheet" role="dialog" aria-modal="true" aria-label="WhatsApp">\
        <div class="vf29-wa-grab"></div>\
        <header class="vf29-wa-head">\
          <div class="vf29-wa-icon">💬</div>\
          <div><h2>WhatsApp</h2><p>Mensagens e relacionamento com suas lideranças</p></div>\
          <button class="vf29-wa-close" id="vf29-wa-close" aria-label="Fechar">×</button>\
        </header>\
        <div class="vf29-wa-stack">\
          <div class="vf29-wa-card">\
            <div class="vf29-wa-status">\
              <span class="vf29-wa-status-dot"></span>\
              <div class="vf29-wa-status-copy"><strong>Usar o WhatsApp deste celular <span class="vf29-wa-badge">Recomendado</span></strong><p>Abre o aplicativo oficial do WhatsApp no próprio iPhone. Sua conta continua conectada normalmente.</p></div>\
            </div>\
          </div>\
          <div class="vf29-wa-card">\
            <div class="vf29-wa-section-title"><strong>💬 Nova mensagem</strong><span>Envio pelo app oficial</span></div>\
            <div class="vf29-wa-field"><label>Número com DDD</label><input id="vf29-wa-number" inputmode="tel" autocomplete="tel" placeholder="(43) 99999-9999"></div>\
            <div class="vf29-wa-field"><label>Mensagem</label><textarea id="vf29-wa-message" placeholder="Digite a mensagem que deseja enviar..."></textarea></div>\
            <div class="vf29-wa-hint">Ao continuar, o WhatsApp abrirá com o número e a mensagem preenchidos. Você confirma o envio dentro do próprio WhatsApp.</div>\
            <button class="vf29-wa-primary" id="vf29-wa-send">🟢 Abrir no WhatsApp</button>\
            <div class="vf29-wa-actions">\
              <button class="vf29-wa-secondary" id="vf29-wa-leaders">👥 Escolher uma liderança</button>\
              <button class="vf29-wa-tertiary" id="vf29-wa-paste">📋 Colar número</button>\
            </div>\
          </div>\
          <div class="vf29-wa-card">\
            <div class="vf29-wa-section-title"><strong>Recursos do VotoForte</strong><span>Mobile</span></div>\
            <div class="vf29-wa-feature"><div class="vf29-wa-feature-icon">👥</div><div class="vf29-wa-feature-copy"><strong>Contatos das lideranças</strong><span>Use os números já cadastrados na aba Lideranças.</span></div><span class="vf29-wa-feature-tag">Ativo</span></div>\
            <div class="vf29-wa-feature"><div class="vf29-wa-feature-icon">📝</div><div class="vf29-wa-feature-copy"><strong>Mensagem pré-preenchida</strong><span>O texto vai pronto para revisão antes do envio.</span></div><span class="vf29-wa-feature-tag">Ativo</span></div>\
            <div class="vf29-wa-feature"><div class="vf29-wa-feature-icon">📊</div><div class="vf29-wa-feature-copy"><strong>Campanhas e automações</strong><span>Exigem integração oficial do WhatsApp Business.</span></div><span class="vf29-wa-feature-tag">Próxima etapa</span></div>\
          </div>\
          <button class="vf29-wa-tertiary" id="vf29-wa-advanced-btn">Ver opções avançadas</button>\
          <div id="vf29-wa-advanced" hidden>\
            <div class="vf29-wa-card">\
              <div class="vf29-wa-section-title"><strong>⚙️ Conexão avançada</strong><span>Outro dispositivo / API</span></div>\
              <div class="vf29-wa-note"><strong>QR Code:</strong> no mesmo celular ele não é a melhor opção, porque o WhatsApp precisa escanear a tela de outro aparelho. Por isso ele não aparece como método principal aqui.</div>\
              <div class="vf29-wa-note" style="margin-top:8px"><strong>Número + código:</strong> o código de vinculação é gerado pelo próprio WhatsApp Web/desktop. O VotoForte não deve inventar esse código.</div>\
              <div class="vf29-wa-note" style="margin-top:8px"><strong>Envio automático:</strong> para campanhas e automações, a próxima etapa correta é integrar o WhatsApp Business oficialmente, mantendo esta interface.</div>\
              <button class="vf29-wa-secondary" id="vf29-wa-old" style="margin-top:10px">🖥️ Abrir conexão antiga / QR</button>\
            </div>\
          </div>\
          <div class="vf29-wa-footer">O envio direto abre o aplicativo oficial do WhatsApp e não desconecta a conta do celular.</div>\
        </div>\
      </section>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
    document.getElementById('vf29-wa-close').onclick=close;
    document.getElementById('vf29-wa-send').onclick=function(){openWhatsApp(document.getElementById('vf29-wa-number').value,document.getElementById('vf29-wa-message').value);};
    document.getElementById('vf29-wa-leaders').onclick=openLeadership;
    document.getElementById('vf29-wa-paste').onclick=async function(){try{var t=await navigator.clipboard.readText();document.getElementById('vf29-wa-number').value=t||'';}catch(_){document.getElementById('vf29-wa-number').focus();}};
    document.getElementById('vf29-wa-advanced-btn').onclick=showAdvanced;
    document.getElementById('vf29-wa-old').onclick=function(){close();if(typeof originalOpen==='function')originalOpen();};
  }

  function install(){
    if(installed)return;
    if(typeof window.openWhatsAppSenderModal!=='function'){setTimeout(install,180);return;}
    originalOpen=window.openWhatsAppSenderModal;
    window.__vfOriginalWhatsAppSenderModal=originalOpen;
    window.openWhatsAppSenderModal=openHub;
    installed=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,250);},{once:true});else setTimeout(install,250);
  setTimeout(install,900);setTimeout(install,1800);
})();
