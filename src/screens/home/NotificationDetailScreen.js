import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationDetailScreen({ navigation, route }) {
  const { notification } = route.params || {};
  const insets = useSafeAreaInsets();

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    try {
      const now = new Date();
      const notificationDate = new Date(createdAt);
      const diffInMs = now - notificationDate;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInMinutes < 1) return 'Az önce';
      if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
      if (diffInHours < 24) return `${diffInHours} saat önce`;
      if (diffInDays < 7) return `${diffInDays} gün önce`;
      
      return notificationDate.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return '';
    }
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

  const iconInfo = getIconInfo(notification?.type);

  const getActionButton = () => {
    switch (notification?.type) {
      case 'appointment':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Appointments')}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Randevularımı Gör</Text>
          </TouchableOpacity>
        );
      case 'promotion':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="gift-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Kampanyaları Gör</Text>
          </TouchableOpacity>
        );
      case 'system':
        return (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Ana Sayfaya Git</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const getDetailedContent = () => {
    const message = notification?.message || notification?.body || '';
    
    const messageLines = message ? message.split('\n') : [];
    
    let sectionTitle = 'Bildirim Detayı';
    switch (notification?.type) {
      case 'appointment':
        sectionTitle = 'Randevu Detayları';
        break;
      case 'promotion':
        sectionTitle = 'Kampanya Detayları';
        break;
      case 'system':
        sectionTitle = 'Sistem Bildirimi';
        break;
      default:
        sectionTitle = notification?.title || 'Bildirim Detayı';
    }
    
    let content = [];
    if (messageLines.length > 0) {
      content = messageLines;
      if (notification?.type === 'appointment') {
        content = [
          ...messageLines,
          '',
          'Randevunuzu görüntülemek veya yönetmek için "Randevularım" bölümünü kullanabilirsiniz.'
        ];
      }
    } else {
      content = [notification?.title || 'Bildirim içeriği bulunamadı.'];
    }
    
    return {
      title: sectionTitle,
      content: content
    };
  };

  const detailedContent = getDetailedContent();

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Bildirim Detayı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.notificationHeader}>
          <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '20' }]}>
            <Ionicons name={iconInfo.name} size={32} color={iconInfo.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.notificationTitle}>{notification?.title || 'Bildirim'}</Text>
            <Text style={styles.notificationTime}>
              {formatTime(notification?.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>{detailedContent.title}</Text>
          <View style={styles.contentContainer}>
            {detailedContent.content.map((line, index) => (
              <Text key={index} style={styles.contentLine}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        {getActionButton()}
      </ScrollView>
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
  placeholder: { width: 40 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  notificationHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 16,
  },
  contentContainer: {
    gap: 8,
  },
  contentLine: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#0F4C4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
