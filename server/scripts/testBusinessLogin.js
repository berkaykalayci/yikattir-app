/**
 * İşletme giriş kontrolünü test eder
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testBusinessLogin() {
  try {
    console.log('🔍 İşletme giriş kontrolü test ediliyor...\n');

    // Son kayıt olan BUSINESS rolündeki kullanıcıları bul
    const businessUsers = await prisma.user.findMany({
      where: { role: 'BUSINESS' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    if (businessUsers.length === 0) {
      console.log('⚠️  Henüz BUSINESS rolünde kullanıcı bulunamadı.');
      return;
    }

    console.log('📋 Son 5 İşletme Kullanıcısı:\n');
    businessUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'Belirtilmemiş'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString('tr-TR')}`);
      
      if (user.businesses && user.businesses.length > 0) {
        user.businesses.forEach(business => {
          console.log(`   Business: ${business.name}`);
          console.log(`   isActive: ${business.isActive}`);
          console.log(`   Business Created: ${business.createdAt.toLocaleDateString('tr-TR')}`);
        });
      } else {
        console.log(`   ⚠️  İşletme kaydı bulunamadı!`);
      }
      console.log('');
    });

    // isActive: false olan işletmeleri kontrol et
    const inactiveBusinesses = await prisma.business.findMany({
      where: { isActive: false },
      include: {
        owner: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log(`\n📊 Onay Bekleyen İşletmeler (isActive: false): ${inactiveBusinesses.length}\n`);
    if (inactiveBusinesses.length > 0) {
      inactiveBusinesses.forEach((business, index) => {
        console.log(`${index + 1}. ${business.name}`);
        console.log(`   Owner: ${business.owner.email} (${business.owner.name || 'İsimsiz'})`);
        console.log(`   Created: ${business.createdAt.toLocaleDateString('tr-TR')}`);
        console.log(`   isActive: ${business.isActive}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testBusinessLogin();

