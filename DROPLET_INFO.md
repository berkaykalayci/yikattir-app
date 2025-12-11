# 🌐 Droplet Bilgileri

## Droplet IP Adresi
**165.22.93.125**

## Domain
**api.yikattir.com**

## Backend API URL
**https://api.yikattir.com** (Production)
**http://165.22.93.125:3001** (Direct IP - SSL olmadan)

## Yapılacaklar

### 1. Backend Deployment (Droplet'te)

Droplet'e SSH ile bağlanın ve backend'i deploy edin:

```bash
ssh root@165.22.93.125
```

Sonra `QUICK_DEPLOY.md` veya `DROPLET_DEPLOYMENT_GUIDE.md` dosyasındaki adımları takip edin.

### 2. PostgreSQL Trusted Sources

DigitalOcean panelinde:
- **Databases** → PostgreSQL cluster → **Settings** → **Trusted Sources**
- Droplet IP'sini ekleyin: `165.22.93.125`

### 3. DNS Yapılandırması

Domain sağlayıcınızda (GoDaddy, Namecheap, vs.) DNS kayıtları:

```
Type: A
Name: api
Value: 165.22.93.125
TTL: 3600 (veya otomatik)
```

**Önemli:** DNS propagation 5 dakika ile 48 saat arasında sürebilir. Kontrol için:
```bash
nslookup api.yikattir.com
```

### 4. Nginx Yapılandırması

Backend deploy edildikten sonra Nginx yapılandırması:

```bash
nano /etc/nginx/sites-available/yikattir-backend
```

İçeriği:

```nginx
server {
    listen 80;
    server_name api.yikattir.com;

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

### 5. SSL Sertifikası Kurulumu (Let's Encrypt)

```bash
# Certbot kurulumu
apt install -y certbot python3-certbot-nginx

# SSL sertifikası oluştur
certbot --nginx -d api.yikattir.com

# Otomatik yenileme testi
certbot renew --dry-run
```

Certbot otomatik olarak Nginx yapılandırmasını HTTPS için güncelleyecek.

### 6. Frontend API URL

✅ **Güncellendi:** `src/config/api.js` dosyasında production URL: `https://api.yikattir.com`

---

## Test

Backend deploy edildikten sonra test edin:

```bash
# IP ile test (SSL olmadan)
curl http://165.22.93.125:3001/health

# Domain ile test (SSL kurulduktan sonra)
curl https://api.yikattir.com/health
```

Başarılı yanıt: `{"ok":true}`

## SSL Kontrolü

SSL kurulumundan sonra kontrol edin:

```bash
# SSL sertifikası kontrolü
curl -I https://api.yikattir.com/health

# Browser'da test
# https://api.yikattir.com/health adresini açın
```

---

**Not:** Backend henüz deploy edilmediyse, önce `QUICK_DEPLOY.md` dosyasındaki adımları tamamlayın.

