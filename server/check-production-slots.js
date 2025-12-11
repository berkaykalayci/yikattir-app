const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('=== Production Veritabanı Kontrolü ===\n');
    
    // İşletmeleri kontrol et
    const businesses = await prisma.business.findMany({
      select: { id: true, name: true }
    });
    console.log(`Toplam İşletme: ${businesses.length}\n`);
    
    // Her işletme için çalışma saatlerini kontrol et
    for (const biz of businesses) {
      const wh = await prisma.workingHour.findMany({
        where: { businessId: biz.id },
        select: { dayOfWeek: true, isOpen: true, openTime: true, closeTime: true }
      });
      
      console.log(`${biz.name} (ID: ${biz.id}):`);
      console.log(`  Çalışma saatleri: ${wh.length}/7 gün`);
      
      const openDays = wh.filter(w => w.isOpen && w.openTime && w.closeTime);
      console.log(`  Açık günler: ${openDays.length}`);
      
      if (openDays.length > 0) {
        openDays.forEach(w => {
          console.log(`    Gün ${w.dayOfWeek}: ${w.openTime} - ${w.closeTime}`);
        });
      } else {
        console.log(`  ⚠️  Bu işletmenin açık günü yok!`);
      }
      console.log('');
    }
    
    // Bugün için test
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const jsDay = today.getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    
    console.log(`\n=== Bugün (${todayStr}) Testi ===`);
    console.log(`JavaScript getDay(): ${jsDay} (0=Pazar, 1=Pazartesi, ..., 6=Cumartesi)`);
    console.log(`Hesaplanan dayOfWeek: ${dayOfWeek} (1=Pazartesi, ..., 7=Pazar)`);
    
    if (businesses.length > 0) {
      const testBiz = businesses[0];
      const testWh = await prisma.workingHour.findFirst({
        where: { businessId: testBiz.id, dayOfWeek }
      });
      
      if (testWh && testWh.isOpen && testWh.openTime && testWh.closeTime) {
        console.log(`\n✅ ${testBiz.name} bugün açık: ${testWh.openTime} - ${testWh.closeTime}`);
      } else {
        console.log(`\n❌ ${testBiz.name} bugün kapalı veya çalışma saati yok`);
      }
    }
    
  } catch (error) {
    console.error('Hata:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
})();

