---
name: run-naviar-care2
description: NAVIAR CARE 2 sitesini (naviar/care2/) bu konteynerde çalıştır, sür ve ekran görüntüsü al — "care2'yi çalıştır", "run", "smoke test", "screenshot/ekran görüntüsü", "Türkçe/Norveççe/İngilizce sayfayı göreyim", "test rezervasyonunu dene", "mobil menüyü göster", "koyu temayı göster" istendiğinde bu beceriyi kullan. Sunucu başlatma + Playwright sürüşü tek komutta; dil, mobil, koyu tema ve menü bayrakla.
---

# NAVIAR CARE 2'yi çalıştırma ve sürme

Saf statik site (derleme YOK, bağımlılık YOK): `naviar/care2/` altında 8 HTML +
`style.css` + `app.js` + `i18n.js` (NO/EN/TR, 270 anahtar) + `doctors.js`
(11 örnek profil) + `langs.js` (113 dil). Sunucu yok; rezervasyon, ölçüm onayı
ve hazırlık örneği `localStorage`'da (`nc2-*`). Ajan yolu: bu klasördeki
**driver.mjs** — sunucuyu kendi açar (8004), Chromium ile sürer, kapatır.
Yollar depo kökünden.

## Önkoşul

Yok. `python3`, `node`, Playwright (`/opt/node22/lib/node_modules`) ve Chromium
(`/opt/pw-browsers/chromium`) hazır. `apt`/`npm install` ÇALIŞTIRMA.

## Çalıştır (ajan yolu — önce bunu kullan)

```bash
# 39 kontrollü smoke (~25 sn), 4 görüntü; çıkış 0/1:
node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs smoke /tmp/naviar-care2-run

# Tek sayfa, tam görüntü (varsayılan Norveççe, masaüstü 1280px):
node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs shot index.html /tmp/naviar-care2-run
node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs shot booking.html /tmp/naviar-care2-run --lang=tr
node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs shot index.html /tmp/naviar-care2-run --lang=en --dark
node naviar/care2/.claude/skills/run-naviar-care2/driver.mjs shot index.html /tmp/naviar-care2-run --mobile --menu
```

Görüntü adı: `<sayfa>-<dil>[-mobile][-dark][-menu].png`. `shot` ölçüm onayını
önceden "hayır" yazar (banner görüntüyü kapatmasın diye); smoke ise temiz
bağlamda banner'ı sınar.

Smoke'un sürdüğü akışlar: ölçüm onayı (ilk ziyarette görünür, seçim kalıcı) →
üç dil (başlık, `html lang`, hero) → 8 sayfa noindex + boş `data-i18n` yok + iç
bağlantılar 200 → hazırlık örneği (dil seçilmeden İleri kapalı, özet, yenilemede
korunur, baştan başla) → profiller (kart = `doctors.js`, rozet, dil/fagområde
filtresi) → dil kataloğu (12 satır + "vis flere", 113 sayacı, arama) → test
rezervasyonu (onay + saat şartı, kaydet, e-posta taslağı, ödeme simülasyonu,
taşı, iptal, yenilemede korunur, Türkçe çeviri, sil) → mobil menü ve 390px'te
yatay taşma yok → konsol hatası ve yerel 404 yok.

## Çalıştır (insan yolu)

```bash
python3 -m http.server 8004 --directory naviar/care2
# → http://localhost:8004  (?lang=tr ile dil; Ctrl-C ile kapat)
```

## Sayfalar

