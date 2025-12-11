const { PrismaClient } = require('@prisma/client');

// Local veritabanı (kaynak)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://berkay@localhost:5432/randevu_db_clean'
    }
  }
});

// Production veritabanı (hedef) - .env'den alınacak
// Bu script'i çalıştırmadan önce DATABASE_URL'i production'a ayarlayın
const productionPrisma = new PrismaClient();

async function migrateWorkingHours() {
  console.log('🔄 Çalışma saatleri aktarılıyor...\n');
  
  try {
    // Local'den çalışma saatlerini al
    const localWorkingHours = await localPrisma.workingHour.findMany({
      include: {
        business: {
          select: { id: true, name: true, ownerId: true }
        }
      }
    });
    
    console.log(`Local'de ${localWorkingHours.length} çalışma saati bulundu`);
    
    // Production'daki işletmeleri al (owner email'e göre eşleştirme için)
    const productionBusinesses = await productionPrisma.business.findMany({
      include: {
        owner: {
          select: { email: true }
        }
      }
    });
    
    console.log(`Production'da ${productionBusinesses.length} işletme bulundu\n`);
    
    // Owner email'e göre işletme eşleştirme map'i oluştur
    const businessMap = new Map();
    
    for (const localWh of localWorkingHours) {
      const localOwnerEmail = await localPrisma.user.findUnique({
        where: { id: localWh.business.ownerId },
        select: { email: true }
      });
      
      if (!localOwnerEmail) continue;
      
      // Production'da aynı email'e sahip işletmeyi bul
      const productionBiz = productionBusinesses.find(
        b => b.owner.email === localOwnerEmail.email
      );
      
      if (!productionBiz) {
        console.log(`⚠️  İşletme bulunamadı: ${localWh.business.name} (Owner: ${localOwnerEmail.email})`);
        continue;
      }
      
      // Bu işletme için çalışma saatlerini kaydet
      const key = `${localOwnerEmail.email}-${localWh.dayOfWeek}`;
      if (!businessMap.has(key)) {
        businessMap.set(key, {
          productionBusinessId: productionBiz.id,
          businessName: productionBiz.name,
          dayOfWeek: localWh.dayOfWeek,
          isOpen: localWh.isOpen,
          openTime: localWh.openTime,
          closeTime: localWh.closeTime
        });
      }
    }
    
    console.log(`\n${businessMap.size} çalışma saati aktarılacak\n`);
    
    // Production'a aktar
    let successCount = 0;
    let errorCount = 0;
    
    for (const [key, whData] of businessMap) {
      try {
        // Mevcut çalışma saatini kontrol et
        const existing = await productionPrisma.workingHour.findFirst({
          where: {
            businessId: whData.productionBusinessId,
            dayOfWeek: whData.dayOfWeek
          }
        });
        
        if (existing) {
          // Güncelle
          await productionPrisma.workingHour.update({
            where: { id: existing.id },
            data: {
              isOpen: whData.isOpen,
              openTime: whData.openTime,
              closeTime: whData.closeTime
            }
          });
          console.log(`✅ Güncellendi: ${whData.businessName} - Gün ${whData.dayOfWeek}`);
        } else {
          // Yeni oluştur
          await productionPrisma.workingHour.create({
            data: {
              businessId: whData.productionBusinessId,
              dayOfWeek: whData.dayOfWeek,
              isOpen: whData.isOpen,
              openTime: whData.openTime,
              closeTime: whData.closeTime
            }
          });
          console.log(`✅ Oluşturuldu: ${whData.businessName} - Gün ${whData.dayOfWeek}`);
        }
        successCount++;
      } catch (error) {
        console.error(`❌ Hata (${whData.businessName} - Gün ${whData.dayOfWeek}):`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Başarılı: ${successCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    
  } catch (error) {
    console.error('Genel hata:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Local → Production Veri Aktarımı Başlıyor...\n');
  console.log('⚠️  UYARI: Bu script production veritabanını değiştirecek!\n');
  
  // Production DATABASE_URL kontrolü
  const prodUrl = process.env.DATABASE_URL;
  if (!prodUrl || !prodUrl.includes('digitalocean')) {
    console.error('❌ HATA: DATABASE_URL production veritabanına işaret etmiyor!');
    console.error('Lütfen production .env dosyasını kullanın veya DATABASE_URL environment variable\'ını ayarlayın.');
    process.exit(1);
  }
  
  console.log('✅ Production veritabanı tespit edildi\n');
  
  try {
    await migrateWorkingHours();
    console.log('\n✅ Aktarım tamamlandı!');
  } catch (error) {
    console.error('\n❌ Aktarım başarısız:', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await productionPrisma.$disconnect();
  }
}

main();

