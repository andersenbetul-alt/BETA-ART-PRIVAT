# NAVIAR CARE 2 — İçerik incelemesi ve düzeltme dosyası

**Proje / arşiv:** NAVIAR-CARE-002  
**Belge:** NAVIAR-CARE-002-REV-001 / v1.0  
**Tarih:** 5 Eylül 2026, Europe/Oslo  
**Aşama:** Discover / Define / Design  
**Durum:** Kullanıcının sağladığı sayfa metinlerinin incelemesi ve uygulama önerileri. Canlı site değiştirilmedi.

## 1. Sonuç

NAVIAR CARE 2’nin ana fikri, insanların sağlık ihtiyaçlarını rahat ifade ettikleri dilde anlatabilmesi, görüşmeye hazırlanması ve uygun sağlık profesyoneline ulaşmasıdır. Paylaşılan kaynak, bu fikri küresel hekim ağı, belirtilerden uzmanlık ve aciliyet belirleme, tercüman, rezervasyon ve görüşme özetiyle birleştiriyor.

En önemli içerik sorunu hizmetin durumudur. Kullanıcının verdiği About metni, hekim listesinin ve müsaitlik bilgilerinin örnek veri olduğunu, gerçek görüşme rezervasyonu yapılmadığını açıkça söylüyor. Ana sayfa, doktor listesi ve dil sayfası ise aynı hizmeti çalışır durumdaymış gibi anlatıyor. Demo bilgisi her giriş sayfasında ve ilgili eylemin yanında görünür olmalı; örnek hekimler ve saatler buna göre etiketlenmeli.

