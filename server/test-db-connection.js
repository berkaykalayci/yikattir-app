// DigitalOcean PostgreSQL bağlantı testi
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Veritabanı bağlantısı test ediliyor...');
    console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    // Basit bir sorgu ile bağlantıyı test et
    await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('✅ Bağlantı başarılı!');
    
    // Tabloları kontrol et
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📊 Mevcut tablolar:');
    if (tables.length === 0) {
      console.log('   Henüz tablo yok. Migration çalıştırmanız gerekiyor.');
    } else {
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Bağlantı hatası:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Çözüm önerileri:');
      console.log('1. DigitalOcean panelinde → Databases → Settings → Trusted Sources');
      console.log('2. Şu IP adresini ekleyin:', process.env.TEST_IP || 'IP adresinizi öğrenmek için: curl ifconfig.me');
      console.log('3. Veya "Allow all" seçeneğini aktif edin (güvenlik riski olabilir)');
      console.log('4. Database\'in çalıştığından emin olun');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

