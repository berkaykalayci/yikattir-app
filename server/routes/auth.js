const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { getCoordinatesFromAddress } = require('../services/geocoding');

const router = express.Router();
const prisma = new PrismaClient();

// Kullanıcı kayıt
router.post('/register', async (req, res) => {
  const { name, email, phone, password, city, district, address, role = 'CUSTOMER' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
  }

  try {
    // E-posta kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor.' });
    }

    // Telefon kontrolü (varsa)
    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Bu telefon numarası zaten kullanılıyor.' });
      }
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        city,
        district,
        role,
      },
    });

    // BUSINESS rolünde ise otomatik işletme oluştur
    let business = null;
    if (role === 'BUSINESS') {
      // Adres bilgisinden koordinat hesapla
      let coordinates = null;
      if (address && city && district) {
        coordinates = await getCoordinatesFromAddress(address, city, district);
        if (coordinates) {
          console.log('İşletme koordinatları hesaplandı:', coordinates);
        } else {
          console.log('Koordinat hesaplanamadı, varsayılan değerler kullanılacak');
        }
      }

      business = await prisma.business.create({
        data: {
          name: name || 'İşletme Adı',
          type: 'OTO_YIKAMA',
          address: address || (city && district ? `${district}, ${city}` : 'Adres bilgisi'),
          city: city || 'Şehir',
          district: district || 'İlçe',
          rating: 0,
          isOpen: true,
          capacity: 3,
          ownerId: user.id,
          lat: coordinates ? coordinates.lat : null,
          lng: coordinates ? coordinates.lng : null,
        },
      });

      // Yeni işletme oluşturuldu: ilgili şehir odasına liste güncellendi yayını
      try {
        const io = req.app.get('io');
        if (io && business.city) {
          io.to(`city:${business.city.toLowerCase()}`).emit('businesses:changed', { city: business.city });
        }
      } catch (e) {
        console.error('Socket emit (business created) hatası:', e);
      }

      // Not: Yeni oluşturulan işletmelere otomatik bilgi ve görsel eklenmemesi istendiği için
      // varsayılan çalışma saatleri ve varsayılan hizmetlerin otomatik oluşturulması kaldırıldı.
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        district: user.district,
        role: user.role,
      },
      business: business ? {
        id: business.id,
        name: business.name,
      } : null,
      token,
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Kayıt işlemi başarısız.' });
  }
});

// Kullanıcı giriş
router.post('/login', async (req, res) => {
  const { email, password, role = 'CUSTOMER' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
  }

  try {
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
    }

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
    }

    // Role kontrolü
    if (user.role !== role) {
      return res.status(401).json({ error: 'Bu hesap türü için giriş yapamazsınız.' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        district: user.district,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Giriş işlemi başarısız.' });
  }
});

// Token doğrulama middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Erişim token\'ı gerekli.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token.' });
    }
    req.user = user;
    next();
  });
};

// Kullanıcı profilini getir
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        city: true,
        district: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ error: 'Profil bilgileri alınamadı.' });
  }
});

module.exports = { router, authenticateToken };
