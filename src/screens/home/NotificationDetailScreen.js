import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationDetailScreen({ navigation, route }) {
  const { notification } = route.params || {};
  const insets = useSafeAreaInsets();

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
    switch (notification?.type) {
      case 'appointment':
        return {
          title: 'Randevu Detayları',
          content: [
            '• Randevunuz yaklaşık 2 saat sonra başlayacak',
            '• İşletme: Kuzenler OtoYıkama',
            '• Konum: Paşakonak, Çamlık Sk. no:9/A, Bandırma',
            '• Hizmet: Oto Yıkama + İç Temizlik',
            '• Tahmini süre: 45-60 dakika',
            '• Ödeme: Nakit veya kart ile yapılabilir',
            '',
            'Randevunuzu iptal etmek veya değiştirmek için "Randevularım" bölümünü kullanabilirsiniz.'
          ]
        };
      case 'promotion':
        return {
          title: 'Kampanya Detayları',
          content: [
            '🎉 Özel İndirim Fırsatı!',
            '',
            'Bu hafta tüm oto yıkama hizmetlerinde %20 indirim!',
            '',
            'Geçerli hizmetler:',
            '• Standart Oto Yıkama',
            '• Premium Oto Yıkama',
            '• İç Temizlik',
            '• Motor Temizliği',
            '• Lastik Parlatma',
            '',
            'Kampanya süresi: 15-21 Aralık 2024',
            'Kampanyadan yararlanmak için randevu alırken "KAMPANYA20" kodunu kullanın.'
          ]
        };
      case 'system':
        return {
          title: 'Hoş Geldiniz!',
          content: [
            'YIKATTIR uygulamasına hoş geldiniz! 🚗',
            '',
            'Uygulamayı kullanmaya başlamak için:',
            '',
            '1. Konumunuzu belirleyin',
            '2. Yakınınızdaki oto yıkama işletmelerini görün',
            '3. Beğendiğiniz işletmeyi seçin',
            '4. Randevu alın ve kolayca ödeme yapın',
            '',
            'Özellikler:',
            '• Yakındaki işletmeleri bulma',
            '• Online randevu alma',
            '• Güvenli ödeme',
            '• Değerlendirme yapma',
            '• Favori işletmeleri kaydetme',
            '',
            'Herhangi bir sorunuz olursa destek ekibimizle iletişime geçebilirsiniz.'
          ]
        };
      default:
        return {
          title: 'Bildirim Detayı',
          content: [notification?.message || 'Bildirim içeriği bulunamadı.']
        };
    }
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
          <View style={[styles.iconContainer, { backgroundColor: notification?.iconColor + '20' }]}>
            <Ionicons name={notification?.icon} size={32} color={notification?.iconColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.notificationTitle}>{notification?.title}</Text>
            <Text style={styles.notificationTime}>{notification?.time}</Text>
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
