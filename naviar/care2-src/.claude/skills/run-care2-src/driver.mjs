#!/usr/bin/env node
/* NAVIAR CARE 2 (kaynak sürüm) sürücüsü — dist/'i üretir, 8006'da servis eder, Chromium ile sürer.
 *
 * Kullanım (depo kökünden):
 *   node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs smoke [çıktı-dizini]
 *   node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs shot <yol> [çıktı-dizini] [--mobile]
 *     yol örnekleri: /  /tr/  /en/clinicians/  /tr/booking/  /languages/
 *
 * smoke: build_static.py → checks/catalog-model.cjs → 27 sayfa 200 + noindex → menü/dil → örnek
 * (URL parçası) → profiller (42, filtre, dialog) → dil kataloğu (113) → rezervasyon (kaydet, öde,
 * taşı, iptal, sil) → ölçüm onayı → mobil taşma → konsol hatası yok. Çıkış 0/1.
 * Dış istekler kesilir (helsenorge). Sunucu: python3 http.server (dizin URL'leri index.html'e düşer).
 */
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const req = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = req('playwright');
const SRC = path.resolve(fileURLToPath(import.meta.url), '../../../..');   // naviar/care2-src
const DIST = path.join(SRC, 'dist');
const PORT = 8006;                                          // 8000 QBLOGG … 8004 care2, 8005 engine

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => [a.slice(2), true]));
const pos = args.filter(a => !a.startsWith('--'));
const KIP = pos[0] || 'smoke';
const OUT = (KIP === 'shot' ? pos[2] : pos[1]) || '/tmp/care2-src-run';
mkdirSync(OUT, { recursive: true });

