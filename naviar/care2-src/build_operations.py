from pathlib import Path
from html import escape as e
import json
import build_content as B
ROOT=Path(__file__).parent
OUT=ROOT/'dist'
LABELS={
'bookingTitle':['Prøv en reservasjon.','Try a reservation.','Rezervasyon akışını deneyin.'],
'bookingLead':['Velg en testtid, se bekreftelsen og prøv å flytte eller avbestille. Dette oppretter ingen helsetime.','Choose a test time, see the confirmation, then try changing or cancelling. This does not create a medical appointment.','Bir test saati seçin, onayı görün, ardından değiştirmeyi veya iptal etmeyi deneyin. Bu işlem gerçek sağlık randevusu oluşturmaz.'],
'bookingNav':['Testbestilling','Test booking','Test rezervasyonu'],
'adminNav':['Driftsoversikt','Operations','Yönetim'],
'loading':['Laster …','Loading…','Yükleniyor…'],
'selectionTitle':['Valgt testtid','Selected test time','Seçilen test saati'],
'chooseFirst':['Velg en tid for å se oppsummeringen.','Choose a time to see your summary.','Özeti görmek için bir saat seçin.'],
'ackNeeded':['Bekreft at du forstår testmodus for å lagre.','Acknowledge test mode to save your reservation.','Kaydetmek için test modunu anladığınızı onaylayın.'],
'readyToSave':['Klar til å lagre en test. Ingen kortbelastning.','Ready to save a test. No card charge.','Test kaydedilmeye hazır. Karttan ödeme alınmaz.'],
'calendar':['01 / Velg en testtid','01 / Choose a test time','01 / Test saati seçin'],
'chooseDay':['Velg testdag','Choose a test day','Test günü seçin'],
'chooseTime':['Velg tidspunkt','Choose a time','Saat seçin'],
'studioNav':['Prøv et kort eksempel','Try a quick example','Kısa örneği deneyin'],
'studioHelp':['Vil du utforske flyten uten å lagre en testreservasjon?','Want to explore the flow without saving a test reservation?','Test rezervasyonu kaydetmeden akışı keşfetmek ister misiniz?'],
'calendarHelp':['Alle tider vises i norsk tid (Europe/Oslo). Hver test varer i 20 minutter. Tidene er tekniske eksempler, ikke legens kalender.','All times use Norwegian time (Europe/Oslo). Each test lasts 20 minutes. These are technical examples, not a clinician’s calendar.','Tüm saatler Norveç saatidir (Europe/Oslo). Her test 20 dakikadır. Saatler teknik örnektir; bir hekimin takvimi değildir.'],
'ack':['Jeg forstår at dette er en test og ingen helsetime.','I understand this is a test, not a medical appointment.','Bunun gerçek sağlık randevusu olmadığını, test olduğunu anlıyorum.'],
'reserve':['Lagre testreservasjon','Save test reservation','Test rezervasyonunu kaydet'],
'emptySlots':['Ingen testtider er lagt ut. Eieren kan opprette dem i driftsoversikten.','No test times have been published. The owner can create them in Operations.','Henüz test saati oluşturulmadı. Site sahibi Yönetim bölümünden oluşturabilir.'],
'myBookings':['02 / Dine testreservasjoner','02 / Your test reservations','02 / Test rezervasyonlarınız'],
'none':['Du har ingen testreservasjoner ennå.','You have no test reservations yet.','Henüz test rezervasyonunuz yok.'],
'cancel':['Avbestill test','Cancel test','Testi iptal et'],
'reschedule':['Flytt til valgt testtid','Move to the selected test time','Seçili test saatine taşı'],
'ics':['Legg testen i kalenderen','Add test to calendar','Testi takvime ekle'],
'active':['Aktiv testreservasjon','Active test reservation','Aktif test rezervasyonu'],
'cancelled':['Avbestilt test','Cancelled test','İptal edilmiş test'],
'confirmed':['Testreservasjonen er lagret. Ingen helsetime er opprettet.','Test reservation saved. No medical appointment was created.','Test rezervasyonu kaydedildi. Gerçek sağlık randevusu oluşturulmadı.'],
'updated':['Testreservasjonen er oppdatert.','Test reservation updated.','Test rezervasyonu güncellendi.'],
'paymentTitle':['Prøv betalingsflyten','Try the payment flow','Ödeme akışını deneyin'],
'paymentHelp':['100 NOK er kun et teknisk testbeløp. Det er ingen behandlingspris. Simuleringen belaster ikke kort.','100 NOK is a technical test amount only. It is not a consultation price. The simulation does not charge a card.','100 NOK yalnızca teknik test tutarıdır. Muayene ücreti değildir. Simülasyonda karttan para çekilmez.'],
'simulateSuccess':['Simuler godkjent betaling','Simulate successful payment','Başarılı ödemeyi simüle et'],
'simulateFailure':['Simuler avvist betaling','Simulate failed payment','Başarısız ödemeyi simüle et'],
'stripeTest':['Åpne Stripe-test','Open Stripe test','Stripe testini aç'],
'nonePayment':['Ingen betaling','No payment','Ödeme yok'],
'simulated_success':['Simulert godkjent — ingen belastning','Simulated success — no charge','Başarı simülasyonu — tahsilat yok'],
'simulated_failure':['Simulert avvist — ingen belastning','Simulated failure — no charge','Başarısızlık simülasyonu — tahsilat yok'],
'stripe_test_pending':['Stripe-test venter på bekreftelse','Stripe test awaiting confirmation','Stripe testi onay bekliyor'],
'stripe_test_paid':['Stripe-test bekreftet — ingen ekte penger','Stripe test confirmed — no real money','Stripe testi onaylandı — gerçek para yok'],
'test_refund_review':['Avbestilt Stripe-test: refusjon må vurderes','Cancelled Stripe test: refund review needed','İptal edilmiş Stripe testi: iade incelemesi gerekli'],
'paymentMissing':['Stripe er ikke tilkoblet. Du kan prøve simuleringen.','Stripe is not connected. You can try the simulation.','Stripe bağlı değil. Simülasyonu deneyebilirsiniz.'],
'mailTitle':['03 / Bekreftelser på e-post','03 / Email confirmations','03 / E-posta onayları'],
'mailHelp':['Se e-postutkast for hver test. Ingen e-post sendes automatisk.','Preview the emails for each test. No email is sent automatically.','Her test için e-posta taslaklarını inceleyin. Otomatik e-posta gönderilmez.'],
'preview':['Se e-postutkast','Preview email','E-posta taslağını göster'],
'sendTest':['Send test til min bekreftede e-post','Send test to my verified email','Doğrulanmış adresime test gönder'],
'close':['Lukk','Close','Kapat'],
'confirmation':['Bekreftelse','Confirmation','Onay'],
'rescheduled':['Endret testtid','Changed test time','Değişen test saati'],
'previewState':['Utkast — ikke sendt','Draft — not sent','Taslak — gönderilmedi'],
'sent':['Sendt til testmottaker','Sent to test recipient','Test alıcısına gönderildi'],
'failed':['Sending feilet','Sending failed','Gönderim başarısız'],
'sending':['Sending pågår','Sending in progress','Gönderiliyor'],
'delete':['Slett mine testreservasjoner og e-postutkast','Delete my test reservations and email drafts','Test rezervasyonlarımı ve e-posta taslaklarımı sil'],
'deleteConfirm':['Slette dine testreservasjoner og utkast? Handlingen kan ikke angres.','Delete your test reservations and drafts? This cannot be undone.','Test rezervasyonlarınız ve taslaklarınız silinsin mi? Bu işlem geri alınamaz.'],
'signIn':['Logg inn for å prøve','Sign in to try it','Denemek için giriş yapın'],
'consentTitle':['Vil du hjelpe oss å forbedre siden?','Would you like to help improve this site?','Bu siteyi geliştirmemize yardımcı olur musunuz?'],
'consentBody':['Med ditt valg kan vi telle besøk og engasjement på forsiden, om-siden og språksiden. Vi måler ikke søk, profiler, forberedelser eller bestillinger. Valget er frivillig og kan endres nederst på siden.','With your permission, we can count visits and engagement on the home, about and language pages. We do not measure searches, profiles, preparation or bookings. Your choice is optional and can be changed in the footer.','İzninizle ana sayfa, hakkında ve diller sayfalarındaki ziyaret ve etkileşimi sayabiliriz. Aramaları, profilleri, hazırlıkları veya rezervasyonları ölçmeyiz. İzin isteğe bağlıdır; sayfanın altından değiştirebilirsiniz.'],
'accept':['Tillat måling','Allow measurement','Ölçüme izin ver'],
'reject':['Ikke tillat måling','Decline measurement','Ölçüme izin verme'],
'preferences':['Endre målevalg','Measurement preferences','Ölçüm tercihini değiştir'],
'consentSaved':['Valget er lagret.','Your choice is saved.','Tercihiniz kaydedildi.'],
'insightTitle':['En tydelig driftsoversikt.','A clear view of operations.','İşleyişi açıkça görün.'],
'insightLead':['Kun for eieren. Se testaktivitet, kontroller oppsettet og opprett testtider. Ingen reelle pasientdata vises.','For the owner only. Review test activity, check the setup and create test times. No real patient data is shown.','Yalnızca site sahibi için. Test hareketlerini inceleyin, bağlantıları kontrol edin ve test saatleri oluşturun. Gerçek hasta verisi gösterilmez.'],
'seed':['Opprett testtider for de neste 14 dagene','Create test times for the next 14 days','Önümüzdeki 14 gün için test saati oluştur'],
'seeded':['Testtidene er klare. Gå til testbestilling.','Test times are ready. Go to Test booking.','Test saatleri hazır. Test rezervasyonu bölümüne gidin.'],
'refresh':['Oppdater oversikten','Refresh overview','Görünümü yenile'],
'opsTitle':['Testaktivitet','Test activity','Test hareketleri'],
'metricsTitle':['Innhold med frivillig måling','Content with optional measurement','İzin verilen içerik ölçümü'],
'metricsHelp':['Tallene gjelder bare besøk som tillater måling. Et engasjement betyr minst 20 synlige sekunder og 25 % rulling, eller en kort side. Det viser ikke at innholdet er lest eller forstått. Testbesøk er ikke grunnlag for å forutsi etterspørsel.','Counts cover visits that allow measurement. Engagement means at least 20 visible seconds plus 25% scrolling, or a short page. It does not prove reading or understanding. Test visits cannot establish real demand.','Sayılar yalnızca ölçüme izin veren ziyaretleri kapsar. Etkileşim, en az 20 saniye görünür süre ve %25 kaydırma veya kısa bir sayfa anlamına gelir. Okunduğunu ya da anlaşıldığını kanıtlamaz. Test ziyaretleri gerçek talep tahmini için kullanılamaz.'],
'noMetrics':['Ingen målinger ennå. Avslag på måling hindrer ikke bruk av siden.','No measurements yet. Declining measurement does not prevent using the site.','Henüz ölçüm yok. Ölçümü reddetmek sitenin kullanımını engellemez.'],
'day':['Dato (UTC)','Date (UTC)','Tarih (UTC)'],
'page':['Side','Page','Sayfa'],
'language':['Språk','Language','Dil'],
'views':['Sidevisninger','Page views','Sayfa görüntüleme'],
'engaged':['Engasjementsignal','Engagement signal','Etkileşim sinyali'],
'home':['Forside','Home','Ana sayfa'],
'about':['Om tjenesten','About','Hakkında'],
'languages':['Språk','Languages','Diller'],
'forecastTitle':['Hva kan vi lære videre?','What can we learn next?','Sonraki adımda ne öğrenebiliriz?'],
'forecastHelp':['Ingen prognose ennå. Alle data er tester. En enkel prognosemodul er klargjort for ukentlige innholdstall, men krever minst åtte komplette uker med egnet produksjonsdata og kontroll mot en testperiode. Den vurderer aldri en persons helsebehov.','No forecast yet. All data is from tests. A simple forecasting module is prepared for weekly content counts, but requires at least eight complete weeks of suitable production data and a holdout check. It never assesses a person’s health needs.','Henüz tahmin yok. Tüm veriler testlerden oluşuyor. Haftalık içerik sayıları için basit bir tahmin modülü hazırlandı; en az sekiz tam haftalık uygun gerçek veri ve ayrılmış dönem kontrolü gerekiyor. Kişinin sağlık ihtiyacını değerlendirmez.'],
'setupTitle':['Tilkoblinger og status','Connections and status','Bağlantılar ve durum'],
'storageReady':['Testreservasjoner: varig lagring','Test reservations: persistent storage','Test rezervasyonları: kalıcı kayıt'],
'emailPreview':['E-post: utkast, avsender er ikke aktivert','Email: drafts, sender not enabled','E-posta: taslak, gönderici etkin değil'],
'emailEnabled':['E-post: sending til godkjent testmottaker aktivert','Email: approved test recipient enabled','E-posta: onaylı test alıcısına gönderim etkin'],
'stripeReady':['Stripe: kun testmodus','Stripe: test mode only','Stripe: yalnızca test modu'],
'errors':{
'generic':['Tjenesten er midlertidig utilgjengelig. Prøv igjen. Valget ditt er beholdt.','The service is temporarily unavailable. Try again. Your selection is kept.','Hizmete şu anda ulaşılamıyor. Tekrar deneyin. Seçiminiz korundu.'],
'sign_in_required':['Logg inn for å bruke testreservasjoner.','Sign in to use test reservations.','Test rezervasyonları için giriş yapın.'],
'forbidden':['Denne oversikten er bare tilgjengelig for eieren.','This overview is available only to the owner.','Bu görünüm yalnızca site sahibine açıktır.'],
'slot_unavailable':['Tiden er ikke lenger ledig. Velg en annen tid.','That time is no longer available. Choose another time.','Bu saat artık uygun değil. Başka bir saat seçin.'],
'booking_limit':['Du kan ha maksimalt tre aktive testreservasjoner. Avbestill en for å fortsette.','You can have up to three active test reservations. Cancel one to continue.','En fazla üç aktif test rezervasyonunuz olabilir. Devam etmek için birini iptal edin.'],
'payment_not_configured':['Stripe-test er ikke konfigurert. Bruk simuleringen.','Stripe test is not configured. Use the simulation.','Stripe testi yapılandırılmadı. Simülasyonu kullanın.'],
'email_not_configured':['E-postsending er ikke aktivert. Utkastet er lagret.','Email sending is not enabled. The draft is saved.','E-posta gönderimi etkin değil. Taslak kaydedildi.'],
'booking_changed':['Reservasjonen er endret. Oppdater siden før du prøver igjen.','The reservation changed. Refresh the page before trying again.','Rezervasyon değişti. Yeniden denemeden önce sayfayı yenileyin.'],
'payment_in_progress':['Betalingstesten pågår. Oppdater status før du endrer tiden.','A payment test is in progress. Refresh its status before changing the time.','Ödeme testi sürüyor. Saati değiştirmeden önce durumu yenileyin.'],
'consent_unavailable':['Målevalget kunne ikke lagres. Ingen måling starter.','Your measurement choice could not be saved. Measurement will not start.','Ölçüm tercihi kaydedilemedi. Ölçüm başlamayacak.'],
'booking_inactive':['Denne testen er avbestilt. Velg en ny tid.','This test has been cancelled. Choose a new time.','Bu test iptal edildi. Yeni bir saat seçin.']}
}
for lang in B.LANGS:
 i=['nb','en','tr'].index(lang);B.I=i
 L={k:({kk:vv[i] for kk,vv in v.items()} if isinstance(v,dict) else v[i]) for k,v in LABELS.items()}
 def text(k):return e(L[k])
 for page in ['booking','insights']:
  if page=='booking':
   title=L['bookingTitle'];body=B.page_title('NAVIAR CARE 2 / TEST',title,L['bookingLead'])+f'''<div class="wrap operations-wrap"><p class="op-feedback" id="op-feedback" role="status" aria-live="polite">{text('loading')}</p><div class="operations-grid"><section class="op-panel"><h2>{text('calendar')}</h2><p>{text('calendarHelp')}</p><div id="slot-list" class="slot-list"></div><section class="booking-review" aria-labelledby="selection-title"><h3 id="selection-title">{text("selectionTitle")}</h3><p id="selected-time" role="status" aria-live="polite">{text("chooseFirst")}</p><p class="quiet">{B.t("20 minutter · Testreservasjon", "20 minutes · Test reservation", "20 dakika · Test rezervasyonu")}</p></section><label class="op-check"><input id="test-ack" type="checkbox">{text('ack')}</label><p class="quiet reserve-help" id="reserve-help">{text("chooseFirst")}</p><button id="reserve-test" class="button primary" aria-describedby="reserve-help" disabled>{text('reserve')}</button></section><aside class="op-panel op-side"><span class="eyebrow">NAVIAR CARE 2</span><h2>{text('paymentTitle')}</h2><p>{text('paymentHelp')}</p><p id="payment-setup" class="quiet">{text('paymentMissing')}</p><a class="text-link" href="{B.path(lang,'privacy')}">{B.t('Les om testdata','Read about test data','Test verilerini öğrenin')}</a><a id="admin-link" hidden href="{B.path(lang,'insights')}" class="text-link">{text('adminNav')}</a><div class="demo-crosslink"><p>{text('studioHelp')}</p><a href="/studio-demo/?lang={lang}" class="text-link">{text('studioNav')}</a></div></aside></div><section class="op-section"><h2>{text('myBookings')}</h2><div id="booking-list" class="booking-list"></div></section><section class="op-section"><h2>{text('mailTitle')}</h2><p>{text('mailHelp')}</p><div id="email-list" class="email-list"></div></section><div class="op-delete"><button id="delete-test-data" class="text-link">{text('delete')}</button></div>{B.urgent()}</div><dialog id="email-dialog" aria-labelledby="email-subject"><button id="email-close" class="button secondary">{text('close')}</button><h2 id="email-subject"></h2><p id="email-body" class="email-body"></p></dialog>'''
  else:
   title=L['insightTitle'];body=B.page_title('NAVIAR CARE 2 / OWNER',title,L['insightLead'])+f'''<div class="wrap operations-wrap"><p class="op-feedback" id="op-feedback" role="status" aria-live="polite">{text('loading')}</p><div id="owner-tools" hidden><div class="hero-actions"><button id="seed-calendar" class="button primary">{text('seed')}</button><button id="refresh-insights" class="button secondary">{text('refresh')}</button><a class="text-link" href="{B.path(lang,'booking')}">{text('bookingNav')}</a></div><div class="operations-grid"><section class="op-panel"><h2>{text('opsTitle')}</h2><div id="operations-summary"></div></section><section class="op-panel op-side"><h2>{text('setupTitle')}</h2><ul id="integration-status"></ul></section></div><section class="op-section"><h2>{text('metricsTitle')}</h2><p>{text('metricsHelp')}</p><div id="metrics-table" class="table-scroll"></div></section><section class="op-panel forecast-panel"><h2>{text('forecastTitle')}</h2><p>{text('forecastHelp')}</p></section></div></div>'''
  cfg=json.dumps(B.config(lang),ensure_ascii=False).replace('<','\\u003c')
  alt=''.join(f'<link rel="alternate" hreflang="{ll}" href="{B.path(ll,page)}">' for ll in B.LANGS)
  doc=f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#123d36"><meta name="description" content="{e(L['bookingLead'],quote=True)}"><title>{e(title)} — NAVIAR CARE 2</title><link rel="icon" href="/assets/logo.svg" type="image/svg+xml"><link rel="stylesheet" href="/styles.css">{alt}</head><body data-page="{page}">{B.header(lang,page)}<main id="main">{body}</main>{B.footer(lang)}<script id="ui-config" type="application/json">{cfg}</script><script id="sample-catalog" type="application/json">{{}}</script><script src="/model.js" defer></script><script src="/site.js" defer></script></body></html>'''
  p=OUT/B.path(lang,page).lstrip('/')/'index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(doc)
 # Replace the old privacy page's inaccurate no-storage statement, keeping clinical scope explicit.
 pp=OUT/B.path(lang,'privacy').lstrip('/');raw=pp.read_text();start=raw.index('<main id="main">');end=raw.index('</main>',start)
 items=[
 (B.t('Dette lagres i testen','What this test stores','Bu testte kaydedilenler'),B.t('Vi lagrer testtid, språk, reservasjonsstatus og en teknisk konto-ID, slik at du kan finne og endre egne testreservasjoner. Ingen symptomer, journaler eller personnummer etterspørres.','We store the test time, language, reservation status and a technical account ID so that you can find and change your own test reservations. We do not ask for symptoms, medical records or national identity numbers.','Test saati, dil, rezervasyon durumu ve teknik hesap kimliği kaydedilir. Böylece kendi test rezervasyonlarınızı bulabilir ve değiştirebilirsiniz. Belirti, hasta dosyası veya ulusal kimlik numarası istenmez.')),
 (B.t('E-post og betaling','Email and payment','E-posta ve ödeme'),B.t('Bekreftelser lagres som utkast. Sending krever aktivert avsender og godkjent testmottaker. Betalingssimuleringen belaster ikke kort. Stripe-tilkoblingen godtar bare testnøkler. 100 NOK er et teknisk testbeløp, ikke behandlingspris.','Confirmations are stored as drafts. Sending requires an enabled sender and an approved test recipient. Payment simulation does not charge a card. The Stripe adapter accepts test keys only. 100 NOK is a technical test amount, not a consultation price.','Onaylar taslak olarak saklanır. Gönderim için etkin gönderici ve onaylı test alıcısı gerekir. Ödeme simülasyonu karttan para çekmez. Stripe bağlantısı yalnızca test anahtarlarını kabul eder. 100 NOK teknik test tutarıdır; muayene ücreti değildir.')),
 (L['consentTitle'],L['consentBody']+' '+B.t('En nødvendig preferansekapsel lagrer valget i inntil 180 dager. Den inneholder ingen nettleserhistorikk. Vi lagrer en kvittering for valget og bruker ikke reklamesporing eller opptak av økten.','A necessary preference cookie stores your choice for up to 180 days. It contains no browsing history. We keep a record of the choice and use no advertising tracking or session recording.','Gerekli tercih çerezi seçiminizi en fazla 180 gün saklar. Tarama geçmişi içermez. Tercih kaydı tutulur; reklam takibi ve oturum kaydı yapılmaz.')),
 (B.t('Forberedelse og søk','Preparation and search','Hazırlık ve arama'),B.t('Eksempelvalg ligger etter # i adressen. Filtrering av eksempelprofiler skjer i nettleseren. Disse valgene sendes ikke til målesystemet. Ikke legg personopplysninger i adressen.','Example choices are kept after # in the address. Sample-profile filtering runs in your browser. These choices are not sent to the measurement system. Do not put personal information in the address.','Örnek seçimler adresin # bölümünde tutulur. Örnek profil filtreleme tarayıcıda yapılır. Bu seçimler ölçüm sistemine gönderilmez. Adrese kişisel bilgi eklemeyin.')),
 (B.t('Tilgang og sletting','Access and deletion','Erişim ve silme'),B.t('Testreservasjoner er bare synlige for kontoen som opprettet dem. Eieren ser summer i driftsoversikten. Du kan slette egne testreservasjoner og utkast fra testsiden. Testreservasjoner og betalingshendelser slettes etter 30 dager, aggregerte målinger etter 90 dager og målevalg etter 180 dager. Opprydding utføres ved åpning av driftsoversikten og opprettelse av testtider. Opplysninger kan derfor ligge lenger dersom disse handlingene ikke utføres.','Test reservations are visible only to the account that created them. The owner sees totals in Operations. You can delete your test reservations and drafts from the test page. Test reservations and payment events expire after 30 days, aggregate measurements after 90 days and measurement choices after 180 days. Cleanup runs when Operations is opened or test times are created. Data may remain longer if those actions do not run.','Test rezervasyonlarını yalnızca oluşturan hesap görür. Site sahibi Yönetim bölümünde toplamları görür. Test sayfasından kendi rezervasyonlarınızı ve taslaklarınızı silebilirsiniz. Test rezervasyonları ve ödeme olayları 30 gün, toplu ölçümler 90 gün, ölçüm tercihleri 180 gün sonra temizlenir. Temizlik Yönetim açıldığında veya test saatleri oluşturulduğunda çalışır. Bu işlemler yapılmazsa kayıtlar daha uzun kalabilir.')),
 (B.t('Drift og tjenestestatus','Operation and service status','İşletim ve hizmet durumu'),B.t('Dette er en privat test av en planlagt tjeneste. Hosting og innlogging kan behandle tekniske tilgangsdata. Helseforetak, behandlingsansvarlig, kontaktpunkt, rettslig grunnlag og avtalene med leverandører må avklares før en offentlig helsetjeneste åpner. Dagens tekst er ingen erklæring om at en klinisk tjeneste er godkjent.','This is a private test of a planned service. Hosting and sign-in services may process technical access data. The healthcare provider, data controller, contact channel, legal basis and supplier agreements must be settled before a public healthcare service opens. This text does not declare that a clinical service has been approved.','Bu, planlanan hizmetin özel erişimli testidir. Barındırma ve giriş hizmetleri teknik erişim verilerini işleyebilir. Sağlık sağlayıcısı, veri sorumlusu, iletişim kanalı, hukuki dayanak ve tedarikçi sözleşmeleri halka açık sağlık hizmetinden önce netleşmelidir. Bu metin klinik hizmetin onaylandığı anlamına gelmez.')),
 (B.t('Illustrasjoner og kilder','Illustrations and sources','Görseller ve kaynaklar'),B.C[lang]['externalSources'])]
 body=B.page_title('NAVIAR CARE 2',B.t('Testen din.<br><em>Valgene dine.</em>','Your test.<br><em>Your choices.</em>','Sizin testiniz.<br><em>Sizin tercihiniz.</em>'),B.t('Her forklarer vi hva testversjonen lagrer og hvordan du styrer valgene dine.','Here is what the test version stores and how you control your choices.','Test sürümünün ne kaydettiğini ve tercihlerinizi nasıl yöneteceğinizi açıklıyoruz.'))+'<div class="wrap prose">'+''.join(f'<section><h2>{h}</h2><p>{b}</p></section>' for h,b in items)+'</div>'
 pp.write_text(raw[:start]+'<main id="main">'+body+raw[end:])
 # Add translated operations controls and measurement preferences to every localized page.
 for page in B.PAGES+['booking','insights']:
  p=OUT/B.path(lang,page).lstrip('/');p=p if str(p).endswith('.html') else p/'index.html';raw=p.read_text()
  raw=raw.replace('<nav class="nav"',f'<a class="button secondary header-booking" href="{B.path(lang,"booking")}">{text("bookingNav")}</a><nav class="nav"',1)
  marker=raw.index('</nav>',raw.index('<nav id="mobile-nav"'))
  raw=raw[:marker]+f'<a href="{B.path(lang,"booking")}">{text("bookingNav")}</a>'+raw[marker:]
  raw=raw.replace('</footer>',f'<div class="wrap consent-footer"><a href="{B.path(lang,"booking")}">{text("bookingNav")}</a><button class="text-link" id="measurement-preferences">{text("preferences")}</button></div></footer>')
  panel=f'''<section id="measurement-panel" class="measurement-panel" aria-labelledby="measurement-title" hidden><div class="wrap"><div><h2 id="measurement-title">{text('consentTitle')}</h2><p>{text('consentBody')}</p></div><div class="measurement-actions"><button id="decline-measurement" class="button secondary">{text('reject')}</button><button id="allow-measurement" class="button secondary">{text('accept')}</button></div><p id="measurement-status" role="status" aria-live="polite"></p></div></section>'''
  cfg=json.dumps(L,ensure_ascii=False).replace('<','\\u003c')
  raw=raw.replace('</body>',panel+f'<script id="operations-config" type="application/json">{cfg}</script><script src="/operations.js" defer></script></body>')
  p.write_text(raw)
(OUT/'booking.html').write_text((OUT/'booking.html').read_text().replace('/en/clinicians/','/en/booking/'))
print('Added 6 localized operations pages, translated privacy and consent controls to 27 pages.')

ORIGIN='https://naviar-care-2.andersen-betul.chatgpt.site'
for locale in B.LANGS:
 for page in B.PAGES+['booking','insights']:
  target=OUT/B.path(locale,page).lstrip('/')
  if target.is_dir(): target=target/'index.html'
  raw=target.read_text()
  canonical=ORIGIN+B.path(locale,page)
  raw=raw.replace('<meta name="referrer" content="strict-origin-when-cross-origin">','<meta name="referrer" content="no-referrer">')
  for language in B.LANGS:
   href=B.path(language,page)
   raw=raw.replace(f'hreflang="{language}" href="{href}"',f'hreflang="{language}" href="{ORIGIN+href}"')
  raw=raw.replace('</head>',f'<link rel="canonical" href="{canonical}"><link rel="alternate" hreflang="x-default" href="{ORIGIN+B.path("nb",page)}"></head>')
  target.write_text(raw)
