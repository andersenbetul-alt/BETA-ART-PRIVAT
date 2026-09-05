---
name: run-engine
description: Curiosity Engine hattını (engine/) bu konteynerde çalıştır, sür ve panelin ekran görüntüsünü al — "engine'i çalıştır", "run", "smoke test", "hattı dene", "demo tara", "canlı tara", "panel/dashboard görüntüsü", "puanlama tablosu", "write --dry" istendiğinde bu beceriyi kullan. Yalıtılmış SQLite ile demo → puan → kuyruk → kuru yazma zinciri + üç test + panel görüntüsü tek komutta.
---

# Curiosity Engine'i çalıştırma ve sürme

CLI hattı + statik panel. `engine/run.mjs` sinyalleri toplar, kümeler, puanlar,
kuyruğa alır ve `engine/data/board.json` yazar; `engine/dashboard.html` o dosyayı
okur; `engine/write.mjs` kuyruktaki konu için Claude ajan zincirini çalıştırır.
Veritabanı Node 22'nin yerleşik `node:sqlite` modülü (ek paket yok). Ajan yolu:
bu klasördeki **driver.mjs**. Yollar depo kökünden.

## Önkoşul

Yok — `node` 22, `python3`, Playwright (`/opt/node22/lib/node_modules`) ve Chromium
(`/opt/pw-browsers/chromium`) hazır. `npm install` ÇALIŞTIRMA (aşağıya bak).

## Çalıştır (ajan yolu — önce bunu kullan)

```bash
# 15 kontrollü smoke (~5 sn): demo tarama, board, --top, kuru yazma zinciri,
# üç test, GSC CSV yolu, panel görüntüsü. Çıkış 0/1. DB yalıtılmış (QB_DB).
node engine/.claude/skills/run-engine/driver.mjs smoke /tmp/engine-run

# Yalnız panel görüntüsü (board.json yoksa önce --demo koşar):
node engine/.claude/skills/run-engine/driver.mjs shot /tmp/engine-run

# Canlı tarama (ağ ister; bu konteynerde RSS kaynakları 403 döner, aşağıya bak):
node engine/.claude/skills/run-engine/driver.mjs live --gsc /tmp/engine-run/gsc-ornek.csv
```

Görüntü `<çıktı>/dashboard.png`. Smoke'un sürdüğü sıra: `run --demo` (30 sinyal →
16 konu → 3 kuyruk) → `board.json` → `--board` → `--demo --top 5` → `write --next
--dry` ve `write ai-receptionist --dry` → olmayan slug çıkış 1 → `write --next`
API yolu "paket yok" ile çıkış 1 → `score/billing/visibility.test.mjs` → `--live
--gsc` örnek CSV (RSS 403'e rağmen GSC satırları kuyruğa girer) → panel Chromium'da
15 satır / 6 sayaç / konsol hatası yok.

## Doğrudan çağrı (hattın parçaları)

```bash
QB_DB=/tmp/engine-run/curiosity.db node engine/run.mjs --demo        # fikstür, ağ yok
QB_DB=/tmp/engine-run/curiosity.db node engine/run.mjs --board       # son tablo
QB_DB=/tmp/engine-run/curiosity.db node engine/write.mjs --next --dry
node engine/score.test.mjs && node engine/billing.test.mjs && node engine/visibility.test.mjs
```

`QB_DB` verilmezse depodaki `engine/data/curiosity.db` kullanılır (gitignore'da
ama kalıcı; deneme koşularını oraya yazma).

## Çalıştır (insan yolu)

```bash
node engine/run.mjs --demo
python3 -m http.server 8005 --directory engine     # → http://localhost:8005/dashboard.html
```

Panel `fetch('./data/board.json')` yapar; `file://` ile açılırsa fetch engellenir,
sunucu şart.

## Gotchas (hepsi bu konteynerde yaşandı)

- **`write.mjs --next` (API yolu) çalışmaz**: `@anthropic-ai/sdk` ve `zod`
  `package.json`'da var ama `node_modules` kurulu değil → `Cannot find package
  '@anthropic-ai/sdk'`. `--dry` bayrağı `agents.mjs`'i hiç import etmediği için
  zinciri anahtarsız anlatır. Gerçek üretim için `npm install` + `ANTHROPIC_API_KEY`
  gerekir; makale başına 1,5–3 $ (README). Bu beceri o yolu sürmez.
- **Canlı kaynaklar bu konteynerde 403**: Google News RSS, Google Trends RSS,
  Reddit JSON, hnrss.org hepsi egress proxy'den `HTTP 403`. `--live` tek başına
  "Hiç sinyal toplanamadı" ile çıkış 1. `--live --gsc dosya.csv` ise GSC satırları
  sayesinde çıkış 0 verir; smoke bunu kullanır. Dışarıda ağ varsa `--live`
  gerçekten tarar; sonuçlar demo sayılarıyla eşleşmez.
- **`board.json` her zaman `engine/data/`'ya yazılır**, `QB_DB` sadece SQLite
  yolunu değiştirir. Smoke sonunda paneli demo verisine geri döndürür; `--live
  --gsc` sonrasında board 2 satıra düşer, şaşırma.
- **GSC CSV filtresi**: `impressions ≥ 100` ve `position ≥ 4` olmayan sorgular
  atılır (`sources/gsc.mjs → findOpportunities`); örnek CSV'deki "chatgpt prompts"
  (poz. 3,1) bu yüzden görünmez. Başlık satırı `Query,Clicks,Impressions,CTR,
  Position` ya da Türkçe karşılıkları.
- **`--demo` idempotent değil ama zararsız**: sinyaller `INSERT OR IGNORE`, konular
  upsert; her koşuda `signal_count` artar, tablo aynı kalır.
- **`ExperimentalWarning: SQLite`** her komutta stderr'e düşer; hata değil.
  Driver bu satırları süzer.
- **Panel ikonları emoji** (🔥 ⚡ 🌲 📈) — CLAUDE.md kural 4 site içindir, panel
  iç araçtır; ama görüntüde işletim sistemine göre farklı çizilir.
- **Playwright depo kökünden import EDİLEMEZ**; driver `createRequire('/opt/node22/
  lib/node_modules/')` kullanır. Panel sunucusu 8005 (8000 QBLOGG, 8001 care,
  8002 care-pilot, 8003 HXI, 8004 care2).
- **`pkill -f 'http.server 8005'` kendi kabuğunu öldürür** (çıkış 144);
  `pkill -f '[h]ttp.server 8005'` yaz, ayrı komut olarak.

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| `Kuyrukta konu yok. Önce: node engine/run.mjs --demo` | DB boş ya da farklı `QB_DB`; aynı `QB_DB` ile önce `--demo` |
| `Cannot find package '@anthropic-ai/sdk'` | Beklenen; `--dry` kullan ya da `npm install` + anahtar |
| `Hiç sinyal toplanamadı` (çıkış 1) | Proxy 403; `--demo` ya da `--live --gsc dosya.csv` |
| Panelde "Önce node engine/run.mjs --demo çalıştırın" | `engine/data/board.json` yok ya da `file://` ile açıldı; sunucu + `--demo` |
| `panel: 15 satır` ❌ (2 satır) | Son koşu `--live --gsc` idi; `--demo` ile tazele |
| `ERR_MODULE_NOT_FOUND: playwright` | `createRequire` deseni (driver'da var) |
