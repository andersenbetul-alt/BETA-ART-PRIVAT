#!/usr/bin/env node
/* Curiosity Engine sürücüsü — hattı yalıtılmış bir veritabanıyla uçtan uca sürer,
 * paneli gerçek Chromium'da açıp görüntü alır.
 *
 * Kullanım (depo kökünden):
 *   node engine/.claude/skills/run-engine/driver.mjs smoke [çıktı-dizini]   # 15 kontrol, ~5 sn, çıkış 0/1
 *   node engine/.claude/skills/run-engine/driver.mjs shot  [çıktı-dizini]   # yalnız panel görüntüsü
 *   node engine/.claude/skills/run-engine/driver.mjs live  [--gsc dosya.csv] # canlı tarama (ağ ister)
 *
 * Yalıtım: QB_DB=<çıktı>/curiosity.db — depodaki engine/data/curiosity.db'ye dokunmaz.
 * Ama run.mjs panel verisini her zaman engine/data/board.json'a yazar (gitignore'da);
 * bunu değiştiremeyiz, driver da oradan okur.
 *
 * API çağıran yol (write.mjs --next, anahtarlı) burada SÜRÜLMEZ: @anthropic-ai/sdk ve zod
 * depoda kurulu değil (package.json'da var, node_modules yok) ve anahtar gerekir.
 * Smoke bunun yerine --dry zincirini ve "paket yok" hatasının beklendiği gibi
 * çıktığını doğrular.
 */
