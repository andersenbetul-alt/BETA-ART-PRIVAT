/* NAVIAR CARE 2 — sample-calendar.js (BETA-ART yeniden kurulumu). Kaynak teslimde yoktu;
 * checks/sample-calendar.test.mjs'in beklediği API: SampleCalendar.sampleDays(now) → Oslo
 * takvimine göre sonraki üç gün (UTC gece yarısı zaman damgası), SampleCalendar.label(day,
 * locale, withYear) → yerelleştirilmiş gün etiketi. Sabit tarih yok (RELEASE-v6, DEC-014). */
(function (root) {
  'use strict';
  var fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit' });
  function osloDate(now) { return fmt.format(now); }                       // 'YYYY-MM-DD' (Oslo)
  function sampleDays(now) {
    var d = osloDate(now || new Date()).split('-').map(Number);
    var base = Date.UTC(d[0], d[1] - 1, d[2]);
    return [1, 2, 3].map(function (n) { return base + n * 864e5; });
  }
  var TAGS = { nb: 'nb-NO', en: 'en-GB', tr: 'tr-TR' };
  function label(day, locale, withYear) {
    var o = { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' };
    if (withYear) o.year = 'numeric';
    return new Intl.DateTimeFormat(TAGS[locale] || 'nb-NO', o).format(new Date(day));
  }
  function shortLabel(day, locale) {
    return new Intl.DateTimeFormat(TAGS[locale] || 'nb-NO', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(day));
  }
  function weekday(day, locale) {
    return new Intl.DateTimeFormat(TAGS[locale] || 'nb-NO', { timeZone: 'UTC', weekday: 'long' }).format(new Date(day));
  }
  root.SampleCalendar = { sampleDays: sampleDays, label: label, shortLabel: shortLabel, weekday: weekday, osloDate: osloDate };
})(typeof globalThis !== 'undefined' ? globalThis : window);
