const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    console.log('Push token POST isteği alındı:', req.body);
    const { userId, token } = req.body;

    if (!userId || !token) {
      console.log('Push token POST: userId veya token eksik', { userId, hasToken: !!token });
      return res.status(400).json({ error: 'userId ve token gereklidir' });
    }

    const pushToken = await prisma.pushToken.upsert({
      where: { userId },
      update: { token, updatedAt: new Date() },
      create: { userId, token },
    });

    console.log('Push token başarıyla kaydedildi:', pushToken.id);
    res.json({ success: true, pushToken });
  } catch (error) {
    console.error('Push token kaydetme hatası:', error);
    res.status(500).json({ error: 'Push token kaydedilemedi', details: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const pushToken = await prisma.pushToken.findUnique({
      where: { userId },
    });

    res.json({ pushToken });
  } catch (error) {
    console.error('Push token getirme hatası:', error);
    res.status(500).json({ error: 'Push token alınamadı' });
  }
});

router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await prisma.pushToken.delete({
      where: { userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Push token silme hatası:', error);
    res.status(500).json({ error: 'Push token silinemedi' });
  }
});

module.exports = router;

