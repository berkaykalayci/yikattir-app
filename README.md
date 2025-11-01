# Yıkattır App

Oto yıkama işletmeleri için randevu ve rezervasyon uygulaması.

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go uygulaması (iOS/Android cihazında)

### 1. Projeyi İndirin

```bash
git clone https://github.com/berkaykalayci/yikattir-app.git
cd yikattir-app
```

### 2. Backend Kurulumu

```bash
cd server
npm install
```

Veritabanını yapılandırın:

```bash
# .env dosyasını oluşturun
cp .env.example .env
```

`.env` dosyasını düzenleyin ve kendi veritabanı bilgilerinizi girin:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/randevu_db"
PORT=3001
JWT_SECRET="your-secret-key"
```

Veritabanını oluşturun ve migration'ları çalıştırın:

```bash
# Prisma migration'ları uygula
npx prisma migrate deploy

# Veritabanı client'ını oluştur
npx prisma generate
```

Backend sunucusunu başlatın:

```bash
npm run dev
# veya production için
npm start
```

Backend şu adreste çalışacak: `http://localhost:3001`

### 3. Frontend Kurulumu

Ana dizinde:

```bash
npm install
```

API yapılandırmasını düzenleyin:

`src/config/api.js` dosyasını açın ve kendi sunucu IP adresinizi girin:

```javascript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3001';
```

**IP Adresinizi Nasıl Öğrenirsiniz?**

- **macOS/Linux:** Terminal'de `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows:** CMD'de `ipconfig` ve IPv4 adresini bulun

**Önemli:** 
- Emülatör/Simülatör kullanıyorsanız: `http://localhost:3001` veya `http://10.0.2.2:3001` (Android emülatör)
- Fiziksel cihazdan test ediyorsanız: Bilgisayarınızın yerel IP adresini kullanın (örn: `http://192.168.1.20:3001`)

### 4. Uygulamayı Çalıştırın

```bash
npm start
```

Expo geliştirme sunucusu başlatılacak. QR kodu Expo Go uygulaması ile tarayın veya:

- iOS için: `npm run ios`
- Android için: `npm run android`

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

1. Expo sunucusunun çalıştığından emin olun (`npm start`)
2. `src/config/api.js` dosyasındaki IP adresinin doğru olduğundan emin olun
3. Bilgisayar ve telefon aynı Wi-Fi ağında olmalı
4. Firewall'ın 3001 ve 8081 portlarını engellemediğinden emin olun

### Veritabanı Bağlantı Hatası

1. PostgreSQL servisinin çalıştığından emin olun
2. `.env` dosyasındaki `DATABASE_URL`'in doğru olduğundan emin olun
3. Veritabanının oluşturulduğundan emin olun

### Port Çakışması

Port değiştirmek için:

- Backend: `server/.env` dosyasında `PORT=3001` değerini değiştirin
- Frontend: `package.json`'daki `--port` parametresini değiştirin

## 📄 Lisans

Bu proje özel kullanım içindir.

## 👤 Geliştirici

Berkay Kalaycı

