const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('📤 Local veritabanından çalışma saatleri export ediliyor...\n');
    
    // Çalışma saatlerini işletme bilgileriyle birlikte al
    const workingHours = await prisma.workingHour.findMany({
      include: {
        business: {
          include: {
            owner: {
              select: { email: true, name: true }
            }
          }
        }
      },
      orderBy: [
        { business: { name: 'asc' } },
        { dayOfWeek: 'asc' }
      ]
    });
    
    console.log(`Toplam ${workingHours.length} çalışma saati bulundu\n`);
    
    // JSON formatında export
    const exportData = {
      exportedAt: new Date().toISOString(),
      workingHours: workingHours.map(wh => ({
        businessName: wh.business.name,
        ownerEmail: wh.business.owner.email,
        ownerName: wh.business.owner.name,
        dayOfWeek: wh.dayOfWeek,
        isOpen: wh.isOpen,
        openTime: wh.openTime,
        closeTime: wh.closeTime
      }))
    };
    
    fs.writeFileSync('working-hours-export.json', JSON.stringify(exportData, null, 2));
    
    console.log('✅ Export tamamlandı: working-hours-export.json\n');
    console.log('İşletmeler:');
    const uniqueBusinesses = [...new Set(workingHours.map(wh => wh.business.name))];
    uniqueBusinesses.forEach(name => {
      const bizWh = workingHours.filter(wh => wh.business.name === name);
      const openDays = bizWh.filter(wh => wh.isOpen && wh.openTime && wh.closeTime).length;
      console.log(`  - ${name}: ${openDays} açık gün`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
})();

