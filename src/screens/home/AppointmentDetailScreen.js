import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppointmentDetailScreen({ navigation, route }) {
  const { appointment } = route.params || {};
  const insets = useSafeAreaInsets();

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed':
        return '#10b981';
      case 'CANCELLED':
      case 'cancelled':
        return '#ef4444';
      case 'CONFIRMED':
      case 'confirmed':
        return '#3b82f6';
      case 'PENDING':
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'completed':
        return 'Tamamlandı';
      case 'CANCELLED':
      case 'cancelled':
        return 'İptal Edildi';
      case 'CONFIRMED':
      case 'confirmed':
        return 'Onaylandı';
      case 'PENDING':
      case 'pending':
        return 'Onay Bekliyor';
      default:
        return 'Bilinmiyor';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Ionicons key={i} name="star" size={20} color="#FFD700" />);
      } else if (rating >= i - 0.5) {
        stars.push(<Ionicons key={i} name="star-half" size={20} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={20} color="#d1d5db" />);
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            // Geri git, eğer geri gidilecek bir ekran yoksa ProfileHome'a git
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // Fallback: ProfileHome'a git
              const homeTabsNavigation = navigation.getParent()?.getParent();
              if (homeTabsNavigation) {
                homeTabsNavigation.navigate('Profile', {
                  screen: 'ProfileHome'
                });
              }
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Randevu Detayı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment?.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(appointment?.status) }]}>
              {getStatusText(appointment?.status)}
            </Text>
          </View>
          <Text style={styles.appointmentId}>Randevu No: #{appointment?.id || '12345'}</Text>
        </View>

        <View style={styles.businessCard}>
          <View style={styles.businessHeader}>
            <View style={styles.businessLogo}>
              <Ionicons name="business" size={32} color="#0F4C4C" />
            </View>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{appointment?.business?.name || appointment?.businessName || 'İşletme Adı'}</Text>
              <Text style={styles.businessLocation}>
                {appointment?.business?.address || 
                 appointment?.business?.district + ', ' + appointment?.business?.city ||
                 appointment?.businessLocation || 
                 'Adres bilgisi yok'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.businessButton}
            onPress={() => {
              const rootNavigation = navigation.getParent()?.getParent()?.getParent();
              if (rootNavigation) {
                rootNavigation.navigate('Home', {
                  screen: 'HomeList',
                  params: {
                    screen: 'Detail',
                    params: {
                      item: {
                        id: appointment?.id || 1,
                        name: appointment?.businessName || 'Kuzenler OtoYıkama',
                        district: appointment?.businessLocation?.split(',')[0] || 'Paşakonak',
                        city: appointment?.businessLocation?.split(',')[1]?.trim() || 'Bandırma',
                        rating: appointment?.rating || 4.5,
                        lat: 40.352,
                        lng: 27.976
                      }
                    }
                  }
                });
              }
            }}
          >
            <Ionicons name="location-outline" size={16} color="#0F4C4C" />
            <Text style={styles.businessButtonText}>İşletmeyi Görüntüle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.serviceCard}>
          <Text style={styles.cardTitle}>Hizmet Detayları</Text>
          <View style={styles.serviceItem}>
            <Ionicons name="car-outline" size={20} color="#0F4C4C" />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{appointment?.service?.name || appointment?.service || 'Hizmet Adı'}</Text>
              <Text style={styles.serviceDescription}>
                {appointment?.service?.description || 'Hizmet açıklaması'}
              </Text>
            </View>
          </View>
          <View style={styles.serviceItem}>
            <Ionicons name="time-outline" size={20} color="#0F4C4C" />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>Tahmini Süre</Text>
              <Text style={styles.serviceDescription}>45-60 dakika</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateTimeCard}>
          <Text style={styles.cardTitle}>Tarih ve Saat</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={20} color="#0F4C4C" />
              <View style={styles.dateTimeInfo}>
                <Text style={styles.dateTimeLabel}>Tarih</Text>
                <Text style={styles.dateTimeValue}>
                  {appointment?.date ? new Date(appointment.date).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Tarih bilgisi yok'}
                </Text>
              </View>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={20} color="#0F4C4C" />
              <View style={styles.dateTimeInfo}>
                <Text style={styles.dateTimeLabel}>Saat</Text>
                <Text style={styles.dateTimeValue}>{appointment?.time || '14:30'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Ödeme Bilgileri</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Hizmet Ücreti</Text>
            <Text style={styles.paymentValue}>{appointment?.totalPrice || appointment?.price || 0} ₺</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Ödeme Yöntemi</Text>
            <Text style={styles.paymentValue}>Nakit</Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{appointment?.totalPrice || appointment?.price || 0} ₺</Text>
          </View>
        </View>

        {appointment?.rating && (
          <View style={styles.ratingCard}>
            <Text style={styles.cardTitle}>Değerlendirmeniz</Text>
            <View style={styles.ratingSection}>
              <View style={styles.ratingStars}>
                {renderStars(appointment.rating)}
              </View>
              <Text style={styles.ratingText}>{appointment.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.ratingComment}>
              "Çok temiz ve hızlı bir hizmet aldım. Personel çok ilgiliydi."
            </Text>
          </View>
        )}

        <View style={styles.actionsCard}>
          {appointment?.canRate && (
            <TouchableOpacity style={styles.rateButton}>
              <Ionicons name="star-outline" size={20} color="white" />
              <Text style={styles.rateButtonText}>Değerlendir</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.repeatButton}>
            <Ionicons name="refresh-outline" size={20} color="#0F4C4C" />
            <Text style={styles.repeatButtonText}>Tekrar Randevu Al</Text>
          </TouchableOpacity>
        </View>
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
  statusCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  appointmentId: {
    fontSize: 14,
    color: '#6b7280',
  },
  businessCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  businessLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  businessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  businessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  serviceCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateTimeCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 20,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeInfo: {
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  paymentCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  ratingCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  ratingComment: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4C4C',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#0F4C4C',
  },
  repeatButtonText: {
    color: '#0F4C4C',
    fontSize: 16,
    fontWeight: '600',
  },
});
