/**
 * Admin kullanıcısı oluşturma script'i
 * 
 * Kullanım:
 * 1. Local veritabanı için:
 *    cd server
 *    node scripts/createAdminUser.js
 * 
 * 2. Production veritabanı için:
 *    cd server
 *    DATABASE_URL="postgresql://user:password@host:port/database" node scripts/createAdminUser.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Prisma Client oluştur
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createAdminUser() {
  try {
    // Veritabanı bağlantısını kontrol et
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ HATA: DATABASE_URL environment variable ayarlanmamış.');
      console.error('Lütfen .env dosyasında DATABASE_URL değişkenini ayarlayın.');
      process.exit(1);
    }

    console.log('🔗 Veritabanına bağlanılıyor...');
    await prisma.$connect();
    
    // Database URL'i güvenli şekilde göster (şifreyi gizle)
    const maskedUrl = databaseUrl.replace(/^(postgresql:\/\/[^:]+):([^@]+)(@.*)$/, '$1:****$3');
    console.log('📍 Database URL:', maskedUrl);
    console.log('✅ Veritabanı bağlantısı başarılı!\n');

    // Admin kullanıcı bilgileri
    const email = 'admin@yikattir.com';
    const password = 'admin123';
    const name = 'Yıkattır Admin';
    const role = 'ADMIN';
    
    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('⚠️  Bu email adresi zaten kullanılıyor!');
      console.log('\n📋 Mevcut kullanıcı bilgileri:');
      console.log('- ID:', existingUser.id);
      console.log('- Email:', existingUser.email);
      console.log('- Role:', existingUser.role);
      console.log('- Name:', existingUser.name || 'Belirtilmemiş');
      
      // Eğer admin değilse role'ü güncelle
      if (existingUser.role !== role) {
        console.log('\n🔄 Kullanıcı rolü ADMIN olarak güncelleniyor...');
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: role },
        });
        console.log('✅ Kullanıcı rolü ADMIN olarak güncellendi!');
        console.log('Yeni role:', updatedUser.role);
      } else {
        console.log('✅ Kullanıcı zaten ADMIN rolüne sahip.');
      }
      
      // Şifreyi güncelle
      console.log('\n🔄 Şifre güncelleniyor...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      console.log('✅ Şifre güncellendi!');
      
      console.log('\n🎉 İşlem tamamlandı!');
      console.log('\n🔐 Giriş Bilgileri:');
      console.log('- Email:', email);
      console.log('- Password:', password);
      console.log('\n⚠️  ÖNEMLİ: Production ortamında şifreyi mutlaka değiştirin!');

      await prisma.$disconnect();
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin kullanıcı oluştur
    const admin = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        role: role,
      },
    });

    console.log('✅ Admin kullanıcı başarıyla oluşturuldu!');
    console.log('\n📋 Kullanıcı Bilgileri:');
    console.log('- ID:', admin.id);
    console.log('- Email:', admin.email);
    console.log('- Name:', admin.name);
    console.log('- Role:', admin.role);
    console.log('- Created At:', admin.createdAt);
    console.log('\n🔐 Giriş Bilgileri:');
    console.log('- Email:', email);
    console.log('- Password:', password);
    console.log('\n⚠️  ÖNEMLİ: Production ortamında şifreyi mutlaka değiştirin!');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    if (error.code === 'P2002') {
      console.error('Bu email adresi zaten kullanılıyor!');
    } else if (error.code === 'P1001') {
      console.error('Veritabanına bağlanılamıyor. DATABASE_URL\'i kontrol edin.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

