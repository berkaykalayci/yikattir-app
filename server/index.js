require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const businessesRouter = require('./routes/businesses');
const appointmentsRouter = require('./routes/appointments');
const notificationsRouter = require('./routes/notifications');
const usersRouter = require('./routes/users');
const favoritesRouter = require('./routes/favorites');
const servicesRouter = require('./routes/services');
const reviewsRouter = require('./routes/reviews');
const addressesRouter = require('./routes/addresses');
const { router: authRouter } = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Statik dosyalar (görseller)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (_req, res) => res.json({ ok: true }));

// API rotaları
console.log('Routes yükleniyor...');
app.use('/auth', authRouter);
app.use('/businesses', businessesRouter);
app.use('/appointments', appointmentsRouter);
app.use('/notifications', notificationsRouter);
app.use('/users', usersRouter);
app.use('/favorites', favoritesRouter);
app.use('/services', servicesRouter);
app.use('/reviews', reviewsRouter);
app.use('/addresses', addressesRouter);
console.log('Tüm routes yüklendi');

// Socket.IO
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('join:business', (businessId) => {
    if (businessId) {
      socket.join(`business:${businessId}`);
      console.log(`Socket ${socket.id} joined business room business:${businessId}`);
    }
  });
  socket.on('join:customer', (customerId) => {
    if (customerId) {
      socket.join(`customer:${customerId}`);
      console.log(`Socket ${socket.id} joined customer room customer:${customerId}`);
    }
  });
  socket.on('join:city', (cityName) => {
    if (cityName) {
      const room = `city:${cityName.toLowerCase()}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined city room ${room}`);
    }
  });
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

app.set('io', io);

const port = process.env.PORT || 3001;
const host = process.env.HOST || '0.0.0.0';
server.listen(port, host, () => console.log(`API running on port ${port}`));