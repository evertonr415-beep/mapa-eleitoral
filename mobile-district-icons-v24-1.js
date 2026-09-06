(function(){
  'use strict';
  if(window.__vfDistrictIconsV241)return;window.__vfDistrictIconsV241=true;

  var ICONS={
    central:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 18h18M12 3 3 7v3h18V7l-9-4Z"/></svg>',
    norte:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z"/></svg>',
    sul:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16V9l-5 3V9l-5 3V5H4v15Z"/><path d="M7 8h1M7 12h1M7 16h1M13 15h1M17 15h1"/></svg>',
    leste:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V10"/><path d="M7 10a5 5 0 0 1 10 0c0 3-2 5-5 5s-5-2-5-5Z"/><path d="M9.5 6.5A4.5 4.5 0 0 1 18 9M6 9a4 4 0 0 1 4-4"/></svg>',
    oeste:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h18M5 20v-8l5-4 5 4v8M15 20v-5l3-2 3 2v5M8 14h4M9 20v-4h2"/></svg>',
    generic:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/></svg>'
  };

  function iconFor(title){
    title=String(title||'').toLowerCase();
    if(title.indexOf('central')!==-1||title.indexOf('histórico')!==-1)return ICONS.central;
    if(title.indexOf('norte')!==-1||title.indexOf('flamingos')!==-1)return ICONS.norte;
    if(title.indexOf('sul')!==-1||title.indexOf('aricanduva')!==-1)return ICONS.sul;
    if(title.indexOf('leste')!==-1||title.indexOf('petrópolis')!==-1)return ICONS.leste;
    if(title.indexOf('oeste')!==-1||title.indexOf('daleffe')!==-1||title.indexOf('palmares')!==-1)return ICONS.oeste;
    return ICONS.generic;
  }

  function professionalizeCard(card){
    if(!card)return;
    var title=card.querySelector('.vf24-card-title strong');
    var icon=card.querySelector('.vf24-card-icon');
    if(icon&&icon.dataset.vf241!=='1'){
      icon.innerHTML=iconFor(title&&title.textContent);
      icon.dataset.vf241='1';
    }
    var status=card.querySelector('.vf24-status');
    if(status&&status.dataset.vf241!=='1'){
      var text=String(status.textContent||'').replace(/[🔴🟡🟢]/g,'').trim();
      status.innerHTML='<span class="vf24-status-dot" aria-hidden="true"></span><span>'+text+'</span>';
      status.dataset.vf241='1';
    }
    var assigned=card.querySelector('.vf24-assigned');
    if(assigned&&assigned.dataset.vf241!=='1'){
      var txt=String(assigned.textContent||'').replace(/[🟢👤]/g,'').trim();
      var free=/região livre/i.test(txt);
      assigned.innerHTML='<span class="vf24-assigned-dot '+(free?'free':'assigned')+'" aria-hidden="true"></span><span>'+txt+'</span>';
      assigned.dataset.vf241='1';
    }
    var mapBtn=card.querySelector('.vf24-map-action');
    if(mapBtn&&mapBtn.dataset.vf241!=='1'){
      mapBtn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2V6Z"/><path d="M8 4v13M16 7v13"/></svg><span>Ver região no mapa</span>';
      mapBtn.dataset.vf241='1';
    }
  }

  function apply(){document.querySelectorAll('.vf24-card').forEach(professionalizeCard);}
  var queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply();});}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
  new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(apply,700);
})();
