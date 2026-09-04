(function () {
  'use strict';

  if (window.__vfMobileCandidateVotesLoaded) return;
  window.__vfMobileCandidateVotesLoaded = true;

  var BREAKPOINT = 900;

  function isMobile() {
    return window.matchMedia('(max-width:' + BREAKPOINT + 'px)').matches;
  }

  function closeMobilePanels() {
    document.body.classList.remove('vf-drawer-open');
    document.body.classList.remove('vf-leader-sheet-open');
  }

  function candidateInfo(key) {
    try {
      if (typeof ELEICAO_2024_DATA !== 'undefined' && ELEICAO_2024_DATA && ELEICAO_2024_DATA.candidates) {
        return ELEICAO_2024_DATA.candidates[key] || null;
      }
    } catch (_) {}
    return null;
  }

  function setCandidateState(value) {
    try {
      if (typeof state !== 'undefined' && state) state.selectedCandidate = value;
    } catch (_) {}
  }

  function renderCandidateVotePage(value) {
    var info = candidateInfo(value);

    setCandidateState(value);
    closeMobilePanels();

    try {
      if (typeof renderMapColegios === 'function') renderMapColegios();
    } catch (_) {}

    try {
      if (typeof renderTableColegios === 'function') renderTableColegios();
    } catch (_) {}

    if (typeof window.switchView === 'function') {
      window.switchView('colegios');
    }

    window.setTimeout(function () {
      try {
        if (typeof renderTableColegios === 'function') renderTableColegios();
      } catch (_) {}

      var view = document.getElementById('view-table-colegios');
      if (!view) return;

      var head = view.querySelector(':scope > div:first-child');
      var title = head && head.querySelector('h2');
      var subtitle = head && head.querySelector('p, span');

      if (info) {
        if (title) title.textContent = 'Votos de ' + info.name;
        if (subtitle) subtitle.textContent = (info.party || '') + ' • votação por colégio eleitoral';
      } else if (value === 'ALL') {
        if (title) title.textContent = 'Colégios eleitorais';
        if (subtitle) subtitle.textContent = 'Visão geral dos 29 locais de votação';
      }

      view.scrollTop = 0;
      window.dispatchEvent(new Event('resize'));
    }, 80);
  }

  function onCandidateChanged(event) {
    if (!isMobile()) return;
    var select = event.currentTarget;
    var value = select && select.value ? select.value : 'ALL';

    // No mobile, qualquer escolha do seletor já leva diretamente à lista de votos.
    renderCandidateVotePage(value);
  }

  function install() {
    var select = document.getElementById('cand-select');
    if (!select || select.dataset.vfCandidateVotesBound === '1') return;

    select.dataset.vfCandidateVotesBound = '1';
    select.setAttribute('aria-label', 'Escolher candidato e abrir lista de votos');
    select.addEventListener('change', onCandidateChanged);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.setTimeout(install, 120);
    }, { once: true });
  } else {
    window.setTimeout(install, 120);
  }

  window.setTimeout(install, 450);
  window.setTimeout(install, 1100);
}());