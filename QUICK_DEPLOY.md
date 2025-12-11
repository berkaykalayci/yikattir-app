# ⚡ Hızlı Deployment Rehberi

## 🎯 Adım Adım Deployment

### 1. Droplet'e SSH ile Bağlanın

```bash
ssh root@YOUR_DROPLET_IP
```

### 2. Temel Kurulumları Yapın

```bash
# Sistem güncellemesi
apt update && apt upgrade -y

# Node.js 18.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Git, PostgreSQL client, Nginx, PM2
apt install -y git postgresql-client nginx
npm install -g pm2
```

### 3. Projeyi Droplet'e Yükleyin

**Seçenek A: Git ile (Önerilen)**

```bash
# Droplet'te
mkdir -p /var/www/yikattir-backend
cd /var/www/yikattir-backend
git clone https://github.com/berkaykalayci/yikattir-app.git .
cd server
```

**Seçenek B: SCP ile (Local'den)**

```bash
# Local bilgisayarınızda
cd /Users/berkay/Desktop/yikattir-app
scp -r server root@YOUR_DROPLET_IP:/var/www/yikattir-backend/
ssh root@YOUR_DROPLET_IP "cd /var/www/yikattir-backend/server"
```

### 4. .env Dosyasını Oluşturun

```bash
cd /var/www/yikattir-backend/server
nano .env
```

İçeriği:

```env
DATABASE_URL="postgresql://doadmin:PASSWORD@HOST:PORT/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGIN="*"
```

### 5. PostgreSQL Trusted Sources

DigitalOcean panelinde:
- Databases → PostgreSQL → Settings → Trusted Sources
- Droplet IP adresini ekleyin

### 6. Deployment Script'i Çalıştırın

```bash
cd /var/www/yikattir-backend/server
chmod +x deploy.sh
./deploy.sh
```

Veya manuel olarak:

```bash
npm install --production
npx prisma generate
npx prisma migrate deploy
mkdir -p uploads/businesses
chmod -R 755 uploads
pm2 start index.js --name yikattir-backend
pm2 startup
pm2 save
```

### 7. Backend Test

```bash
# PM2 durumu
pm2 status

# Loglar
pm2 logs yikattir-backend

# API test
curl http://localhost:3001/health
```

### 8. Nginx Yapılandırması

```bash
nano /etc/nginx/sites-available/yikattir-backend
```

İçeriği:

```nginx
server {
    listen 80;
    server_name api.yikattir.com;  # Kendi domain'iniz

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifleştirin:

```bash
ln -s /etc/nginx/sites-available/yikattir-backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 9. SSL Kurulumu (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.yikattir.com
```

### 10. Frontend API URL Güncelleme

`src/config/api.js` dosyasını güncelleyin:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.25:3001'  // Development
  : 'https://api.yikattir.com';  // Production
```

---

## ✅ Kontrol Listesi

- [ ] Droplet oluşturuldu
- [ ] SSH bağlantısı yapıldı
- [ ] Node.js kuruldu
- [ ] Proje droplet'e yüklendi
- [ ] .env dosyası oluşturuldu
- [ ] PostgreSQL Trusted Sources'a droplet IP eklendi
- [ ] Migration'lar çalıştırıldı
- [ ] PM2 ile backend başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] Domain DNS kayıtları yapıldı
- [ ] Frontend API URL güncellendi

---

## 🔄 Güncelleme

```bash
cd /var/www/yikattir-backend
git pull origin main
cd server
./deploy.sh
```

---

**Detaylı rehber için:** `DROPLET_DEPLOYMENT_GUIDE.md`

