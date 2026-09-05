/* NAVIAR CARE 2 — model.js (BETA-ART yeniden kurulumu). Kaynak teslimde yoktu; API
 * checks/catalog-model.cjs'in beklediği imzalardan türetildi: profilesForLanguage,
 * filterProfiles, filterLanguages, readJourney, initialJourney, groupSlots.
 * Hem tarayıcıda (window.CareModel) hem `new Function('module', src)` ile yüklenir.
 * Ağ, depolama ve DOM yok (checks/static.py bunu denetler). */
(function () {
  'use strict';
  var STEPS = 4, QUESTIONS = 3, LANGS = ['nb', 'en', 'tr', 'other'];

  function fold(s) {
    return String(s || '').toLowerCase()
      .replace(/ı/g, 'i').replace(/İ/g, 'i')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/ß/g, 'ss').trim();
  }

  function profilesForLanguage(clinicians, code) {
    return (clinicians || []).filter(function (c) { return (c.languages || []).indexOf(code) > -1; });
  }

  /* fields: {"Internal medicine": "İç hastalıkları"} — yerel ad da aranır */
  function filterProfiles(catalog, fields, query, specialty, language) {
    var q = fold(query), f = fields || {};
    return (catalog.clinicians || []).filter(function (c) {
      if (specialty && c.specialty !== specialty) return false;
      if (language && (c.languages || []).indexOf(language) === -1) return false;
      if (!q) return true;
      var hay = [c.name, c.specialty, f[c.specialty] || '', c.country].map(fold).join(' ');
      return hay.indexOf(q) > -1;
    });
  }

  function filterLanguages(languages, query) {
    var q = fold(query);
    return (languages || []).filter(function (l) {
      return !q || fold(l.native).indexOf(q) > -1 || fold(l.english).indexOf(q) > -1 || fold(l.code) === q;
    });
  }

  function initialJourney() {
    return { step: 0, language: 'nb', questions: ['0', '1', '2'] };
  }

  /* Örnek durumu URL parçasında yaşar: #step=2&language=tr&questions=0,2 (depolama yok) */
  function readJourney(hash) {
    var init = initialJourney();
    var h = String(hash || '').replace(/^#/, '');
    if (!h) return init;
    var params = {};
    h.split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i < 0) return;
      params[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
    });
    var step = parseInt(params.step, 10);
    if (!(step >= 0 && step < STEPS)) step = 0;
    var language = LANGS.indexOf(params.language) > -1 ? params.language : 'nb';
    var questions = [];
    if ('questions' in params) {
      String(params.questions).split(',').forEach(function (v) {
        if (/^[0-9]+$/.test(v) && parseInt(v, 10) < QUESTIONS && questions.indexOf(v) === -1) questions.push(v);
      });
    } else questions = init.questions;
    if (step === 3 && !questions.length) step = 2;
    return { step: step, language: language, questions: questions };
  }

  function writeJourney(state) {
    return '#step=' + state.step + '&language=' + state.language + '&questions=' + state.questions.join(',');
  }

  var osloDay = (function () {
    try {
      var f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' });
      return function (ms) { return f.format(new Date(ms)); };
    } catch (e) { return function (ms) { return new Date(ms).toISOString().slice(0, 10); }; }
  })();

  /* Slotları Oslo gününe göre gruplar; girdiyi değiştirmez, başlangıca göre sıralar */
  function groupSlots(slots) {
    var sorted = (slots || []).slice().sort(function (a, b) { return a.starts - b.starts; });
    var days = [], byDay = {};
    sorted.forEach(function (s) {
      var d = osloDay(s.starts);
      if (!byDay[d]) { byDay[d] = { day: d, slots: [] }; days.push(byDay[d]); }
      byDay[d].slots.push(s);
    });
    return days;
  }

  var model = {
    fold: fold, profilesForLanguage: profilesForLanguage, filterProfiles: filterProfiles,
    filterLanguages: filterLanguages, initialJourney: initialJourney, readJourney: readJourney,
    writeJourney: writeJourney, groupSlots: groupSlots, osloDay: osloDay
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  if (typeof window !== 'undefined') window.CareModel = model;
})();
