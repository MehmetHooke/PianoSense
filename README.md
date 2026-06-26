# PianoSense

PianoSense, piyano ogrencilerinin kisa egzersiz kayitlarini analiz ederek gelisimlerini takip etmeyi hedefleyen bir Expo/React Native uygulamasidir. Uygulama; ogrenci, ogretmen ve veli olmak uzere uc farkli rol etrafinda kurgulanmistir. Ogrenci egzersiz secip kayit alir, kaydini analize gonderir ve nota/zamanlama bazli sonucunu gorur. Ogretmen ogrencileri ve siniflari takip eder. Veli ise cocugunun son calismalarini ve genel ilerlemesini izler.

Bu repo mobil istemciyi, Firebase Functions katmanini ve Firebase guvenlik/yapilandirma dosyalarini icerir. Ses analizini gercekten yapan Cloud Run servisi bu repo icinde bulunmuyor; uygulama o servise Cloud Tasks uzerinden is gonderiyor.

## Neler Yapiyor?

- Ogrenci kaydi ve giris akisi sunar.
- Kayit sirasinda rol secimi yapilir: `student`, `teacher`, `parent`.
- Ogrencilere aktif egzersizleri Firestore'dan listeler.
- Egzersiz icin orijinal referans sesi oynatir.
- Mikrofon kaydi, geri sayim/count-in ve metronom destekli calisma akisi sunar.
- Kaydi Firebase Storage'a yukler ve analiz isi olusturur.
- Analiz durumunu `uploading -> queued -> processing -> completed/failed` olarak takip eder.
- Sonuc ekraninda genel skor, pitch skoru, timing skoru ve nota detaylarini gosterir.
- Ogrenci tarafinda analiz gecmisi ve ozet icgoru kartlari sunar.
- Ogretmen tarafinda sinif olusturma, katilim kodu uretme, ogrenci takip etme ve panel ozeti saglar.
- Veli tarafinda ogrenci kodu ile cocuk baglama ve son performanslari izleme akisi bulunur.

## Uygulama Akisi

### Ogrenci

1. Hesap olusturur veya giris yapar.
2. Pratik ekranindan aktif bir egzersiz secer.
3. Orijinal sesi dinler, metronom ile kayit alir.
4. Kaydini analize gonderir.
5. Islem ekraninda analiz durumunu canli izler.
6. Sonuc ekraninda skor kirilimini ve nota bazli geribildirimi gorur.
7. Analizler ekranindan zaman icindeki gelisimini takip eder.

### Ogretmen

- Panelde toplam sinif, ogrenci ve haftalik analiz ozetlerini gorur.
- Ogrenci kodu ile ogrenci takibi baslatir.
- Sinif olusturur ve ogrencilerle katilim kodu paylasir.
- Sinif bazli ogrenci listelerini ve ogrenci detay sayfasini acar.

### Veli

- Ogrenci kodu ile cocugunu hesabina baglar.
- Cocuk baglandiktan sonra haftalik calisma ozeti ve son analizleri gorur.
- Daha detayli genel gorunum ekranina ilerleyebilir.

## Teknik Mimari

### Mobil uygulama

- Expo 54
- React Native 0.81
- React 19
- Expo Router ile dosya tabanli yonlendirme
- `expo-audio` ile referans ses ve mikrofon kaydi
- Firebase Web SDK ile Auth, Firestore, Storage ve Functions baglantisi

### Backend ve altyapi

- Firebase Authentication: kullanici oturumu
- Cloud Firestore: kullanici profilleri, sarkilar, analiz isleri, siniflar ve iliskiler
- Firebase Storage: ogrenci kayitlari ve referans ses dosyalari
- Firebase Functions v2: analiz isi olusturma ve kuyruklama
- Google Cloud Tasks: analiz isini asenkron isleme servisine tasima
- Cloud Run: dis analiz servisi icin hedef endpoint

## Repo Yapisi

