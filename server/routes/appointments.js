const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Yeni randevu oluştur
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { businessId, serviceId, selectedServices, date, time, vehicleType, plate, notes, totalPrice } = req.body;
    const customerId = req.user.userId;

    if (!businessId || !serviceId || !date || !time || !vehicleType || !plate || !totalPrice) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

    // Kapasite kontrolü: aynı gün, aynı saat için mevcut doluluk
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { capacity: true } });
    if (!business) {
      return res.status(404).json({ error: 'İşletme bulunamadı' });
    }
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    const existingCount = await prisma.appointment.count({
      where: {
        businessId,
        date: { gte: startDate, lt: endDate },
        time,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });
    if (existingCount >= (business.capacity || 1)) {
      return res.status(409).json({ error: 'Seçili saat dolu. Lütfen farklı bir saat seçin.' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        customerId,
        serviceId,
        selectedServices: selectedServices || null,
        date: new Date(date),
        time,
        vehicleType,
        plate,
        notes,
        totalPrice: parseInt(totalPrice),
        status: 'PENDING'
      },
      include: {
        business: {
          include: { owner: { include: { pushToken: true } } }
        },
        customer: {
          include: { pushToken: true }
        },
        service: true
      }
    });

    // Socket.IO yayını (işletme ve müşteri odalarına) + slot invalidation
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`business:${businessId}`).emit('appointment:created', {
          id: appointment.id,
          businessId: appointment.businessId,
          customerName: appointment.customer?.name,
          serviceName: appointment.service?.name,
          time: appointment.time,
          date: appointment.date,
          phone: appointment.customer?.phone,
          status: appointment.status,
        });
        io.to(`customer:${customerId}`).emit('appointment:created', appointment);
        // Seçili günün slotlarını geçersiz kıl (yeniden yüklet)
        io.to(`business:${businessId}`).emit('slots:invalidate', { date: appointment.date });
        // İstatistiklerin değişmesine yol açtı -> işletme odasına stats invalidate
        io.to(`business:${businessId}`).emit('stats:invalidate');
      }
    } catch (e) {
      console.error('Socket emit hatası:', e);
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error);
    res.status(500).json({ error: 'Randevu oluşturulamadı' });
  }
});

// Müşterinin randevularını getir
router.get('/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const { status } = req.query;

  try {
    const where = { customerId };
    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        business: true,
        service: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Randevuları getirme hatası:', error);
    res.status(500).json({ error: 'Randevular getirilemedi.' });
  }
});

// İşletmenin randevularını getir
router.get('/business/:businessId', async (req, res) => {
  const { businessId } = req.params;
  const { status, date } = req.query;

  try {
    const where = { businessId };
    if (status) {
      where.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        service: true,
        reviews: true,
      },
      orderBy: { date: 'asc' },
    });

    res.json(appointments);
  } catch (error) {
    console.error('İşletme randevularını getirme hatası:', error);
    res.status(500).json({ error: 'Randevular getirilemedi.' });
  }
});

// Yeni randevu oluştur
router.post('/', async (req, res) => {
  const { businessId, customerId, serviceId, date, time, vehicleType, plate, notes } = req.body;

  if (!businessId || !customerId || !serviceId || !date || !time) {
    return res.status(400).json({ error: 'Gerekli alanlar eksik.' });
  }

  try {
    // Kapasite kontrolü (public endpoint için de)
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { capacity: true } });
    if (!business) {
      return res.status(404).json({ error: 'İşletme bulunamadı.' });
    }
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    const existingCount = await prisma.appointment.count({
      where: {
        businessId,
        date: { gte: startDate, lt: endDate },
        time,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });
    if (existingCount >= (business.capacity || 1)) {
      return res.status(409).json({ error: 'Seçili saat dolu. Lütfen farklı bir saat seçin.' });
    }

    // Hizmet bilgilerini al
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { business: true },
    });

    if (!service) {
      return res.status(404).json({ error: 'Hizmet bulunamadı.' });
    }

    // Randevu oluştur
    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        customerId,
        serviceId,
        date: new Date(date),
        time,
        vehicleType,
        plate,
        notes,
        totalPrice: service.price,
        status: 'PENDING',
      },
      include: {
        business: true,
        service: true,
      },
    });

    // Socket.IO yayını (işletme ve müşteri odalarına) + slot invalidation
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`business:${businessId}`).emit('appointment:created', {
          id: appointment.id,
          businessId: appointment.businessId,
          customerId: appointment.customerId,
          serviceId: appointment.serviceId,
          time: appointment.time,
          date: appointment.date,
          status: appointment.status,
        });
        io.to(`customer:${customerId}`).emit('appointment:created', appointment);
        io.to(`business:${businessId}`).emit('slots:invalidate', { date: appointment.date });
        io.to(`business:${businessId}`).emit('stats:invalidate');
      }
    } catch (e) {
      console.error('Socket emit hatası:', e);
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Randevu oluşturma hatası:', error);
    res.status(500).json({ error: 'Randevu oluşturulamadı.', details: error.message });
  }
});

// Randevu durumunu güncelle
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Geçersiz durum.' });
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        business: true,
        service: true,
        customer: true,
      },
    });

    // Socket.IO: Durum güncellemesini yayınla (işletme ve müşteri odalarına) + slot invalidation
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`business:${appointment.businessId}`).emit('appointment:updated', {
          id: appointment.id,
          businessId: appointment.businessId,
          customerId: appointment.customerId,
          serviceId: appointment.serviceId,
          status: appointment.status,
          date: appointment.date,
          time: appointment.time,
        });
        io.to(`customer:${appointment.customerId}`).emit('appointment:updated', appointment);
        io.to(`business:${appointment.businessId}`).emit('slots:invalidate', { date: appointment.date });
        io.to(`business:${appointment.businessId}`).emit('stats:invalidate');
      }
    } catch (e) {
      console.error('Socket emit (status) hatası:', e);
    }

    res.json(appointment);
  } catch (error) {
    console.error('Randevu durumu güncelleme hatası:', error);
    res.status(500).json({ error: 'Randevu durumu güncellenemedi.' });
  }
});

// Randevu sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.appointment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Randevu silme hatası:', error);
    res.status(500).json({ error: 'Randevu silinemedi.' });
  }
});

// Randevu onayla
router.patch('/:id/confirm', async (req, res) => {
  const { id } = req.params;
  
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        customer: {
          include: { pushToken: true }
        },
        business: {
          include: { owner: { include: { pushToken: true } } }
        },
        service: true
      }
    });


    res.json(appointment);
  } catch (error) {
    console.error('Randevu onaylama hatası:', error);
    res.status(500).json({ error: 'Randevu onaylanamadı.' });
  }
});

// Randevu reddet
router.patch('/:id/reject', async (req, res) => {
  const { id } = req.params;
  
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        customer: {
          include: { pushToken: true }
        },
        business: {
          include: { owner: { include: { pushToken: true } } }
        },
        service: true
      }
    });


    res.json(appointment);
  } catch (error) {
    console.error('Randevu reddetme hatası:', error);
    res.status(500).json({ error: 'Randevu reddedilemedi.' });
  }
});

// Randevu tamamla
router.patch('/:id/complete', async (req, res) => {
  const { id } = req.params;
  
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        customer: {
          include: { pushToken: true }
        },
        business: {
          include: { owner: { include: { pushToken: true } } }
        },
        service: true
      }
    });


    res.json(appointment);
  } catch (error) {
    console.error('Randevu tamamlama hatası:', error);
    res.status(500).json({ error: 'Randevu tamamlanamadı.' });
  }
});

module.exports = router;
