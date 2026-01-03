/**
 * Yeni kayıt olan işletmelerin isActive durumunu kontrol eder
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNewBusinesses() {
  try {
    console.log('🔍 Son 10 işletme kaydı kontrol ediliyor...\n');

    const businesses = await prisma.business.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    console.log('📋 Son 10 İşletme:\n');
    businesses.forEach((business, index) => {
      console.log(`${index + 1}. ${business.name}`);
      console.log(`   Owner: ${business.owner.email} (${business.owner.name || 'İsimsiz'})`);
      console.log(`   Role: ${business.owner.role}`);
      console.log(`   isActive: ${business.isActive}`);
      console.log(`   Created: ${business.createdAt.toLocaleDateString('tr-TR')} ${business.createdAt.toLocaleTimeString('tr-TR')}`);
      
      if (business.isActive && business.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        console.log(`   ⚠️  SORUN: Yeni kayıt ama isActive: true!`);
      }
      console.log('');
    });

    // Son 24 saatte kayıt olan ve isActive: true olan işletmeler
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const problematicBusinesses = await prisma.business.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: yesterday
        }
      },
      include: {
        owner: {
          select: {
            email: true
          }
        }
      }
    });

    if (problematicBusinesses.length > 0) {
      console.log(`\n⚠️  SORUN: Son 24 saatte ${problematicBusinesses.length} işletme isActive: true olarak kaydedilmiş:\n`);
      problematicBusinesses.forEach((business, index) => {
        console.log(`${index + 1}. ${business.name} (${business.owner.email})`);
      });
    } else {
      console.log('\n✅ Son 24 saatte kayıt olan tüm işletmeler isActive: false olarak kaydedilmiş.');
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewBusinesses();

