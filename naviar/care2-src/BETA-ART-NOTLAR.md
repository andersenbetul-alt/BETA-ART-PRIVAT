# BETA-ART notları — bu klasör kullanıcının v6 kaynak teslimidir

Kaynak: kullanıcının 05.09.2026'da yüklediği dosyalar (chatgpt.site'deki NAVIAR CARE 2
projesinin kaynak kodu). Orijinal dosyalar (`build_content.py`, `build_operations.py`,
`content.json`, `catalog.json`, `checks/`, `db/`, `drizzle/`, `scripts/`, `design/`,
`README.md`, `package*.json`, `vite.config.mjs`, `drizzle.config.ts`, `.openai/hosting.json`,
`.gitignore`) **bayt bayt değiştirilmedi**. Belge arşivi ve numaralar:
`docs/naviar/care2-teslim/00_ARSIV-DIZINI.md`.

Bu depoda eklenenler (teslimde yoktu):

| Dosya | Neden |
|---|---|
| `public/styles.css` | Teslimde stil dosyası yok; `design/REVIEW-v4.md` Foundations değerleriyle yazıldı |
| `public/model.js` | `checks/catalog-model.cjs`'in beklediği API (geçiyor) |
| `public/site.js` | Menü, dil, hazırlık örneği (URL parçası), profiller, katalog, sekmeler; `checks/static.py` kuralına uygun (fetch/localStorage/innerHTML yok) |
| `public/operations.js` | Rezervasyon + ölçüm tercihi; **sunucu yerine localStorage** (server/operations.mjs teslimde yok) |
| `public/assets/logo.svg` | Özgün hibrit işaret (v0.3), arşivdeki `NAVIAR-CARE-002_Studio-Demo_v1.0.html` içindeki gömülü SVG'den çıkarıldı |
| `public/assets/conversation.webp` | Özgün KI görseli 1000×1250, aynı dosyadaki gömülü webp'den çıkarıldı (`conversation.svg` yalnız yedek) |
| `public/studio-demo/` | Aynı arşiv dosyasından: gövde + stil + betik ayrıldı; sabit 7–9 Eylül tarihleri `sample-calendar.js` ile Oslo takvimine bağlandı (DEC-014); `site-home`/`back-to-site`/`saved-booking`/`sample-date-note` kancaları eklendi |
| `build_static.py` | İki üreticiyi koşar, `public/` ekler; studio-demo ve webp yoksa yedeğe düşer |
| `design/CONCEPT-v7-tr.md`, `design/RELEASE-v7.md`, `scripts/export-handoff-v7.py` | v7 statik sürüm belgeleri; teslim HTML'leri `docs/naviar/care2-teslim/` |
| `.claude/skills/run-care2-src/` | Sürücü + beceri (smoke 40 kontrol) |

Bilinçli farklar (CONCEPT-v7 §20): `/insights/` yalnız bu tarayıcıdaki test özetini gösterir;
e-posta taslağı etiketlerden kurulur; ödeme simülasyonu yalnız durum alanı yazar; ICS dosyası
tarayıcıda üretilir. Doğrulama: `checks/static.py`, `catalog-model.cjs`, `sample-calendar.test.mjs`
PASS; `run-care2-src` smoke 54/54. `checks/operations.test.mjs` sunucu ister, çalışmaz.
Özgün `styles.css`/`site.js`/`model.js`/`operations.js`/`server/*.mjs` gelirse `public/`
altındaki karşılıkları değiştirilir.
