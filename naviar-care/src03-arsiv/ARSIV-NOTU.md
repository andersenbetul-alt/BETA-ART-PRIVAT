# SRC-03 kaynak arşivi — bu klasör nedir?

Kullanıcının 05.09.2026 akşamı bu oturuma yüklediği SRC-03 (ChatGPT
platformu CARE uygulaması) kaynak dosyalarının olduğu gibi arşividir.
Kaynak temel: **özel inceleme sürümü 5, commit
`255ee9b2f98e5cfab344ede26f876908d0ab6877`** (bkz. DOGRULAMA.md).

**Bu kod bu depoda ÇALIŞTIRILMAZ ve kanonik landing'in parçası
değildir.** ChatGPT Sites ortamına bağlıdır (Worker + D1 + Sites
kimlik akışı); KODU-CALISTIRMA.md'nin kendisi de standart Next.js/
Vercel'e taşımanın otomatik olmadığını söyler. Amaç: chatgpt.site bu
ortamdan erişilemediği için kaynağın kaybolmaması ve karşılaştırma/
taşıma kararlarına dayanak olması (bkz.
`../docs/src03-karsilastirma.md`).

## Teknik yapı (özet)

- React 19 + TypeScript, Vinext/Vite App Router; Cloudflare Worker
  üzerinde çalışır (`worker/index.ts`), varlıklar ASSETS binding'i.
- Veri: Cloudflare D1 (SQLite) + Drizzle (`db/schema.ts`;
  `db/legacy-schema.ts` eski tabloları korur, veri silmeyen migration
  ilkesi). Tablolar: care_requests, care_reservations,
  care_applications, care_cases, care_outbox, care_payment_events,
  care_analytics, care_feedback, care_audit.
- Kimlik: ChatGPT Sites oturumu, `oai-authenticated-user-*`
  başlıklarından (`lib/chatgpt-auth.ts`); kayıt sahibi sunucuda
  belirlenir.
- İçerik: 3 dil (nb/en/tr) tek katalogda `lib/content.ts`
  (~287 anahtar); tasarım belirteçleri `app/globals.css`
  (#0B5152 ana eylem, #10384A metin, #A96A00 odak).
- Ödeme/e-posta: Stripe test + Resend bağdaştırıcısı
  (`lib/care-integrations.ts`); .env.example'da gerçek sır yok,
  INTAKE/ödeme kapalı duruş.
- Bağımsız tasarım önizlemesi: `design-preview/` +
  `scripts/export-design-preview.mjs` → tek dosyalık
  `teslim/NAVIAR-CARE_SRC03_Web-Tasarim.html` (CSP ile ağ istekleri
  kapalı, kişisel verisiz deneme formu).
- Tam konsept belgesi (23 bölüm, TR):
  `teslim/NAVIAR-CARE_SRC03_Tam-Konsept.html`.

## v2.4 son teslim kaydı (05.09.2026 gece)

ChatGPT hattı inceleme sürümünü **NAVIAR-CARE-001-WEB-01 v2.4.0** olarak
kapattı; teslim kaydı `teslim/NAVIAR-CARE-001-WEB-01_DOC-010_FINAL-
TESLIM_v2.4.html` (yükleme kopyasıyla bayt bayt aynı). Özü: 36 otomatik
test geçti (30 sunucu/SQLite + 6 sentetik DOM akışı); tarayıcı/telefon
kontrolleri ortam hatasıyla TAMAMLANAMADI; SERVICE_OPEN /
PAYMENTS_ENABLED / LAUNCH_REVIEW_COMPLETE false — gerçek hizmet, ödeme
ve e-posta kapalı. Açılış girdileri (işletme kimliği, bölge, e-posta,
alan adı, sağlayıcı hesapları) işletme sahibinden bekleniyor.
`KAYNAK-KOD_v2.4.zip` bu oturuma YÜKLENMEDİ — buradaki kaynak ağacı
hâlâ sürüm 5 / 255ee9b2 temelidir, v2.4 koduyla eş değildir.

## Adlandırma notları

- Dosyalar yükleme adlarındaki hash önekleri atılarak KODU-CALISTIRMA
  tablosundaki özgün yollara yerleştirildi; `app/[lang]/` köşeli
  ayraçları `app/lang/` olarak düzleştirildi (git/derleme karışıklığını
  önlemek için — orijinal yol Next.js dinamik segmentidir).
- `_gitignore` ve `_npmrc`: nokta-dosyalar bilerek etkisiz adla
  saklandı (arşiv alt ağacında ignore kuralı çalıştırmasınlar diye).
- `sablon-notlar/`: platform başlangıç şablonundan kalan "notes" demo
  şeması ve API rotası — CARE ürününün parçası değil.
- `vendor/`: shadcn/tailwind derlenmiş CSS + lisansı (yüklemede
  geldiği için saklandı).
