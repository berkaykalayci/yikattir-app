# Production'a Şema Aktarımı Rehberi

## 📋 Özet

Local veritabanındaki şema doğru çalışıyor. Bu şemayı production veritabanına aktarmak için migration'ları uygulamanız gerekiyor.

## ⚠️ ÖNEMLİ

- Bu işlem production veritabanını değiştirecek
- Önce backup alın
- Migration'lar sırayla uygulanacak

## 🔧 Adımlar

### 1. Droplet'e SSH ile Bağlanın

```bash
ssh root@165.22.93.125
```

### 2. Proje Dizinine Gidin

```bash
cd /var/www/yikattir-backend/yikattir-app/server
```

### 3. Git Pull Yapın (Migration Dosyalarını Alın)

```bash
git pull origin main
```

### 4. Migration Durumunu Kontrol Edin

```bash
npx prisma migrate status
```

Bu komut hangi migration'ların uygulandığını, hangilerinin beklediğini gösterecek.

### 5. Migration'ları Uygulayın

```bash
npx prisma migrate deploy
```

Bu komut bekleyen tüm migration'ları production veritabanına uygulayacak.

### 6. Prisma Client'ı Yeniden Oluşturun

```bash
npx prisma generate
```

### 7. Backend'i Yeniden Başlatın

```bash
pm2 restart yikattir-backend
```

### 8. Kontrol Edin

```bash
# Health check
curl http://localhost:3001/health

# PM2 durumu
pm2 status

# Logları kontrol edin
pm2 logs yikattir-backend --lines 50
```

## 📝 Beklenen Migration'lar

1. `20250117140000_remove_push_token` - PushToken tablosunu kaldırır
2. `20250117150000_add_selected_services` - Appointment.selectedServices kolonunu ekler

## 🔍 Sorun Giderme

### Migration Hatası

Eğer migration hatası alırsanız:

```bash
# Migration durumunu kontrol edin
npx prisma migrate status

# Manuel olarak migration uygulayın
npx prisma db execute --file prisma/migrations/MIGRATION_NAME/migration.sql --schema prisma/schema.prisma
```

### Schema Uyumsuzluğu

Eğer schema uyumsuzluğu varsa:

```bash
# Schema'yı kontrol edin
npx prisma validate

# Database schema'yı kontrol edin
npx prisma db pull
```

## ✅ Başarı Kontrolü

Migration sonrası kontrol:

```bash
# Veritabanı tablolarını kontrol edin
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'\`.then(r => console.log('Tablolar:', r.map(t => t.table_name))).catch(e => console.error(e));"

# Çalışma saatlerini kontrol edin
node check-production-slots.js
```

