#!/bin/bash

# DigitalOcean Droplet Deployment Script
# Bu script'i droplet'te çalıştırın

set -e

echo "🚀 Yıkattır Backend Deployment Başlıyor..."

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Node.js versiyon kontrolü
echo -e "${YELLOW}📦 Node.js versiyonu kontrol ediliyor...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js bulunamadı. Lütfen önce Node.js kurun.${NC}"
    exit 1
fi
node --version

# 2. Dependencies kurulumu
echo -e "${YELLOW}📦 Dependencies kuruluyor...${NC}"
npm install --production

# 3. .env dosyası kontrolü
echo -e "${YELLOW}🔐 .env dosyası kontrol ediliyor...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
    echo "Lütfen .env dosyasını oluşturun:"
    echo "DATABASE_URL=\"postgresql://...\""
    echo "JWT_SECRET=\"...\""
    echo "PORT=3001"
    exit 1
fi

# 4. Prisma setup
echo -e "${YELLOW}🗄️  Prisma client oluşturuluyor...${NC}"
npx prisma generate

echo -e "${YELLOW}🗄️  Database migration'ları çalıştırılıyor...${NC}"
npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migration hatası, devam ediliyor...${NC}"
}

# 5. Uploads klasörü kontrolü
echo -e "${YELLOW}📁 Uploads klasörü kontrol ediliyor...${NC}"
mkdir -p uploads/businesses
chmod -R 755 uploads

# 6. PM2 ile başlatma
echo -e "${YELLOW}🚀 PM2 ile başlatılıyor...${NC}"
if pm2 list | grep -q "yikattir-backend"; then
    echo -e "${YELLOW}⚠️  Mevcut process durduruluyor...${NC}"
    pm2 delete yikattir-backend || true
fi

pm2 start index.js --name yikattir-backend
pm2 save

echo -e "${GREEN}✅ Deployment tamamlandı!${NC}"
echo -e "${GREEN}📊 PM2 durumu:${NC}"
pm2 status

echo -e "${GREEN}📝 Logları görüntülemek için: pm2 logs yikattir-backend${NC}"

