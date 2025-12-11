import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';


export default function BusinessAppointmentsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user]);

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      if (user && businessId) {
        loadAppointments(businessId);
      }
    });
    return () => {
      onFocus && onFocus();
    };
  }, [navigation, user, businessId]);

  useEffect(() => {
    if (!businessId) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    socket.on('connect', () => {
      socket.emit('join:business', businessId);
    });
    socket.on('appointment:created', (payload) => {
      setAppointments((prev) => [
        {
          id: payload.id,
          customer: payload.customerName || 'Müşteri',
          service: payload.serviceName || 'Hizmet',
          time: payload.time,
          date: payload.date,
          status: 'pending',
          phone: payload.phone || 'Telefon yok',
        },
        ...prev,
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      await loadAppointments(foundBusinessId);
      
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (businessIdParam) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/business/${businessIdParam}`);
      const appointmentsData = response.data;
      
      const formattedAppointments = appointmentsData.map(apt => ({
        id: apt.id,
        customer: apt.customer?.name || 'Müşteri',
        service: apt.service?.name || 'Hizmet',
        selectedServices: apt.selectedServices || null,
        time: apt.time,
        date: apt.date,
        status: apt.status.toLowerCase(),
        phone: apt.customer?.phone || 'Telefon yok',
        price: `₺${apt.totalPrice}`,
        customerId: apt.customerId,
        serviceId: apt.serviceId,
        updatedAt: apt.updatedAt,
        createdAt: apt.createdAt
      }));
      
      const sortedAppointments = formattedAppointments.sort((a, b) => {
        if (a.status === 'completed' && b.status === 'completed') {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        const aDateTime = new Date(`${a.date}T${a.time}:00`);
        const bDateTime = new Date(`${b.date}T${b.time}:00`);
        return aDateTime - bDateTime;
      });
      
      setAppointments(sortedAppointments);
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Randevular yüklenirken bir hata oluştu');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        status: 'CONFIRMED'
      });
      
      await loadAppointments(businessId);
      
      Alert.alert('Başarılı', 'Randevu onaylandı');
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Randevu onaylanamadı');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        status: 'CANCELLED'
      });
      
      await loadAppointments(businessId);
      
      Alert.alert('Başarılı', 'Randevu reddedildi');
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Randevu reddedilemedi');
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        status: 'COMPLETED'
      });
      
      await loadAppointments(businessId);
      
      Alert.alert('Başarılı', 'Randevu tamamlandı');
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Randevu tamamlanamadı');
    }
  };

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
              const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
                status: 'CANCELLED'
              });
              
              await loadAppointments(businessId);
              
              Alert.alert('Başarılı', 'Randevu iptal edildi');
            } catch (error) {
              logError('$(basename "$file" .js)', 'Hata');
              Alert.alert('Hata', 'Randevu iptal edilemedi');
            }
          }
        }
      ]
    );
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedTab === 'pending') {
      return appointment.status === 'pending';
    }
    if (selectedTab === 'confirmed') {
      return appointment.status === 'confirmed';
    }
    return appointment.status === 'completed' || appointment.status === 'cancelled';
  });

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      if (businessId) {
        await loadAppointments(businessId);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#0F4C4C" />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>
      
      <View style={styles.appointmentBody}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customer}</Text>
          
          {/* Hizmet gösterimi */}
          {item.selectedServices && item.selectedServices.length > 0 ? (
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesTitle}>Seçilen Hizmetler:</Text>
              {item.selectedServices.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                  <Text style={styles.serviceText}>
                    {service.name} - ₺{service.price}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.serviceName}>{item.service}</Text>
          )}
          
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={14} color="#6b7280" />
            <Text style={styles.phoneText}>{item.phone}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleRejectAppointment(item.id)}
            >
              <Ionicons name="close" size={16} color="#ef4444" />
              <Text style={styles.rejectText}>Reddet</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleApproveAppointment(item.id)}
            >
              <Ionicons name="checkmark" size={16} color="#10b981" />
              <Text style={styles.acceptText}>Onayla</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'confirmed' && (
          <>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => handleCancelAppointment(item.id)}
            >
              <Ionicons name="close-circle" size={16} color="#ef4444" />
              <Text style={styles.cancelText}>İptal Et</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleCompleteAppointment(item.id)}
            >
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.completeText}>Tamamlandı</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => setSelectedAppointment(item)}
        >
          <Ionicons name="information-circle-outline" size={16} color="#0F4C4C" />
          <Text style={styles.detailsText}>Detaylar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0F4C4C" />
        <Text style={styles.loadingText}>Randevular yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Randevularım</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'pending' && styles.activeTab]} 
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.activeTabText]}>Bekleyen</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'confirmed' && styles.activeTab]} 
          onPress={() => setSelectedTab('confirmed')}
        >
          <Text style={[styles.tabText, selectedTab === 'confirmed' && styles.activeTabText]}>Onaylanan</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]} 
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>Tamamlanan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Randevu Detay Modal */}
      <Modal
        visible={selectedAppointment !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedAppointment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Randevu Detayları</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedAppointment(null)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedAppointment && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailRow}>
                  <Ionicons name="person" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Müşteri:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.customer}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="call" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Telefon:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.phone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Tarih:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Saat:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.time}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="car" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Araç Tipi:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.vehicleType}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="card" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Plaka:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.plate}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="cash" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Tutar:</Text>
                  <Text style={styles.detailValue}>{selectedAppointment.price}</Text>
                </View>

                {/* Çoklu hizmet gösterimi */}
                {selectedAppointment.selectedServices && selectedAppointment.selectedServices.length > 0 ? (
                  <View style={styles.servicesDetailRow}>
                    <Ionicons name="list" size={20} color="#0F4C4C" />
                    <Text style={styles.detailLabel}>Hizmetler:</Text>
                    <View style={styles.selectedServicesList}>
                      {selectedAppointment.selectedServices.map((service, index) => (
                        <View key={index} style={styles.serviceDetailItem}>
                          <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                          <Text style={styles.serviceDetailText}>
                            {service.name} - ₺{service.price}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.detailRow}>
                    <Ionicons name="construct" size={20} color="#0F4C4C" />
                    <Text style={styles.detailLabel}>Hizmet:</Text>
                    <Text style={styles.detailValue}>{selectedAppointment.service}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Ionicons name="flag" size={20} color="#0F4C4C" />
                  <Text style={styles.detailLabel}>Durum:</Text>
                  <Text style={[
                    styles.detailValue,
                    styles.statusText,
                    { color: getStatusColor(selectedAppointment.status) }
                  ]}>
                    {getStatusText(selectedAppointment.status)}
                  </Text>
                </View>

                {selectedAppointment.notes && (
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={20} color="#0F4C4C" />
                    <Text style={styles.detailLabel}>Notlar:</Text>
                    <Text style={styles.detailValue}>{selectedAppointment.notes}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
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
    paddingTop: 16,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  servicesContainer: {
    marginBottom: 6,
  },
  servicesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  serviceText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  rejectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  acceptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  completeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    marginHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  servicesDetailRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  selectedServicesList: {
    marginLeft: 32,
    gap: 4,
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#374151',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statusText: {
    fontWeight: '600',
  },
});
