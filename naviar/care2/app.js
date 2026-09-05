/* NAVIAR CARE 2 — dil, gezinme, ölçüm onayı, hazırlık örneği, profiller, dil kataloğu,
 * test rezervasyonu. Sunucu yok; her şey tarayıcıda kalır (localStorage: nc2-*). */
(function () {
  'use strict';
  const I18N = window.NC2_I18N, LANGS = window.NC2_LANGS;
  const DEFAULT = 'no';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------------------------------------------------------- dil
  let lang = DEFAULT;
  function pickLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (q && I18N[q]) return q;
    const s = store.get('nc2-lang', null);
    if (s && I18N[s]) return s;
    const n = (navigator.language || '').slice(0, 2);
    return (n === 'nb' || n === 'nn') ? 'no' : (I18N[n] ? n : DEFAULT);
  }
  function t(key, vars) {
    let s = (I18N[lang] && I18N[lang][key]) ?? I18N[DEFAULT][key] ?? key;
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  }
  const hooks = [];
  function applyLang() {
    document.documentElement.lang = lang === 'no' ? 'nb' : lang;
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-label]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    const page = document.body.dataset.page;
    if (page) document.title = t('meta.' + page);
    $$('.lang-sel select').forEach(s => { s.value = lang; });
    hooks.forEach(fn => fn());
  }
  function setLang(code) {
    if (!I18N[code]) return;
    lang = code; store.set('nc2-lang', code); applyLang();
  }
  window.NC2 = { t, setLang, get lang() { return lang; }, onLang: fn => hooks.push(fn) };

  // ------------------------------------------------------------ gezinme
  function initNav() {
    const sel = $('.lang-sel select');
    if (sel) {
      sel.innerHTML = LANGS.map(l => `<option value="${l.code}">${l.label}</option>`).join('');
      sel.addEventListener('change', e => setLang(e.target.value));
    }
    const btn = $('.menu-btn'), nav = $('.nav');
    if (btn && nav) btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    const page = document.body.dataset.page;
    $$('.nav a').forEach(a => { if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); });
  }

  // ------------------------------------------------------- ölçüm onayı
  function initConsent() {
    const box = $('#consent'); if (!box) return;
    const show = () => { box.hidden = false; };
    if (store.get('nc2-measure', null) === null) setTimeout(show, 600);
    $('#consent-yes').addEventListener('click', () => { store.set('nc2-measure', 'yes'); box.hidden = true; });
    $('#consent-no').addEventListener('click', () => { store.set('nc2-measure', 'no'); box.hidden = true; });
    const again = $('#measure-again'); if (again) again.addEventListener('click', show);
  }

  // ------------------------------------------------ hazırlık örneği (Alex)
  function initJourney() {
    const root = $('#journey'); if (!root) return;
    const st = Object.assign({ step: 1, lang: null, qs: [] }, store.get('nc2-journey', {}));
    const save = () => store.set('nc2-journey', st);
    const panels = $$('.jpanel', root), stepper = $$('.stepper li', root);
    function render() {
      panels.forEach(p => { p.hidden = Number(p.dataset.step) !== st.step; });
      stepper.forEach((li, i) => {
        li.classList.toggle('done', i + 1 < st.step);
        if (i + 1 === st.step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      $$('input[name="jlang"]', root).forEach(r => { r.checked = r.value === st.lang; });
      $$('input[name="jq"]', root).forEach(c => { c.checked = st.qs.includes(c.value); });
      const nextBtn = $('[data-act="next"][data-for="2"]', root); if (nextBtn) nextBtn.disabled = !st.lang;
      const sl = $('#sum-lang'), sq = $('#sum-qs');
      if (sl) sl.textContent = st.lang ? t('jr.s2.' + st.lang) : '—';
      if (sq) sq.innerHTML = st.qs.length ? st.qs.map(q => `<li>${esc(t('jr.s3.' + q))}</li>`).join('') : `<li>${esc(t('jr.s4.none'))}</li>`;
      panels.find(p => !p.hidden)?.querySelector('h2')?.focus({ preventScroll: false });
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const a = b.dataset.act;
      if (a === 'next') st.step = Math.min(4, st.step + 1);
      if (a === 'back') st.step = Math.max(1, st.step - 1);
      if (a === 'restart') { st.step = 1; st.lang = null; st.qs = []; }
      save(); render();
    });
    root.addEventListener('change', e => {
      if (e.target.name === 'jlang') st.lang = e.target.value;
      if (e.target.name === 'jq') st.qs = $$('input[name="jq"]:checked', root).map(c => c.value);
      save(); render();
    });
    $$('.jpanel h2', root).forEach(h => h.tabIndex = -1);
    render(); window.NC2.onLang(render);
  }

  // ------------------------------------------------------ örnek profiller
  const DOCS = () => window.NC_DOCTORS || [];
  function initClinicians() {
    const grid = $('#profiles'); if (!grid) return;
    const fl = $('#f-lang'), fs = $('#f-spec');
    const langs = [...new Set(DOCS().flatMap(d => Object.values(d.langLabels)))].sort((a, b) => a.localeCompare(b));
    const specs = [...new Set(DOCS().map(d => d.specialty))];
    const pre = new URLSearchParams(location.search).get('speaks');
    function fill() {
      fl.innerHTML = `<option value="">${esc(t('cl.filter.all'))}</option>` + langs.map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join('');
      fs.innerHTML = `<option value="">${esc(t('cl.filter.all'))}</option>` + specs.map(s => `<option value="${s}">${esc(t('spec.' + s))}</option>`).join('');
    }
    function render() {
      const vl = fl.value, vs = fs.value;
      const list = DOCS().filter(d => (!vl || Object.values(d.langLabels).includes(vl)) && (!vs || d.specialty === vs));
      $('#p-count').textContent = t('cl.count', { n: list.length });
      grid.innerHTML = list.length ? list.map(d => `
        <article class="profile">
          <span class="badge">${esc(t('cl.badge'))}</span>
          <div class="top"><div class="ini" aria-hidden="true">${esc(d.initials)}</div>
            <div><div class="name">${esc(d.name)}</div><div class="small muted">${esc(t('spec.' + d.specialty))} · ${esc(t('cl.exp', { n: d.experience }))}</div></div></div>
          <div class="tags">${Object.values(d.langLabels).map(l => `<span class="tag">${esc(l)}</span>`).join('')}${d.types.map(x => `<span class="tag">${esc(t('cl.' + x))}</span>`).join('')}</div>
          <p class="bio">${esc(d.bio)}</p>
        </article>`).join('') : `<p class="muted">${esc(t('cl.empty'))}</p>`;
    }
    fill(); if (pre && langs.includes(pre)) fl.value = pre;
    fl.addEventListener('change', render); fs.addEventListener('change', render);
    render(); window.NC2.onLang(() => { const a = fl.value, b = fs.value; fill(); fl.value = a; fs.value = b; render(); });
  }

  // -------------------------------------------------------- dil kataloğu
  function initLanguages() {
    const tb = $('#lang-tbody'); if (!tb) return;
    const all = window.NC_LANGS || [];
    const spoken = {};
    DOCS().forEach(d => Object.values(d.langLabels).forEach(l => { spoken[l.toLowerCase()] = (spoken[l.toLowerCase()] || 0) + 1; }));
    const cnt = L => spoken[L.n.toLowerCase()] || spoken[L.e.toLowerCase()] || 0;
    const q = $('#lang-q'); let limit = 12;
    function render() {
      const v = (q.value || '').trim().toLowerCase();
      const list = all.filter(L => !v || L.n.toLowerCase().includes(v) || L.e.toLowerCase().includes(v));
      $('#lang-count').textContent = t('lg.count', { n: list.length });
      const shown = list.slice(0, limit);
      tb.innerHTML = shown.map(L => {
        const n = cnt(L);
        const label = L.n === L.e ? '' : `<span class="e">${esc(L.e)}</span>`;
        const prof = n ? `<a href="clinicians.html?speaks=${encodeURIComponent(n && (spoken[L.n.toLowerCase()] ? L.n : L.e))}">${esc(t('lg.prof', { n }))}</a>` : `<span class="muted">${esc(t('lg.noprof'))}</span>`;
        return `<tr><td>${esc(L.n)}${label}</td><td>${prof}</td><td><span class="pill">${esc(t('lg.notactive'))}</span></td></tr>`;
      }).join('');
      $('#lang-more').hidden = shown.length >= list.length;
    }
    q.addEventListener('input', () => { limit = 12; render(); });
    $('#lang-more').addEventListener('click', () => { limit += 24; render(); });
    render(); window.NC2.onLang(render);
  }

  // ------------------------------------------------- test rezervasyonu
  const TZ = 'Europe/Oslo';
  function osloToday() { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
  function addDays(ymd, n) { const d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function isWeekday(ymd) { const w = new Date(ymd + 'T00:00:00Z').getUTCDay(); return w >= 1 && w <= 5; }
  function fmtDay(ymd) {
    const loc = lang === 'no' ? 'nb-NO' : lang === 'tr' ? 'tr-TR' : 'en-GB';
    return new Intl.DateTimeFormat(loc, { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(ymd + 'T00:00:00Z'));
  }
  const fmtSlot = s => `${fmtDay(s.slice(0, 10))} · ${s.slice(11, 16)}`;
  function genSlots() {
    // Bugünden itibaren sonraki 8 iş günü, 5 test saati; sabit tarih yok → örnek tarihler hep güncel.
    const out = []; let d = addDays(osloToday(), 1), days = 0;
    while (days < 8) { if (isWeekday(d)) { ['09:00', '10:20', '11:40', '13:00', '14:20'].forEach(h => out.push(d + 'T' + h)); days++; } d = addDays(d, 1); }
    return out;
  }
  function initBooking() {
    const root = $('#booking'); if (!root) return;
    const ack = $('#bk-ack'), grid = $('#slots'), live = $('#bk-live'), list = $('#res-list'), mails = $('#mail-list');
    let selected = null, moving = null;
    const load = () => store.get('nc2-bookings', []);
    const saveAll = b => store.set('nc2-bookings', b);
    const say = k => { live.textContent = t(k); };
    const statusKey = r => 'bk.status.' + r.status;
    function renderSlots() {
      const taken = new Set(load().filter(r => r.status !== 'cancelled').map(r => r.slot));
      const slots = genSlots(); let day = '';
      grid.innerHTML = '';
      slots.forEach(s => {
        const d = s.slice(0, 10);
        if (d !== day) { day = d; const h = document.createElement('div'); h.className = 'day-h'; h.textContent = fmtDay(d); h.style.gridColumn = '1 / -1'; grid.appendChild(h); }
        const b = document.createElement('button'); b.type = 'button'; b.className = 'slot'; b.dataset.slot = s;
        b.innerHTML = `<b>${s.slice(11, 16)}</b><span>20 min</span>`;
        b.disabled = taken.has(s); b.setAttribute('aria-pressed', String(selected === s));
        grid.appendChild(b);
      });
      if (!slots.length) grid.innerHTML = `<p>${esc(t('bk.noslots'))}</p>`;
      $('#sel-text').textContent = selected ? fmtSlot(selected) : t('bk.sel.none');
      $('#bk-save').disabled = !(selected && ack.checked);
      $('#bk-save').textContent = moving ? t('bk.move') : t('bk.save');
    }
    function renderList() {
      const all = load();
      $('#bk-del').hidden = !all.length;
      if (!all.length) { list.innerHTML = `<p class="muted">${esc(t('bk.s2.empty'))}</p>`; mails.innerHTML = `<p class="muted">${esc(t('bk.s2.empty'))}</p>`; return; }
      list.innerHTML = all.map(r => `
        <div class="res" data-id="${r.id}">
          <div class="when">${esc(fmtSlot(r.slot))}</div>
          <div class="st ${r.status}">${esc(t(statusKey(r)))} · ${esc(t('bk.sel.meta'))}</div>
          <div class="acts">
            ${r.status === 'cancelled' ? '' : `<button type="button" class="btn ghost sm" data-act="move">${esc(t('bk.move'))}</button>
            <button type="button" class="btn danger sm" data-act="cancel">${esc(t('bk.cancel'))}</button>
            ${r.status === 'new' ? `<button type="button" class="btn sm" data-act="pay">${esc(t('bk.pay.btn'))}</button>` : ''}`}
          </div>
        </div>`).join('');
      mails.innerHTML = all.map(r => `
        <details class="res"><summary>${esc(t('bk.mail'))} · ${esc(fmtSlot(r.slot))}</summary>
          <pre class="mail">${esc(t('bk.mail.subject'))}\n\n${esc(t('bk.mail.body', { slot: fmtSlot(r.slot), status: t(statusKey(r)) }))}</pre></details>`).join('');
    }
    grid.addEventListener('click', e => {
      const b = e.target.closest('.slot'); if (!b || b.disabled) return;
      selected = b.dataset.slot; renderSlots();
    });
    ack.addEventListener('change', renderSlots);
    $('#bk-save').addEventListener('click', () => {
      if (!selected || !ack.checked) return;
      const all = load();
      if (moving) { const r = all.find(x => x.id === moving); if (r) r.slot = selected; moving = null; say('bk.moved'); }
      else { all.push({ id: 'r' + Date.now().toString(36), slot: selected, status: 'new', created: new Date().toISOString() }); say('bk.saved'); }
      saveAll(all); selected = null; renderSlots(); renderList();
    });
    list.addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const id = b.closest('.res').dataset.id, all = load(), r = all.find(x => x.id === id); if (!r) return;
      if (b.dataset.act === 'cancel') { r.status = 'cancelled'; say('bk.cancelled'); }
      if (b.dataset.act === 'pay') { r.status = 'paid'; say('bk.pay.done'); }
      if (b.dataset.act === 'move') { moving = id; selected = null; say('bk.moving'); $('#slots').scrollIntoView({ block: 'start' }); }
      saveAll(all); renderSlots(); renderList();
    });
    $('#bk-del').addEventListener('click', () => { store.del('nc2-bookings'); moving = null; selected = null; live.textContent = ''; renderSlots(); renderList(); });
    renderSlots(); renderList();
    window.NC2.onLang(() => { renderSlots(); renderList(); });
  }

  // ------------------------------------------------------------- başlat
  function boot() {
    lang = pickLang();
    initNav(); initConsent(); initJourney(); initClinicians(); initLanguages(); initBooking();
    applyLang();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
