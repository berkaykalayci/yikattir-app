import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://192.168.1.31:3001';

const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: 'appointment',
    title: 'Randevu Hatırlatması',
    message: 'Kuzenler OtoYıkama randevunuz 2 saat sonra başlayacak',
    time: '2 saat önce',
    isRead: false,
    icon: 'calendar',
    iconColor: '#0F4C4C'
  },
  {
    id: 2,
    type: 'promotion',
    title: 'Özel Kampanya!',
    message: 'Bu hafta tüm hizmetlerde %20 indirim fırsatı',
    time: '1 gün önce',
    isRead: false,
    icon: 'gift',
    iconColor: '#f59e0b'
  },
  {
    id: 3,
    type: 'appointment',
    title: 'Randevu Onaylandı',
    message: 'Temiz Oto randevunuz onaylandı. 15 Aralık 14:30',
    time: '2 gün önce',
    isRead: true,
    icon: 'checkmark-circle',
    iconColor: '#10b981'
  },
  {
    id: 4,
    type: 'system',
    title: 'Hoş Geldiniz!',
    message: 'YIKATTIR uygulamasına hoş geldiniz. İlk randevunuzu alın!',
    time: '3 gün önce',
    isRead: true,
    icon: 'information-circle',
    iconColor: '#3b82f6'
  },
  {
    id: 5,
    type: 'promotion',
    title: 'Yeni İşletme',
    message: 'Yakınınızda yeni bir oto yıkama işletmesi açıldı',
    time: '1 hafta önce',
    isRead: true,
    icon: 'business',
    iconColor: '#8b5cf6'
  },
];

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notifications/user/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
      // Fallback data
      setNotifications(SAMPLE_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`);
      loadNotifications(); // Bildirimleri yeniden yükle
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
    }
  };

  const deleteNotification = async (id) => {
    Alert.alert(
      'Bildirimi Sil',
      'Bu bildirimi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/notifications/${id}`);
              loadNotifications();
              Alert.alert('Başarılı', 'Bildirim silindi');
            } catch (error) {
              console.error('Bildirim silme hatası:', error);
              Alert.alert('Hata', 'Bildirim silinemedi');
            }
          }
        }
      ]
    );
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/user/${customerId}/mark-all-read`);
      loadNotifications();
      Alert.alert('Başarılı', 'Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
      Alert.alert('Hata', 'Bildirimler işaretlenemedi');
    }
  };

  const deleteAllRead = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/user/${customerId}/delete-read`);
      loadNotifications();
      Alert.alert('Başarılı', 'Okunmuş bildirimler silindi');
    } catch (error) {
      console.error('Okunmuş bildirimleri silme hatası:', error);
      Alert.alert('Hata', 'Bildirimler silinemedi');
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      'Bildirimleri Sil',
      `${selectedItems.length} bildirimi silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                selectedItems.map(id => 
                  axios.delete(`${API_BASE_URL}/notifications/${id}`)
                )
              );
              setSelectedItems([]);
              setIsSelectionMode(false);
              loadNotifications();
              Alert.alert('Başarılı', 'Seçili bildirimler silindi');
            } catch (error) {
              console.error('Toplu silme hatası:', error);
              Alert.alert('Hata', 'Bildirimler silinemedi');
            }
          }
        }
      ]
    );
  };

  const formatTime = (createdAt) => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  const getIconInfo = (type) => {
    switch (type) {
      case 'appointment':
        return { name: 'calendar', color: '#0F4C4C' };
      case 'promotion':
        return { name: 'gift', color: '#f59e0b' };
      case 'system':
        return { name: 'information-circle', color: '#3b82f6' };
      default:
        return { name: 'notifications', color: '#6b7280' };
    }
  };

  const renderNotification = ({ item }) => {
    const iconInfo = getIconInfo(item.type);
    
    return (
    <View style={[
      styles.notificationCard,
      !item.isRead && styles.unreadCard
    ]}>
      <TouchableOpacity 
        style={styles.notificationContent}
        onPress={() => {
          markAsRead(item.id);
          navigation.navigate('NotificationDetail', { notification: item });
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '20' }]}>
          <Ionicons name={iconInfo.name} size={24} color={iconInfo.color} />
        </View>
        
        <View style={styles.notificationText}>
          <Text style={[
            styles.notificationTitle,
            !item.isRead && styles.unreadTitle
          ]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>
            {item.body}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {!item.isRead && (
          <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Bildirimler</Text>
        <View style={styles.headerButtons}>
          {notifications.some(n => n.isRead) && (
            <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllRead}>
              <Ionicons name="trash" size={18} color="white" />
            </TouchableOpacity>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications" size={20} color="#0F4C4C" />
          <Text style={styles.unreadBannerText}>
            {unreadCount} okunmamış bildirim
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
            <Text style={styles.emptySubtitle}>
              Randevu ve kampanya bildirimleri burada görünecek
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  topBar: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  unreadBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0F4C4C',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  deleteButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F4C4C',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});
