/**
 * Belirli bir işletmenin durumunu kontrol eder
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBusinessStatus() {
  try {
    const businessName = 'Abiler Oto Yıkama';
    
    console.log(`🔍 "${businessName}" işletmesinin durumu kontrol ediliyor...\n`);

    const business = await prisma.business.findFirst({
      where: {
        name: {
          contains: 'Abiler',
          mode: 'insensitive'
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!business) {
      console.log('❌ İşletme bulunamadı!');
      return;
    }

    console.log('📋 İşletme Bilgileri:');
    console.log(`- ID: ${business.id}`);
    console.log(`- İsim: ${business.name}`);
    console.log(`- Şehir: ${business.city}`);
    console.log(`- İlçe: ${business.district}`);
    console.log(`- Adres: ${business.address}`);
    console.log(`- isActive: ${business.isActive}`);
    console.log(`- isOpen: ${business.isOpen}`);
    console.log(`- Rating: ${business.rating}`);
    console.log(`- Oluşturulma: ${business.createdAt.toLocaleString('tr-TR')}`);
    console.log(`- Güncellenme: ${business.updatedAt.toLocaleString('tr-TR')}`);
    console.log('\n👤 İşletme Sahibi:');
    console.log(`- Email: ${business.owner.email}`);
    console.log(`- İsim: ${business.owner.name || 'Belirtilmemiş'}`);
    console.log(`- Role: ${business.owner.role}`);

    console.log('\n📊 Durum Analizi:');
    if (business.isActive) {
      console.log('✅ İşletme AKTİF - Müşteriler görebilir ve randevu alabilir');
    } else {
      console.log('⏸️  İşletme ASKIYA ALINMIŞ - Müşteriler göremez, randevu alamaz');
    }

    if (business.isOpen) {
      console.log('🟢 İşletme AÇIK - Çalışma saatleri içinde');
    } else {
      console.log('🔴 İşletme KAPALI - Çalışma saatleri dışında');
    }

    // Müşteri endpoint'inden görünüyor mu kontrol et
    console.log('\n🔍 Müşteri Endpoint Kontrolü:');
    const customerView = await prisma.business.findFirst({
      where: {
        id: business.id,
        isActive: true
      }
    });

    if (customerView) {
      console.log('✅ Müşteriler bu işletmeyi görebilir (/businesses endpoint)');
    } else {
      console.log('❌ Müşteriler bu işletmeyi GÖREMEZ (/businesses endpoint)');
    }

    // İşletme sahibi giriş yapabilir mi kontrol et
    console.log('\n🔐 İşletme Sahibi Giriş Kontrolü:');
    if (business.isActive) {
      console.log('✅ İşletme sahibi giriş yapabilir (isActive: true)');
    } else {
      console.log('❌ İşletme sahibi giriş YAPAMAZ (isActive: false)');
      console.log('   → Login endpoint\'inde "Hesabınız henüz onaylanmamıştır" hatası döner');
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkBusinessStatus();

