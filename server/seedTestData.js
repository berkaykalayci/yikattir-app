const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('Test verileri oluşturuluyor...');

    // Test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        phone: '5551234567',
        password: hashedPassword,
        role: 'CUSTOMER'
      }
    });

    console.log('Test kullanıcısı oluşturuldu:', testUser.email);

    // Test işletmesi oluştur
    const testBusiness = await prisma.business.upsert({
      where: { id: 'test-business-1' },
      update: {},
      create: {
        id: 'test-business-1',
        name: 'Kuzenler OtoYıkama',
        type: 'OTO_YIKAMA',
        address: 'Paşakonak, Çamlık Sk. no:9/A',
        city: 'Balıkesir',
        district: 'Paşakonak',
        rating: 4.2,
        isOpen: true,
        capacity: 5,
        imageUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200',
        logoUrl: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=200',
        lat: 40.352,
        lng: 27.976,
        ownerId: testUser.id
      }
    });

    console.log('Test işletmesi oluşturuldu:', testBusiness.name);

    // Test hizmetleri oluştur
    const services = [
      {
        name: 'İç-Dış Yıkama',
        price: 300,
        durationMin: 45,
        vehicleType: 'SEDAN',
        businessId: testBusiness.id
      },
      {
        name: 'Detaylı Temizlik',
        price: 500,
        durationMin: 90,
        vehicleType: 'SEDAN',
        businessId: testBusiness.id
      },
      {
        name: 'Motor Temizliği',
        price: 200,
        durationMin: 30,
        vehicleType: 'SEDAN',
        businessId: testBusiness.id
      }
    ];

    for (const serviceData of services) {
      await prisma.service.create({
        data: serviceData
      });
    }

    console.log('Test hizmetleri oluşturuldu');

    // Test çalışma saatleri oluştur
    const workingHours = [
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00', businessId: testBusiness.id },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00', businessId: testBusiness.id },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00', businessId: testBusiness.id },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00', businessId: testBusiness.id },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00', businessId: testBusiness.id },
      { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00', businessId: testBusiness.id },
      { dayOfWeek: 7, isOpen: false, openTime: null, closeTime: null, businessId: testBusiness.id }
    ];

    for (const wh of workingHours) {
      await prisma.workingHour.create({
        data: wh
      });
    }

    console.log('Test çalışma saatleri oluşturuldu');

    // Test randevuları oluştur
    const firstService = await prisma.service.findFirst({ where: { businessId: testBusiness.id } });
    
    const appointments = [
      {
        businessId: testBusiness.id,
        customerId: testUser.id,
        serviceId: firstService.id,
        date: new Date('2024-12-20'),
        time: '14:30',
        vehicleType: 'SEDAN',
        plate: '16 ABC 123',
        totalPrice: 300,
        status: 'PENDING'
      },
      {
        businessId: testBusiness.id,
        customerId: testUser.id,
        serviceId: firstService.id,
        date: new Date('2024-12-15'),
        time: '10:00',
        vehicleType: 'SEDAN',
        plate: '16 ABC 123',
        totalPrice: 500,
        status: 'CONFIRMED'
      }
    ];

    for (const appointmentData of appointments) {
      await prisma.appointment.create({
        data: appointmentData
      });
    }

    console.log('Test randevuları oluşturuldu');

    // Test bildirimleri oluştur
    const notifications = [
      {
        userId: testUser.id,
        type: 'appointment',
        title: 'Randevu Hatırlatması',
        body: 'Kuzenler OtoYıkama randevunuz 2 saat sonra başlayacak',
        isRead: false
      },
      {
        userId: testUser.id,
        type: 'promotion',
        title: 'Özel Kampanya!',
        body: 'Bu hafta tüm hizmetlerde %20 indirim fırsatı',
        isRead: false
      },
      {
        userId: testUser.id,
        type: 'appointment',
        title: 'Randevu Onaylandı',
        body: 'Randevunuz başarıyla onaylandı',
        isRead: true
      }
    ];

    for (const notificationData of notifications) {
      await prisma.notification.create({
        data: notificationData
      });
    }

    console.log('Test bildirimleri oluşturuldu');

    console.log('✅ Tüm test verileri başarıyla oluşturuldu!');
    
  } catch (error) {
    console.error('Test verileri oluşturulurken hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();