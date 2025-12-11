import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import API_BASE_URL from '../config/api';
import { logError } from '../utils/errorMessages';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '../services/pushNotificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notifications/user/${user.id}`);
      const notificationsList = response.data || [];
      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.isRead).length);
    } catch (error) {
      logError('NotificationContext', 'Bildirimler yüklenirken hata');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      setTimeout(() => {
        registerForPushNotificationsAsync(user.id).catch((error) => {
          logError('NotificationContext', 'Push notification kaydı hatası', error);
        });
      }, 1000);
    }
  }, [user?.id, loadNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 5000,
    });

    socket.on('connect', () => {
      socket.emit('join:customer', user.id);
    });

    socket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    notificationListener.current = addNotificationReceivedListener((notification) => {
      const notificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        message: notification.request.content.body,
        type: notification.request.content.data?.type || 'appointment',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications(prev => [notificationData, ...prev]);
      setUnreadCount(prev => prev + 1);
      loadNotifications();
    });

    responseListener.current = addNotificationResponseReceivedListener((response) => {
      const notificationId = response.notification.request.content.data?.notificationId;
      if (notificationId) {
        loadNotifications();
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logError('NotificationContext', 'Bildirim okundu işaretleme hatası');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await axios.patch(`${API_BASE_URL}/notifications/user/${user.id}/mark-all-read`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      logError('NotificationContext', 'Tüm bildirimleri okundu işaretleme hatası');
    }
  }, [user?.id]);

  const value = {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

