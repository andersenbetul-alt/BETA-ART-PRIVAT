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
| `public/assets/logo.svg` | `brand/naviar/care/naviar-care-lockup.svg` kopyası (özgün logo teslimde yok) |
| `public/assets/conversation.svg` | Hero görseli yer tutucu (`conversation.webp` teslimde yok) |
| `build_static.py` | İki üreticiyi koşar, `public/` ekler, `/studio-demo/` → `/journey/`, webp → svg |
| `.claude/skills/run-care2-src/` | Sürücü + beceri (smoke 40 kontrol) |

Bilinçli farklar: `/insights/` sahip araçları çalışmaz (sunucu yok); e-posta taslağı
sunucu şablonu yerine etiketlerden kurulur; ödeme simülasyonu yalnız durum alanı yazar;
`/studio-demo/` yok. Gerçek `conversation.webp`, `logo.svg`, `styles.css`, `site.js`,
`model.js`, `operations.js`, `studio.js`, `sample-calendar.js`, `server/*.mjs` gelirse
`public/` altındaki karşılıkları değiştirilir; `build_static.py` webp'yi kendiliğinden kullanır.
