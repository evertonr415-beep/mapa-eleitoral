(function(){
  'use strict';
  if(window.__vfMobileEventStabilityV3Loaded)return;
  window.__vfMobileEventStabilityV3Loaded=true;

  var nativeDispatch=window.dispatchEvent.bind(window);

  function invalidateMap(){
    try{
      if(typeof state!=='undefined'&&state&&state.map&&typeof state.map.invalidateSize==='function'){
        state.map.invalidateSize({pan:false,animate:false});
      }
    }catch(_){}
  }

  window.dispatchEvent=function(event){
    /* mobile-ui usava resize sintético para atualizar o mapa. No iOS isso
       entrava novamente no listener global de resize e criava um ciclo que
       interferia com scroll e drawer. Eventos reais do navegador continuam. */
    if(event&&event.type==='resize'&&event.isTrusted===false){
      invalidateMap();
      return true;
    }
    return nativeDispatch(event);
  };
})();
