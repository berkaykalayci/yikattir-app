/**
 * Business tablosundaki isActive kolonunun default değerini kontrol eder
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDefault() {
  try {
    console.log('🔍 Business tablosundaki isActive default değeri kontrol ediliyor...');
    
    // PostgreSQL'de default değeri kontrol et
    const result = await prisma.$queryRaw`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Business' 
      AND column_name = 'isActive';
    `;

    console.log('\n📊 Veritabanı Bilgileri:');
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      const maskedUrl = databaseUrl.replace(/^(postgresql:\/\/[^:]+):([^@]+)(@.*)$/, '$1:****$3');
      console.log('📍 Database URL:', maskedUrl);
    }

    if (result && result.length > 0) {
      const defaultValue = result[0].column_default;
      console.log('\n✅ Mevcut Default Değer:', defaultValue);
      
      if (defaultValue === 'false' || defaultValue === 'false::boolean') {
        console.log('✅ Default değer doğru şekilde false olarak ayarlanmış!');
      } else {
        console.log('⚠️  Default değer henüz false değil. Güncelleme gerekebilir.');
      }
    } else {
      console.log('⚠️  Kolon bulunamadı.');
    }

    // Son 5 işletmenin durumunu kontrol et
    console.log('\n📋 Son 5 İşletme Durumu:');
    const recentBusinesses = await prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true
      }
    });

    if (recentBusinesses.length > 0) {
      recentBusinesses.forEach((business, index) => {
        console.log(`${index + 1}. ${business.name} - isActive: ${business.isActive} (Oluşturulma: ${business.createdAt.toLocaleDateString('tr-TR')})`);
      });
    } else {
      console.log('Henüz işletme kaydı yok.');
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code === 'P1001') {
      console.error('Veritabanına bağlanılamıyor. DATABASE_URL\'i kontrol edin.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDefault();

