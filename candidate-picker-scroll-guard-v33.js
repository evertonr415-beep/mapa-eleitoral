(function(){
  'use strict';
  if(window.__vfCandidatePickerScrollGuardV33)return;
  window.__vfCandidatePickerScrollGuardV33=true;

  var NativeMutationObserver=window.MutationObserver;
  if(!NativeMutationObserver)return;

  function isInsideCandidateSource(node){
    var select=document.getElementById('cand-select');
    return !!(select&&node&&(node===select||select.contains(node)));
  }

  function hasStructuralOptionChange(records){
    return records.some(function(record){
      if(record.type!=='childList')return false;
      var nodes=Array.prototype.slice.call(record.addedNodes||[]).concat(Array.prototype.slice.call(record.removedNodes||[]));
      return nodes.some(function(node){
        if(!node||node.nodeType!==1)return false;
        var tag=String(node.tagName||'').toLowerCase();
        if(tag==='option'||tag==='optgroup')return true;
        return !!(node.querySelector&&node.querySelector('option,optgroup'));
      });
    });
  }

  function restoreListScroll(y){
    if(y==null)return;
    var apply=function(){
      var list=document.querySelector('.vf-mobile-candidate-list');
      if(list&&document.body.classList.contains('vf-mobile-candidate-open'))list.scrollTop=y;
    };
    requestAnimationFrame(apply);
    setTimeout(apply,0);
    setTimeout(apply,50);
    setTimeout(apply,100);
  }

  function GuardedMutationObserver(callback){
    var wrapped=function(records,observer){
      var sourceRecords=(records||[]).filter(function(record){return isInsideCandidateSource(record.target);});
      if(sourceRecords.length){
        // Alterações apenas de texto dos options não precisam reconstruir a lista.
        // Isso evita o ciclo de rebuild -> scrollIntoView -> retorno ao topo.
        if(!hasStructuralOptionChange(sourceRecords))return;

        var list=document.querySelector('.vf-mobile-candidate-list');
        var open=document.body.classList.contains('vf-mobile-candidate-open');
        var y=open&&list?list.scrollTop:null;
        callback(records,observer);
        restoreListScroll(y);
        return;
      }
      callback(records,observer);
    };
    return new NativeMutationObserver(wrapped);
  }

  GuardedMutationObserver.prototype=NativeMutationObserver.prototype;
  try{Object.setPrototypeOf(GuardedMutationObserver,NativeMutationObserver);}catch(_){ }
  window.MutationObserver=GuardedMutationObserver;

  // Proteção adicional: chamadas internas de scrollIntoView da linha selecionada
  // não podem mover a lista enquanto o usuário estiver navegando nela.
  var nativeScrollIntoView=Element.prototype.scrollIntoView;
  if(nativeScrollIntoView&&!Element.prototype.__vfCandidateScrollGuardV33){
    try{Object.defineProperty(Element.prototype,'__vfCandidateScrollGuardV33',{value:true,configurable:true});}catch(_){ }
    Element.prototype.scrollIntoView=function(){
      try{
        if(this.classList&&this.classList.contains('vf-mobile-candidate-option')&&this.closest('.vf-mobile-candidate-list')&&document.body.classList.contains('vf-mobile-candidate-open')){
          var list=this.closest('.vf-mobile-candidate-list');
          if(list&&list.scrollTop>12)return;
        }
      }catch(_){ }
      return nativeScrollIntoView.apply(this,arguments);
    };
  }
})();
