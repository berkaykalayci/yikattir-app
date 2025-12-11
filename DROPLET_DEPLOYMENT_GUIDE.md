# 🚀 DigitalOcean Droplet Deployment Rehberi

Bu rehber, backend'inizi DigitalOcean Droplet'e deploy etmek için tüm adımları içerir.

---

## 📋 İçindekiler

1. [Droplet Hazırlığı](#droplet-hazırlığı)
2. [SSH Bağlantısı](#ssh-bağlantısı)
3. [Sunucu Kurulumu](#sunucu-kurulumu)
4. [Backend Deployment](#backend-deployment)
5. [PostgreSQL Bağlantısı](#postgresql-bağlantısı)
6. [PM2 ile Process Yönetimi](#pm2-ile-process-yönetimi)
7. [Nginx Reverse Proxy](#nginx-reverse-proxy)
8. [SSL/HTTPS Kurulumu](#sslhttps-kurulumu)
9. [Domain Yapılandırması](#domain-yapılandırması)

---

## 🖥️ Droplet Hazırlığı

### 1. Droplet Oluşturma

DigitalOcean panelinde:
1. **Create** → **Droplets**
2. **Ubuntu 22.04 LTS** seçin
3. **Plan:** En az 1GB RAM, 1 vCPU (önerilen: 2GB RAM)
4. **Datacenter region:** PostgreSQL ile aynı region'ı seçin (daha hızlı bağlantı)
5. **Authentication:** SSH key ekleyin (önerilen) veya root password
6. **Create Droplet**

### 2. Droplet IP Adresini Not Edin

Droplet oluşturulduktan sonra IP adresini not edin (örn: `157.230.123.45`)

---

## 🔐 SSH Bağlantısı

### 1. SSH ile Bağlanın

```bash
# Root password ile
ssh root@YOUR_DROPLET_IP

# Veya SSH key ile
ssh root@YOUR_DROPLET_IP -i ~/.ssh/your_key
```

### 2. İlk Güvenlik Ayarları

```bash
# Sistem güncellemesi
apt update && apt upgrade -y

# Firewall kurulumu
ufw allow OpenSSH
ufw enable
ufw status
```

---

## 🛠️ Sunucu Kurulumu

### 1. Node.js Kurulumu

```bash
# Node.js 18.x LTS kurulumu
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Versiyon kontrolü
node --version  # v18.x.x olmalı
npm --version   # v9.x.x olmalı
```

### 2. PostgreSQL Client Kurulumu

```bash
# PostgreSQL client (bağlantı testi için)
apt install -y postgresql-client

# Bağlantı testi
psql "postgresql://doadmin:PASSWORD@HOST:PORT/database?sslmode=require"
```

### 3. Git Kurulumu

```bash
apt install -y git
```

### 4. PM2 Kurulumu (Process Manager)

```bash
npm install -g pm2
```

### 5. Nginx Kurulumu

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## 📦 Backend Deployment

### 1. Proje Klasörü Oluşturma

```bash
# Ana dizin
mkdir -p /var/www/yikattir-backend
cd /var/www/yikattir-backend
```

### 2. Git ile Kod Çekme

```bash
# Git repository'nizi clone edin
git clone https://github.com/berkaykalayci/yikattir-app.git .

# Veya manuel olarak dosyaları yükleyin (scp, rsync, vs.)
```

### 3. Backend Klasörüne Geçin

```bash
cd server
```

### 4. Dependencies Kurulumu

```bash
npm install --production
```

### 5. Environment Variables (.env) Oluşturma

```bash
nano .env
```

`.env` dosyasına şunları ekleyin:

```env
# DigitalOcean PostgreSQL Connection String
DATABASE_URL="postgresql://doadmin:PASSWORD@HOST:PORT/database?sslmode=require"

# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# JWT Secret Key (güçlü bir değer kullanın, en az 32 karakter)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# CORS Configuration
CORS_ORIGIN="*"
```

**ÖNEMLİ:** `DATABASE_URL`'deki şifreyi DigitalOcean panelinden alın.

### 6. Prisma Setup

```bash
# Prisma client oluştur
npx prisma generate

# Migration'ları çalıştır
npx prisma migrate deploy
```

### 7. Uploads Klasörü Oluşturma

```bash
mkdir -p uploads/businesses
chmod -R 755 uploads
```

---

## 🔗 PostgreSQL Bağlantısı

### 1. DigitalOcean PostgreSQL Trusted Sources

DigitalOcean panelinde:
1. **Databases** → PostgreSQL cluster
2. **Settings** → **Trusted Sources**
3. Droplet'in IP adresini ekleyin
4. Kaydedin

### 2. Bağlantı Testi

```bash
cd /var/www/yikattir-backend/server
node test-db-connection.js
```

Başarılı olmalı! ✅

---

## 🚀 PM2 ile Process Yönetimi

### 1. PM2 ile Backend'i Başlatma

```bash
cd /var/www/yikattir-backend/server

# PM2 ile başlat
pm2 start index.js --name yikattir-backend

# Logları görüntüle
pm2 logs yikattir-backend

# Durumu kontrol et
pm2 status
```

### 2. PM2 Startup Script (Sunucu yeniden başladığında otomatik başlatma)

```bash
pm2 startup
# Çıkan komutu çalıştırın (sudo ile)

pm2 save
```

### 3. PM2 Komutları

```bash
# Restart
pm2 restart yikattir-backend

# Stop
pm2 stop yikattir-backend

# Logları temizle
pm2 flush

# Monitoring
pm2 monit
```

---

## 🌐 Nginx Reverse Proxy

### 1. Nginx Configuration

```bash
nano /etc/nginx/sites-available/yikattir-backend
```

Aşağıdaki içeriği ekleyin:

```nginx
server {
    listen 80;
    server_name api.yikattir.com;  # Kendi domain'inizi yazın

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

### 2. Site'ı Aktifleştirme

```bash
# Symbolic link oluştur
ln -s /etc/nginx/sites-available/yikattir-backend /etc/nginx/sites-enabled/

# Test et
nginx -t

# Nginx'i yeniden başlat
systemctl restart nginx
```

### 3. Firewall Port Açma

```bash
# HTTP (80) ve HTTPS (443) portlarını aç
ufw allow 80/tcp
ufw allow 443/tcp

# Durumu kontrol et
ufw status
```

---

## 🔒 SSL/HTTPS Kurulumu (Let's Encrypt)

### 1. Certbot Kurulumu

```bash
apt install -y certbot python3-certbot-nginx
```

### 2. SSL Sertifikası Oluşturma

```bash
certbot --nginx -d api.yikattir.com
```

Sertifika otomatik olarak oluşturulacak ve Nginx yapılandırması güncellenecek.

### 3. Otomatik Yenileme

Certbot otomatik olarak yenileme yapar, ancak test edebilirsiniz:

```bash
certbot renew --dry-run
```

---

## 🌍 Domain Yapılandırması

### 1. DNS Kayıtları

Domain sağlayıcınızda (GoDaddy, Namecheap, vs.) DNS kayıtları:

```
Type    Name    Value
A       api     YOUR_DROPLET_IP
```

### 2. Domain Doğrulama

```bash
# DNS propagation kontrolü
nslookup api.yikattir.com
```

---

## ✅ Deployment Sonrası Kontroller

### 1. Backend Çalışıyor mu?

```bash
# PM2 durumu
pm2 status

# Loglar
pm2 logs yikattir-backend --lines 50

# API test
curl http://localhost:3001/health
```

### 2. Nginx Çalışıyor mu?

```bash
systemctl status nginx
curl http://api.yikattir.com/health
```

### 3. SSL Çalışıyor mu?

```bash
curl https://api.yikattir.com/health
```

---

## 🔄 Güncelleme Süreci

### 1. Kod Güncelleme

```bash
cd /var/www/yikattir-backend
git pull origin main

# Backend klasörüne geç
cd server

# Dependencies güncelle
npm install --production

# Migration varsa
npx prisma migrate deploy

# PM2 restart
pm2 restart yikattir-backend
```

### 2. Log Kontrolü

```bash
pm2 logs yikattir-backend --lines 100
```

---

## 🆘 Sorun Giderme

### Backend Başlamıyor

```bash
# Logları kontrol et
pm2 logs yikattir-backend

# Manuel çalıştır
cd /var/www/yikattir-backend/server
node index.js
```

### Database Bağlantı Hatası

1. PostgreSQL Trusted Sources'u kontrol edin
2. `.env` dosyasındaki `DATABASE_URL`'i kontrol edin
3. Firewall kurallarını kontrol edin

### Nginx 502 Bad Gateway

```bash
# Backend çalışıyor mu?
pm2 status

# Port doğru mu?
netstat -tulpn | grep 3001
```

---

## 📝 Özet Komutlar

```bash
# Tüm kurulum (tek seferlik)
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs postgresql-client git nginx
npm install -g pm2

# Backend deployment
cd /var/www/yikattir-backend/server
npm install --production
npx prisma generate
npx prisma migrate deploy
pm2 start index.js --name yikattir-backend
pm2 startup
pm2 save

# Nginx + SSL
certbot --nginx -d api.yikattir.com
```

---

**Başarılar! 🎉**

