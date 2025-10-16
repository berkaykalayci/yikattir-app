import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { useAppointments } from '../../contexts/AppointmentsContext';
import RateAppointmentScreen from './RateAppointmentScreen';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.31:3001';

const SAMPLE_APPOINTMENTS = [
  {
    id: 1,
    businessName: 'Kuzenler OtoYıkama',
    service: 'Tam Yıkama',
    date: '15 Aralık 2024',
    time: '14:30',
    status: 'active',
    price: '450 ₺',
    address: 'Paşakonak, Çamlık Sk. no:9/A'
  },
  {
    id: 2,
    businessName: 'Temiz Oto',
    service: 'İç Temizlik',
    date: '12 Aralık 2024',
    time: '10:00',
    status: 'active',
    price: '300 ₺',
    address: 'Merkez, Atatürk Cd. no:15'
  },
  {
    id: 3,
    businessName: 'Kuzenler OtoYıkama',
    service: 'Tam Yıkama',
    date: '10 Aralık 2024',
    time: '16:00',
    status: 'completed',
    price: '450 ₺',
    address: 'Paşakonak, Çamlık Sk. no:9/A'
  },
  {
    id: 4,
    businessName: 'Hızlı Yıkama',
    service: 'Dış Yıkama',
    date: '8 Aralık 2024',
    time: '11:30',
    status: 'completed',
    price: '200 ₺',
    address: 'Yeni Mahalle, İnönü Sk. no:3'
  },
];

export default function AppointmentsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('pending');
  const { appointments, loading, refreshAppointments, loadAppointments } = useAppointments();
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Ekran odaklandığında bir kez güncelle (ilk yük), periodik auto-refresh yok
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        refreshAppointments();
      }
      return () => {};
    }, [user?.id, refreshAppointments])
  );

  // Socket.IO ile müşterinin odasına katıl, anlık değişiklikleri yansıt
  useEffect(() => {
    if (!user?.id) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    socket.on('connect', () => {
      socket.emit('join:customer', user.id);
    });
    socket.on('appointment:created', () => {
      // Yeni randevu eklendiğinde listeleri tazele
      refreshAppointments();
    });
    return () => {
      socket.disconnect();
    };
  }, [user?.id, refreshAppointments]);

  const handleCancelAppointment = async (appointmentId) => {
    Alert.alert(
      'Randevu İptali',
      'Bu randevuyu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        { 
          text: 'Evet', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
                status: 'CANCELLED'
              });
              loadAppointments(); // Randevuları yeniden yükle
              Alert.alert('Başarılı', 'Randevu iptal edildi');
            } catch (error) {
              console.error('Randevu iptal hatası:', error);
              Alert.alert('Hata', 'Randevu iptal edilemedi');
            }
          }
        }
      ]
    );
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Onay Bekliyor', color: '#f59e0b' };
      case 'CONFIRMED':
        return { text: 'Onaylandı', color: '#10b981' };
      case 'CANCELLED':
        return { text: 'İptal Edildi', color: '#ef4444' };
      case 'COMPLETED':
        return { text: 'Tamamlandı', color: '#6b7280' };
      default:
        return { text: 'Bilinmiyor', color: '#6b7280' };
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedTab === 'pending') {
      return appointment.status === 'PENDING';
    }
    if (selectedTab === 'confirmed') {
      return appointment.status === 'CONFIRMED';
    }
    // completed
    return appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED';
  });

  const renderAppointment = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const appointmentDate = new Date(item.date);
    const formattedDate = appointmentDate.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.businessInfo}>
            <View style={styles.businessLogo}>
              <Ionicons name="business" size={24} color="#0F4C4C" />
            </View>
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>{item.business?.name || 'İşletme Adı'}</Text>
              <Text style={styles.service}>{item.service?.name || 'Hizmet Adı'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.business?.address || 'Adres bilgisi yok'}</Text>
          </View>
        </View>

        <View style={styles.appointmentFooter}>
          <Text style={styles.price}>{item.totalPrice} ₺</Text>
          {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelAppointment(item.id)}
            >
              <Text style={styles.cancelButtonText}>İptal Et</Text>
            </TouchableOpacity>
          )}
          {item.status === 'COMPLETED' && (
            <>
              {item.reviews && item.reviews.length > 0 ? (
                <View style={styles.ratedContainer}>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons 
                        key={star} 
                        name={star <= item.reviews[0].rating ? "star" : "star-outline"} 
                        size={16} 
                        color="#fbbf24" 
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingText}>{item.reviews[0].rating}/5</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.rateButton}
                  onPress={() => {
                    console.log('Değerlendir butonuna tıklandı, randevu:', item);
                    // Review bilgisini temizle, sadece gerekli bilgileri geç
                    const cleanAppointment = {
                      id: item.id,
                      businessId: item.businessId,
                      customerId: item.customerId,
                      serviceId: item.serviceId,
                      date: item.date,
                      time: item.time,
                      vehicleType: item.vehicleType,
                      plate: item.plate,
                      status: item.status,
                      notes: item.notes,
                      totalPrice: item.totalPrice,
                      business: item.business,
                      service: item.service
                    };
                    setSelectedAppointment(cleanAppointment);
                    setShowRateModal(true);
                  }}
                >
                  <Text style={styles.rateButtonText}>Değerlendir</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.title}>Randevularım</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]} 
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>
            Onay Bekleyen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'confirmed' && styles.activeTab]} 
          onPress={() => setSelectedTab('confirmed')}
        >
          <Text style={[styles.tabText, selectedTab === 'confirmed' && styles.activeTabText]}>
            Onaylanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]} 
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Geçmiş
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshAppointments}
            colors={['#0F4C4C']}
            tintColor="#0F4C4C"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'pending' ? 'Onay bekleyen randevunuz yok' : selectedTab === 'confirmed' ? 'Onaylanan randevunuz yok' : 'Geçmiş randevunuz yok'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'completed' ? 'Tamamlanan/iptal edilen randevularınız burada görünecek' : 'Yeni randevu almak için ana sayfayı ziyaret edin'}
            </Text>
          </View>
        }
      />
      
      <Modal
        visible={showRateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRateModal(false)}
      >
        <RateAppointmentScreen 
          navigation={{
            goBack: () => setShowRateModal(false)
          }}
          route={{
            params: {
              appointment: selectedAppointment
            }
          }}
          onSuccess={() => {
            setShowRateModal(false);
            // Randevuları yeniden yükle
            loadAppointments();
          }}
        />
      </Modal>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#0F4C4C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  service: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  appointmentDetails: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  rateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0F4C4C',
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  ratedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});


