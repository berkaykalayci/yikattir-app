const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const readline = require('readline');
const prisma = new PrismaClient();

async function importFromCSV() {
  try {
    console.log('📥 CSV dosyasından çalışma saatleri import ediliyor...\n');
    
    if (!fs.existsSync('working-hours-export.csv')) {
      console.error('❌ working-hours-export.csv dosyası bulunamadı!');
      process.exit(1);
    }
    
    // CSV'yi oku
    const fileStream = fs.createReadStream('working-hours-export.csv');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    const lines = [];
    for await (const line of rl) {
      lines.push(line);
    }
    
    // Header'ı atla
    const dataLines = lines.slice(1);
    
    console.log(`${dataLines.length} satır bulundu\n`);
    
    // Production'daki işletmeleri al
    const productionBusinesses = await prisma.business.findMany({
      include: {
        owner: {
          select: { email: true }
        }
      }
    });
    
    const businessMap = new Map();
    productionBusinesses.forEach(biz => {
      businessMap.set(biz.owner.email, biz.id);
    });
    
    console.log(`Production'da ${productionBusinesses.length} işletme bulundu\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      const [dayOfWeek, isOpen, openTime, closeTime, businessName, ownerEmail] = line.split(',');
      
      const productionBizId = businessMap.get(ownerEmail);
      
      if (!productionBizId) {
        console.log(`⚠️  İşletme bulunamadı: ${businessName} (${ownerEmail})`);
        skippedCount++;
        continue;
      }
      
      try {
        const dayOfWeekNum = parseInt(dayOfWeek);
        const isOpenBool = isOpen === 't' || isOpen === 'true';
        
        const existing = await prisma.workingHour.findFirst({
          where: {
            businessId: productionBizId,
            dayOfWeek: dayOfWeekNum
          }
        });
        
        if (existing) {
          await prisma.workingHour.update({
            where: { id: existing.id },
            data: {
              isOpen: isOpenBool,
              openTime: openTime === 'NULL' || !openTime ? null : openTime,
              closeTime: closeTime === 'NULL' || !closeTime ? null : closeTime
            }
          });
          console.log(`✅ Güncellendi: ${businessName} - Gün ${dayOfWeekNum}`);
        } else {
          await prisma.workingHour.create({
            data: {
              businessId: productionBizId,
              dayOfWeek: dayOfWeekNum,
              isOpen: isOpenBool,
              openTime: openTime === 'NULL' || !openTime ? null : openTime,
              closeTime: closeTime === 'NULL' || !closeTime ? null : closeTime
            }
          });
          console.log(`✅ Oluşturuldu: ${businessName} - Gün ${dayOfWeekNum}`);
        }
        successCount++;
      } catch (error) {
        console.error(`❌ Hata (${businessName} - Gün ${dayOfWeek}):`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Özet:`);
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`❌ Hatalı: ${errorCount}`);
    console.log(`⚠️  Atlandı: ${skippedCount}`);
    
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importFromCSV().then(() => {
  console.log('\n✅ Import tamamlandı!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Import başarısız:', error);
  process.exit(1);
});

