import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { logError } from '../utils/errorMessages';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    logError('PushNotificationService', 'Push notifications sadece fiziksel cihazlarda çalışır');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logError('PushNotificationService', 'Push notification izni verilmedi');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'cb1e0927-75f4-4ee9-b2be-3ceb2fcc90a7',
    });

    const token = tokenData.data;

    if (userId && token) {
      await savePushTokenToBackend(userId, token);
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0F4C4C',
      });
    }

    return token;
  } catch (error) {
    logError('PushNotificationService', 'Push token alma hatası', error);
    return null;
  }
}

async function savePushTokenToBackend(userId, token) {
  if (!userId || !token) {
    if (__DEV__) {
      console.log('Push token kaydetme atlandı: userId veya token eksik', { userId, hasToken: !!token });
    }
    return;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/push-tokens`, {
      userId,
      token,
    }, {
      timeout: 5000,
    });
    
    if (__DEV__) {
      console.log('Push token başarıyla kaydedildi:', response.data);
    }
  } catch (error) {
    if (error.response) {
      logError('PushNotificationService', `Push token kaydetme hatası: ${error.response.status} - ${error.response.data?.error || error.message}`, error);
    } else if (error.request) {
      logError('PushNotificationService', 'Push token kaydetme hatası: Backend\'e ulaşılamadı', error);
    } else {
      logError('PushNotificationService', `Push token kaydetme hatası: ${error.message}`, error);
    }
    
    if (__DEV__) {
      console.error('Push token kaydetme detayları:', {
        url: `${API_BASE_URL}/push-tokens`,
        userId,
        token: token?.substring(0, 20) + '...',
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
    }
  }
}

export function addNotificationReceivedListener(listener) {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addNotificationResponseReceivedListener(listener) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

export function removeNotificationSubscription(subscription) {
  Notifications.removeNotificationSubscription(subscription);
}

