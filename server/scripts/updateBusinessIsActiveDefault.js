/**
 * Business tablosundaki isActive kolonunun default değerini false yapar
 * Mevcut kayıtlar etkilenmez, sadece yeni kayıtlar için default değer değişir
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDefault() {
  try {
    console.log('🔄 Business tablosundaki isActive default değeri güncelleniyor...');
    
    // PostgreSQL'de default değeri değiştir
    await prisma.$executeRaw`
      ALTER TABLE "Business" 
      ALTER COLUMN "isActive" SET DEFAULT false;
    `;

    console.log('✅ Default değer başarıyla false olarak güncellendi!');
    console.log('📝 Not: Mevcut kayıtlar etkilenmedi, sadece yeni kayıtlar için default değer false olacak.');
    
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

updateDefault();

