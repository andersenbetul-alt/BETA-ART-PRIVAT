---
name: run-care2-src
description: NAVIAR CARE 2 kaynak sürümünü (naviar/care2-src/, kullanıcının v6 teslimi) bu konteynerde derle, çalıştır, sür ve ekran görüntüsü al — "care2-src'yi çalıştır", "kaynaktan derle", "build_static", "run", "smoke test", "27 sayfa", "screenshot/ekran görüntüsü", "Türkçe/Norveççe/İngilizce sayfayı göreyim", "rezervasyon akışını dene", "catalog-model testi" istendiğinde bu beceriyi kullan. Python üreticiler + Playwright sürüşü tek komutta.
---

# NAVIAR CARE 2 (kaynak sürümü) — derleme, çalıştırma, sürme

Kullanıcının 05.09.2026'da yüklediği v6 kaynak teslimi: `build_content.py` +
`build_operations.py` (`content.json`, `catalog.json` → 27 yerel sayfa NO/EN/TR),
`checks/`, `db/`, `drizzle/`, `design/`. Teslimde **olmayan** ve bu depoda yeniden
yazılan parçalar `public/` altında: `styles.css`, `model.js`, `site.js`,
`operations.js`, `studio-demo/` ve arşivden çıkarılan özgün `assets/logo.svg` + `assets/conversation.webp`.
Sunucu (Cloudflare Worker + D1) yok; rezervasyon ve ölçüm tercihi tarayıcı
depolamasında. Ajan yolu: bu klasördeki **driver.mjs**. Yollar depo kökünden.

## Önkoşul