İkinci sorun, aciliyet ve doğru uzman belirleme vaatleridir. Bu işlevler klinik etki taşır. Bir metni “tanı değildir” diye etiketlemek, işlevin klinik doğruluğunu veya düzenleyici durumunu kanıtlamaz. Klinik amaçlı yazılımın kapsamı, amaçlanan kullanımına göre değerlendirilmelidir. Bu sayfa için kesin bir tıbbi cihaz sınıfı tayin edilmedi. [DMP: tıbbi amaçlı yazılım](https://www.dmp.no/medisinsk-utstyr/programvare-som-medisinsk-utstyr)

## 2. Kanıt ve kaynak sınırı

Yedi farklı deployment adresi kayda alındı. Vercel proje bilgilerine erişim, bağlı hesabın ilgili ekip kapsamına yetkisi olmadığı için 403 verdi. Adresler arasında proje kimliği, kaynak commit’i, tarih sırası veya içerik eşitliği doğrulanamadı. Kaynak referanslarının aynı dosyada bulunması, yedi web projesinin birleştirildiği anlamına gelmez.

Bu inceleme aşağıdaki **kullanıcı tarafından sağlanmış metinlere** dayanır; canlı DOM, kaynak kodu, ağ trafiği veya çalışan rezervasyon testi değildir.

| Kaynak | İçerik | Kayıt |
| --- | --- | --- |
| SRC-001 | Ana sayfa / index.html | Limte inn markdown(4).md; proje dosyasına taşındı ve adlandırıldı |
| SRC-002 | Doktor listesi / booking.html | Limte inn markdown(5).md; proje dosyasına taşındı ve adlandırıldı |
| SRC-003 | Dil sayfası / languages.html | Limte inn markdown(6).md; proje dosyasına taşındı ve adlandırıldı |
| SRC-003 ikinci gönderim | Dil sayfasının tekrar gönderimi | Limte inn markdown(7).md; ilk kopyayla byte düzeyinde aynı, korunmuştur |
| SRC-004 | Belirti formu / triage.html | Kullanıcının mesajındaki ilk adım, 1/5; sonraki dört adım verilmedi |
| SRC-005 | Hekim başvurusu / join.html | Kullanıcının mesajındaki başvuru formu ve açıklamalar |
| SRC-006 | Hakkımızda / about.html | Kullanıcının iki kez verdiği gövde metni; son footer satırları kesik |

SRC-004–006 bu raporda referans kodudur; bunlar için ayrı tam sayfa dosyası teslim edilmiş değildir. Kaynak alıntıları Bölüm 10’da korunmuştur. Legal ve feedback sayfaları yalnızca bağlantı olarak görüldü; içerikleri incelenmedi. Metindeki “svg” ibarelerinin canlı sayfada göründüğü kanıtlanmadı; kopyalama artığı olabilir.

Önceki DOS-001 v1.0, Norveç’te yetişkinlerle sınırlı bir pilot önerisi içerir. Yeni kaynaklar ise küresel ve çocukları da kapsayan bir demo anlatır. Bunlar ayrı kapsam durumlarıdır: küresel demo mevcut kaynak anlatımıdır; dar pilot önceki tasarım önerisidir. Hiçbiri doğrulanmış canlı klinik hizmet olarak kabul edilmez.

## 3. Öncelikli düzeltmeler

P0: kullanıcıların mevcut durumu veya klinik işlevi yanlış anlamasına yol açabilecek konu. P1: hizmet akışı ve içerik tutarlılığı. P2: dil ve sunum iyileştirmesi. Bunlar bu incelemenin iş öncelikleridir; resmi risk sınıflandırması değildir.

| Kod | Öncelik | Gözlenen içerik | Yapılacak düzeltme | Tamamlanma kanıtı |
| --- | --- | --- | --- | --- |
| F-001 | P0 | About demo diyor; ana sayfa ve liste canlı hekim vaat ediyor | Tüm sayfalara tutarlı demo durumu; kartlara örnek profil/saat/fiyat etiketi; Book yerine Preview example | Her sayfaya doğrudan giren kullanıcı gerçek randevu alınmadığını anlar |
| F-002 | P0 | İki dakikada uzman ve aciliyet belirleme; doğru uzmanı ilk seferde bulma | Doğrulanmamış klinik karar çıktısını demodan çıkar; inceleme sürümünde önceden yazılmış örnek hazırlık akışı kullan | Demo kişinin gerçek belirtisine “bekleyebilir” veya uzman/aciliyet sonucu üretmez |
| F-003 | P0 | Göğüs ağrısı ve nefes darlığı, rezervasyon kartlarında da yer alıyor | Acil yardım bilgisini formdan önce ve doğrudan booking girişinde göster; klinik yönlendirme varsa profesyonelce doğrula | Acil yardım için form tamamlama, hesap açma veya ödeme şartı yoktur |
| F-004 | P0 | Ülkenin erişimi hiç sınırlamadığı, diğer ülkelerde ikinci görüş verilebildiği söyleniyor | Ülke, sağlayıcı yetkisi, hizmet türü ve sigorta uygunluğu doğrulanmadan erişim sözü verme | Doğrulanmamış ülke/hizmet kombinasyonunda gerçek rezervasyon açılamaz |
| F-005 | P0 | Hekim başvurusunda lisans bilgileri dışında her şeyin açık profilde görüneceği yazıyor | Kamuya açık alanları tek tek belirt; e-posta, referans kişisi iletişimi, sigorta ve doğrulama belgelerini özel tut | Kamuya açık profil, yalnızca izin verilen alanları içerir |
| F-006 | P0 | Tüm yanıtların cihazda kaldığı ve rezervasyona kadar iletilmediği iddiası | Kod, ağ, üçüncü taraf betikleri, hata kayıtları ve depolamayı incele; açıklamayı gerçek veri akışına göre yaz | Belirti yazma, dil değiştirme, geri dönme, hata ve gönderme durumları doğrulanır |
| F-007 | P1 | 113 dil, 44 hekim dili ve 24/7 tercüman kapasitesi anlatılıyor | Demo kataloğu ile gerçek hizmet kapasitesini ayır; site dili, klinik dil yeterliği ve tercüman dilini ayrı alanlar yap | Dil ve saat bazında kanıtlı kapasite veya açık “doğrulanmadı” durumu |
| F-008 | P1 | 12 dil için profil ile dil tablosu farklı bilgi veriyor | Ortak veri kaynağı ve dil yeterlik türü kullan; mevcut veriyi otomatik olarak “ana dil”e yükseltme | Her farkın açıklaması veya doğrulanmış düzeltmesi vardır |
| F-009 | P1 | Başvuru formunun lisans ülkeleri arasında Norveç yok | Hasta, çalışma, lisans ve hizmet ülkelerini tutarlı fakat ayrı listelerle yönet | Hedef pazarın izin verilen lisans kayıtları doğru temsil edilir |
| F-010 | P1 | Tüm meslekler hekim başlığında ve Dr unvanıyla gösteriliyor | Meslek, akademik unvan, ruhsat ve uzmanlığı ayrı doğrula | Psikolog, fizyoterapist, diyetisyen ve hekim rolleri açıkça anlaşılır |
| F-011 | P1 | Toplam USD fiyat, ayrı platform ücreti, sabit tercüman ücreti anlatıları var | Hekim ücreti, platform, tercüman, vergiler ve toplamı örnek olarak ayrıştır; gerçek ücret açıklamasını doğrula | İptal, iade, kesinti, tercümanın gelmemesi ve ek ücret koşulları açık |
| F-012 | P1 | Geçmişin sonraki hekime otomatik geçtiği söyleniyor | Paylaşılacak özet, alıcı, amaç ve uygun yetki/hukuki dayanak netleştirilmeli | Yeni hekim sırf aynı platformda olduğu için bütün geçmişe erişmez |
| F-013 | P1 | Demo iletişim metni kullanıcıyı gerçek görüşme açmaya yönlendiriyor | Gerçek muayene bulunmadığını yaz; tıbbi bilgi almayan destek akışı tanımla | Demo başarı ekranı gönderilmiş mesaj veya oluşmuş randevu iddia etmez |
| F-014 | P2 | 1 doctors; çok uzun filtreler; site dili ile görüşme dili karışıyor | Tekil/çoğul düzeltmesi, aranabilir alanlar, açık alan etiketleri ve klinik çeviri kontrolü | Klavye, ekran okuyucu, dar ekran, büyütme ve Arapça yön testi yapılır |

F-005 bir veri sızıntısı tespiti değildir: sağlanan metin kapsamı gereğinden geniş bir görünürlük vaadi veriyor; gerçek API ve profil çıktısı incelenmedi. F-006 için de veri gönderildiği sonucuna varılmadı.

## 4. Metin verilerinin çapraz kontrolü

| Kontrol | Sayılan | Metnin söylediği | Yorum |
| --- | ---: | ---: | --- |
| Doktor listesi profilleri | 42 | 42 | Sayım tutarlı; gerçek kişi/ruhsat kanıtı değil |
| Available now etiketli kartlar | 17 | 17 | Sayım tutarlı; About bunları örnek veri olarak tanımlıyor |
| Dil tablosu satırları | 113 | 113 | Sayım tutarlı; gerçek kapasite kanıtı değil |
| Doctor speaks it satırları | 44 | 44 | Sayım tutarlı; klinik yeterlik kanıtı değil |
| Interpreter joins satırları | 69 | 113 dilin geri kalanı | Sayım tutarlı; atanmış tercüman kanıtı değil |

12 dil için doktor kartının “Speaks” alanında dil bulunurken dil tablosu tercüman katılacağını söylüyor. Bu fark, konuşabilme ile klinik/ana dil yeterliği arasındaki ayrımdan kaynaklanabilir; kullanıcıya açıklanmıyor. Doğrudan hekim dil desteği varmış gibi otomatik düzeltme yapılmamalı.

| Dil | Örnek profil |
| --- | --- |
| Basa Jawa | Dr Budi Santoso |
| Cebuano | Dr Maria Santos |
| Dansk | Dr Sara Lindqvist |
| Hausa | Dr Marcus Adeyemi |
| Igbo | Dr Daniel Okafor |
| Magyar | Dr Andrei Popescu |
| Nāhuatl | Dr Rosa Delgado |
| Norsk | Dr Sara Lindqvist |
| Yorùbá | Dr Marcus Adeyemi |
| ⵜⴰⵎⴰⵣⵉⵖⵜ | Dr Fatima Zahra Idrissi |
| मराठी | Dr Ravi Deshmukh |
| ລາວ | Dr Siriporn Chaiyaporn |

Özellikle Norveççe için dil sayfası tercüman gösterirken bir beslenme/diyetetik profili Norsk listeliyor. Bu, Norveççe konuşan bir hekimin mevcut olduğu sonucunu da vermez; meslek türü ayrıca önemlidir.

## 5. Kullanılabilecek yeni İngilizce metinler

Bu metinler demo sürümü için hazırlanmıştır. Veri akışına veya çalışan bir işleme ilişkin cümleler, yanlarındaki uygulama şartı sağlandıktan sonra kullanılmalıdır. Metin değişikliği, klinik işlevin doğrulamasının yerine geçmez.

### Tüm sayfalarda durum şeridi

> Service preview. Clinician profiles, appointment times and prices are examples. You cannot book a medical consultation on this website.

### Ana sayfa

**Başlık:** Healthcare starts with being understood.

**Açıklama:** Naviar Care is developing a service to help people prepare for a medical appointment and explain their needs in a language they understand. Explore an example journey and see how language support could work.

**Ana eylem:** Explore an example journey  
**İkinci eylem:** See how language support works

17 hekim, 15 yakında, on dakika, 24/7 ve 113 dil sayıları pazarlama kanıtı olarak kullanılmamalı. Tasarım değerlendirmesi için tutulacaklarsa “Example catalogue” alanında bulunmalı.

### Belirti sayfası: demo için önerilen değişiklik

**Başlık:** See how to prepare for an appointment.

**Açıklama:** Explore a sample journey for organising concerns and questions before a medical appointment. This preview does not assess symptoms or tell you how urgently you need care.

**Eylem:** Open the sample journey

**Uygulama şartı:** Serbest gerçek belirti girdisiyle klinik sonuç üretmek yerine önceden yazılmış örnek senaryo kullanılmalı. Örnek akışta isim, sağlık geçmişi veya kişisel belirti istenmemeli. “İki dakikada aciliyet” sonucu ve otomatik uzman sıralaması bu sürümde çalışmamalı.

Gerçek bir hazırlık notu aracı ileride eklenirse kullanıcının kendi yazdıklarını düzenlemesi, önizlemesi ve silmesi sağlanmalı; içerik klinik çıkarımlarla kendiliğinden zenginleştirilmemeli. “Yalnızca bu cihazda” ifadesi ancak depolama ve ağ davranışı doğrulandığında yayımlanmalı.

### Doktor listesi

**Başlık:** Explore example clinician profiles.

**Açıklama:** These profiles demonstrate how a future clinician directory could work. The people, fees and appointment times shown are sample data. No consultation is available to book here.

**Kart etiketleri:** Example profile · Example fee · Sample appointment time  
**Eylem:** Preview this example

**Gelecekteki gerçek ülke seçimi için taslak:** Tell us where you will be during the appointment. We must confirm that the clinician and service can support patients in that location before a booking can be offered.

Bu son cümle, gerçek uygunluk kontrolü kurulmadan çalışan bir özellik gibi gösterilmemeli.

### Dil sayfası

**Başlık:** Plan care around the language you understand.

**Açıklama:** This preview shows two possible forms of language support: a clinician with verified proficiency in your preferred language, or a qualified interpreter. The language catalogue is an example and does not confirm current availability.

**Alanlar:** Website language · Preferred consultation language · Interpreter required  
**Durum:** Availability will need to be confirmed for each appointment.

“Sign language” tek bir küresel dil olarak sunulmamalı; ilgili işaret dili ve bölge açıkça belirtilmeli. Bu bir içerik tasarımı önerisidir. Helsenorge, nitelikli tercüman kullanımını ve sağlık hizmetinin tercüman ihtiyacını ele almasını açıklar; aile üyeleri varsayılan tercüman çözümü olarak kullanılmamalı. [Helsenorge: tercüman](https://www.helsenorge.no/en/health-rights-in-norway/interpreter/)

### Hekim başvurusu

**Başlık:** Explore joining Naviar Care.

**Demo açıklaması:** This is a preview of a future clinician application. Please do not enter licence documents, referee contact details or other personal information here.

**Gelecekteki gerçek formda görünürlük metni:** Only fields marked “Public profile” may be published after verification and your review. Your contact details, referee details, insurance information and verification documents are private application information.

**Ülke metni:** Eligibility depends on the locations involved, the proposed service and the applicable professional requirements. We will assess this before enabling patient appointments. An appointment described as a second opinion is not automatically available across borders.

Son iki metin, gerçek erişim ve doğrulama süreçleriyle eşleştirilmeli. “3–5 iş günü” ve partner tesise bağlama vaadi, doğrulanmış kapasite ve sözleşme olmadan kaldırılmalı.

### About ve sık sorular

**Başlık:** A clearer path to care, built around understanding.

**Açıklama:** Naviar Care is a service concept for people who want to explain their health concerns in a language they understand. We are exploring appointment preparation, clinician access and qualified language support. This website is a demonstration, and it does not provide medical consultations.

**Can I book a doctor here?** No. The profiles and appointment times are examples. No real medical appointment is created.

**Can I get a prescription, referral or sick note?** No. This demonstration does not provide consultations or issue medical documents.

**Does this preview assess my symptoms?** No. The proposed preview uses an example journey. It should not be used to decide whether symptoms can wait or which specialist you need.

Bu yanıt, klinik değerlendirme yapan mevcut demo işlevi gerçekten devreden çıkarıldıktan sonra kullanılmalıdır.

**İletişim açıklaması:** Use this channel for general questions about the project. Do not send symptoms, medical documents or other health information. This website does not offer clinical support.

İletişim kanalı bağlı değilse “Send message” yerine örnek form gösterilmeli; gönderilmiş mesaj onayı verilmemeli.

### Norveç sürümünde acil yardım metni

> In Norway, call 113 for a medical emergency. If your GP is unavailable and the help cannot wait, call 116 117. Do not wait for this website to assess your symptoms.

Bu numaralar Norveç kapsamıyla gösterilmeli; dili Türkçe veya İngilizce seçmek kullanıcının ülkesini belirlemez. Diğer ülkelerin numaraları ayrıca doğrulanmalı. [Helsenorge: acil ve bekleyemeyen yardım](https://www.helsenorge.no/en/help-services-in-the-municipalities/out-of-hours-medical-service/)

## 6. Hizmet ve veri tasarımı kararları

**Hastanın yolu:** hizmetin açık olup olmadığını öğrenme; hizmet ülkesi ve uygunluk; görüşme dili ve tercüman ihtiyacı; doğrulanmış meslek/uzmanlık; fiyat ve koşullar; görüşmeye hazırlık; klinik görüşme; anlaşılır takip. Klinik aciliyet değerlendirmesi ayrı doğrulanmış süreçtir.

**Hekimin yolu:** özel başvuru; meslek/kimlik/lisans/uzmanlık doğrulaması; dil yeterliği; ülke ve hizmet kapsamı; sigorta; gerektiğinde tesis ilişkisi; referans süreci; sözleşme; incelenmiş profil; çalışma saatleri; takip sorumluluğu. Referans kişilerine bu çalışma sırasında mesaj gönderilmedi.

**Tercümanın yolu:** nitelik doğrulaması; dil ve bölgesel kapsam; gizlilik; uygunluk ve yedek kapasite; görüşme hazırlığı; bağlantı sorunu ve gelmeme halinde devralma. Bir dilin katalogda bulunması, tercümanın o anda hazır olduğu anlamına gelmez.

**Kamusal / özel alan ayrımı:** yayın profili için ayrı izinli alan listesi kullanılmalı. Başvuru e-postaları, referans telefonları, belgeler ve hasta kayıtları bu profille aynı veri nesnesinden serbestçe yayımlanmamalı.

**Veri açıklaması:** formun yerelde hesaplama yapması tek başına bütün veri akışını açıklamaz. URL parametreleri, analitik, hata kayıtları, üçüncü taraf betikleri, kalıcı depolama, dışa aktarma, ödeme ve rezervasyon geçişi ayrı incelenmeli. Gerekli kayıtlar, amaçlar, hukuki dayanaklar ve yüksek risk/DPIA ihtiyacı belirlenmeli. Bir DPIA yapılması, diğer hukuki gerekliliklerin yerine geçmez. [Datatilsynet: DPIA rehberi](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/)

**Sınır ötesi hizmet:** “Medical licensing follows the patient, not the doctor” bütün ülkeler için yeterli bir kural değildir. GMC rehberi, sınır ötesi uzaktan hizmette profesyonelin bulunduğu ülke, hastanın bulunduğu ülke ve ilacın verileceği ülkedeki kayıt gereklilikleri ile sigorta kapsamının kontrolünü belirtir. Bu Birleşik Krallık rehberidir; küresel hukuki uygunluk tespiti yerine kullanılamaz. NAVIAR için çıkarımımız, ülke/meslek/hizmet matrisi doğrulanmadan “herkese ikinci görüş” vaadinin yayımlanmamasıdır. Türkiye’de tesis zorunluluğu iddiası bu raporda ayrıca doğrulanmadı. [GMC: uzaktan reçeteleme ilkeleri](https://www.gmc-uk.org/professional-standards/learning-materials/remote-prescribing-high-level-principles)

## 7. Görsel ve kullanım tasarımı

Ekran görüntüsü bulunmadığından mevcut renk, boşluk, kontrast veya mobil kalite hakkında puan verilmedi. Önerilen bilgi hiyerarşisi: görünür hizmet durumu, tek ana değer önerisi, bir ana eylem, açık süreç, dil desteği ve gerçek hizmet sınırları.

113 dil ve 28 hizmet alanı ana ekranın tamamını kaplayan seçim blokları yerine aranabilir alanlarla sunulmalı. Bir soru ekranında bir ana karar olmalı. Acil yardım bağlantısı her aşamada ulaşılabilir kalmalı. Her dilde gerçek içerik kapsamı ve gerektiğinde geri dönüş dili açıklanmalı. Arapça için yazı yönü, etiketlerin programatik ilişkisi, hata mesajları, odak sırası ve büyütme testleri gerekir. Bunlar henüz yapılmış testler değildir.

Marka başlıklarında NAVIAR CARE 2 proje adı korunur; tüketiciye gösterilecek Naviar Care markası ayrıca kararlaştırılabilir. Arşiv numaraları geliştirici metadata ve proje belgelerinde tutulur; hasta akışına gereksiz teknik alan olarak eklenmez.

## 8. Aşama ve karar kaydı

| Kayıt | Aşama | Karar / bulgu | Durum |
| --- | --- | --- | --- |
| REV-DEC-001 | Discover | Yedi farklı URL, eşleşme doğrulanmadan ayrı referans olarak korundu | Uygulandı |
| REV-DEC-002 | Discover | Dört ek dosyanın üç farklı içeriğe karşılık geldiği; diller dosyasının ikinci kopyasının aynı olduğu doğrulandı | Uygulandı; kopya silinmedi |
| REV-DEC-003 | Discover | About beyanıyla orijinal sunumun demo ve hekim verilerinin örnek olduğu kaydedildi | Kaynak metinle doğrulandı; çalışma davranışı test edilmedi |
| REV-DEC-004 | Define | Küresel demo vizyonu ile önceki Norveç pilot önerisi birbirinden ayrıldı | Kapsam kararı bekliyor |
| REV-DEC-005 | Design | Tüm sayfalar için tutarlı demo metinleri ve klinik sonuç üretmeyen örnek akış önerildi | Metin hazır; siteye uygulanmadı |
| REV-DEC-006 | Validate | Klinik amaç, veri akışı, ülke yetkileri ve dil yeterliği doğrulanmadan gerçek hizmet iddiası kullanılmaması önerildi | Açık |
| REV-DEC-007 | Build | API/profil alan ayrımı, erişim kontrolleri, tercüman/kapasite verisi ve kayıt paylaşımı tasarlanacak | Kaynak kodu erişimi bekliyor |

## 9. Uygulama ve doğrulama sırası

1. Doğru kaynak repository ve deployment kimliğini yetkili erişimle eşleştir; canlı sürümün hangisi olduğunu belirle.
2. F-001, F-002, F-005 ve F-013’ü birlikte uygula: demo durumu, gerçek belirtiyle karar vermeyen örnek akış, özel başvuru alanları ve doğru eylem metinleri.
3. Klinik sorumlu ve uygun uzmanlarla F-003/F-004’ü ele al; gerçek hizmet kapsamını belirle. Yeni klinik aciliyet algoritması bu incelemede yazılmadı.
4. Dil, meslek ve hekim veri modelini tek kaynaktan besle; 12 farkı çöz; tutarlı ülke ve ücret bilgisi oluştur.
5. Ağ/mahremiyet incelemesi ve görev temelli kullanıcı testlerini yap; masaüstü, mobil, klavye ve dil yönlerini doğrula.
6. Gerçek hekim/tercüman/ödeme/video/kayıt süreçleri doğrulandığında ayrı bir klinik pilot kararı ver.

**Bu turda doğrulananlar:** ek dosyalar okundu; iki dil dosyasının SHA-256 özeti eşit; 42/17 ve 113/44/69 metin sayımları tutarlı; 12 dil eşleşmesi farkı çıkarıldı; mevcut proje kimliği korundu; yedi deployment için yetki engeli kaydedildi.

**Bu turda doğrulanamayanlar:** gerçek hekim kimliği ve yetkisi, fiyat ve kapasite, ülke bazlı uygunluk, gerçek dil yetkinliği, klinik algoritma, ağ trafiği, ödeme ve randevu davranışı, görsel/mobil/erişilebilirlik ve Vercel’e yayın. Bu belgenin oluşması, bu kontrollerin geçtiği anlamına gelmez.

## 10. Mesajla verilen kaynaklardan seçilmiş alıntılar

Bu bölüm, kullanıcı mesajlarındaki bulgulara dayanak olan ifadeleri olduğu gibi korur; tam sayfa HTML veya eksiksiz metin yedeği değildir.

**SRC-004 / triage.html:**

> Answer a few questions in your own words. In about two minutes you will know which specialist fits and how quickly you should be seen.

> Your answers are worked out in your browser. Nothing is sent anywhere until you choose to book a consultation.

**SRC-005 / join.html:**

> Everything here appears on your public profile except your licence details, which we verify privately.

> Patients elsewhere can still reach you — those sessions are second opinions rather than consultations, and we label them that way.

> Medical licensing follows the patient, not the doctor. You can consult with patients anywhere in the world, but you may only diagnose and prescribe where you hold a licence.

**SRC-006 / about.html:**

> This site is a working demonstration of the Naviar Care service. The clinician roster and availability shown are sample data, and no real consultation is booked.

> It is a routing tool. It reads your description and works out which specialty treats it and how soon you should be seen. It does not diagnose, it does not rule anything out, and it is not a substitute for examination.

> Please do not send medical details here. For anything clinical, start a consultation instead — that channel is confidential and reaches a doctor.

## 11. Bağlantı dizini

URL-001 ilk gönderimde tekrarlandı; URL-007 ikinci kez de gönderildi. Aşağıdaki liste, yedi farklı deployment referansını içerir. Daha sonra verilen alt sayfa bağlantıları aynı URL-007 alanına aittir; yeni deployment sayılmadı.

| Referans | Bağlantı |
| --- | --- |
| URL-001 | https://beta-art-intelligence-platform-nm0asuxfy.vercel.app/ |
| URL-002 | https://beta-art-intelligence-platform-iwki7au6b.vercel.app/ |
| URL-003 | https://beta-art-intelligence-platform-q0ji4exdc.vercel.app/ |
| URL-004 | https://beta-art-intelligence-platform-r4n0kdbhq.vercel.app/ |
| URL-005 | https://beta-art-intelligence-platform-731x2e9ln.vercel.app/ |
| URL-006 | https://beta-art-intelligence-platform-lxwdy9clh.vercel.app/ |
| URL-007 | https://beta-art-intelligence-platform-kliduwohq.vercel.app/ |

Sonradan sağlanan içerikler URL-007 hakkında metin incelemesine imkân vermiştir. Diğer altı deployment’ın aynı içeriği taşıdığı varsayılmamıştır.