function build() {
  const r = spawnSync('python3', ['build_static.py'], { cwd: SRC, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
async function portAcik() { try { return (await fetch(`http://localhost:${PORT}/`)).ok; } catch { return false; } }
let srv = null;
async function sunucu() {
  if (await portAcik()) return null;
  srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', DIST], { stdio: 'ignore', detached: true });
  srv.unref();
  for (let i = 0; i < 20; i++) { if (await portAcik()) return srv; await new Promise(r => setTimeout(r, 250)); }
  throw new Error('sunucu 5 sn içinde açılmadı');
}
process.on('exit', () => { if (srv) { try { process.kill(-srv.pid); } catch {} } });
async function baglam(b, mobil) {
  const ctx = await b.newContext({ viewport: mobil ? { width: 390, height: 844 } : { width: 1280, height: 850 }, deviceScaleFactor: mobil ? 1 : 0.75 });
  await ctx.route(u => !u.href.startsWith('http://localhost'), r => r.abort());
  return ctx;
}
const git = (p, yol) => p.goto(`http://localhost:${PORT}${yol}`, { waitUntil: 'networkidle' });

if (KIP === 'shot') {
  if (!existsSync(DIST)) build();
  await sunucu();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await baglam(b, !!flags.mobile);
  await ctx.addInitScript(() => { try { localStorage.setItem('nc2s-measure', '{"choice":"decline"}'); } catch {} });
  const p = await ctx.newPage();
  await git(p, pos[1] || '/');
  await p.waitForTimeout(300);
  const ad = `${OUT}/${(pos[1] || '/').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'index'}${flags.mobile ? '-mobile' : ''}.png`;
  await p.screenshot({ path: ad, fullPage: true });
  console.log('görüntü:', ad);
  await b.close();
} else {
  let kalan = 0;
  const kontrol = (ad, k, ek = '') => { console.log((k ? '✅ ' : '❌ ') + ad + (ek ? ' → ' + String(ek).trim().split('\n').slice(-1)[0] : '')); if (!k) kalan++; };
  const bd = build();
  kontrol('build_static.py: 27 yerel sayfa, hero webp, studio-demo var', bd.code === 0 && /27 pages/.test(bd.out) && /hero = webp, studio-demo = var/.test(bd.out), bd.out);
  const st = spawnSync('python3', ['checks/static.py'], { cwd: SRC, encoding: 'utf8' });
  kontrol('checks/static.py (27 + 9 sayfa)', st.status === 0 && /PASS/.test(st.stdout), st.stdout + st.stderr);
  const sc = spawnSync('node', ['--test', 'checks/sample-calendar.test.mjs'], { cwd: SRC, encoding: 'utf8' });
  kontrol('checks/sample-calendar.test.mjs (Oslo, yıl, DST)', sc.status === 0, sc.stdout + sc.stderr);
  const cm = spawnSync('node', ['checks/catalog-model.cjs'], { cwd: SRC, encoding: 'utf8' });
  kontrol('checks/catalog-model.cjs (42 profil, 113 dil, 12 fark)', cm.status === 0 && /PASS/.test(cm.stdout), cm.stdout + cm.stderr);

  await sunucu();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const hata = [], yerel404 = [];
  const sayfa = async ctx => {
    const p = await ctx.newPage();
    p.on('pageerror', e => hata.push(String(e)));
    p.on('console', m => { if (m.type() === 'error') hata.push(m.text()); });
    p.on('response', r => { if (r.url().startsWith('http://localhost') && r.status() >= 400) yerel404.push(r.url()); });
    return p;
  };
  const PAGES = ['', 'journey/', 'clinicians/', 'languages/', 'professionals/', 'about/', 'privacy.html', 'booking/', 'insights/'];
  const LOCALES = ['/', '/en/', '/tr/'];
  const ctx = await baglam(b, false);
  const p = await sayfa(ctx);

  // sayfalar
  const eksik = [];
  for (const l of LOCALES) for (const pg of PAGES) {
    await git(p, l + pg);
    const robots = await p.locator('meta[name="robots"]').getAttribute('content').catch(() => null);
    if (robots !== 'noindex,nofollow' || !(await p.locator('.notice').count())) eksik.push(l + pg);
  }
  kontrol('27 sayfa açılır, noindex, demo şeridi', eksik.length === 0, eksik.join(', '));

  // ana sayfa: stil uygulandı, dil menüsü, ölçüm onayı
  await git(p, '/');
  kontrol('styles.css uygulandı (forest düğme)', (await p.evaluate(() => getComputedStyle(document.querySelector('.button.primary')).backgroundColor)) === 'rgb(19, 63, 56)');
  await p.locator('#measurement-panel:not([hidden])').waitFor({ timeout: 3000 });
  kontrol('ölçüm onayı ana sayfada görünür', true);
  await p.click('#decline-measurement');
  await p.waitForTimeout(1100);
  kontrol('ölçüm reddi kaydedildi ve panel kapandı', (await p.locator('#measurement-panel').isHidden()) && (await p.evaluate(() => !!localStorage.getItem('nc2s-measure'))));
  await p.click('details.locale summary');
  kontrol('dil menüsü 3 bağlantı, Türkçe → /tr/', (await p.locator('details.locale nav a').count()) === 3 && (await p.locator('details.locale nav a[lang="tr"]').getAttribute('href')) === '/tr/');
  kontrol('hero CTA /studio-demo/?lang=nb', (await p.locator('.hero-actions a.button').getAttribute('href')) === '/studio-demo/?lang=nb');
  kontrol('hero görseli conversation.webp yüklendi', await p.evaluate(() => { const i = document.querySelector('.photo-frame img'); return i.naturalWidth === 1000 && i.naturalHeight === 1250; }));
  kontrol('logo /assets/logo.svg (hibrit işaret)', (await p.locator('.brand img').getAttribute('src')) === '/assets/logo.svg');

  // studio-demo (bellek içi kısa örnek)
  await git(p, '/studio-demo/?lang=tr');
  kontrol('studio-demo: Türkçe, 3 örnek gün, bugünden sonraki günler', (await p.evaluate(() => document.documentElement.lang)) === 'tr' && (await p.locator('#day-options input').count()) === 3
    && await p.evaluate(() => { const d = SampleCalendar.sampleDays(new Date()); return d[0] > Date.now() - 864e5 && document.getElementById('sample-date-note').textContent.length > 10; }));
  await p.click('#continue');
  kontrol('  saat seçmeden devam → hata', await p.locator('#flow-error').isVisible());
  await p.check('#time-options input[value="09:30"]');
  await p.click('#continue');
  kontrol('  gözden geçir: özet yıl ve Europe/Oslo içerir, UTC+02 yok', /20\d\d/.test(await p.locator('#review-summary').innerText()) && /Europe\/Oslo/.test(await p.locator('#review-summary').innerText()) && !/UTC\+02/.test(await p.locator('body').innerText()));
  await p.click('#confirm');
  kontrol('  onaysız → hata', await p.locator('#flow-error').isVisible());
  await p.check('#ack'); await p.click('#confirm');
  kontrol('  örnek onay ekranı', await p.locator('#done-panel').isVisible());
  await p.click('#payment-success');
  kontrol('  ödeme sonucu: 100 NOK tahsil edilmedi', /100 NOK/.test(await p.locator('#payment-status').innerText()));
  await p.click('#email-preview');
  kontrol('  e-posta önizleme dialogu', (await p.locator('#email-dialog[open]').count()) === 1);
  await p.click('#close-email');
  kontrol('  siteye dön / kalıcı rezervasyon bağlantıları Türkçe yollara', (await p.locator('#back-to-site').getAttribute('href')) === '/tr/' && (await p.locator('#saved-booking').getAttribute('href')) === '/tr/booking/');
  await p.click('[data-locale="nb"]');
  kontrol('  dil değişimi nb: html lang, site-home /', (await p.evaluate(() => document.documentElement.lang)) === 'nb' && (await p.locator('#site-home').getAttribute('href')) === '/');
  await p.screenshot({ path: `${OUT}/smoke-studio-demo.png`, fullPage: true });
  await p.screenshot({ path: `${OUT}/smoke-home.png`, fullPage: true });

  // örnek: URL parçası
  await git(p, '/tr/journey/');
  await p.click('#flow-next');
  await p.check('input[name="example-language"][value="tr"]');
  await p.click('#flow-next');
  await p.uncheck('input[name="example-question"][value="1"]');
  await p.click('#flow-next');
  kontrol('örnek özet: Türkçe + 2 soru, hash step=3', location => true, '');
  kontrol('  hash step=3&language=tr&questions=0,2', (await p.evaluate(() => location.hash)) === '#step=3&language=tr&questions=0,2');
  kontrol('  özet dil "Türkçe", 2 soru', (await p.locator('#summary-language').innerText()) === 'Türkçe' && (await p.locator('#summary-questions li').count()) === 2);
  kontrol('  dil bağlantıları hash taşır', (await p.locator('[data-locale-link][lang="en"]').getAttribute('href')).endsWith('#step=3&language=tr&questions=0,2'));
  await p.reload({ waitUntil: 'networkidle' });
  kontrol('  yenilemede adım 4 korunur', await p.locator('.flow-panel[data-step="3"]').isVisible());
  await p.click('#flow-reset');
  kontrol('  yeniden başlat → adım 1', await p.locator('.flow-panel[data-step="0"]').isVisible());

  // profiller
  await git(p, '/en/clinicians/');
  kontrol('42 profil, 12 kart, sayaç', (await p.locator('.profile-card').count()) === 12 && /42 of 42/.test(await p.locator('#profile-count').innerText()));
  await p.click('#show-more');
  kontrol('  vis flere → 24', (await p.locator('.profile-card').count()) === 24);
  await p.selectOption('#language-filter', 'tr');
  const trN = await p.evaluate(() => JSON.parse(document.getElementById('sample-catalog').textContent).clinicians.filter(c => c.languages.includes('tr')).length);
  kontrol(`  dil filtresi tr (${trN})`, (await p.locator('.profile-card').count()) === trN);
  await p.selectOption('#language-filter', '');
  await p.fill('#clinician-search', 'zzzz');
  kontrol('  boş durum görünür', await p.locator('#profile-empty').isVisible());
  await p.click('#empty-reset');
  await p.click('.profile-card .button >> nth=0');
  kontrol('  profil dialogu açıldı, ad dolu', (await p.locator('#profile-dialog[open]').count()) === 1 && (await p.locator('#profile-title').innerText()).length > 2);
  await p.click('.dialog-done');
  await git(p, '/tr/clinicians/');
  await p.fill('#clinician-search', 'iç hastaliklari');
  kontrol('  aksansız arama (tr): "iç hastaliklari" → İç hastalıkları kartları', (await p.locator('.profile-card').count()) > 0 && /İç hastalıkları/.test(await p.locator('.profile-card .field').first().innerText()));
  await git(p, '/clinicians/?language=nah');
  kontrol('  ?language=nah ön seçim → Rosa Delgado', (await p.locator('.profile-card h3').first().innerText()) === 'Rosa Delgado');
  await p.screenshot({ path: `${OUT}/smoke-clinicians.png`, fullPage: true });

  // dil kataloğu
  await git(p, '/languages/');
  kontrol('113 dil, 12 satır, sayaç', (await p.locator('#language-rows tr').count()) === 12 && /113/.test(await p.locator('#language-count').innerText()));
  await p.fill('#language-search', 'yoruba');
  kontrol('  arama yoruba → profil bağlantısı ?language=yo', (await p.locator('#language-rows a').first().getAttribute('href')).endsWith('?language=yo'));

  // rezervasyon
  await git(p, '/tr/booking/');
  kontrol('40 test saati (8 gün × 5), kaydet kapalı', (await p.locator('.slot').count()) === 40 && await p.locator('#reserve-test').isDisabled());
  await p.click('.slot >> nth=0'); await p.check('#test-ack');
  kontrol('  saat + onay → kaydet açık, seçim özeti dolu', await p.locator('#reserve-test').isEnabled() && !/seçin/i.test(await p.locator('#selected-time').innerText()));
  await p.click('#reserve-test');
  kontrol('  kaydedildi: 1 kayıt, saat kapandı, geri bildirim', (await p.locator('.booking-item').count()) === 1 && await p.locator('.slot >> nth=0').isDisabled() && (await p.locator('#op-feedback').innerText()).length > 0);
  kontrol('  e-posta taslağı listelendi', (await p.locator('.email-item').count()) === 1);
  await p.click('.booking-item .button >> nth=1');   // Başarılı ödemeyi simüle et
  kontrol('  ödeme simülasyonu → durum satırında "tahsilat yok"', /tahsilat yok/i.test(await p.locator('.booking-item .state').innerText()));
  await p.click('.slot:not([disabled]) >> nth=0');
  await p.click('.booking-item .button >> nth=0');   // Seçili test saatine taşı
  kontrol('  taşıma: ilk saat yeniden açık', await p.locator('.slot >> nth=0').isEnabled());
  await p.click('.booking-item .text-link >> nth=0'); // Testi iptal et
  await p.waitForTimeout(200);
  kontrol('  iptal → durum "İptal edilmiş test"', /İptal|iptal/.test(await p.locator('.booking-item .state').innerText()), await p.locator('.booking-item .state').innerText());
  await p.click('.email-item .button');
  kontrol('  e-posta dialogu açıldı, Europe/Oslo geçer', (await p.locator('#email-dialog[open]').count()) === 1 && /Europe\/Oslo/.test(await p.locator('#email-body').innerText()));
  await p.click('#email-close');
  await p.reload({ waitUntil: 'networkidle' });
  kontrol('  yenilemede kayıt korunur', (await p.locator('.booking-item').count()) === 1);
  await p.screenshot({ path: `${OUT}/smoke-booking-tr.png`, fullPage: true });
  await p.click('#delete-test-data');
  kontrol('  sil → boş', (await p.locator('.booking-item').count()) === 0);
  await p.click('.slot >> nth=2'); await p.check('#test-ack'); await p.click('#reserve-test');
  kontrol('  takvim dosyası (ICS) bağlantısı', (await p.locator('.booking-item a[download]').getAttribute('href')).startsWith('data:text/calendar'));
  await git(p, '/tr/insights/');
  kontrol('insights: statik özet (1 test rezervasyonu), Stripe bağlı değil', await p.locator('#owner-tools').isVisible() && /1/.test(await p.locator('#operations-summary dd').first().innerText()) && /Stripe/.test(await p.locator('#integration-status').innerText()));
  await p.screenshot({ path: `${OUT}/smoke-insights-tr.png`, fullPage: true });
  await ctx.close();

  // mobil
  const ctxM = await baglam(b, true);
  await ctxM.addInitScript(() => { try { localStorage.setItem('nc2s-measure', '{"choice":"decline"}'); } catch {} });
  const pm = await sayfa(ctxM);
  await git(pm, '/tr/');
  kontrol('mobil: menü düğmesi görünür, nav gizli', await pm.locator('.menu-button').isVisible() && !(await pm.locator('.nav').isVisible()));
  await pm.click('.menu-button');
  kontrol('  menü açıldı (5 bağlantı), Escape kapatır', (await pm.locator('#mobile-nav a').count()) === 5 && (await pm.locator('.menu-button').getAttribute('aria-expanded')) === 'true');
  await pm.screenshot({ path: `${OUT}/smoke-mobile-menu.png` });
  await pm.keyboard.press('Escape');
  kontrol('  kapandı', await pm.locator('#mobile-nav').isHidden());
  kontrol('  390px yatay taşma yok', await pm.evaluate(() => document.documentElement.scrollWidth <= 390));
  await ctxM.close();

  kontrol('konsol/sayfa hatası yok', hata.length === 0, hata[0] || '');
  kontrol('yerel 404 yok', yerel404.length === 0, yerel404[0] || '');
  await b.close();
  console.log(kalan === 0 ? 'SMOKE: PASS' : `SMOKE: FAIL (${kalan})`);
  process.exit(kalan ? 1 : 0);
}
