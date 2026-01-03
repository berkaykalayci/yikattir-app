require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Business tablosuna setupCompleted alanı ekleniyor...');
  try {
    // PostgreSQL için ALTER TABLE komutu
    await prisma.$executeRaw`ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "setupCompleted" BOOLEAN NOT NULL DEFAULT false;`;
    console.log('✅ setupCompleted alanı başarıyla eklendi!');
    console.log('📝 Not: Mevcut kayıtlar için default değer false olarak ayarlandı.');
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

