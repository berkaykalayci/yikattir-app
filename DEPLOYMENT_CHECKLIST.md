# ✅ Deployment Kontrol Listesi

## 🔍 Kontrol Edilenler

### ✅ Hazır Olanlar

1. **Backend Deployment**
   - ✅ `server/deploy.sh` script'i hazır
   - ✅ `.env` dosyası yapılandırılabilir
   - ✅ Prisma migration'ları hazır

2. **Frontend Configuration**
   - ✅ `app.json` production için yapılandırıldı
   - ✅ Bundle ID ve Package name ayarlandı
   - ✅ Permissions eklendi
   - ✅ Assets mevcut

3. **EAS Build**
   - ✅ `eas.json` yapılandırıldı
   - ✅ Build profiles hazır

4. **Documentation**
   - ✅ `PRODUCTION_DEPLOYMENT_GUIDE.md` hazır
   - ✅ `DROPLET_DEPLOYMENT_GUIDE.md` hazır
   - ✅ `QUICK_DEPLOY.md` hazır

### ⚠️ Dikkat Edilmesi Gerekenler

1. **app.json - projectId**
   - ⚠️ `projectId` boş - `eas init` çalıştırılmalı
   - Komut: `eas init`

2. **src/config/api.js**
   - ⚠️ Production URL hala local IP
   - Domain hazır olduğunda güncellenmeli
   - Şu an: `http://192.168.1.25:3001`
   - Olmalı: `https://api.yikattir.com` (domain hazır olduğunda)

3. **eas.json - Submit Configuration**
   - ⚠️ Google Service Account key dosyası gerekli
   - ⚠️ Apple ID ve Team ID gerekli

4. **Backend .env**
   - ⚠️ Droplet'te `.env` dosyası oluşturulmalı
   - ⚠️ JWT_SECRET production için güçlü olmalı

5. **Domain ve SSL**
   - ⚠️ Domain satın alınmalı
   - ⚠️ DNS kayıtları yapılmalı
   - ⚠️ SSL sertifikası kurulmalı

---

## 📋 Yapılacaklar Listesi

### Backend (Droplet)

- [ ] Droplet oluşturuldu
- [ ] SSH bağlantısı yapıldı
- [ ] Node.js, Git, PM2, Nginx kuruldu
- [ ] Proje droplet'e yüklendi
- [ ] `.env` dosyası oluşturuldu (DATABASE_URL, JWT_SECRET)
- [ ] PostgreSQL Trusted Sources'a droplet IP eklendi
- [ ] `deploy.sh` çalıştırıldı
- [ ] PM2 ile backend başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] Domain DNS kayıtları yapıldı
- [ ] SSL sertifikası kuruldu (Let's Encrypt)
- [ ] Backend test edildi (`curl https://api.yikattir.com/health`)

### Frontend (EAS Build)

- [ ] Expo hesabı oluşturuldu
- [ ] `eas login` yapıldı
- [ ] `eas init` çalıştırıldı (projectId oluşturuldu)
- [ ] `app.json` içindeki `projectId` güncellendi
- [ ] `src/config/api.js` production URL'e güncellendi
- [ ] `eas build --platform android --profile production` çalıştırıldı
- [ ] `eas build --platform ios --profile production` çalıştırıldı
- [ ] Build'ler başarılı oldu

### Store Listings

- [ ] Google Play Console hesabı oluşturuldu ($25)
- [ ] Apple Developer Program hesabı oluşturuldu ($99/yıl)
- [ ] Uygulama adı belirlendi
- [ ] Açıklama yazıldı (Türkçe + İngilizce)
- [ ] Ekran görüntüleri hazırlandı (en az 2)
- [ ] İkon hazırlandı (1024x1024)
- [ ] Privacy Policy oluşturuldu ve yayınlandı
- [ ] Support URL hazırlandı

### Store Submission

- [ ] Android APK/AAB Google Play Console'a yüklendi
- [ ] iOS build App Store Connect'e yüklendi
- [ ] Store listing'ler tamamlandı
- [ ] İnceleme için gönderildi

---

## 🚀 Hızlı Başlangıç Komutları

### 1. EAS Project ID Oluşturma

```bash
cd /Users/berkay/Desktop/yikattir-app
eas login
eas init
```

### 2. Production API URL Güncelleme

Domain hazır olduğunda `src/config/api.js` dosyasını güncelleyin:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.25:3001'  // Development
  : 'https://api.yikattir.com';  // Production
```

### 3. Build Oluşturma

```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

---

## ✅ Son Kontrol

Tüm adımlar tamamlandıktan sonra:

1. ✅ Backend çalışıyor mu? (`curl https://api.yikattir.com/health`)
2. ✅ Frontend API URL doğru mu?
3. ✅ Build'ler başarılı mı?
4. ✅ Store listing'ler tamamlandı mı?
5. ✅ Privacy Policy yayınlandı mı?

---

**Hazır! 🎉**

