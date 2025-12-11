# DigitalOcean PostgreSQL Kurulum Rehberi

## 1. DigitalOcean'dan Connection String'i Alın

DigitalOcean panelinde:
1. **Databases** → PostgreSQL cluster'ınızı seçin
2. **Connection Details** sekmesine gidin
3. **Connection String** bölümünden connection string'i kopyalayın

**Format genellikle şöyledir:**
```
postgresql://username:password@host:port/database?sslmode=require
```

**Örnek:**
```
postgresql://doadmin:your-password@db-postgresql-nyc1-12345.db.ondigitalocean.com:25060/defaultdb?sslmode=require
```

## 2. Connection String'i `.env` Dosyasına Ekleyin

`server/.env` dosyasını açın ve `DATABASE_URL` satırını güncelleyin:

```env
# DigitalOcean PostgreSQL Connection String
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# JWT Secret Key (güçlü bir değer kullanın)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# CORS Configuration
CORS_ORIGIN="*"
```

## 3. Prisma Migration'ları Çalıştırın

Connection string'i ekledikten sonra, veritabanı şemasını oluşturun:

```bash
cd server

# Prisma client'ı oluştur
npx prisma generate

# Migration'ları çalıştır (veritabanı tablolarını oluşturur)
npx prisma migrate deploy

# Veya development için:
npx prisma migrate dev
```

## 4. Bağlantıyı Test Edin

```bash
# Prisma Studio ile veritabanını görüntüleyin
npx prisma studio
```

Bu komut tarayıcıda bir arayüz açacak ve veritabanınızı görüntülemenizi sağlayacak.

## 5. Backend'i Başlatın

```bash
# Development modu
npm run dev

# Production modu
npm start
```

## ⚠️ Önemli Notlar

1. **SSL Mode:** DigitalOcean PostgreSQL SSL gerektirir, bu yüzden connection string'de `?sslmode=require` parametresi olmalı.

2. **Firewall:** DigitalOcean panelinde **Firewall Rules** bölümünden backend sunucunuzun IP adresini ekleyin. Aksi halde bağlantı reddedilir.

3. **Trusted Sources:** DigitalOcean PostgreSQL'de **Trusted Sources** bölümüne backend sunucunuzun IP adresini ekleyin.

4. **Password:** Connection string'deki şifreyi güvenli tutun ve `.env` dosyasını asla git'e commit etmeyin.

5. **Backup:** DigitalOcean otomatik backup sağlar, ancak önemli veriler için ekstra backup stratejisi düşünün.

## 🔍 Sorun Giderme

### Bağlantı Hatası Alıyorsanız:

1. **Firewall Kontrolü:**
   - DigitalOcean panelinde → Databases → Your Cluster → Settings → Trusted Sources
   - Backend sunucunuzun IP adresini ekleyin

2. **Connection String Kontrolü:**
   - Tırnak işaretlerini kaldırmayın
   - Özel karakterler varsa URL encode edin
   - `sslmode=require` parametresinin olduğundan emin olun

3. **Network Kontrolü:**
   ```bash
   # Backend sunucunuzdan PostgreSQL'e bağlanmayı test edin
   psql "postgresql://username:password@host:port/database?sslmode=require"
   ```

4. **Prisma Log Kontrolü:**
   ```bash
   # Detaylı log için
   DEBUG=* npx prisma migrate deploy
   ```

## 📝 Örnek `.env` Dosyası

```env
# DigitalOcean PostgreSQL
DATABASE_URL="postgresql://doadmin:your-password@db-postgresql-nyc1-12345.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# JWT
JWT_SECRET="super-secret-key-min-32-characters-long-change-this"

# CORS
CORS_ORIGIN="*"
```

---

**Başarılar! 🎉**

