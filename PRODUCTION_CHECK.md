# Production (Droplet) Kontrol Listesi

## ✅ Frontend Yapılandırması
- **API URL**: `src/config/api.js` → Production'da `https://api.yikattir.com` ✅
- **Development**: `http://192.168.1.22:3001` (local) ✅

## ✅ Backend Yapılandırması (Droplet'te)

### 1. Droplet'teki `.env` Dosyası Kontrolü
Droplet'e SSH ile bağlanın ve kontrol edin:
```bash
ssh root@165.22.93.125
cd /var/www/yikattir-backend/yikattir-app/server
cat .env
```

**Olması gereken:**
```env
DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-17274-do-user-30365413-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
JWT_SECRET="your-jwt-secret-key"
PORT=3001
HOST=0.0.0.0
```

### 2. Nginx Yapılandırması
```bash
cat /etc/nginx/sites-available/yikattir-api
```

**Olması gereken:**
- `server_name api.yikattir.com;`
- `proxy_pass http://localhost:3001;`
- SSL sertifikası aktif

### 3. PM2 Durumu
```bash
pm2 list
pm2 logs yikattir-backend
```

### 4. Domain DNS Kontrolü
```bash
nslookup api.yikattir.com
```

**Olması gereken:** `165.22.93.125` IP adresi

## 📋 Deployment Komutları

### Droplet'te Deployment:
```bash
cd /var/www/yikattir-backend/yikattir-app/server
git pull origin main
bash deploy.sh
```

### Migration Uygulama:
```bash
cd /var/www/yikattir-backend/yikattir-app/server
npx prisma migrate deploy
```

## 🔍 Kontrol Komutları

### Backend Health Check:
```bash
curl https://api.yikattir.com/health
# Beklenen: {"ok":true}
```

### Veritabanı Bağlantısı:
```bash
cd /var/www/yikattir-backend/yikattir-app/server
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => console.log('✅ DB OK')).catch(e => console.error('❌', e.message));"
```

## ⚠️ Önemli Notlar

1. **Local Development**: `randevu_db_clean` kullanılıyor ✅
2. **Production**: DigitalOcean PostgreSQL kullanılmalı ✅
3. **Frontend**: Production build'de `https://api.yikattir.com` kullanılacak ✅
4. **Backend**: Droplet'te `.env` dosyası DigitalOcean PostgreSQL'e işaret etmeli ✅

