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

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function candidateInfo(key) {
    try {
      if (typeof ELEICAO_2024_DATA !== 'undefined' && ELEICAO_2024_DATA && ELEICAO_2024_DATA.candidates) {
        return ELEICAO_2024_DATA.candidates[key] || null;
      }
    } catch (_) {}
    return null;
  }

  function locations() {
    try {
      if (typeof ELEICAO_2024_DATA !== 'undefined' && ELEICAO_2024_DATA && Array.isArray(ELEICAO_2024_DATA.locais)) {
        return ELEICAO_2024_DATA.locais;
      }
    } catch (_) {}
    return [];
  }

  function leaders() {
    try {
      if (typeof state !== 'undefined' && state && Array.isArray(state.liderancas)) return state.liderancas;
    } catch (_) {}
    return [];
  }

  function setCandidateState(value) {
    try {
      if (typeof state !== 'undefined' && state) state.selectedCandidate = value;
    } catch (_) {}
  }

  function selectedOptionLabel() {
    var select = document.getElementById('cand-select');
    if (!select || select.selectedIndex < 0) return '';
    return (select.options[select.selectedIndex].textContent || '').trim();
  }

  function fallbackCandidateName(label) {
    var clean = String(label || '').replace(/^[^A-Za-zÀ-ÿ0-9]+/, '').trim();
    var cut = clean.indexOf(' - ');
    if (cut > -1) clean = clean.slice(0, cut);
    return clean || 'Candidato selecionado';
  }

  function getCollegeLeadershipStats(loc) {
    var list = leaders().filter(function (item) {
      if (item.colegioId === loc.id) return true;
      if (!item.colegioNome || !loc.name) return false;
      return String(item.colegioNome).toLowerCase().indexOf(String(loc.name).toLowerCase().split(' ')[0]) > -1;
    });
    var votes = list.reduce(function (sum, item) {
      return sum + (Number(item.metaVotos) || 0);
    }, 0);
    return { count: list.length, votes: votes };
  }

  function ensureMobileList(view) {
    var list = view.querySelector('.vf-candidate-mobile-list');
    if (list) return list;

    list = document.createElement('section');
    list.className = 'vf-candidate-mobile-list';
    list.setAttribute('aria-label', 'Votação por colégio eleitoral');

    var table = view.querySelector('.colegios-table');
    if (table && table.parentNode) table.parentNode.insertBefore(list, table);
    else view.appendChild(list);
    return list;
  }

  function renderCompactCandidateList(value, info) {
    var view = document.getElementById('view-table-colegios');
    if (!view) return;

    var listRoot = ensureMobileList(view);
    var locs = locations();
    var label = selectedOptionLabel();
    var name = info && info.name ? info.name : fallbackCandidateName(label);
    var party = info && info.party ? info.party : '';
    var totalVotes = locs.reduce(function (sum, loc) {
      return sum + (Number(loc.votes && loc.votes[value]) || 0);
    }, 0);

    var rows = locs.map(function (loc, index) {
      var votes = Number(loc.votes && loc.votes[value]) || 0;
      var totalCollege = Number(loc.total_pref) || Number(loc.total_ver) || 0;
      var pct = totalCollege > 0 ? ((votes / totalCollege) * 100).toFixed(1).replace('.', ',') : '0,0';
      var leadership = getCollegeLeadershipStats(loc);

      return '' +
        '<article class="vf-candidate-college-item" data-vf-college="' + escapeHtml(loc.id) + '">' +
          '<button type="button" class="vf-candidate-college-main" aria-expanded="false">' +
            '<span class="vf-candidate-college-index">' + String(index + 1).padStart(2, '0') + '</span>' +
            '<span class="vf-candidate-college-copy">' +
              '<strong>' + escapeHtml(loc.name) + '</strong>' +
              '<span>' + escapeHtml(loc.address || 'Endereço não informado') + '</span>' +
            '</span>' +
            '<span class="vf-candidate-vote-box">' +
              '<strong>' + votes.toLocaleString('pt-BR') + ' v</strong>' +
              '<span>' + pct + '%</span>' +
            '</span>' +
            '<span class="vf-candidate-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>' +
          '</button>' +
          '<div class="vf-candidate-college-details">' +
            '<div class="vf-candidate-detail-grid">' +
              '<div><span>Seções</span><strong>' + (Number(loc.sections) || 0) + '</strong></div>' +
              '<div><span>Total colégio</span><strong>' + totalCollege.toLocaleString('pt-BR') + '</strong></div>' +
              '<div class="vf-candidate-detail-leaders"><span>Lideranças</span><strong>' + leadership.count + ' (+ ' + leadership.votes + 'v)</strong></div>' +
            '</div>' +
            '<div class="vf-candidate-college-actions">' +
              '<button type="button" data-vf-add-leader="' + escapeHtml(loc.id) + '">+ Liderança</button>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');

    listRoot.innerHTML = '' +
      '<div class="vf-candidate-summary">' +
        '<div class="vf-candidate-summary-copy">' +
          '<span>Votação por colégio</span>' +
          '<strong>' + escapeHtml(name) + '</strong>' +
          '<small>' + escapeHtml(party ? party + ' • ' + locs.length + ' colégios' : locs.length + ' colégios') + '</small>' +
        '</div>' +
        '<div class="vf-candidate-summary-total"><span>Total</span><strong>' + totalVotes.toLocaleString('pt-BR') + '</strong></div>' +
      '</div>' +
      '<div class="vf-candidate-college-list">' + rows + '</div>';

    listRoot.querySelectorAll('.vf-candidate-college-main').forEach(function (button) {
      button.addEventListener('click', function () {
        var item = button.closest('.vf-candidate-college-item');
        if (!item) return;
        var willOpen = !item.classList.contains('open');
        listRoot.querySelectorAll('.vf-candidate-college-item.open').forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            var otherButton = other.querySelector('.vf-candidate-college-main');
            if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('open', willOpen);
        button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });

    listRoot.querySelectorAll('[data-vf-add-leader]').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        var collegeId = button.getAttribute('data-vf-add-leader');
        if (typeof window.openNewLiderancaWithColegio === 'function') {
          window.openNewLiderancaWithColegio(collegeId);
        } else {
          try {
            if (typeof openNewLiderancaWithColegio === 'function') openNewLiderancaWithColegio(collegeId);
          } catch (_) {}
        }
      });
    });

    document.body.classList.add('vf-candidate-list-active');
  }

  function clearCompactList() {
    document.body.classList.remove('vf-candidate-list-active');
    var view = document.getElementById('view-table-colegios');
    var list = view && view.querySelector('.vf-candidate-mobile-list');
    if (list) list.innerHTML = '';
  }

  function updatePageTitle(info, value) {
    var view = document.getElementById('view-table-colegios');
    if (!view) return;
    var head = view.querySelector(':scope > div:first-child');
    var title = head && head.querySelector('h2');
    var subtitle = head && head.querySelector('p, span');

    if (value !== 'ALL') {
      var label = selectedOptionLabel();
      var name = info && info.name ? info.name : fallbackCandidateName(label);
      if (title) title.textContent = 'Votos de ' + name;
      if (subtitle) subtitle.textContent = 'Lista compacta por colégio eleitoral';
    } else {
      if (title) title.textContent = 'Colégios eleitorais';
      if (subtitle) subtitle.textContent = 'Visão geral dos 29 locais de votação';
    }
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

    if (typeof window.switchView === 'function') window.switchView('colegios');

    window.setTimeout(function () {
      try {
        if (typeof renderTableColegios === 'function') renderTableColegios();
      } catch (_) {}

      if (value === 'ALL') clearCompactList();
      else renderCompactCandidateList(value, info);

      updatePageTitle(info, value);

      var view = document.getElementById('view-table-colegios');
      if (view) view.scrollTop = 0;
      window.dispatchEvent(new Event('resize'));
    }, 70);
  }

  function onCandidateChanged(event) {
    if (!isMobile()) return;
    var select = event.currentTarget;
    var value = select && select.value ? select.value : 'ALL';
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