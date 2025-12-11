const { Expo } = require('expo-server-sdk');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const expo = new Expo();

async function sendPushNotification(userId, title, message, data = {}) {
  try {
    const pushTokenRecord = await prisma.pushToken.findUnique({
      where: { userId },
    });

    if (!pushTokenRecord || !pushTokenRecord.token) {
      console.log(`Push token bulunamadı: userId=${userId}`);
      return { success: false, error: 'Push token bulunamadı' };
    }

    const token = pushTokenRecord.token;

    if (!Expo.isExpoPushToken(token)) {
      console.log(`Geçersiz Expo push token: ${token}`);
      return { success: false, error: 'Geçersiz push token' };
    }

    const messages = [
      {
        to: token,
        sound: 'default',
        title,
        body: message,
        data: {
          ...data,
          userId,
        },
        priority: 'high',
        channelId: 'default',
      },
    ];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Push notification gönderme hatası:', error);
      }
    }

    const receiptIds = [];
    for (const ticket of tickets) {
      if (ticket.status === 'ok') {
        receiptIds.push(ticket.id);
      } else if (ticket.status === 'error') {
        console.error(`Push notification hatası: ${ticket.message}`);
        if (ticket.details && ticket.details.error) {
          console.error(`Hata detayı: ${ticket.details.error}`);
        }
      }
    }

    if (receiptIds.length > 0) {
      const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      for (const chunk of receiptIdChunks) {
        try {
          const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
          for (const receiptId in receipts) {
            const receipt = receipts[receiptId];
            if (receipt.status === 'error') {
              console.error(`Push notification receipt hatası: ${receipt.message}`);
              if (receipt.details && receipt.details.error) {
                console.error(`Receipt hata detayı: ${receipt.details.error}`);
              }
            }
          }
        } catch (error) {
          console.error('Receipt alma hatası:', error);
        }
      }
    }

    return { success: true, tickets };
  } catch (error) {
    console.error('Push notification gönderme hatası:', error);
    return { success: false, error: error.message };
  }
}

async function sendPushNotificationToMultipleUsers(userIds, title, message, data = {}) {
  const results = [];
  for (const userId of userIds) {
    const result = await sendPushNotification(userId, title, message, data);
    results.push({ userId, ...result });
  }
  return results;
}

module.exports = {
  sendPushNotification,
  sendPushNotificationToMultipleUsers,
};