Yok. `python3` (stdlib), `node` 22, Playwright (`/opt/node22/lib/node_modules`)
ve Chromium (`/opt/pw-browsers/chromium`) hazır. `npm install` GEREKMEZ
(package.json'daki drizzle/vite yalnızca sunucu ve şema içindir).

## Derle

```bash
cd naviar/care2-src && python3 build_static.py     # → dist/ (27 sayfa + public/ + yol düzeltmeleri)
node checks/catalog-model.cjs                       # 42 profil, 113 dil, 12 fark → PASS
```

`checks/static.py` (27 + 9 sayfa) ve `node --test checks/sample-calendar.test.mjs` de geçer;
smoke ikisini de koşar. `checks/operations.test.mjs` `server/operations.mjs` ister, çalışmaz.

## Çalıştır (ajan yolu — önce bunu kullan)

```bash
# derle + 3 kaynak denetimi + tarayıcı sürüşü = 54 kontrol (~60 sn), 6 görüntü; çıkış 0/1
node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs smoke /tmp/care2-src-run

# tek sayfa görüntüsü (yol = site yolu; --mobile 390×844)
node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs shot /tr/ /tmp/care2-src-run
node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs shot /tr/booking/ /tmp/care2-src-run
node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs shot "/studio-demo/?lang=tr" /tmp/care2-src-run
node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs shot /en/clinicians/ /tmp/care2-src-run
node naviar/care2-src/.claude/skills/run-care2-src/driver.mjs shot /tr/ /tmp/care2-src-run --mobile
```

Görüntü adı yol'dan türer (`tr.png`, `tr_booking.png`, `tr-mobile.png`). Sunucu 8006.

Smoke'un sürdüğü sıra: `build_static.py` → `catalog-model.cjs` → 27 sayfa (3 dil × 9)
noindex + demo şeridi → stil uygulanmış (forest düğme) → ölçüm onayı görünür/kaydedilir →
dil menüsü → hero CTA `/studio-demo/?lang=nb`, hero webp 1000×1250, logo → studio-demo akışı
(3 dinamik gün, hata durumları, onay, ödeme sonucu, e-posta önizleme, dil değişimi) → hazırlık örneği (durum URL parçasında:
`#step=3&language=tr&questions=0,2`, dil bağlantıları parçayı taşır, yenilemede korunur)
→ profiller (42, "vis flere" 24, dil filtresi, aksansız arama `iç hastaliklari`, boş
durum, dialog, `?language=nah` ön seçimi) → dil kataloğu (113, arama → `?language=yo`)
→ rezervasyon (40 saat, onay şartı, kaydet, e-posta taslağı, ödeme simülasyonu, taşı,
iptal, yenilemede korunur, sil, ICS) → insights yerel özet → mobil menü + Escape +
390 px'te taşma yok → konsol hatası ve yerel 404 yok.

## Çalıştır (insan yolu)

```bash
cd naviar/care2-src && python3 build_static.py && python3 -m http.server 8006 --directory dist
# → http://localhost:8006/  (/en/, /tr/ ; dizin yolları index.html'e düşer)
```

## Gotchas (hepsi bu konteynerde yaşandı)

- **`#sample-catalog` bazı sayfalarda `{}`** (journey, about…): `CATALOG.clinicians`
  yoksa `.length` patlar. `site.js` boş diziye düşer; yeni kod da öyle yapmalı.
- **`checks/static.py` `innerHTML` kelimesini yorumda bile yasaklar** (`'innerHTML' not in js`).
  `site.js`/`model.js` yorumlarına bu kelimeyi yazma.
- **Studio-Demo ve varlıklar arşiv dosyasının içindeydi**: `NAVIAR-CARE-002_Studio-Demo_v1.0.html`
  tek dosya; logo SVG ve 1000×1250 webp base64 gömülü. Buradan `public/studio-demo/` ve
  `public/assets/` çıkarıldı. `studio.js` sabit 7–9 Eylül 2026 tarihleriyle geliyordu;
  `SampleCalendar.sampleDays` (Oslo bugün + 1..3) ile değiştirildi, `UTC+02` etiketi kaldırıldı.
- **`sample-calendar.test.mjs` global `SampleCalendar` bekler**: dosyayı ESM yan etkisiyle
  import eder; `globalThis.SampleCalendar = …` yaz, `var` ile modül kapsamında kalır.
- **Türkçe büyük İ ile regex**: `/iptal/i` "İptal" ile eşleşmez (U+0130 katlanmaz);
  `/İptal|iptal/` yaz.
- **Dil filtresi ile arama ayrı dillerde**: `filterProfiles` uzmanlık adını `ui-config.fields`
  ile arar; Türkçe "iç hastaliklari" yalnız `/tr/clinicians/`'da eşleşir.
- **Taşı düğmesi seçime bağlı**: saat seçilince `renderLists()` de çağrılmalı, yoksa
  düğme `disabled` kalır (Playwright "element is not enabled").
- **390 px'te başlık 3 px taşıyordu**: logo 26 px, dil düğmesi 10 px iç boşluk (≤430 px).
- **Dış istekler kesilir** (helsenorge bağlantısı); kesilmezse `networkidle` proxy
  yüzünden ~13 sn askıda kalır.
- **Portlar**: 8000 QBLOGG, 8001 care, 8002 care-pilot, 8003 HXI, 8004 care2, 8005
  engine, 8006 care2-src. `pkill -f '[h]ttp.server 8006'` (köşeli parantezle, ayrı komut).
- **Dağıtım**: `naviar/vercel-care.json` → Vercel `naviarcare`; buildCommand depoyu
  klonlayıp `python3 build_static.py` koşar, `outputDirectory` `dist`. Canlı
  `naviarcare-bet-art.vercel.app` (proxy engelli; `web_fetch_vercel_url` ile doğrula).

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| `TypeError: Cannot read properties of undefined (reading 'length')` site.js:12 | `sample-catalog` `{}`; dizileri varsayılanla |
| `static.py` AssertionError `innerHTML` | yorumdaki kelimeyi kaldır |
| `static.py` AssertionError `studio-demo` | `public/studio-demo/` eksik ya da `site-home`/`saved-booking` kancaları silinmiş |
| `page.click … element is not enabled` (taşı) | saat seçildikten sonra `renderLists()` |
| `390px yatay taşma yok` ❌ | `.menu-button` sağı 391+; ≤430 px kuralını kontrol et |
| `sunucu 5 sn içinde açılmadı` | `pkill -f '[h]ttp.server 8006'` → tekrar |