| Dosya | İçerik |
|---|---|
| `index.html` | Hero, üç bilgi kartı, planlanan hizmet (3 adım), açıklık, dil, SSS |
| `journey.html` | 4 adımlı hazırlık örneği (Alex) — `#journey`, durum `nc2-journey` |
| `clinicians.html` | Örnek profiller, `#f-lang`/`#f-spec` filtreleri, `?speaks=<dil>` ön seçim |
| `languages.html` | 113 dil, `#lang-q` arama, `#lang-more` |
| `about.html` | Fikir, durum (`#status`), kimin için, sorumluluk, SSS |
| `professionals.html` | Sağlık çalışanları için; başvuru formu yok (bilinçli) |
| `booking.html` | Test rezervasyonu: `#bk-ack` onayı, `#slots`, `#bk-save`, `#res-list`, `#mail-list`, `#bk-del` |
| `privacy.html` | Ne saklanır, ne olmaz, silme, ölçüm, sorumlu |
| `i18n.js` | `NC2_I18N` (no/en/tr) + `NC2_LANGS`; anahtar eşitliği zorunlu |
| `app.js` | Dil, gezinme, onay, örnek, profiller, katalog, rezervasyon (`window.NC2`) |

## Gotchas (hepsi bu konteynerde yaşandı)

- **Kapalı `<details>` içindeki metin `innerText` ile boş döner.** E-posta
  taslağı `<details>` içinde; test `textContent()` kullanır. Görünürlük
  sınamak istiyorsan önce `summary`'ye tıkla.
- **Test saatleri sabit değil**: `genSlots()` Oslo gününden itibaren sonraki
  8 iş günü × 5 saat üretir (40 düğme). Saat sayısı testi 40 bekler; saat
  listesini değiştirirsen testi de değiştir.
- **Tarih biçimi `timeZone:'UTC'` ile**: slot `YYYY-MM-DDTHH:MM` Oslo duvar
  saati olarak saklanır, gösterim tarih kısmından UTC'de üretilir; ofset
  hesabı yok. Gerçek takvime geçerken bu yaklaşım yetmez.
- **Dış istekler kesilir** (`ctx.route(... abort)`): helsenorge bağlantısı
  tıklanmaz; kesilmezse `networkidle` proxy yüzünden ~13 sn askıda kalır.
- **`pkill -f 'http.server 8004'` kendi kabuğunu öldürür** (çıkış 144):
  `pkill -f '[h]ttp.server 8004'` yaz, ayrı komut olarak.
- **Portlar**: 8000 QBLOGG, 8001 care, 8002 care-pilot, 8003 HXI, 8004 care2.
- **Playwright depo kökünden import EDİLEMEZ**; driver `createRequire('/opt/node22/lib/node_modules/')`.
- **Detached sunucu `unref()` ister**; yoksa `shot` sonsuza dek bekler.
- **`npm run check` CARE 2'yi denetlemez**; doğrulama bu smoke + i18n eşitliği:
  ```bash
  node -e 'const fs=require("fs"),vm=require("vm"),w={};w.window=w;vm.createContext(w);vm.runInContext(fs.readFileSync("naviar/care2/i18n.js","utf8"),w);const d=w.NC2_I18N,no=Object.keys(d.no);for(const l of ["en","tr"]){const k=Object.keys(d[l]);console.log(l,"eksik",no.filter(x=>!k.includes(x)),"fazla",k.filter(x=>!no.includes(x)))}'
  ```
- **Dağıtım = `naviar/vercel-care.json`** (`cp -r _repo/naviar/care2/. dist/`):
  dal'a push + `deploy_to_vercel` (`naviarcare`, takım BET - ART). Canlı
  `naviarcare-bet-art.vercel.app`; egress proxy `*.vercel.app`'i engeller,
  doğrulama `web_fetch_vercel_url` ile.

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| `sunucu 5 sn içinde açılmadı` | `pkill -f '[h]ttp.server 8004'` → tekrar |
| `e-posta taslağı üretildi` ❌ | `innerText` kullanılmış; `textContent()` |
| `test saatleri üretildi (N = 8 gün × 5)` ❌ | `genSlots()` saat listesi değişmiş |
| `boş data-i18n yok` ❌ | HTML'de anahtar var, `i18n.js`'te yok; üç dile ekle |
| `ERR_MODULE_NOT_FOUND: playwright` | `createRequire` deseni |
