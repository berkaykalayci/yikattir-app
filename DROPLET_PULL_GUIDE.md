# Droplet'e Pull Rehberi

## ⚠️ ÖNEMLİ: .env Dosyası

**Local'deki `.env` dosyası local veritabanına (`randevu_db_clean`) işaret ediyor!**
Droplet'te pull yaptıktan sonra `.env` dosyasını kontrol edin ve gerekirse production .env'i geri yükleyin.

## 📋 Droplet'te Yapılacaklar

### 1. SSH ile Droplet'e Bağlanın
```bash
ssh root@165.22.93.125
```

### 2. Proje Dizinine Gidin
```bash
cd /var/www/yikattir-backend/yikattir-app
```

### 3. Mevcut .env Dosyasını Yedekleyin (Güvenlik İçin)
```bash
cd server
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### 4. Git Pull Yapın
```bash
cd /var/www/yikattir-backend/yikattir-app
git pull origin main
```

### 5. .env Dosyasını Kontrol Edin
```bash
cd server
cat .env
```

**Eğer local veritabanına işaret ediyorsa:**
```bash
# Production .env'i geri yükleyin
cat > .env << 'EOF'
DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-17274-do-user-30365413-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
JWT_SECRET="1f7b8cfa-54ee-4e89-b097-3338f240e6e8-9jd82hs912"
PORT=3001
HOST=0.0.0.0
EOF
```

### 6. Migration'ı Uygulayın
```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

### 7. Backend'i Yeniden Başlatın
```bash
pm2 restart yikattir-backend
# veya
pm2 delete yikattir-backend
pm2 start index.js --name yikattir-backend
pm2 save
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

## ✅ Pull Edilen Değişiklikler

1. **Migration**: `20250117150000_add_selected_services` - `Appointment.selectedServices` kolonu eklenecek
2. **Kod Güncellemeleri**:
   - `server/routes/appointments.js` - Hata loglama iyileştirmeleri
   - `src/contexts/AppointmentsContext.js` - Detaylı hata loglama
3. **Dokümantasyon**: `PRODUCTION_CHECK.md`, `QUICK_DEPLOY.md`

## 🔍 Kontrol Listesi

- [ ] Git pull başarılı
- [ ] `.env` dosyası production veritabanına işaret ediyor
- [ ] Migration başarıyla uygulandı
- [ ] Prisma client yeniden oluşturuldu
- [ ] Backend yeniden başlatıldı
- [ ] Health check başarılı (`{"ok":true}`)
- [ ] PM2 çalışıyor

## ⚠️ Sorun Giderme

### Migration Hatası
```bash
# Migration durumunu kontrol edin
npx prisma migrate status

# Manuel migration uygulama
npx prisma db execute --file prisma/migrations/20250117150000_add_selected_services/migration.sql
```

### Backend Başlamıyor
```bash
# Logları kontrol edin
pm2 logs yikattir-backend

# Veritabanı bağlantısını test edin
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('✅ DB OK')).catch(e => console.error('❌', e.message));"
```

