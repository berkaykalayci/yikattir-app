# Yıkattır App

Oto yıkama işletmeleri için randevu ve rezervasyon uygulaması.

## ⚡ Hızlı Başlangıç (Özet)

Eğer daha önce benzer projeler kurduysanız, hızlı başlangıç için:

```bash
# 1. Projeyi klonla
git clone https://github.com/berkaykalayci/yikattir-app.git
cd yikattir-app

# 2. PostgreSQL'de veritabanı oluştur
psql -U postgres -c "CREATE DATABASE randevu_db;"

# 3. Backend kurulumu
cd server
npm install
cp .env.example .env
# .env dosyasını düzenle (DATABASE_URL, JWT_SECRET)
npx prisma migrate deploy
npx prisma generate
npm run dev  # Ayrı terminal'de çalıştır

# 4. Frontend kurulumu (yeni terminal)
cd ..  # Ana dizine dön
npm install
# src/config/api.js dosyasını düzenle (kendi IP adresinizi yazın)
npm start
```

**Detaylı kurulum için aşağıdaki bölüme bakın.**

## 🚀 Kurulum (Adım Adım)

### Gereksinimler

- **Node.js 18+** ([İndir](https://nodejs.org/))
- **npm** (Node.js ile birlikte gelir)
- **PostgreSQL 14+** ([İndir](https://www.postgresql.org/download/))
- **Expo Go** uygulaması (iOS/Android cihazınızda App Store/Play Store'dan indirin)

### 1. Projeyi İndirin

```bash
git clone https://github.com/berkaykalayci/yikattir-app.git
cd yikattir-app
```

### 2. PostgreSQL Veritabanını Hazırlayın

PostgreSQL'in kurulu ve çalışıyor olduğundan emin olun:

```bash
# macOS (Homebrew ile kuruluysa)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows - PostgreSQL servisini Services panelinden başlatın
```

PostgreSQL'e bağlanın ve veritabanı oluşturun:

```bash
# PostgreSQL'e bağlan (şifrenizi girin)
psql -U postgres

# Veritabanını oluştur
CREATE DATABASE randevu_db;

# Çıkış yap
\q
```

### 3. Backend Kurulumu

```bash
cd server
npm install
```

#### 3.1. Environment Dosyasını Oluşturun

```bash
# .env dosyasını oluşturun
cp .env.example .env
```

`.env` dosyasını açın ve kendi bilgilerinizi girin:

```env
# Veritabanı bağlantısı (kendi şifrenizi yazın)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/randevu_db"

# Sunucu portu
PORT=3001

# JWT secret key (rastgele bir string yazın)
JWT_SECRET="your-super-secret-key-change-this"

# Socket.IO için host
HOST=0.0.0.0
```

#### 3.2. Veritabanı Migration'larını Çalıştırın

```bash
# Prisma migration'ları uygula (veritabanı tablolarını oluşturur)
npx prisma migrate deploy

# Veritabanı client'ını oluştur
npx prisma generate
```

#### 3.3. Backend Sunucusunu Başlatın

```bash
# Development modu (otomatik yeniden başlatma ile)
npm run dev

# Veya production modu
npm start
```

✅ Backend başarıyla çalışıyorsa `http://localhost:3001` adresinde erişilebilir olacaktır.

**Test için:** Tarayıcıda `http://localhost:3001/businesses` adresini açın. JSON veri dönerse başarılı!

### 4. Frontend Kurulumu

Yeni bir terminal penceresi açın ve ana dizine dönün:

```bash
cd /path/to/yikattir-app  # Ana dizine dönün
npm install
```

#### 4.1. API Yapılandırması (ÇOK ÖNEMLİ!)

`src/config/api.js` dosyasını açın ve kendi yerel IP adresinizi girin:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:3001'  // Kendi IP'nizi buraya yazın
  : 'http://YOUR_LOCAL_IP:3001';
```

**🔍 IP Adresinizi Nasıl Öğrenirsiniz?**

- **macOS/Linux:**
  ```bash
  ifconfig | grep "inet " | grep -v 127.0.0.1
  # veya
  ipconfig getifaddr en0  # macOS
  ```
  Çıktıda `192.168.x.x` gibi bir IP göreceksiniz. Bu IP'yi kullanın.

- **Windows:**
  ```cmd
  ipconfig
  ```
  Çıktıda "IPv4 Address" satırını bulun (örn: `192.168.1.20`).

**📱 Cihaz Türüne Göre Ayarlar:**

- **iOS Simülatör:** `http://localhost:3001`
- **Android Emülatör:** `http://10.0.2.2:3001`
- **Fiziksel Cihaz (Telefon/Tablet):** Bilgisayarınızın yerel IP adresi (örn: `http://192.168.1.20:3001`)

**⚠️ ÖNEMLİ:** Fiziksel cihaz kullanıyorsanız, bilgisayar ve telefon **aynı Wi-Fi ağında** olmalıdır!

### 5. Uygulamayı Çalıştırın

```bash
npm start
```

Expo geliştirme sunucusu başlatılacak ve terminal'de QR kod görünecektir.

**📱 Telefon/Tablet ile Bağlanma:**

1. Expo Go uygulamasını açın
2. QR kodu tarayın veya manuel olarak URL'yi girin
3. Uygulama yüklenecek ve açılacaktır

**💻 Emülatör/Simülatör ile:**

```bash
# iOS için
npm run ios

# Android için
npm run android
```

### 6. İlk Çalıştırma Kontrol Listesi

- [ ] PostgreSQL çalışıyor mu? (`psql -U postgres` ile kontrol)
- [ ] Backend sunucusu çalışıyor mu? (`http://localhost:3001/businesses` erişilebilir mi?)
- [ ] `src/config/api.js` dosyasında IP adresi doğru mu?
- [ ] Bilgisayar ve telefon aynı Wi-Fi ağında mı?
- [ ] Firewall 3001 ve 8081 portlarını engelliyor mu?

## 📁 Proje Yapısı

```
yikattir-app/
├── server/              # Backend (Node.js + Express + Prisma)
│   ├── routes/          # API route'ları
│   ├── prisma/          # Veritabanı schema ve migration'lar
│   └── index.js         # Server ana dosyası
├── src/                 # Frontend (React Native + Expo)
│   ├── screens/         # Ekranlar
│   ├── contexts/        # Context API (Auth, Appointments, vb.)
│   ├── navigation/      # Navigasyon yapılandırması
│   └── config/          # Yapılandırma dosyaları
└── assets/              # Görseller, logo vb.
```

## 🔧 Yapılandırma

### API URL Değiştirme

Tüm API çağrıları `src/config/api.js` dosyasından yönetilir. Bu dosyayı düzenleyerek backend URL'ini değiştirebilirsiniz.

### Veritabanı

Prisma kullanılıyor. Schema değişiklikleri için:

```bash
cd server
npx prisma migrate dev --name migration_name
```

## 📱 Özellikler

- ✅ Müşteri ve işletme kayıt/giriş sistemi
- ✅ İşletme arama ve filtreleme
- ✅ Randevu oluşturma ve yönetimi
- ✅ Çoklu hizmet seçimi
- ✅ Favori işletmeler
- ✅ Yorum ve değerlendirme sistemi
- ✅ Gerçek zamanlı bildirimler (Socket.IO)
- ✅ İşletme profil yönetimi
- ✅ Bloke edilmiş zaman dilimleri
- ✅ Ödeme yöntemleri
- ✅ Adres yönetimi

## 🛠️ Geliştirme

### Yeni Özellik Ekleme

1. Backend route ekleyin: `server/routes/`
2. Frontend ekran/component ekleyin: `src/screens/`
3. Navigation'a ekleyin: `src/navigation/`

### Debug

- Backend logları terminal'de görünür
- Frontend logları Expo Go'da veya React Native Debugger ile görüntülenebilir

## ⚠️ Sorun Giderme

### "Could not connect to development server" Hatası

**Belirtiler:** Expo Go uygulaması açılmıyor, "Could not connect" hatası görünüyor.

**Çözümler:**

1. ✅ Expo sunucusunun çalıştığından emin olun:
   ```bash
   npm start
   ```
   Terminal'de QR kod görünmeli.

2. ✅ IP adresini kontrol edin:
   - `src/config/api.js` dosyasındaki IP adresinin doğru olduğundan emin olun
   - IP adresiniz değiştiyse (Wi-Fi değiştirdiyseniz) güncelleyin

3. ✅ Aynı Wi-Fi ağında olduğunuzdan emin:
   - Bilgisayar ve telefon aynı Wi-Fi ağında olmalı
   - Farklı ağlardaysanız, tunnel modunu deneyin: `npm run start:tunnel`

4. ✅ Firewall kontrolü:
   - macOS: Sistem Tercihleri > Güvenlik > Firewall
   - Windows: Windows Defender Firewall
   - 3001 ve 8081 portlarının açık olduğundan emin olun

5. ✅ Expo Go cache'ini temizleyin:
   - Android: Ayarlar > Uygulamalar > Expo Go > Depolama > Verileri Temizle
   - iOS: Expo Go'yu silip yeniden yükleyin

6. ✅ Eski Expo process'lerini kapatın:
   ```bash
   npm run kill-expo
   npm start
   ```

### "Network Error" veya "İşletmeler yüklenirken hata" Hatası

**Belirtiler:** Uygulama açılıyor ama veriler yüklenmiyor, network hatası görünüyor.

**Çözümler:**

1. ✅ Backend sunucusunun çalıştığından emin olun:
   ```bash
   cd server
   npm run dev
   ```
   Tarayıcıda `http://localhost:3001/businesses` adresini açın, JSON veri dönmeli.

2. ✅ `src/config/api.js` dosyasındaki IP adresini kontrol edin:
   - Backend'in çalıştığı IP adresi ile eşleşmeli
   - `localhost` yerine yerel IP adresini kullanın (fiziksel cihaz için)

3. ✅ Backend loglarını kontrol edin:
   - Terminal'de backend loglarını inceleyin
   - Hata mesajları varsa düzeltin

### Veritabanı Bağlantı Hatası

**Belirtiler:** Backend başlatılırken Prisma/PostgreSQL hatası.

**Çözümler:**

1. ✅ PostgreSQL servisinin çalıştığından emin olun:
   ```bash
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. ✅ `.env` dosyasındaki `DATABASE_URL`'i kontrol edin:
   - Kullanıcı adı, şifre, veritabanı adı doğru olmalı
   - Format: `postgresql://postgres:PASSWORD@localhost:5432/randevu_db`

3. ✅ Veritabanının var olduğundan emin olun:
   ```bash
   psql -U postgres -l  # Veritabanı listesi
   ```
   `randevu_db` listede olmalı.

4. ✅ Migration'ları tekrar çalıştırın:
   ```bash
   cd server
   npx prisma migrate deploy
   npx prisma generate
   ```

### Port Çakışması (EADDRINUSE)

**Belirtiler:** "address already in use" hatası.

**Çözümler:**

1. ✅ Portu kullanan process'i bulun ve kapatın:
   ```bash
   # 3001 portu için
   lsof -ti:3001 | xargs kill -9
   
   # 8081 portu için
   lsof -ti:8081 | xargs kill -9
   ```

2. ✅ Veya farklı bir port kullanın:
   - Backend: `server/.env` dosyasında `PORT=3002` gibi değiştirin
   - Frontend: `src/config/api.js` dosyasında da aynı portu kullanın

### "expo is not installed" veya Paket Hataları

**Çözümler:**

1. ✅ `node_modules` ve `package-lock.json` dosyalarını silin:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. ✅ Bağımlılıkları yeniden yükleyin:
   ```bash
   npm install
   npx expo install --fix
   ```

### Expo Versiyon Uyarıları

**Belirtiler:** "Following packages should be updated" uyarısı.

**Çözüm:**

```bash
npx expo install --fix
```

Bu komut tüm Expo paketlerini uyumlu versiyonlara güncelleyecektir.

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👤 Geliştirici

Berkay Kalaycı

