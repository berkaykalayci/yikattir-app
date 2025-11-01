import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';


export default function BookingScreen({ navigation, route }) {
  const { item: business } = route.params || {};
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tarih sınırları
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30); // Maksimum 30 gün sonrası

  // Tarih seçimi için hazır tarihler
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) { // Sadece 2 hafta göster
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Toplam fiyat hesaplama
  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  // Hizmet seçimi toggle fonksiyonu
  const toggleService = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  useEffect(() => {
    if (business?.id) {
      loadServices();
    }
  }, [business?.id]);

  useEffect(() => {
    if (business?.id && selectedDate) {
      loadSlots();
    }
  }, [business?.id, selectedDate]);

  // Socket.IO: İşletme odasına katıl ve slot invalidation dinle
  useEffect(() => {
    if (!business?.id) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    socket.on('connect', () => {
      socket.emit('join:business', business.id);
    });
    socket.on('slots:invalidate', (payload) => {
      // Sadece seçili tarih etkilendiyse yenile
      if (!payload?.date) return;
      const selectedDateStr = formatDateParam(selectedDate);
      const payloadDateStr = formatDateParam(new Date(payload.date));
      if (selectedDateStr === payloadDateStr) {
        loadSlots();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [business?.id, selectedDate]);

  const formatDateParam = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/${business.id}`);
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error);
      Alert.alert('Hata', 'Hizmetler yüklenemedi');
    }
  };

  const loadSlots = async () => {
    try {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const dateParam = formatDateParam(selectedDate);
      const url = `${API_BASE_URL}/businesses/${business.id}/available-slots?date=${dateParam}`;
      const resp = await axios.get(url);
      setSlots(resp.data.slots || []);
    } catch (error) {
      console.error('Slotlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Uygun saatler getirilemedi');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirm = async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir hizmet seçin');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Uyarı', 'Lütfen bir saat seçin');
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        Alert.alert('Hata', 'Randevu oluşturmak için giriş yapmalısınız.');
        setLoading(false);
        return;
      }
      
      // Türkiye saatine göre tarih al
      const turkishDate = new Date(selectedDate.getTime() + (3 * 60 * 60 * 1000)); // UTC+3
      const dateString = turkishDate.toISOString().split('T')[0];
      
      // İlk hizmeti ana hizmet olarak kullan (backend uyumluluğu için)
      const primaryService = selectedServices[0];
      
      const appointmentData = {
        businessId: business.id,
        customerId: user.id,
        serviceId: primaryService.id,
        date: dateString, // Türkiye saatine göre tarih
        time: selectedSlot,
        vehicleType: 'SEDAN', // Geçici
        plate: '34 ABC 123', // Geçici
        notes: 'Müşteri notu',
        totalPrice: calculateTotalPrice(), // Toplam fiyat
        selectedServices: selectedServices // Seçilen tüm hizmetler
      };

      const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
      
      setShowModal(false);
      navigation.navigate('BookingConfirm', { 
        service: primaryService,
        services: selectedServices,
        date: selectedDate,
        time: selectedTime,
        appointment: response.data
      });
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      Alert.alert('Hata', 'Randevu oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.card}>
        <Text style={styles.label}>Hizmet</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowServiceModal(true)}
        >
          <Text style={styles.inputText}>
            {selectedServices.length > 0 
              ? `${selectedServices.length} hizmet seçildi` 
              : 'Hizmet Seçin'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>

        <Text style={styles.label}>Tarih</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
          <Text style={styles.inputText}>{formatDate(selectedDate)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
        
        {showDate && (
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Tarih Seçin</Text>
              <TouchableOpacity onPress={() => setShowDate(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
              {availableDates.map((date, index) => {
                const isToday = date.toDateString() === today.toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
                const dayNumber = date.getDate();
                const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateItem,
                      isSelected && styles.dateItemSelected,
                      isToday && styles.dateItemToday
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setShowDate(false);
                      loadSlots(date);
                    }}
                  >
                    <View style={styles.dateItemContent}>
                      <Text style={[
                        styles.dayName,
                        isSelected && styles.dayNameSelected,
                        isToday && styles.dayNameToday
                      ]}>
                        {isToday ? 'Bugün' : dayName}
                      </Text>
                      <Text style={[
                        styles.dayNumber,
                        isSelected && styles.dayNumberSelected,
                        isToday && styles.dayNumberToday
                      ]}>
                        {dayNumber}
                      </Text>
                      <Text style={[
                        styles.monthName,
                        isSelected && styles.monthNameSelected,
                        isToday && styles.monthNameToday
                      ]}>
                        {monthName}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#0F4C4C" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>Saat</Text>
        <View style={styles.slotsWrap}>
          {loadingSlots ? (
            <Text style={{ color: '#374151' }}>Uygun saatler yükleniyor...</Text>
          ) : slots.length === 0 ? (
            <Text style={{ color: '#374151' }}>Bu tarihte uygun saat bulunamadı</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((s) => (
                <TouchableOpacity
                  key={s.time}
                  disabled={!s.available}
                  onPress={() => setSelectedSlot(s.time)}
                  style={[styles.slotBtn, 
                    selectedSlot === s.time && styles.slotBtnSelected,
                    !s.available && styles.slotBtnDisabled
                  ]}
                >
                  <Text style={[styles.slotText, selectedSlot === s.time && styles.slotTextSelected]}>{s.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.cta, selectedServices.length === 0 && styles.ctaDisabled]} 
          onPress={() => setShowModal(true)}
          disabled={selectedServices.length === 0}
        >
          <Text style={styles.ctaText}>Randevu Onay</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Toplam Tutar:</Text>
        <Text style={styles.totalValue}>{calculateTotalPrice()} ₺</Text>
      </View>
      </ScrollView>

      {/* Hizmet Seçimi Modal */}
      <Modal visible={showServiceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hizmet Seçin</Text>
              <View style={styles.modalHeaderButtons}>
                <Text style={styles.selectedCount}>
                  {selectedServices.length} hizmet seçildi
                </Text>
                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={() => setShowServiceModal(false)}
                >
                  <Text style={styles.doneButtonText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.servicesList}>
              {services.map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceItem,
                      isSelected && styles.serviceItemSelected
                    ]}
                    onPress={() => toggleService(service)}
                  >
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>{service.price} ₺</Text>
                      <Text style={styles.serviceDuration}>{service.durationMin} dakika</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#0F4C4C" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Randevu Onayı</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.confirmationDetails}>
              <View style={styles.servicesDetailRow}>
                <Ionicons name="car-outline" size={20} color="#0F4C4C" />
                <Text style={styles.detailLabel}>Hizmetler:</Text>
                <View style={styles.selectedServicesList}>
                  {selectedServices.map((service, index) => (
                    <Text key={service.id} style={styles.serviceDetailItem}>
                      {index + 1}. {service.name} - {service.price} ₺
                    </Text>
                  ))}
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#0F4C4C" />
                <Text style={styles.detailLabel}>Tarih:</Text>
                <Text style={styles.detailValue}>{formatDate(selectedDate)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#0F4C4C" />
                <Text style={styles.detailLabel}>Saat:</Text>
                <Text style={styles.detailValue}>{selectedSlot || '-'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={20} color="#0F4C4C" />
                <Text style={styles.detailLabel}>Toplam Tutar:</Text>
                <Text style={styles.detailValue}>{calculateTotalPrice()} ₺</Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>İptal Et</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'İşleniyor...' : 'Onayla'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
         </View>
       </Modal>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16, paddingTop: 0 },
  card: { backgroundColor: '#d1d5db', padding: 16, borderRadius: 20, marginTop: 12 },
  label: { textAlign: 'center', color: '#0F4C4C', fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { height: 42, backgroundColor: 'white', borderRadius: 22, justifyContent: 'center', paddingHorizontal: 16 },
  inputText: { color: '#374151', fontSize: 16 },
  cta: { backgroundColor: '#0F4C4C', paddingVertical: 12, alignItems: 'center', borderRadius: 28, marginTop: 24 },
  ctaText: { color: 'white', fontWeight: '700' },
  slotsWrap: { backgroundColor: 'white', borderRadius: 12, padding: 12 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  slotBtnSelected: { backgroundColor: '#0F4C4C', borderColor: '#0F4C4C' },
  slotBtnDisabled: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  slotText: { color: '#374151', fontWeight: '600' },
  slotTextSelected: { color: 'white' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginTop: 16 },
  totalLabel: { color: '#111827', fontWeight: '600' },
  totalValue: { color: '#111827', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  confirmationDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    minWidth: 60,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0F4C4C',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  servicesList: {
    maxHeight: 400,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  serviceItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedCount: {
    fontSize: 14,
    color: '#0F4C4C',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  dateList: {
    maxHeight: 200,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dateItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  dateItemToday: {
    backgroundColor: '#fef3c7',
  },
  dateItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    minWidth: 50,
  },
  dayNameSelected: {
    color: '#0F4C4C',
    fontWeight: '600',
  },
  dayNameToday: {
    color: '#d97706',
    fontWeight: '600',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    minWidth: 30,
    textAlign: 'center',
  },
  dayNumberSelected: {
    color: '#0F4C4C',
  },
  dayNumberToday: {
    color: '#d97706',
  },
  monthName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    minWidth: 40,
  },
  monthNameSelected: {
    color: '#0F4C4C',
    fontWeight: '600',
  },
  monthNameToday: {
    color: '#d97706',
    fontWeight: '600',
  },
  servicesDetailRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  selectedServicesList: {
    marginTop: 8,
    marginLeft: 28, // Icon genişliği kadar boşluk
  },
  serviceDetailItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
});



