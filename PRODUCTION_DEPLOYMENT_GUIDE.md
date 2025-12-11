# 🚀 Play Store ve App Store Yayınlama Rehberi

Bu rehber, Yıkattır uygulamasını Play Store ve App Store'da yayınlamak için yapmanız gereken tüm adımları içerir.

---

## 📋 İçindekiler

1. [Ön Hazırlık](#ön-hazırlık)
2. [Backend Sunucu Hazırlığı](#backend-sunucu-hazırlığı)
3. [Expo EAS Build Kurulumu](#expo-eas-build-kurulumu)
4. [Android (Play Store) Yayınlama](#android-play-store-yayınlama)
5. [iOS (App Store) Yayınlama](#ios-app-store-yayınlama)
6. [Güncellemeler ve Bakım](#güncellemeler-ve-bakım)

---

## 🎯 Ön Hazırlık

### 1. Gerekli Hesaplar

- ✅ **Google Play Console** hesabı ($25 tek seferlik ücret)
- ✅ **Apple Developer Program** hesabı ($99/yıl)
- ✅ **Expo** hesabı (ücretsiz)

### 2. Uygulama Bilgileri

Aşağıdaki bilgileri hazırlayın:
- Uygulama adı: "Yıkattır" (veya tercih ettiğiniz isim)
- Paket adı: `com.yikattir.app` (Android)
- Bundle ID: `com.yikattir.app` (iOS)
- Açıklama (Türkçe ve İngilizce)
- Kategori: Otomotiv / Hizmetler
- Ekran görüntüleri (en az 2, tercihen 4-8)
- Uygulama ikonu (1024x1024 px)
- Splash screen görseli

---

## 🌐 Backend Sunucu Hazırlığı

### 1. Production Sunucu Kurulumu

Backend'inizi production ortamında çalıştırmanız gerekiyor. Seçenekler:

**Seçenek A: VPS/Cloud Sunucu (Önerilen)**
- DigitalOcean, AWS, Google Cloud, Azure
- En az 1GB RAM, 1 CPU core
- Ubuntu 20.04+ veya benzeri Linux dağıtımı

**Seçenek B: Heroku/Railway/Render**
- Daha kolay kurulum
- Otomatik deployment

### 2. Backend Production Ayarları

#### 2.1. Environment Variables

`server/.env` dosyasını production için güncelleyin:

```env
# Production Database
DATABASE_URL="postgresql://user:password@host:5432/randevu_db_prod"

# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# JWT Secret (güçlü bir değer kullanın)
JWT_SECRET="your-production-secret-key-min-32-chars"

# CORS (sadece kendi domain'inizi ekleyin)
CORS_ORIGIN=https://yourdomain.com
```

#### 2.2. SSL/HTTPS Kurulumu

**ÖNEMLİ:** Production'da HTTPS kullanmalısınız!

- Let's Encrypt (ücretsiz SSL sertifikası)
- Cloudflare (ücretsiz SSL + CDN)
- Veya hosting sağlayıcınızın SSL sertifikası

#### 2.3. Domain ve DNS

- Domain satın alın (örn: `yikattir.com`)
- Backend için subdomain oluşturun (örn: `api.yikattir.com`)
- DNS kayıtlarını yapılandırın

### 3. Frontend API URL Güncelleme

`src/config/api.js` dosyasını production URL'e güncelleyin:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.25:3001'  // Development
  : 'https://api.yikattir.com';  // Production - HTTPS kullanın!
```

---

## 📦 Expo EAS Build Kurulumu

### 1. EAS CLI Kurulumu

```bash
npm install -g eas-cli
```

### 2. Expo Hesabına Giriş

```bash
eas login
```

### 3. EAS Build Yapılandırması

Proje kök dizininde `eas.json` dosyası oluşturun:

```bash
eas build:configure
```

Bu komut size sorular soracak, şu şekilde yanıtlayın:
- **Build profile:** production
- **Android:** Google Play Store
- **iOS:** App Store

### 4. app.json Güncellemeleri

`app.json` dosyasını production için güncelleyin:

```json
{
  "expo": {
    "name": "Yıkattır",
    "slug": "yikattir-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F4C4C"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yikattir.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Yakınınızdaki oto yıkama işletmelerini bulmak için konum bilgisine ihtiyacımız var.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Yakınınızdaki oto yıkama işletmelerini bulmak için konum bilgisine ihtiyacımız var."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F4C4C"
      },
      "package": "com.yikattir.app",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Yakınınızdaki oto yıkama işletmelerini bulmak için konum bilgisine ihtiyacımız var."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### 5. EAS Project ID Oluşturma

```bash
eas init
```

Bu komut bir `projectId` oluşturacak, bunu `app.json` dosyasına ekleyin.

---

## 🤖 Android (Play Store) Yayınlama

### 1. Google Play Console Hesabı

1. [Google Play Console](https://play.google.com/console) adresine gidin
2. Hesap oluşturun ($25 tek seferlik ücret)
3. Geliştirici bilgilerinizi doldurun

### 2. Android Keystore Oluşturma

EAS otomatik olarak keystore oluşturur, ancak manuel oluşturmak isterseniz:

```bash
eas credentials
```

### 3. Android Build Oluşturma

```bash
eas build --platform android --profile production
```

Bu işlem 15-30 dakika sürebilir. Build tamamlandığında size bir link gönderilecek.

### 4. APK/AAB İndirme

Build tamamlandıktan sonra:
```bash
eas build:list
```

En son build'i indirin veya Expo dashboard'dan indirin.

### 5. Google Play Console'a Yükleme

1. [Google Play Console](https://play.google.com/console) → "Uygulama oluştur"
2. Uygulama bilgilerini doldurun:
   - Uygulama adı: Yıkattır
   - Varsayılan dil: Türkçe
   - Uygulama veya oyun: Uygulama
   - Ücretsiz veya ücretli: Ücretsiz

3. **İçerik derecelendirmesi** formunu doldurun

4. **Uygulama erişimi** bölümünde:
   - Tüm özellikler: Evet
   - Hedef kitle: 13+

5. **Uygulama ayrıntıları:**
   - Kısa açıklama (80 karakter)
   - Tam açıklama (4000 karakter)
   - Ekran görüntüleri (en az 2, tercihen 4-8)
   - Uygulama ikonu (512x512 px)
   - Özellik grafiği (1024x500 px) - opsiyonel

6. **Yayın** bölümünde:
   - "Yeni sürüm oluştur" → AAB dosyasını yükleyin
   - Sürüm notları yazın

7. **Gözden geçirme için gönder**

### 6. İnceleme Süreci

- Genellikle 1-3 gün sürer
- Reddedilirse, geri bildirimleri düzeltip tekrar gönderin

---

## 🍎 iOS (App Store) Yayınlama

### 1. Apple Developer Program

1. [Apple Developer Program](https://developer.apple.com/programs/) adresine kaydolun ($99/yıl)
2. Apple ID ile giriş yapın
3. Ödeme yapın ve hesabınızı aktifleştirin

### 2. iOS Sertifikaları ve Provisioning Profiles

EAS otomatik olarak yönetir:

```bash
eas credentials
```

### 3. iOS Build Oluşturma

```bash
eas build --platform ios --profile production
```

**NOT:** iOS build için macOS gereklidir. EAS cloud build kullanıyorsanız macOS gerekmez.

### 4. App Store Connect'e Yükleme

Build tamamlandıktan sonra:

```bash
eas submit --platform ios
```

Veya manuel olarak:
1. [App Store Connect](https://appstoreconnect.apple.com) → "My Apps"
2. "+" → "New App"
3. Bilgileri doldurun:
   - Platform: iOS
   - Name: Yıkattır
   - Primary Language: Turkish
   - Bundle ID: com.yikattir.app
   - SKU: yikattir-app-001

4. **App Information:**
   - Category: Automotive / Utilities
   - Privacy Policy URL (gerekli)

5. **Pricing and Availability:**
   - Price: Free

6. **App Store:**
   - Açıklama (4000 karakter)
   - Keywords (100 karakter)
   - Destek URL'si
   - Marketing URL (opsiyonel)
   - Ekran görüntüleri (iPhone 6.7", 6.5", 5.5" boyutlarında)

7. **Build:** Build'i seçin ve "Submit for Review"

### 5. İnceleme Süreci

- Genellikle 1-7 gün sürer
- Reddedilirse, geri bildirimleri düzeltip tekrar gönderin

---

## 🔄 Güncellemeler ve Bakım

### 1. Yeni Versiyon Yayınlama

#### Version Güncelleme

1. `app.json` dosyasında versiyonu güncelleyin:
   ```json
   {
     "version": "1.0.1",  // Semantik versioning: MAJOR.MINOR.PATCH
     "ios": {
       "buildNumber": "2"  // Her build için artırın
     },
     "android": {
       "versionCode": 2  // Her build için artırın
     }
   }
   ```

2. Build oluşturun:
   ```bash
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```

3. Yayınlayın:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

### 2. Over-the-Air (OTA) Güncellemeler

Küçük JavaScript değişiklikleri için OTA güncellemeleri kullanabilirsiniz:

```bash
eas update --branch production --message "Bug fixes and improvements"
```

**NOT:** Native kod değişiklikleri için yeni build gerekir.

---

## ✅ Yayınlama Öncesi Kontrol Listesi

### Backend
- [ ] Production sunucu kuruldu ve çalışıyor
- [ ] HTTPS/SSL aktif
- [ ] Database backup alındı
- [ ] Environment variables doğru ayarlandı
- [ ] CORS ayarları yapıldı
- [ ] API URL production'a güncellendi

### Frontend
- [ ] `app.json` production için güncellendi
- [ ] Bundle ID / Package name ayarlandı
- [ ] Versiyon numaraları doğru
- [ ] İkon ve splash screen hazır
- [ ] API URL production'a güncellendi
- [ ] Test edildi (development build ile)

### Store Listings
- [ ] Uygulama adı belirlendi
- [ ] Açıklama yazıldı (Türkçe + İngilizce)
- [ ] Ekran görüntüleri hazırlandı
- [ ] İkon hazırlandı (1024x1024)
- [ ] Privacy Policy URL hazır
- [ ] Support URL hazır

### Legal
- [ ] Privacy Policy oluşturuldu
- [ ] Terms of Service oluşturuldu (opsiyonel)
- [ ] Kullanıcı verileri koruma politikası hazır

---

## 🆘 Sorun Giderme

### Build Hataları

**Android:**
```bash
eas build --platform android --profile production --clear-cache
```

**iOS:**
```bash
eas build --platform ios --profile production --clear-cache
```

### Credentials Sorunları

```bash
eas credentials
```

### Log Kontrolü

```bash
eas build:list
eas build:view [BUILD_ID]
```

---

## 📚 Faydalı Linkler

- [Expo EAS Build Dokümantasyonu](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)

---

## 💡 İpuçları

1. **Test Build:** Production'a göndermeden önce test build oluşturup test edin
2. **Staging Environment:** Production'dan önce staging ortamı kurun
3. **Analytics:** Firebase Analytics veya benzeri bir servis ekleyin
4. **Crash Reporting:** Sentry veya Crashlytics ekleyin
5. **Beta Testing:** TestFlight (iOS) ve Internal Testing (Android) kullanın

---

**Başarılar! 🎉**

