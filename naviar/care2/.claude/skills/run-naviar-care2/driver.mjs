#!/usr/bin/env node
/* NAVIAR CARE 2 sürücüsü — siteyi başlatır (8004), Chromium ile sürer, görüntü alır.
 *
 * Kullanım (depo kökünden):
 *   node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs smoke [çıktı-dizini]
 *   node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs shot <sayfa> [çıktı-dizini] [--lang=no|en|tr] [--mobile] [--dark] [--menu]
 *
 * smoke : 8 sayfa açılır, üç dil, ölçüm onayı, hazırlık örneği, profil filtresi, dil araması,
 *         test rezervasyonu (kaydet → öde → taşı → iptal → sil). Çıkış 0/1. 4 görüntü.
 * shot  : tek sayfanın tam görüntüsü; --mobile 390×844, --dark koyu tema, --menu mobil menüyü açar.
 * Dış istekler kesilir (helsenorge bağlantısı tıklanmaz; proxy engeli → networkidle askıda kalırdı).
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const req = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = req('playwright');
const SITE_DIR = path.resolve(fileURLToPath(import.meta.url), '../../../..');
const PORT = 8004;                                          // 8000 QBLOGG, 8001 care, 8002 care-pilot, 8003 HXI

const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
const pos = args.filter(a => !a.startsWith('--'));
const KIP = pos[0] || 'smoke';
const OUT = (KIP === 'shot' ? pos[2] : pos[1]) || '/tmp/naviar-care2-run';
mkdirSync(OUT, { recursive: true });

async function portAcik() { try { return (await fetch(`http://localhost:${PORT}/index.html`)).ok; } catch { return false; } }
let srv = null;
async function sunucu() {
  if (await portAcik()) return null;
  srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', SITE_DIR], { stdio: 'ignore', detached: true });
  srv.unref();
  for (let i = 0; i < 20; i++) { if (await portAcik()) return srv; await new Promise(r => setTimeout(r, 250)); }
  throw new Error('sunucu 5 sn içinde açılmadı');
}
process.on('exit', () => { if (srv) { try { process.kill(-srv.pid); } catch {} } });

const MASAUSTU = { width: 1280, height: 850 }, MOBIL = { width: 390, height: 844 };
async function baglam(b, { mobil = false, dark = false, lang = 'no' } = {}) {
  const ctx = await b.newContext({ viewport: mobil ? MOBIL : MASAUSTU, deviceScaleFactor: mobil ? 1 : 0.75, colorScheme: dark ? 'dark' : 'light', locale: lang === 'no' ? 'nb-NO' : lang });
  await ctx.route(u => !u.href.startsWith('http://localhost'), r => r.abort());
  await ctx.addInitScript(l => { try { localStorage.setItem('nc2-lang', JSON.stringify(l)); } catch {} }, lang);
  return ctx;
}
const git = (p, yol) => p.goto(`http://localhost:${PORT}/${yol}`, { waitUntil: 'networkidle' });

if (KIP === 'shot') {
  const yol = pos[1] || 'index.html';
  await sunucu();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await baglam(b, { mobil: !!flags.mobile, dark: !!flags.dark, lang: flags.lang || 'no' });
  await ctx.addInitScript(() => { try { localStorage.setItem('nc2-measure', '"no"'); } catch {} });
  const p = await ctx.newPage();
  await git(p, yol);
  if (flags.menu) { await p.click('.menu-btn'); await p.locator('.nav.open').waitFor(); }
  await p.waitForTimeout(300);
  const ad = `${OUT}/${yol.replace(/[?&/=]/g, '_')}-${flags.lang || 'no'}${flags.mobile ? '-mobile' : ''}${flags.dark ? '-dark' : ''}${flags.menu ? '-menu' : ''}.png`;
  await p.screenshot({ path: ad, fullPage: !flags.menu });
  console.log('görüntü:', ad);
  await b.close();
} else {
  await sunucu();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const hata = [], yerel404 = [];
  let kalan = 0;
  const kontrol = (ad, k, ek = '') => { console.log((k ? '✅ ' : '❌ ') + ad + (ek ? ' → ' + ek : '')); if (!k) kalan++; };
  const sayfa = async ctx => {
    const p = await ctx.newPage();
    p.on('pageerror', e => hata.push(String(e)));
    p.on('console', m => { if (m.type() === 'error') hata.push(m.text()); });
    p.on('response', r => { if (r.url().startsWith('http://localhost') && r.status() >= 400) yerel404.push(r.url()); });
    return p;
  };
  const SAYFALAR = ['index.html', 'journey.html', 'clinicians.html', 'languages.html', 'about.html', 'professionals.html', 'booking.html', 'privacy.html'];

  // A. Temiz bağlam: ölçüm onayı, sayfalar, üç dil
  const ctxA = await baglam(b, {});
  const p = await sayfa(ctxA);
  await git(p, 'index.html');
  await p.locator('#consent:not([hidden])').waitFor({ timeout: 3000 });
  kontrol('ölçüm onayı ilk ziyarette görünür', true);
  await p.click('#consent-no');
  kontrol('ölçüm reddi kaydedildi', (await p.evaluate(() => localStorage.getItem('nc2-measure'))) === '"no"');
  kontrol('başlık Norveççe', (await p.title()).startsWith('NAVIAR CARE 2 — Dine ord'));
  kontrol('html lang=nb', (await p.evaluate(() => document.documentElement.lang)) === 'nb');
  await p.selectOption('#lang-select', 'tr');
  kontrol('Türkçe: başlık ve h1 çevrildi', (await p.title()).includes('Sizin sözleriniz') && (await p.locator('h1').innerText()).includes('Sizin yolunuz'));
  await p.selectOption('#lang-select', 'en');
  kontrol('İngilizce: html lang=en, hero', (await p.evaluate(() => document.documentElement.lang)) === 'en' && (await p.locator('.hero .lead').innerText()).includes('language support'));
  await p.screenshot({ path: `${OUT}/smoke-index-en.png`, fullPage: true });
  await p.selectOption('#lang-select', 'no');
  const eksikRobots = [], kirik = new Set(), bosI18n = [];
  for (const s of SAYFALAR) {
    await git(p, s);
    if ((await p.locator('meta[name="robots"]').getAttribute('content')) !== 'noindex,nofollow') eksikRobots.push(s);
    const bos = await p.evaluate(() => Array.from(document.querySelectorAll('[data-i18n]')).filter(e => !e.textContent.trim()).map(e => e.dataset.i18n));
    if (bos.length) bosI18n.push(s + ': ' + bos.join(','));
    const hrefler = await p.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href')).filter(h => !/^(https?:|tel:|#|mailto:)/.test(h)));
    for (const h of new Set(hrefler)) { const r = await fetch(`http://localhost:${PORT}/${h.split('#')[0].split('?')[0]}`); if (!r.ok) kirik.add(`${s} → ${h}`); }
  }
  kontrol(`${SAYFALAR.length} sayfa noindex,nofollow`, eksikRobots.length === 0, eksikRobots.join(', '));
  kontrol('boş data-i18n yok', bosI18n.length === 0, bosI18n[0] || '');
  kontrol('iç bağlantılar 200', kirik.size === 0, [...kirik].join(', '));
  kontrol('ölçüm onayı ikinci ziyarette gizli', await p.locator('#consent').isHidden());

  // B. Hazırlık örneği
  await git(p, 'journey.html');
  await p.click('[data-act="next"]');
  kontrol('adım 2: dil seçilmeden İleri kapalı', await p.locator('[data-for="2"]').isDisabled());
  await p.check('input[name="jlang"][value="o2"]');
  await p.click('[data-for="2"]');
  await p.check('input[name="jq"][value="q1"]'); await p.check('input[name="jq"][value="q3"]');
  await p.click('.jpanel[data-step="3"] [data-act="next"]');
  kontrol('özet: tolk planı + 2 soru', (await p.locator('#sum-lang').innerText()).includes('tolk') && (await p.locator('#sum-qs li').count()) === 2);
  await p.reload({ waitUntil: 'networkidle' });
  kontrol('örnek ilerlemesi yenilemede korunur', await p.locator('.jpanel[data-step="4"]').isVisible());
  await p.click('[data-act="restart"]');
  kontrol('baştan başla → adım 1', await p.locator('.jpanel[data-step="1"]').isVisible());

  // C. Profiller
  await git(p, 'clinicians.html');
  const toplam = await p.evaluate(() => window.NC_DOCTORS.length);
  kontrol(`profil kartı = doctors.js (${toplam})`, (await p.locator('.profile').count()) === toplam);
  kontrol('her kart "Eksempelprofil" rozeti taşır', (await p.locator('.profile .badge').count()) === toplam);
  await p.selectOption('#f-lang', 'Türkçe');
  const trN = await p.evaluate(() => window.NC_DOCTORS.filter(d => Object.values(d.langLabels).includes('Türkçe')).length);
  kontrol(`Türkçe filtresi (${trN})`, (await p.locator('.profile').count()) === trN);
  await p.selectOption('#f-lang', ''); await p.selectOption('#f-spec', 'psychiatry');
  kontrol('fagområde filtresi', (await p.locator('.profile').count()) === 1);
  await p.screenshot({ path: `${OUT}/smoke-clinicians.png`, fullPage: true });

  // D. Dil kataloğu
  await git(p, 'languages.html');
  kontrol('ilk 12 satır + "vis flere"', (await p.locator('#lang-tbody tr').count()) === 12 && await p.locator('#lang-more').isVisible());
  kontrol('sayaç 113', (await p.locator('#lang-count').innerText()).includes('113'));
  await p.fill('#lang-q', 'türk');
  kontrol('arama: Türkçe bulunur, profil bağlantısı var', (await p.locator('#lang-tbody tr').count()) >= 1 && (await p.locator('#lang-tbody a').count()) >= 1);
  await p.click('#lang-more').catch(() => {});
  await p.fill('#lang-q', '');
  await p.click('#lang-more');
  kontrol('vis flere → 36 satır', (await p.locator('#lang-tbody tr').count()) === 36);

  // E. Test rezervasyonu
  await git(p, 'booking.html');
  kontrol('kaydet: onay + saat yokken kapalı', await p.locator('#bk-save').isDisabled());
  const slotN = await p.locator('.slot').count();
  kontrol(`test saatleri üretildi (${slotN} = 8 gün × 5)`, slotN === 40);
  await p.click('.slot >> nth=0');
  kontrol('saat seçildi ama onay yok → kapalı', await p.locator('#bk-save').isDisabled());
  await p.check('#bk-ack');
  kontrol('onay + saat → kaydet açık', await p.locator('#bk-save').isEnabled());
  await p.click('#bk-save');
  kontrol('rezervasyon listelendi, saat artık kapalı', (await p.locator('#res-list .res').count()) === 1 && await p.locator('.slot >> nth=0').isDisabled());
  kontrol('e-posta taslağı üretildi', (await p.locator('#mail-list pre').count()) === 1 && (await p.locator('#mail-list pre').textContent()).includes('Europe/Oslo'));
  await p.click('[data-act="pay"]');
  kontrol('ödeme simülasyonu → durum "100 NOK test"', (await p.locator('#res-list .st').innerText()).includes('100 NOK'));
  await p.click('[data-act="move"]');
  await p.click('.slot:not([disabled]) >> nth=0');
  await p.click('#bk-save');
  kontrol('taşıma: ilk saat yeniden açıldı', await p.locator('.slot >> nth=0').isEnabled() && (await p.locator('#bk-live').innerText()).length > 0);
  await p.click('[data-act="cancel"]');
  kontrol('iptal → durum "Avbestilt", düğmeler kalktı', (await p.locator('#res-list .st').innerText()).includes('Avbestilt') && (await p.locator('#res-list [data-act]').count()) === 0);
  await p.reload({ waitUntil: 'networkidle' });
  kontrol('rezervasyon yenilemede korunur (localStorage)', (await p.locator('#res-list .res').count()) === 1);
  await p.selectOption('#lang-select', 'tr');
  kontrol('Türkçe: durum ve taslak çevrildi', (await p.locator('#res-list .st').innerText()).includes('İptal') && (await p.locator('#mail-list pre').textContent()).includes('Merhaba'));
  await p.screenshot({ path: `${OUT}/smoke-booking-tr.png`, fullPage: true });
  await p.click('#bk-del');
  kontrol('sil → liste boş, localStorage temiz', (await p.locator('#res-list .res').count()) === 0 && (await p.evaluate(() => localStorage.getItem('nc2-bookings'))) === null);
  await ctxA.close();

  // F. Mobil menü
  const ctxB = await baglam(b, { mobil: true });
  await ctxB.addInitScript(() => { try { localStorage.setItem('nc2-measure', '"no"'); } catch {} });
  const pb = await sayfa(ctxB);
  await git(pb, 'index.html');
  kontrol('mobilde menü düğmesi görünür, nav gizli', await pb.locator('.menu-btn').isVisible() && !(await pb.locator('.nav').isVisible()));
  await pb.click('.menu-btn');
  kontrol('menü açıldı (aria-expanded=true, 5 bağlantı)', (await pb.locator('.menu-btn').getAttribute('aria-expanded')) === 'true' && (await pb.locator('.nav.open a').count()) === 5);
  await pb.screenshot({ path: `${OUT}/smoke-mobile-menu.png` });
  kontrol('yatay taşma yok (390px)', await pb.evaluate(() => document.documentElement.scrollWidth <= 390));
  await ctxB.close();

  kontrol('konsol/sayfa hatası yok', hata.length === 0, hata[0] || '');
  kontrol('yerel 404 yok', yerel404.length === 0, yerel404[0] || '');
  await b.close();
  console.log(kalan === 0 ? 'SMOKE: PASS' : `SMOKE: FAIL (${kalan})`);
  process.exit(kalan ? 1 : 0);
}