```text
app/                  Expo Router ekranlari
src/components/       UI bilesenleri
src/context/          Auth ve uygulama alert context'leri
src/services/         Firebase ve uygulama servisleri
src/types/            Paylasilan tipler
src/utils/            Sonuc ve icgoru yardimcilari
src/theme/            Tema altyapisi
functions/            Firebase Functions kaynak kodu
assets/               Uygulama ikonlari
firestore.rules       Firestore guvenlik kurallari
firebase.json         Firebase emulator/deploy ayarlari
```

## Onemli Veri Alanlari

Projeyi incelerken one cikan koleksiyonlar ve amaclari:

- `users`: rol, ad-soyad, profil resmi ve ogrenci kodu gibi temel profil verileri
- `songs`: aktif egzersizler, BPM, sure ve referans ses yolu
- `analysisJobs`: kayit yukleme ve analiz sonucu yasam dongusu
- `classes`: ogretmen siniflari ve katilim kodlari
- `teachers/{teacherId}/followedStudents`: takip edilen ogrenciler
- `parents/{parentId}/children`: veliye bagli cocuklar
- `users/{studentId}/classes`: ogrencinin katildigi siniflar

## Gereksinimler

- Node.js 20+ onerilir
- npm
- Expo CLI icin `npx expo`
- Firebase projesi
- Istege bagli olarak Firebase Emulator Suite
- Analiz akisinin tam calismasi icin ayri bir Cloud Run analiz servisi

## Kurulum

### 1. Bagimliliklari yukle

```bash
npm install
cd functions
npm install
```

### 2. Ortam degiskenlerini hazirla

Kok dizindeki `.env` dosyasinda en az su degiskenler bulunmali:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=false
```

Notlar:

- Uygulama Firebase istemci ayarlarini `src/services/firebase.ts` icinden okur.
- Emulator kullanimi sadece `__DEV__` ortaminda ve `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true` iken devreye girer.
- Mevcut kodda emulator hostlari Android emulator adresleri olan `10.0.2.2` uzerine ayarlanmistir.

### 3. Firebase Functions ortamini ayarla

`functions/src/index.ts` asagidaki sunucu tarafi degiskenlerine baglidir:

- `CLOUD_RUN_ANALYZE_URL`
- `STORAGE_BUCKET`
- `TASKS_PROJECT_ID`
- `TASKS_LOCATION`
- `TASKS_QUEUE`
- `TASKS_SERVICE_ACCOUNT`

Bu degerler olmadan analiz isini Cloud Tasks uzerinden dis servise yollayan akis tamamlanmaz.

### 4. Uygulamayi baslat

```bash
npm run start
```

Alternatif komutlar:

```bash
npm run android
npm run ios
npm run web
```

## Firebase Functions Akisi

Mobil uygulama analiz gonderirken arka planda su akisi izler:

1. `createPendingAnalysisJob` cagrilir ve Firestore'da bir analiz isi olusturulur.
2. Kayit dosyasi Firebase Storage'a yuklenir.
3. `startAnalysisJob` cagrilir.
4. Function, isi Cloud Tasks kuyruguna yazar.
5. Cloud Tasks, Cloud Run analiz endpoint'ine HTTP istegi gonderir.
6. Sonuc Firestore'daki `analysisJobs` belgesine yazildiginda mobil uygulama sonucu dinleyip ekrana tasir.

## Script'ler

### Koku dizin

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

### Functions dizini

```bash
npm run build
npm run serve
npm run deploy
npm run logs
```

## Dikkat Edilmesi Gerekenler

- Analiz motoru bu repo icinde yok; yalnizca onu tetikleyen mobil ve function katmani burada.
- Uygulamanin bazi metinlerinde Turkish karakter encoding kaynakli bozulmalar goruluyor; README bu davranisi belgelese de duzeltmez.
- Gercek cihaz ve iOS/Android ses davranislari icin `expo-audio` ayarlari kritik; kayit ekrani buna ozel olarak ayarlanmis.

## Gelistirme Icin Ozet

Bu proje, bireysel piyano calismasini olculebilir hale getirmeyi amaclayan cok rollu bir mobil uygulama. En guclu parcalari ogrenci kayit/analiz akisi, ogretmenin sinif ve ogrenci takibi, velinin ilerleme izleme deneyimi ve Firebase tabanli gercek zamanli veri akisidir.