import { createRequire } from 'node:module';
import { spawnSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ENGINE = path.resolve(fileURLToPath(import.meta.url), '../../../..');   // engine/
const ROOT = path.dirname(ENGINE);
const PORT = 8005;                                          // 8000 QBLOGG, 8001 care, 8002 care-pilot, 8003 HXI, 8004 care2
const args = process.argv.slice(2);
const KIP = args[0] || 'smoke';
const OUT = (args[1] && !args[1].startsWith('--')) ? args[1] : '/tmp/engine-run';
mkdirSync(OUT, { recursive: true });
const DB = path.join(OUT, 'curiosity.db');

function calistir(script, ...a) {
  const r = spawnSync('node', [path.join(ENGINE, script), ...a],
    { cwd: ROOT, env: { ...process.env, QB_DB: DB }, encoding: 'utf8', timeout: 90_000 });
  const out = (r.stdout || '') + (r.stderr || '');
  return { code: r.status, out: out.replace(/\(node:\d+\) ExperimentalWarning[^\n]*\n(\(Use[^\n]*\n)?/g, '') };
}

async function panel(pngYolu) {
  const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', ENGINE], { stdio: 'ignore', detached: true });
  srv.unref();
  try {
    for (let i = 0; i < 20; i++) { try { if ((await fetch(`http://localhost:${PORT}/dashboard.html`)).ok) break; } catch {} await new Promise(r => setTimeout(r, 250)); }
    const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 0.75 });
    await ctx.route(u => !u.href.startsWith('http://localhost'), r => r.abort());
    const p = await ctx.newPage(); const hata = [];
    p.on('pageerror', e => hata.push(String(e))); p.on('console', m => { if (m.type() === 'error') hata.push(m.text()); });
    await p.goto(`http://localhost:${PORT}/dashboard.html`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const sonuc = { satir: await p.locator('#board tbody tr').count(), stat: await p.locator('.stat').count(),
                    meta: await p.locator('#meta').innerText(), hata };
    await p.screenshot({ path: pngYolu, fullPage: true });
    await b.close();
    return sonuc;
  } finally { try { process.kill(-srv.pid); } catch {} }
}

if (KIP === 'live') {
  const r = calistir('run.mjs', '--live', ...args.slice(1).filter(a => a !== OUT));
  process.stdout.write(r.out); process.exit(r.code ?? 1);
}

if (KIP === 'shot') {
  if (!existsSync(path.join(ENGINE, 'data', 'board.json'))) calistir('run.mjs', '--demo');
  const s = await panel(path.join(OUT, 'dashboard.png'));
  console.log('görüntü:', path.join(OUT, 'dashboard.png'), '·', s.satir, 'satır');
  process.exit(0);
}

// ── smoke ──────────────────────────────────────────────────────────────────
for (const f of [DB, DB + '-wal', DB + '-shm']) if (existsSync(f)) rmSync(f);
let kalan = 0;
const kontrol = (ad, k, ek = '') => { console.log((k ? '✅ ' : '❌ ') + ad + (ek ? ' → ' + ek.trim().split('\n').slice(-1)[0] : '')); if (!k) kalan++; };

let r = calistir('run.mjs', '--demo');
kontrol('run --demo: 30 sinyal → 16 konu, 3 kuyruk', r.code === 0 && /30 sinyal → 16 konu/.test(r.out) && /Kuyruğa alınan: 3/.test(r.out), r.out);
kontrol('board.json yazıldı', existsSync(path.join(ENGINE, 'data', 'board.json')));
const board = JSON.parse(readFileSync(path.join(ENGINE, 'data', 'board.json'), 'utf8'));
kontrol('board.json: mod demo, 16 konu', board.mode === 'demo' && (board.topics || board.rows || []).length === 16, JSON.stringify(Object.keys(board)));
kontrol('yalıtılmış DB oluştu (QB_DB)', existsSync(DB));

r = calistir('run.mjs', '--board');
kontrol('run --board tabloyu yazdırır', r.code === 0 && /jobs ai will replace/.test(r.out), r.out);

r = calistir('run.mjs', '--demo', '--top', '5');
kontrol('run --demo --top 5 → 5 kuyruk', r.code === 0 && /Kuyruğa alınan: 5/.test(r.out), r.out);

r = calistir('write.mjs', '--next', '--dry');
kontrol('write --next --dry: 6 adımlı zincir, API yok', r.code === 0 && /KURU ÇALIŞTIRMA/.test(r.out) && /6\. qualityGate/.test(r.out), r.out);
r = calistir('write.mjs', 'ai-receptionist', '--dry');
kontrol('write <slug> --dry: kuyruktaki konu bulunur', r.code === 0 && /Konu:\s+ai receptionist/.test(r.out), r.out);
r = calistir('write.mjs', 'olmayan-slug', '--dry');
kontrol('write olmayan slug → çıkış 1', r.code === 1 && /Kuyrukta konu yok/.test(r.out), r.out);
r = calistir('write.mjs', '--next');
kontrol('write --next (API yolu): @anthropic-ai/sdk kurulu değil → çıkış 1', r.code === 1 && /Cannot find package '@anthropic-ai\/sdk'/.test(r.out), r.out);

for (const t of ['score', 'billing', 'visibility']) {
  r = calistir(`${t}.test.mjs`);
  kontrol(`${t}.test.mjs geçti`, r.code === 0, r.out);
}

const csv = path.join(OUT, 'gsc-ornek.csv');
writeFileSync(csv, 'Query,Clicks,Impressions,CTR,Position\nai receptionist cost,12,900,1.3%,8.4\nbest ai tools small business,3,1400,0.2%,14.2\nchatgpt prompts,40,600,6.6%,3.1\n');
r = calistir('run.mjs', '--live', '--gsc', csv);
kontrol('run --live --gsc: GSC satırları hatta girer (RSS 403 olsa da)', r.code === 0 && /best ai tools small business/.test(r.out) && !/chatgpt prompts/.test(r.out), r.out);

calistir('run.mjs', '--demo');                              // paneli demo verisine döndür
const s = await panel(path.join(OUT, 'dashboard.png'));
kontrol('panel: 15 satır, 6 sayaç, hata yok', s.satir === 15 && s.stat === 6 && s.hata.length === 0, s.hata[0] || s.meta);

console.log(kalan === 0 ? 'SMOKE: PASS' : `SMOKE: FAIL (${kalan})`);
process.exit(kalan ? 1 : 0);
