# NAVIAR ARŞİVİ — ANA KAYIT (numaralı)

**Depo arşiv kodu:** BA-NAVIAR-ARSIV · **Kuruluş:** 05.09.2026 gece
(kullanıcı talimatı: "bütün belgeleri organize et, numaralı bir şekilde
arşivle"). ChatGPT tarafındaki NAVIAR-MASTER-2026-001 ana arşivinin bu
depodaki karşılığıdır; oradaki numaralama ile eşleşme
`01_master-dizin/ARSIV-NOTU.md`'de.

**Kural:** dosyalar yükleme kopyalarıyla bayt bayt (md5) doğrulanarak
alınır; adlar özgün haliyle korunur, hiçbir belge birleştirilmez veya
üzerine yazılmaz; yeni parça geldiğinde ilgili klasöre eklenir ve bu
kayıt güncellenir. Buradaki hiçbir kod bu depoda çalıştırılmaz.

## Klasör numaraları

| No | Klasör | Proje / içerik | Ayrıntı |
|---|---|---|---|
| 00 | `00_ANA-KAYIT.md` | Bu kayıt | — |
| 01 | `01_master-dizin/` | NAVIAR-MASTER-2026-001 dizin dosyaları (00_MASTER-INDEX, 02_FILE-REGISTER) | `01_master-dizin/ARSIV-NOTU.md` |
| 02 | `02_care-1-src03/` | NAVIAR CARE 1 (NAVIAR-CARE-001-WEB-01 / SRC-03) kaynak ağacı + teslim belgeleri | `02_care-1-src03/ARSIV-NOTU.md` |
| 03 | `03_care-1-studio-web-2026-002/` | WEB-2026-002 "Hverdagsstøttepilot" statik prototip + **logo v0.2 kaynak SVG** (`brand/`) | `03_…/ARSIV-NOTU.md` |
| 04 | `04_care-2/` | NAVIAR CARE 2 (NAVIAR-CARE-002) — dil odaklı dijital sağlık konsepti | `04_care-2/ARSIV-NOTU.md` |
| 05 | `05_consult/` | NAVIAR Consult (P-010 / NVC-001) teslim ve gelişim kayıtları | `05_consult/ARSIV-NOTU.md` |
| 06 | — ayrılmış — | P-011 hattı (COOKIE1/STUDIO demoları): dosyaları henüz gelmedi | master FILE-007…012 |

## Numaralı belge kaydı (teslim/tasarım belgeleri)

`BA-###` yalnızca bu depodaki izleme numarasıdır; özgün adlar korunur.

| No | Klasör | Belge | İçerik |
|---|---|---|---|
| BA-001 | 01 | `00_MASTER-INDEX.md` | 5 kaynak sohbet, 4 proje akışı, çalışma kararı |
| BA-002 | 01 | `02_FILE-REGISTER.md` | FILE-001…024 dosya kaydı + RELATED |
| BA-003 | 02 | `teslim/NAVIAR-CARE_SRC03_Web-Tasarim.html` | Tek dosyalık tasarım önizlemesi |
| BA-004 | 02 | `teslim/NAVIAR-CARE_SRC03_Tam-Konsept.html` | 23 bölümlük tam konsept (TR) |
| BA-005 | 02 | `teslim/NAVIAR-MASTER-2026-001_DOC-KONSEPT-WEB-01_v1.0.html` | Master konsept-web belgesi |
| BA-006 | 02 | `teslim/NAVIAR-CARE-001-WEB-01_DOC-010_FINAL-TESLIM_v2.4.html` | Son teslim kaydı v2.4.0 (36 test; hizmet/ödeme/e-posta kapalı) |
| BA-007 | 02 | `teslim/NAVIAR-CARE_Web-Design-Platform-Studio_2026-09-05.md` | Platform karşılaştırması + sürüm 3/4 kayıtları |
| BA-008 | 02 | `README.md` / `DOGRULAMA.md` / `KODU-CALISTIRMA.md` | Kaynak ağacın kendi belgeleri |
| BA-027 | 02 | `teslim/NAVIAR-CARE-001-WEB-01_DOC-012_TUM-BELGELER_v1.0.html` | 20 belge + 10 tarihsel kayıt (tek dosya) |
| BA-028 | 02 | `teslim/NAVIAR-CARE-001-WEB-01_BELGE-LISTESI_v1.0.csv` | DOC-012 paketinin numaralı listesi |
| BA-029 | 02 | `kaynak-v2.4.0/` | Tam kaynak v2.4.0 (rev 2d1ea68e; 62 dosya, SHA-256 62/62 doğrulandı) |
| BA-030 | 02 | `kaynak-v2.4.0/naviar-care/assets/` | hverdag.png (fotoğraf; lisans kaydı YOK) + naviar-care-v03.svg (kucaklaşma-kalp logo) |
| BA-031 | 02 | `belge-paketi-20260905/` | SRC-03 belge paketi (18 dosya; SHA256 17/17 doğrulandı; CHAT-004 üçlüsü FILE-020…022 dahil) |
| BA-032 | 02 | `belge-paketi-20260905/01_PROJE_BELGELERI/NAVIAR-CARE_SRC03_Proje-Dokumantasyonu_v1.0.docx` | 29 sayfalık ana proje dokümantasyonu (+ md kaynağı) |
| BA-009 | 03 | `docs/CONCEPT.md` | Stüdyo prototip konsepti |
| BA-010 | 03 | `docs/PLATFORM-DECISION.md` | Platform kararı |
| BA-011 | 03 | `docs/DECISION-LOG.md` | Karar günlüğü |
| BA-012 | 03 | `docs/QA-REPORT.md` | QA raporu |
| BA-013 | 03 | `docs/SERVICE-BLUEPRINT.md` | Hizmet planı |
| BA-014 | 03 | `docs/CMS-CONTENT-MODEL.md` | İçerik modeli |
| BA-015 | 03 | `docs/CONTENT-GUIDE.md` | İçerik rehberi |
| BA-016 | 03 | `docs/PROJECT-CARD.md` | Proje kartı (WEB-2026-002 kimliği) |
| BA-017 | 03 | `docs/ROADMAP.md` | Yol haritası |
| BA-018 | 03 | `brand/NAVIAR-CARE-001_master_candidate_v0.2.svg` | **Logo adayı kaynak SVG v0.2** (v0.3 bekleniyor — FILE-016) |
| BA-019 | 04 | `design/CONCEPT-v6-tr.md` | CARE 2 ana konsept (DOS-001 v6.0) |
| BA-020 | 04 | `design/RELEASE-v5.md` | CARE 2 sürüm 5 teslimi |
| BA-021 | 04 | `design/RELEASE-v6.md` | CARE 2 sürüm 6 teslimi (12 test) |
| BA-022 | 04 | `design/REVIEW-v4.md` | CARE 2 inceleme kaydı |
| BA-023 | 04 | `design/STUDIO-DEMO.md` | CARE 2 stüdyo demo kaydı |
| BA-024 | 04 | `README.md` | CARE 2 operasyon sürümü belgesi |
| BA-025 | 05 | `NVC-001_Kapanis-ve-Teslim.md` | Consult kapanış-teslim (ticari açılış tamamlanmadı) |
| BA-026 | 05 | `NVC-001-DEC-02_Surekli-Gelisim-Kaydi.md` | Consult sürekli gelişim kaydı |

Kaynak kod dosyaları (uygulama, test, yapılandırma) klasör bazında
sayılır; tam liste için `git ls-files naviar-arsiv/`.

## Eksik parçalar (master FILE-REGISTER'a ve belgelere göre)

| Beklenen | Master kaydı | Gideceği yer |
|---|---|---|
| `01_SOURCE-REGISTER.md` | — | 01 |
| P-011 zip'leri + raporları (COOKIE1 v0.3.0, STUDIO v0.4.0) | FILE-007…012 | 06 (açılacak) |
| `NAVIAR-CARE-001_master_candidate_v0.3.svg` | FILE-016 | 03/brand |
| KAYNAK-KOD zip'leri v1.0 ve v2.2 (v2.4.0 GELDİ → BA-029) | FILE-014/019 | 02 |
| CARE 2: build_content.py, build_operations.py, db/schema.ts, drizzle göçü, dist/ | 04 ARSIV-NOTU | 04 |
| Kadın fotoğrafının köken/lisans kaydı (dosya geldi: BA-030) | — | 02 |
