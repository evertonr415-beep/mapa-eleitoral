(function(){
'use strict';
if(window.__vfHamburgerNavV5Loaded)return;window.__vfHamburgerNavV5Loaded=true;
function closeDrawer(){document.body.classList.remove('vf-drawer-open');}
function active(){var ids=['map','colegios','liderancas','distritos'];for(var i=0;i<ids.length;i++){var t=document.getElementById('tab-btn-'+ids[i]);if(t&&t.classList.contains('active'))return ids[i];}return 'map';}
function sync(){var v=active();document.querySelectorAll('.vf-drawer-nav-grid button[data-vf-nav]').forEach(function(b){b.classList.toggle('active',b.dataset.vfNav===v);});}
function install(){
 var drawer=document.querySelector('.vf-mobile-drawer');var bottom=document.querySelector('.vf-mobile-bottom-nav');
 if(!drawer||!bottom){setTimeout(install,80);return;}
 if(drawer.querySelector('.vf-drawer-navigation')){sync();return;}
 var scroll=drawer.querySelector('.vf-drawer-scroll');var first=scroll&&scroll.querySelector('.vf-drawer-section');if(!scroll||!first)return;
 var sec=document.createElement('section');sec.className='vf-drawer-section vf-drawer-navigation';
 sec.innerHTML='<div class="vf-drawer-label">Navegação</div><div class="vf-drawer-nav-grid"></div>';
 var grid=sec.querySelector('.vf-drawer-nav-grid');
 ['map','colegios','liderancas','distritos'].forEach(function(v){var src=bottom.querySelector('button[data-vf-view="'+v+'"]');if(!src)return;var b=document.createElement('button');b.type='button';b.dataset.vfNav=v;b.innerHTML=src.innerHTML;b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();closeDrawer();if(typeof window.switchView==='function')window.switchView(v);setTimeout(sync,30);});grid.appendChild(b);});
 scroll.insertBefore(sec,first);sync();
 document.querySelectorAll('.tab-btn').forEach(function(t){new MutationObserver(sync).observe(t,{attributes:true,attributeFilter:['class','style']});});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,100);},{once:true});else setTimeout(install,100);
 setTimeout(install,500);
})();
