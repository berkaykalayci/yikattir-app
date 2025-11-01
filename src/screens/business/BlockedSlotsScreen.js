import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.20:3001';

export default function BlockedSlotsScreen({ navigation }) {
  const { user, token } = useAuth();
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [reason, setReason] = useState('');
  const [businessId, setBusinessId] = useState(null);

  useEffect(() => {
    loadBusinessId();
  }, []);

  useEffect(() => {
    if (businessId) {
      loadBlockedSlots();
    }
  }, [businessId]);

  const loadBusinessId = async () => {
    try {
      // İşletme sahibinin business ID'sini almak için auth profile endpoint'ini kullan
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.businesses && response.data.businesses.length > 0) {
        setBusinessId(response.data.businesses[0].id);
      } else {
        console.error('Kullanıcının işletmesi bulunamadı');
      }
    } catch (error) {
      console.error('İşletme ID yüklenirken hata:', error);
    }
  };

  const loadBlockedSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blocked-slots/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockedSlots(response.data);
    } catch (error) {
      console.error('Engellenmiş saatler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlockedSlot = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      Alert.alert('Hata', 'Lütfen tarih ve en az bir saat seçin');
      return;
    }

    try {
      // Her seçilen saat için ayrı ayrı engelleme oluştur
      const promises = selectedTimes.map(time => 
        axios.post(`${API_BASE_URL}/blocked-slots/business/${businessId}`, {
          date: selectedDate,
          time: time,
          reason: reason || null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      await Promise.all(promises);

      setShowAddModal(false);
      setSelectedDate('');
      setSelectedTimes([]);
      setReason('');
      loadBlockedSlots();
      Alert.alert('Başarılı', `${selectedTimes.length} saat başarıyla engellendi`);
    } catch (error) {
      console.error('Saat engellenirken hata:', error);
      Alert.alert('Hata', error.response?.data?.error || 'Saatler engellenemedi');
    }
  };

  const handleRemoveBlockedSlot = async (blockedSlotId) => {
    Alert.alert(
      'Saat Engelini Kaldır',
      'Bu saati tekrar müsait hale getirmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/blocked-slots/${blockedSlotId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              loadBlockedSlots();
              Alert.alert('Başarılı', 'Saat engeli kaldırıldı');
            } catch (error) {
              console.error('Saat engeli kaldırılırken hata:', error);
              Alert.alert('Hata', 'Saat engeli kaldırılamadı');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderBlockedSlot = ({ item }) => (
    <View style={styles.blockedSlotItem}>
      <View style={styles.slotInfo}>
        <Text style={styles.slotDate}>{formatDate(item.date)}</Text>
        <Text style={styles.slotTime}>{item.time}</Text>
        {item.reason && <Text style={styles.slotReason}>{item.reason}</Text>}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveBlockedSlot(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const toggleTimeSelection = (time) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          weekday: 'short'
        })
      });
    }
    return dates;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F4C4C" />
        </TouchableOpacity>
        <Text style={styles.title}>Saat Engelleme</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#0F4C4C" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={blockedSlots}
          keyExtractor={(item) => item.id}
          renderItem={renderBlockedSlot}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz engellenmiş saat yok</Text>
              <Text style={styles.emptySubtext}>
                Saatleri engellemek için + butonuna tıklayın
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saat Engelle</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tarih</Text>
                <ScrollView style={styles.datePickerContainer} horizontal showsHorizontalScrollIndicator={false}>
                  {getAvailableDates().map((date) => (
                    <TouchableOpacity
                      key={date.value}
                      style={[
                        styles.dateOption,
                        selectedDate === date.value && styles.dateOptionSelected
                      ]}
                      onPress={() => setSelectedDate(date.value)}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        selectedDate === date.value && styles.dateOptionTextSelected
                      ]}>
                        {date.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Saat {selectedTimes.length > 0 && `(${selectedTimes.length} seçildi)`}
                </Text>
                <ScrollView style={styles.timeSlotsContainer} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  <View style={styles.timeSlotsGrid}>
                    {timeSlots.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlot,
                          selectedTimes.includes(time) && styles.timeSlotSelected
                        ]}
                        onPress={() => toggleTimeSelection(time)}
                      >
                        <Text style={[
                          styles.timeSlotText,
                          selectedTimes.includes(time) && styles.timeSlotTextSelected
                        ]}>
                          {time}
                        </Text>
                        {selectedTimes.includes(time) && (
                          <Ionicons name="checkmark" size={12} color="white" style={styles.checkIcon} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sebep (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Örn: Bakım, Mola, Kişisel"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddBlockedSlot}
              >
                <Text style={styles.confirmButtonText}>Engelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  blockedSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slotInfo: {
    flex: 1,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  slotTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  slotReason: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
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
    width: Platform.OS === 'ios' ? '90%' : '95%',
    maxHeight: '85%',
    marginHorizontal: Platform.OS === 'ios' ? 20 : 10,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  dateInputText: {
    fontSize: 16,
    color: '#374151',
  },
  datePickerContainer: {
    marginTop: 8,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    minWidth: 100,
    alignItems: 'center',
  },
  dateOptionSelected: {
    backgroundColor: '#0F4C4C',
    borderColor: '#0F4C4C',
  },
  dateOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  dateOptionTextSelected: {
    color: 'white',
  },
  timeSlotsContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  timeSlot: {
    width: '25%',
    padding: 8,
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#0F4C4C',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: 'white',
  },
  checkIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
