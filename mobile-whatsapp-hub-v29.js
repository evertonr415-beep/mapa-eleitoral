(function(){
  'use strict';
  if(window.__vfWhatsAppHubV292)return;window.__vfWhatsAppHubV292=true;

  var installed=false,originalOpen=null;
  function isMobile(){return window.matchMedia&&window.matchMedia('(max-width:900px)').matches;}
  function digits(v){return String(v||'').replace(/\D/g,'');}
  function normalizeBR(v){var d=digits(v);if(!d)return'';if(d.length===10||d.length===11)d='55'+d;return d;}
  function esc(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
  function leaders(){try{return Array.isArray(state.liderancas)?state.liderancas:[];}catch(_){return [];}}
  function findLeader(id){var sid=String(id==null?'':id);return leaders().find(function(l){return String(l&&l.id)==sid;})||null;}
  function firstName(name){return String(name||'').trim().split(/\s+/)[0]||'';}

  function close(){var o=document.getElementById('vf29-wa-overlay');if(o)o.remove();}
  function openWhatsApp(number,message){
    var n=normalizeBR(number),m=String(message||'').trim();
    if(!n){alert('Selecione uma liderança com WhatsApp cadastrado ou informe um número com DDD.');return;}
    var url='https://wa.me/'+n+(m?'?text='+encodeURIComponent(m):'');
    window.location.href=url;
  }

  function openLeadership(){
    close();
    try{if(typeof window.switchView==='function')window.switchView('liderancas');}
    catch(_){ }
  }

  function templateText(kind,leader){
    var nome=firstName(leader&&leader.nome),ola=nome?'Olá, '+nome+'!':'Olá!';
    if(kind==='reuniao')return ola+' Tudo bem? Gostaria de alinhar uma reunião com você. Qual horário fica melhor?';
    if(kind==='convite')return ola+' Tudo bem? Quero te fazer um convite e contar com a sua participação. Posso te passar os detalhes?';
    if(kind==='lembrete')return ola+' Passando para lembrar do nosso compromisso combinado. Se precisar ajustar o horário, me avise por aqui.';
    if(kind==='agradecimento')return ola+' Muito obrigado pelo apoio e pela parceria. Seguimos juntos!';
    return '';
  }

  function openHub(leadershipId){
    if(!isMobile()){if(typeof originalOpen==='function')return originalOpen.apply(window,arguments);return;}
    close();
    var all=leaders().slice().sort(function(a,b){return String(a&&a.nome||'').localeCompare(String(b&&b.nome||''),'pt-BR');});
    var selected=findLeader(leadershipId);
    var options='<option value="">Selecione uma liderança</option>'+all.map(function(l){
      var label=[l.nome||'Liderança',l.bairro].filter(Boolean).join(' • ');
      return '<option value="'+esc(l.id)+'"'+(selected&&String(selected.id)===String(l.id)?' selected':'')+'>'+esc(label)+'</option>';
    }).join('')+'<option value="__manual__">Outro número</option>';

    var overlay=document.createElement('div');overlay.id='vf29-wa-overlay';overlay.className='vf29-wa-overlay';
    overlay.innerHTML='\
      <section class="vf29-wa-sheet" role="dialog" aria-modal="true" aria-label="WhatsApp">\
        <div class="vf29-wa-grab"></div>\
        <header class="vf29-wa-head">\
          <div class="vf29-wa-icon">💬</div>\
          <div><h2>WhatsApp</h2><p>Fale com suas lideranças pelo WhatsApp do celular</p></div>\
          <button class="vf29-wa-close" id="vf29-wa-close" aria-label="Fechar">×</button>\
        </header>\
        <div class="vf29-wa-stack">\
          <div class="vf29-wa-hero">\
            <div class="vf29-wa-hero-icon">✓</div>\
            <div><strong>Envio rápido e simples</strong><p>Funciona em Android e iPhone. O VotoForte prepara a conversa e abre o WhatsApp oficial para você confirmar o envio.</p></div>\
          </div>\
          <div class="vf29-wa-card">\
            <div class="vf29-wa-section-title"><strong>Nova mensagem</strong><span>1 de 2</span></div>\
            <div class="vf29-wa-field">\
              <label>Escolha a liderança</label>\
              <select id="vf29-wa-leader">'+options+'</select>\
            </div>\
            <div class="vf29-wa-selected" id="vf29-wa-selected" hidden></div>\
            <div class="vf29-wa-field" id="vf29-wa-manual-wrap" hidden>\
              <label>Número com DDD</label>\
              <input id="vf29-wa-number" inputmode="tel" autocomplete="tel" placeholder="(43) 99999-9999">\
            </div>\
            <button type="button" class="vf29-wa-link" id="vf29-wa-go-leaders">👥 Ver cadastro de lideranças</button>\
          </div>\
          <div class="vf29-wa-card">\
            <div class="vf29-wa-section-title"><strong>Escreva a mensagem</strong><span>2 de 2</span></div>\
            <div class="vf29-wa-templates" aria-label="Mensagens rápidas">\
              <button type="button" data-template="reuniao">Reunião</button>\
              <button type="button" data-template="convite">Convite</button>\
              <button type="button" data-template="lembrete">Lembrete</button>\
              <button type="button" data-template="agradecimento">Agradecimento</button>\
            </div>\
            <div class="vf29-wa-field">\
              <label>Mensagem</label>\
              <textarea id="vf29-wa-message" placeholder="Digite ou escolha uma mensagem rápida acima..."></textarea>\
            </div>\
            <button class="vf29-wa-primary" id="vf29-wa-send">💬 Abrir conversa no WhatsApp</button>\
            <div class="vf29-wa-safe">O VotoForte não lê suas conversas e não envia nada sozinho. Você revisa e confirma a mensagem dentro do WhatsApp.</div>\
          </div>\
          <details class="vf29-wa-help">\
            <summary>Como funciona?</summary>\
            <div class="vf29-wa-help-body">\
              <div><b>1</b><span>Escolha uma liderança ou informe outro número.</span></div>\
              <div><b>2</b><span>Escreva a mensagem ou use um modelo rápido.</span></div>\
              <div><b>3</b><span>Toque em “Abrir conversa no WhatsApp”. O app oficial abre com tudo preenchido.</span></div>\
            </div>\
          </details>\
        </div>\
      </section>';
    document.body.appendChild(overlay);

    var leaderSelect=document.getElementById('vf29-wa-leader');
    var selectedBox=document.getElementById('vf29-wa-selected');
    var manualWrap=document.getElementById('vf29-wa-manual-wrap');
    var numberInput=document.getElementById('vf29-wa-number');
    var messageInput=document.getElementById('vf29-wa-message');

    function currentLeader(){var v=leaderSelect.value;if(!v||v==='__manual__')return null;return findLeader(v);}
    function syncSelection(){
      var v=leaderSelect.value,l=currentLeader();
      manualWrap.hidden=v!=='__manual__';
      selectedBox.hidden=true;selectedBox.innerHTML='';
      if(l){
        var phone=l.whatsapp||l.telefone||l.celular||'';
        selectedBox.hidden=false;
        selectedBox.innerHTML='<div class="vf29-wa-avatar">'+esc((String(l.nome||'L').trim()[0]||'L').toUpperCase())+'</div><div><strong>'+esc(l.nome||'Liderança')+'</strong><span>'+esc([l.bairro,phone].filter(Boolean).join(' • ')||'WhatsApp não informado')+'</span></div>';
      }
    }
    leaderSelect.addEventListener('change',syncSelection);syncSelection();

    overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
    document.getElementById('vf29-wa-close').onclick=close;
    document.getElementById('vf29-wa-go-leaders').onclick=openLeadership;
    document.querySelectorAll('#vf29-wa-overlay [data-template]').forEach(function(btn){btn.addEventListener('click',function(){
      document.querySelectorAll('#vf29-wa-overlay [data-template]').forEach(function(b){b.classList.remove('is-active');});
      btn.classList.add('is-active');messageInput.value=templateText(btn.getAttribute('data-template'),currentLeader());messageInput.focus();
    });});
    document.getElementById('vf29-wa-send').onclick=function(){
      var l=currentLeader(),phone=l&&(l.whatsapp||l.telefone||l.celular)||'';
      if(leaderSelect.value==='__manual__')phone=numberInput.value;
      if(!leaderSelect.value){alert('Escolha uma liderança ou selecione “Outro número”.');return;}
      if(l&&!phone){alert('Essa liderança ainda não possui WhatsApp cadastrado. Atualize o cadastro ou use “Outro número”.');return;}
      openWhatsApp(phone,messageInput.value);
    };
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
