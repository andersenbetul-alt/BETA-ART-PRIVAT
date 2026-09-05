/* NAVIAR CARE 2 — site.js (BETA-ART yeniden kurulumu). Kaynak teslimde yoktu.
 * Menü, dil menüsü, hazırlık örneği (durum URL parçasında), örnek profil dizini,
 * dil kataloğu, profesyonel sayfası sekmeleri. Ağ, depolama ve HTML dizesi enjeksiyonu yok
 * (checks/static.py). Veri: #ui-config ve #sample-catalog JSON blokları. */
(function () {
  'use strict';
  var M = window.CareModel;
  var $ = function (id) { return document.getElementById(id); };
  function json(id) { var el = $(id); try { return el ? JSON.parse(el.textContent) : null; } catch (e) { return null; } }
  var UI = json('ui-config') || {}, CATALOG = json('sample-catalog') || {};
  CATALOG.clinicians = CATALOG.clinicians || []; CATALOG.languages = CATALOG.languages || [];
  var LOCALE = UI.locale || document.documentElement.lang || 'nb';
  var TOTAL_P = CATALOG.clinicians.length, TOTAL_L = CATALOG.languages.length;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function langName(code) { var l = CATALOG.languages.filter(function (x) { return x.code === code; })[0]; return l ? l.native : code; }

  // ── menü ────────────────────────────────────────────────────────────────
  var menuBtn = document.querySelector('.menu-button'), mobile = $('mobile-nav');
  if (menuBtn && mobile) {
    var setMenu = function (open) { mobile.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); };
    menuBtn.addEventListener('click', function () { setMenu(mobile.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mobile.hidden) { setMenu(false); menuBtn.focus(); } });
  }
  var locale = document.querySelector('details.locale');
  if (locale) document.addEventListener('click', function (e) { if (locale.open && !locale.contains(e.target)) locale.open = false; });
  // aktif sayfa
  var here = location.pathname.replace(/index\.html$/, '');
  Array.prototype.forEach.call(document.querySelectorAll('.nav-link'), function (a) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
  });

  // ── hazırlık örneği ─────────────────────────────────────────────────────
  var next = $('flow-next');
  if (next && M) {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.flow-panel'));
    var indicators = Array.prototype.slice.call(document.querySelectorAll('[data-step-indicator]'));
    var back = $('flow-back'), reset = $('flow-reset'), count = $('flow-count'), err = $('question-error');
    var radios = document.querySelectorAll('input[name="example-language"]');
    var checks = document.querySelectorAll('input[name="example-question"]');
    var state = M.readJourney(location.hash);
    var syncLocaleLinks = function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-locale-link]'), function (a) {
        a.setAttribute('href', a.getAttribute('href').split('#')[0] + M.writeJourney(state));
      });
    };
    var render = function (focus) {
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== state.step; });
      indicators.forEach(function (li, i) {
        if (i === state.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.classList.toggle('done', i < state.step);
      });
      Array.prototype.forEach.call(radios, function (r) { r.checked = r.value === state.language; });
      Array.prototype.forEach.call(checks, function (c) { c.checked = state.questions.indexOf(c.value) > -1; });
      back.hidden = state.step === 0; reset.hidden = state.step !== 3; next.hidden = state.step === 3;
      var label = state.step === 0 ? (UI.start || 'Start') : (UI.next || 'Next');
      var svg = next.querySelector('svg'); clear(next); next.appendChild(document.createTextNode(label)); if (svg) next.appendChild(svg);
      count.textContent = (UI.step || 'Step') + ' ' + (state.step + 1) + ' / 4';
      if (err) err.hidden = true;
      var sl = $('summary-language'), sq = $('summary-questions');
      if (sl) sl.textContent = (UI.languages || {})[state.language] || state.language;
      if (sq) {
        clear(sq);
        state.questions.slice().sort().forEach(function (v) {
          var c = document.querySelector('input[name="example-question"][value="' + v + '"]');
          sq.appendChild(el('li', '', c ? c.parentNode.querySelector('span').textContent : v));
        });
      }
      history.replaceState(null, '', M.writeJourney(state));
      syncLocaleLinks();
      if (focus) { var h = panels[state.step].querySelector('h2'); if (h) h.focus(); }
    };
    var readForm = function () {
      Array.prototype.forEach.call(radios, function (r) { if (r.checked) state.language = r.value; });
      state.questions = Array.prototype.filter.call(checks, function (c) { return c.checked; }).map(function (c) { return c.value; });
    };
    next.addEventListener('click', function () {
      readForm();
      if (state.step === 2 && !state.questions.length) { if (err) { err.hidden = false; } checks[0].focus(); return; }
      state.step = Math.min(3, state.step + 1); render(true);
    });
    back.addEventListener('click', function () { readForm(); state.step = Math.max(0, state.step - 1); render(true); });
    reset.addEventListener('click', function () { state = M.initialJourney(); render(true); });
    document.addEventListener('change', function (e) { if (e.target.name === 'example-language' || e.target.name === 'example-question') { readForm(); render(false); } });
    var print = $('print-example'); if (print) print.addEventListener('click', function () { window.print(); });
    render(false);
  }

  // ── örnek profiller ─────────────────────────────────────────────────────
  var grid = $('profile-grid');
  if (grid && M) {
    var search = $('clinician-search'), spec = $('specialty-filter'), lang = $('language-filter');
    var countEl = $('profile-count'), empty = $('profile-empty'), more = $('show-more'), dialog = $('profile-dialog');
    var PAGE = 12, limit = PAGE, lastTrigger = null;
    var pre = new URLSearchParams(location.search).get('language');
    if (pre && lang && Array.prototype.some.call(lang.options, function (o) { return o.value === pre; })) lang.value = pre;
    var card = function (c) {
      var a = el('article', 'profile-card');
      a.appendChild(el('span', 'badge', UI.profileLabel || 'Example profile'));
      a.appendChild(el('h3', '', c.name));
      a.appendChild(el('p', 'field', ((UI.fields || {})[c.specialty] || c.specialty) + ' · ' + c.country));
      var ls = el('div', 'langs'); (c.languages || []).forEach(function (code) { ls.appendChild(el('span', '', langName(code))); }); a.appendChild(ls);
      a.appendChild(el('p', 'nobook', UI.noBooking || ''));
      var b = el('button', 'button secondary', UI.viewProfile || 'View'); b.type = 'button';
      b.addEventListener('click', function () { open(c, b); }); a.appendChild(b);
      return a;
    };
    var open = function (c, trigger) {
      if (!dialog) return;
      lastTrigger = trigger;
      $('profile-title').textContent = c.name;
      $('profile-detail-field').textContent = ((UI.fields || {})[c.specialty] || c.specialty) + ' · ' + c.country;
      var dl = $('profile-detail-languages'); clear(dl);
      dl.appendChild(document.createTextNode((c.languages || []).map(langName).join(', ') + ' — ' + (UI.notVerified || '')));
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    };
    var close = function () { if (dialog.open) dialog.close(); if (lastTrigger) lastTrigger.focus(); };
    if (dialog) {
      Array.prototype.forEach.call(dialog.querySelectorAll('.dialog-close, .dialog-done'), function (b) { b.addEventListener('click', close); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    }
    var renderP = function () {
      var list = M.filterProfiles(CATALOG, UI.fields || {}, search.value, spec.value, lang.value);
      clear(grid);
      list.slice(0, limit).forEach(function (c) { grid.appendChild(card(c)); });
      countEl.textContent = list.length + ' ' + (UI.of || 'of') + ' ' + TOTAL_P + ' ' + (UI.results || '');
      empty.hidden = list.length > 0; more.hidden = list.length <= limit;
    };
    [search, spec, lang].forEach(function (i) { i.addEventListener('input', function () { limit = PAGE; renderP(); }); });
    var resetF = function () { search.value = ''; spec.value = ''; lang.value = ''; limit = PAGE; renderP(); search.focus(); };
    $('clear-filters').addEventListener('click', resetF); $('empty-reset').addEventListener('click', resetF);
    more.addEventListener('click', function () { limit += PAGE; renderP(); });
    renderP();
  }

  // ── dil kataloğu ────────────────────────────────────────────────────────
  var rows = $('language-rows');
  if (rows && M) {
    var q = $('language-search'), lcount = $('language-count'), lempty = $('language-empty'), lmore = $('language-more');
    var LPAGE = 12, llimit = LPAGE;
    var renderL = function () {
      var list = M.filterLanguages(CATALOG.languages, q.value);
      clear(rows);
      list.slice(0, llimit).forEach(function (l) {
        var tr = el('tr');
        var td1 = el('td', '', l.native); if (l.english && l.english !== l.native) td1.appendChild(el('small', '', l.english)); tr.appendChild(td1);
        var td2 = el('td'); var n = M.profilesForLanguage(CATALOG.clinicians, l.code).length;
        if (n) { var a = el('a', '', n + ' · ' + (UI.seeProfiles || 'See profiles')); a.href = (UI.clinicianPath || '/clinicians/') + '?language=' + encodeURIComponent(l.code); td2.appendChild(a); }
        else td2.appendChild(el('span', 'quiet', UI.noProfiles || '—'));
        tr.appendChild(td2);
        var td3 = el('td'); td3.appendChild(el('span', 'pill', UI.notOffered || '')); tr.appendChild(td3);
        rows.appendChild(tr);
      });
      lcount.textContent = list.length + ' ' + (UI.of || 'of') + ' ' + TOTAL_L + ' ' + (UI.languagesLabel || '');
      lempty.hidden = list.length > 0; lmore.hidden = list.length <= llimit;
    };
    q.addEventListener('input', function () { llimit = LPAGE; renderL(); });
    lmore.addEventListener('click', function () { llimit += 24; renderL(); });
    renderL();
  }

  // ── profesyoneller: açık/özel alan sekmesi ──────────────────────────────
  var tabs = document.querySelectorAll('[data-privacy-tab]');
  if (tabs.length) Array.prototype.forEach.call(tabs, function (b) {
    b.addEventListener('click', function () {
      var key = b.getAttribute('data-privacy-tab');
      Array.prototype.forEach.call(tabs, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-privacy-panel]'), function (p) { p.hidden = p.getAttribute('data-privacy-panel') !== key; });
    });
  });
})();
