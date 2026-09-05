/* NAVIAR CARE 2 — operations.js (BETA-ART statik sürümü). Kaynak teslimde bu dosya
 * Cloudflare Worker + D1 API'sine (server/operations.mjs) istek atıyordu; o sunucu bu
 * depoda yok. Bu sürüm aynı arayüzü tarayıcı depolamasıyla çalıştırır: test saatleri
 * her ziyarette Oslo gününden itibaren üretilir, rezervasyonlar localStorage'da
 * (nc2s-bookings), ölçüm tercihi nc2s-measure. Sunucuya hiçbir şey gitmez. Metinler
 * sayfadaki #operations-config bloğundan (LABELS, üç dil). */
(function () {
  'use strict';
  var M = window.CareModel;
  var $ = function (id) { return document.getElementById(id); };
  function json(id) { var e = $(id); try { return e ? JSON.parse(e.textContent) : null; } catch (x) { return null; } }
  var L = json('operations-config') || {}, UI = json('ui-config') || {};
  var LOCALE = UI.locale || 'nb', TAG = { nb: 'nb-NO', en: 'en-GB', tr: 'tr-TR' }[LOCALE] || 'nb-NO';
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  // ── ölçüm tercihi (her sayfada) ─────────────────────────────────────────
  var panel = $('measurement-panel');
  if (panel) {
    var status = $('measurement-status'), pref = $('measurement-preferences');
    var page = document.body.getAttribute('data-page');
    var show = function () { panel.hidden = false; $('decline-measurement').focus(); };
    var choose = function (v) {
      store.set('nc2s-measure', { choice: v, at: new Date().toISOString(), policy: 'static-2026-09' });
      status.textContent = L.consentSaved || ''; setTimeout(function () { panel.hidden = true; if (pref) pref.focus(); }, 900);
    };
    $('allow-measurement').addEventListener('click', function () { choose('allow'); });
    $('decline-measurement').addEventListener('click', function () { choose('decline'); });
    if (pref) pref.addEventListener('click', function () { status.textContent = ''; show(); });
    if (!store.get('nc2s-measure', null) && ['home', 'about', 'languages'].indexOf(page) > -1) setTimeout(show, 700);
  }

  // ── işletim sayfası (statik sürümde sahip araçları yok) ─────────────────
  if ($('owner-tools')) {
    $('op-feedback').textContent = L.signIn || '';
    return;
  }

  // ── test rezervasyonu ───────────────────────────────────────────────────
  var slotList = $('slot-list'); if (!slotList || !M) return;
  var fb = $('op-feedback'), selText = $('selected-time'), ack = $('test-ack'), help = $('reserve-help'), reserveBtn = $('reserve-test');
  var bookingList = $('booking-list'), emailList = $('email-list'), dialog = $('email-dialog');
  var selected = null, moving = null;
  var load = function () { return store.get('nc2s-bookings', []); };
  var save = function (b) { store.set('nc2s-bookings', b); };

  // Saatler: Oslo gününden sonraki 8 iş günü × 5 saat (20 dk). Gerçek takvim değil.
  function osloParts(ms) {
    var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    var o = {}; f.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; }); return o;
  }
  function osloOffsetMs(ms) { var p = osloParts(ms); var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute); return asUTC - Math.floor(ms / 60000) * 60000; }
  function osloTime(day, hm) { // 'YYYY-MM-DD', 'HH:MM' → epoch ms (Oslo duvar saati, DST dahil)
    var guess = Date.parse(day + 'T' + hm + ':00Z'); return guess - osloOffsetMs(guess);
  }
  function genSlots() {
    var out = [], d = new Date(Date.parse(M.osloDay(Date.now()) + 'T12:00:00Z')), days = 0;
    while (days < 8) {
      d.setUTCDate(d.getUTCDate() + 1);
      var wd = d.getUTCDay(); if (wd === 0 || wd === 6) continue;
      var day = d.toISOString().slice(0, 10);
      ['09:00', '10:20', '11:40', '13:00', '14:20'].forEach(function (hm) { out.push({ id: day + 'T' + hm, starts: osloTime(day, hm) }); });
      days++;
    }
    return out;
  }
  var SLOTS = genSlots();
  function fmt(ms, withDay) {
    var o = { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit' };
    if (withDay) { o.weekday = 'long'; o.day = 'numeric'; o.month = 'long'; }
    return new Intl.DateTimeFormat(TAG, o).format(new Date(ms));
  }
  function fmtDay(day) { return new Intl.DateTimeFormat(TAG, { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(day + 'T00:00:00Z')); }
  var slotById = function (id) { return SLOTS.filter(function (s) { return s.id === id; })[0]; };

  function renderSlots() {
    var taken = {}; load().forEach(function (b) { if (b.status !== 'cancelled') taken[b.slot] = true; });
    clear(slotList);
    M.groupSlots(SLOTS).forEach(function (g) {
      slotList.appendChild(el('p', 'slot-day', fmtDay(g.day)));
      var row = el('div', 'slot-row');
      g.slots.forEach(function (s) {
        var b = el('button', 'slot', fmt(s.starts)); b.type = 'button'; b.setAttribute('aria-pressed', String(selected === s.id));
        b.disabled = !!taken[s.id];
        b.addEventListener('click', function () { selected = s.id; renderSlots(); renderLists(); });
        row.appendChild(b);
      });
      slotList.appendChild(row);
    });
    if (!SLOTS.length) slotList.appendChild(el('p', 'quiet', L.emptySlots || ''));
    var s = selected && slotById(selected);
    selText.textContent = s ? fmt(s.starts, true) : (L.chooseFirst || '');
    var ready = !!(s && ack.checked);
    reserveBtn.disabled = !ready;
    help.textContent = !s ? (L.chooseFirst || '') : !ack.checked ? (L.ackNeeded || '') : (L.readyToSave || '');
    reserveBtn.textContent = moving ? (L.reschedule || 'Move') : (L.reserve || 'Save');
  }
  function stateLabel(b) {
    if (b.status === 'cancelled') return L.cancelled || 'cancelled';
    return (L.active || 'active') + ' · ' + (L[b.payment] || L.nonePayment || '');
  }
  function mailFor(b) {
    var s = slotById(b.slot); var when = s ? fmt(s.starts, true) : b.slot;
    var subject = (b.status === 'cancelled' ? (L.cancelled || '') : b.rescheduled ? (L.rescheduled || '') : (L.confirmation || '')) + ' — ' + when;
    var body = [(L.mailHelp || ''), '', (L.selectionTitle || '') + ': ' + when + ' (Europe/Oslo)', '20 min · NAVIAR CARE 2', (L.previewState || ''), '', stateLabel(b), '', (L.paymentHelp || ''), '', 'NAVIAR CARE 2'].join('\n');
    return { subject: subject, body: body };
  }
  function renderLists() {
    var all = load(); clear(bookingList); clear(emailList);
    if (!all.length) { bookingList.appendChild(el('p', 'quiet', L.none || '')); emailList.appendChild(el('p', 'quiet', L.none || '')); return; }
    all.forEach(function (b) {
      var s = slotById(b.slot);
      var item = el('div', 'booking-item');
      item.appendChild(el('div', 'when', s ? fmt(s.starts, true) : b.slot));
      item.appendChild(el('div', 'state ' + (b.status === 'cancelled' ? 'cancelled' : 'active'), stateLabel(b)));
      var acts = el('div', 'actions');
      if (b.status !== 'cancelled') {
        var mv = el('button', 'button secondary', L.reschedule || 'Move'); mv.type = 'button';
        mv.disabled = !selected || selected === b.slot;
        mv.addEventListener('click', function () { b.slot = selected; b.rescheduled = true; selected = null; save(all); fb.textContent = L.updated || ''; renderSlots(); renderLists(); });
        acts.appendChild(mv);
        var cx = el('button', 'text-link', L.cancel || 'Cancel'); cx.type = 'button';
        cx.addEventListener('click', function () { b.status = 'cancelled'; if (b.payment === 'stripe_test_paid') b.payment = 'test_refund_review'; save(all); fb.textContent = L.cancelled || ''; renderSlots(); renderLists(); });
        acts.appendChild(cx);
        if (b.payment === 'none') {
          var ok = el('button', 'button secondary', L.simulateSuccess || ''); ok.type = 'button';
          ok.addEventListener('click', function () { b.payment = 'simulated_success'; save(all); fb.textContent = L.simulated_success || ''; renderLists(); });
          var bad = el('button', 'text-link', L.simulateFailure || ''); bad.type = 'button';
          bad.addEventListener('click', function () { b.payment = 'simulated_failure'; save(all); fb.textContent = L.simulated_failure || ''; renderLists(); });
          acts.appendChild(ok); acts.appendChild(bad);
        }
      }
      item.appendChild(acts); bookingList.appendChild(item);

      var m = mailFor(b), e = el('div', 'email-item');
      e.appendChild(el('strong', '', m.subject)); e.appendChild(el('span', 'quiet', L.previewState || ''));
      var ea = el('div', 'actions'); var pv = el('button', 'button secondary', L.preview || 'Preview'); pv.type = 'button';
      pv.addEventListener('click', function () { $('email-subject').textContent = m.subject; $('email-body').textContent = m.body; if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', ''); });
      ea.appendChild(pv); e.appendChild(ea); emailList.appendChild(e);
    });
  }
  ack.addEventListener('change', renderSlots);
  reserveBtn.addEventListener('click', function () {
    var s = selected && slotById(selected); if (!s || !ack.checked) return;
    var all = load();
    all.push({ id: 'b' + Date.now().toString(36), slot: s.id, status: 'active', payment: 'none', created: new Date().toISOString() });
    save(all); selected = null; fb.textContent = L.confirmed || ''; renderSlots(); renderLists();
  });
  $('delete-test-data').addEventListener('click', function () { store.del('nc2s-bookings'); selected = null; fb.textContent = L.deleteConfirm || ''; renderSlots(); renderLists(); });
  if (dialog) { $('email-close').addEventListener('click', function () { dialog.close(); }); dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); }); }
  var setup = $('payment-setup'); if (setup) setup.textContent = L.paymentMissing || '';
  fb.textContent = L.readyToSave ? '' : '';
  renderSlots(); renderLists();
})();
