const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('📥 Production veritabanına çalışma saatleri import ediliyor...\n');
    
    // Export dosyasını oku
    if (!fs.existsSync('working-hours-export.json')) {
      console.error('❌ working-hours-export.json dosyası bulunamadı!');
      console.error('Önce export-working-hours.js scriptini çalıştırın.');
      process.exit(1);
    }
    
    const exportData = JSON.parse(fs.readFileSync('working-hours-export.json', 'utf8'));
    console.log(`Export tarihi: ${exportData.exportedAt}`);
    console.log(`Toplam ${exportData.workingHours.length} çalışma saati import edilecek\n`);
    
    // Production'daki işletmeleri al
    const productionBusinesses = await prisma.business.findMany({
      include: {
        owner: {
          select: { email: true, name: true }
        }
      }
    });
    
    console.log(`Production'da ${productionBusinesses.length} işletme bulundu\n`);
    
    // Owner email'e göre eşleştirme
    const businessMap = new Map();
    productionBusinesses.forEach(biz => {
      businessMap.set(biz.owner.email, {
        id: biz.id,
        name: biz.name,
        ownerEmail: biz.owner.email
      });
    });
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const wh of exportData.workingHours) {
      const productionBiz = businessMap.get(wh.ownerEmail);
      
      if (!productionBiz) {
        console.log(`⚠️  İşletme bulunamadı: ${wh.businessName} (Owner: ${wh.ownerEmail})`);
        skippedCount++;
        continue;
      }
      
      try {
        // Mevcut çalışma saatini kontrol et
        const existing = await prisma.workingHour.findFirst({
          where: {
            businessId: productionBiz.id,
            dayOfWeek: wh.dayOfWeek
          }
        });
        
        if (existing) {
          // Güncelle
          await prisma.workingHour.update({
            where: { id: existing.id },
            data: {
              isOpen: wh.isOpen,
              openTime: wh.openTime,
              closeTime: wh.closeTime
            }
          });
          console.log(`✅ Güncellendi: ${productionBiz.name} - Gün ${wh.dayOfWeek} (${wh.openTime || 'KAPALI'})`);
        } else {
          // Yeni oluştur
          await prisma.workingHour.create({
            data: {
              businessId: productionBiz.id,
              dayOfWeek: wh.dayOfWeek,
              isOpen: wh.isOpen,
              openTime: wh.openTime,
              closeTime: wh.closeTime
            }
          });
          console.log(`✅ Oluşturuldu: ${productionBiz.name} - Gün ${wh.dayOfWeek} (${wh.openTime || 'KAPALI'})`);
        }
        successCount++;
      } catch (error) {
        console.error(`❌ Hata (${productionBiz.name} - Gün ${wh.dayOfWeek}):`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Özet:`);
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    console.log(`⚠️  Atlandı: ${skippedCount}`);
    console.log(`\n✅ Import tamamlandı!`);
    
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

