# Local → Production Veri Aktarımı Rehberi

## 📋 Özet

Bu rehber, local veritabanındaki (`randevu_db_clean`) çalışma saatlerini production veritabanına aktarmak için hazırlanmıştır.

## ⚠️ ÖNEMLİ UYARILAR

1. **Backup alın**: Production veritabanının yedeğini alın
2. **Test edin**: Önce test ortamında deneyin
3. **Dikkatli olun**: Bu işlem production veritabanını değiştirecek

## 🔧 Adımlar

### 1. Local Veritabanını Kontrol Edin

```bash
cd /Users/berkay/Desktop/yikattir-app/server
node check-production-slots.js
```

### 2. Production .env Dosyasını Hazırlayın

Droplet'te production `.env` dosyasını kullanın veya geçici olarak export edin:

```bash
# Droplet'te
cd /var/www/yikattir-backend/yikattir-app/server
export DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-17274-do-user-30365413-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
```

### 3. Script'i Çalıştırın

**YÖNTEM 1: Droplet'te çalıştırma (ÖNERİLEN)**

```bash
# 1. Script'i droplet'e kopyalayın (git pull ile)
cd /var/www/yikattir-backend/yikattir-app/server
git pull origin main

# 2. Local veritabanına bağlanmak için geçici .env oluşturun
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://berkay@localhost:5432/randevu_db_clean"
EOF

# 3. Production DATABASE_URL'i export edin
export DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-17274-do-user-30365413-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

# 4. Script'i düzenleyin (local DB için .env.local kullanacak şekilde)
# migrate-to-production.js dosyasını açın ve localPrisma'yı şu şekilde değiştirin:
# const localPrisma = new PrismaClient({
#   datasources: {
#     db: {
#       url: 'postgresql://berkay@localhost:5432/randevu_db_clean' // SSH tunnel gerekebilir
#     }
#   }
# });

# 5. Script'i çalıştırın
node migrate-to-production.js
```

**YÖNTEM 2: Local'den çalıştırma (SSH Tunnel gerekir)**

```bash
# 1. SSH tunnel oluşturun (yeni terminal)
ssh -L 5432:localhost:5432 root@165.22.93.125

# 2. Başka bir terminal'de script'i çalıştırın
cd /Users/berkay/Desktop/yikattir-app/server
export DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-17274-do-user-30365413-0.g.db.ondigitalocean.com:25060/defaultdb?sslmode=require"
node migrate-to-production.js
```

**YÖNTEM 3: Manuel SQL Export/Import (EN GÜVENLİ)**

```bash
# 1. Local'den export
cd /Users/berkay/Desktop/yikattir-app/server
psql -U berkay -d randevu_db_clean -c "COPY (SELECT * FROM \"WorkingHour\") TO STDOUT WITH CSV HEADER" > working_hours.csv

# 2. CSV'yi düzenleyin (businessId'leri production'daki ID'lere çevirin)

# 3. Production'a import
# Droplet'te
psql $DATABASE_URL -c "COPY \"WorkingHour\" FROM STDIN WITH CSV HEADER" < working_hours.csv
```

## ✅ Kontrol

Aktarım sonrası kontrol:

```bash
# Droplet'te
cd /var/www/yikattir-backend/yikattir-app/server
node check-production-slots.js
```

## 🔍 Sorun Giderme

### "İşletme bulunamadı" hatası
- Production'da işletme yoksa önce işletmeleri aktarın
- Owner email'leri eşleşmiyorsa manuel eşleştirme yapın

### "Connection refused" hatası
- SSH tunnel'ın çalıştığından emin olun
- Firewall ayarlarını kontrol edin

### "Foreign key constraint" hatası
- İşletmelerin önce production'da olması gerekiyor
- İşletmeleri de aktarın

