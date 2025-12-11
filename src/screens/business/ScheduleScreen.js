import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { logError } from '../../utils/errorMessages';


const DAYS = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'
];

export default function ScheduleScreen({ navigation }) {
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState({});
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [breakTimes, setBreakTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotIntervalMin, setSlotIntervalMin] = useState('30');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      loadSchedule();
    }
  }, [user]);

  useEffect(() => {
    if (businessId) {
      loadSlotsForDate(selectedDate);
    }
  }, [businessId, selectedDate]);

  useEffect(() => {
    const autoSave = async () => {
      if (!businessId) return;
      if (!Object.keys(workingHours).length) return;
      try {
        const workingHoursData = Object.keys(workingHours).map((dayName, index) => ({
          dayOfWeek: index + 1,
          isOpen: workingHours[dayName]?.isOpen || false,
          openTime: workingHours[dayName]?.isOpen ? workingHours[dayName].startTime : null,
          closeTime: workingHours[dayName]?.isOpen ? workingHours[dayName].endTime : null,
        }));
        await axios.put(`${API_BASE_URL}/businesses/working-hours/${businessId}`, {
          workingHours: workingHoursData,
          slotIntervalMin: parseInt(slotIntervalMin || '30', 10),
        });
        await loadSlotsForDate(selectedDate);
      } catch (e) {
        logError('ScheduleScreen', 'Slot aralığı kaydedilirken hata');
      }
    };
    autoSave();
  }, [slotIntervalMin]);

  const formatDateParam = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadSlotsForDate = async (d) => {
    try {
      setLoadingSlots(true);
      const dateParam = formatDateParam(d);
      const url = `${API_BASE_URL}/businesses/${businessId}/available-slots?date=${dateParam}`;
      const resp = await axios.get(url);
      setSlots(resp.data.slots || []);
    } catch (error) {
      logError('ScheduleScreen', 'Slotlar yüklenirken hata');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      const formattedHours = {};
      DAYS.forEach((day, index) => {
        const dayNumber = index + 1;
        const dayHours = businessData.workingHours?.find(wh => wh.dayOfWeek === dayNumber);
        
        formattedHours[day] = {
          isOpen: dayHours?.isOpen || (index < 6),
          startTime: dayHours?.openTime || '09:00',
          endTime: dayHours?.closeTime || (index === 5 ? '17:00' : '18:00')
        };
      });
      
      setWorkingHours(formattedHours);
      if (typeof businessData.slotIntervalMin === 'number') {
        setSlotIntervalMin(String(businessData.slotIntervalMin));
      }
      
    } catch (error) {
      logError('ScheduleScreen', 'Çalışma saatleri yüklenirken hata');
      
      const defaultHours = {};
      DAYS.forEach((day, index) => {
        defaultHours[day] = {
          isOpen: index < 6,
          startTime: '09:00',
          endTime: index === 5 ? '17:00' : '18:00'
        };
      });
      setWorkingHours(defaultHours);
      
      Alert.alert('Uyarı', 'Çalışma saatleri yüklenirken bir hata oluştu, varsayılan saatler kullanılıyor');
    } finally {
      setLoading(false);
    }
  };

  const findBusinessId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      setBusinessId(response.data.id);
    } catch (error) {
      logError('ScheduleScreen', 'İşletme ID bulunurken hata');
    }
  };

  const updateWorkingHours = async (day, field, value) => {
    if (!workingHours[day]) {
      return;
    }
    
    const updatedHours = {
      ...workingHours,
      [day]: { ...workingHours[day], [field]: value }
    };
    
    setWorkingHours(updatedHours);
    
    try {
      const workingHoursData = Object.keys(updatedHours).map((dayName, index) => ({
        dayOfWeek: index + 1,
        isOpen: updatedHours[dayName]?.isOpen || false,
        openTime: updatedHours[dayName]?.isOpen ? updatedHours[dayName].startTime : null,
        closeTime: updatedHours[dayName]?.isOpen ? updatedHours[dayName].endTime : null,
      }));
      
      await axios.put(`${API_BASE_URL}/businesses/working-hours/${businessId}`, {
        workingHours: workingHoursData,
        slotIntervalMin: parseInt(slotIntervalMin || '30', 10)
      });
      
    } catch (error) {
      logError('ScheduleScreen', 'Çalışma saatleri güncellenirken hata');
      Alert.alert('Hata', 'Çalışma saatleri güncellenirken bir hata oluştu');
    }
  };

  const addBreakTime = () => {
    Alert.alert('Mola Ekle', 'Mola ekleme özelliği yakında eklenecek');
  };

  const removeBreakTime = (id) => {
    Alert.alert(
      'Mola Sil',
      'Bu molayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => setBreakTimes(prev => prev.filter(breakTime => breakTime.id !== id))
        }
      ]
    );
  };

  const saveSchedule = async () => {
    try {
      const workingHoursData = Object.keys(workingHours).map((dayName, index) => ({
        dayOfWeek: index + 1,
        isOpen: workingHours[dayName]?.isOpen || false,
        openTime: workingHours[dayName]?.isOpen ? workingHours[dayName].startTime : null,
        closeTime: workingHours[dayName]?.isOpen ? workingHours[dayName].endTime : null,
      }));

      await axios.put(`${API_BASE_URL}/businesses/working-hours/${businessId}`, {
        workingHours: workingHoursData,
        slotIntervalMin: parseInt(slotIntervalMin || '30', 10),
      });

      await loadSlotsForDate(selectedDate);
      Alert.alert('Başarılı', 'Çalışma saatleri ve slot aralığı kaydedildi');
    } catch (error) {
      logError('ScheduleScreen', 'Çalışma saatleri kaydedilirken hata');
      Alert.alert('Hata', 'Kaydetme sırasında bir sorun oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Çalışma Saatleri</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Çalışma saatleri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Çalışma Saatleri</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveSchedule}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Randevu Slotları</Text>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12 }}>
            <Text style={{ color: '#374151', marginBottom: 8, fontWeight: '600' }}>Slot Aralığı (dakika)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {['10','15','20','30','45','60'].map(opt => (
                <TouchableOpacity key={opt} onPress={() => setSlotIntervalMin(opt)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: slotIntervalMin === opt ? '#0F4C4C' : '#f3f4f6' }}>
                  <Text style={{ color: slotIntervalMin === opt ? 'white' : '#374151', fontWeight: '600' }}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: '#6b7280', marginTop: 8 }}>Kaydetmek için herhangi bir günün saatini değiştirmeniz yeterli (geçici). İsterseniz ayrıca Kaydet butonuna da basabilirsiniz.</Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' }}
            onPress={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 1);
              setSelectedDate(next);
            }}
          >
            <Text style={{ color: '#374151' }}>Tarih: {selectedDate.toLocaleDateString('tr-TR')}</Text>
            <Text style={{ color: '#6b7280', marginTop: 4 }}>Dokun: Sonraki gün</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 12, backgroundColor: 'white', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
            {loadingSlots ? (
              <Text style={{ color: '#6b7280' }}>Yükleniyor...</Text>
            ) : slots.length === 0 ? (
              <Text style={{ color: '#6b7280' }}>Uygun slot bulunamadı</Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {slots.map((s) => (
                  <View key={s.time} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: s.available ? '#ecfeff' : '#fee2e2', borderWidth: 1, borderColor: s.available ? '#06b6d4' : '#ef4444' }}>
                    <Text style={{ color: s.available ? '#0e7490' : '#b91c1c', fontWeight: '600' }}>{s.time}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Haftalık Çalışma Saatleri</Text>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day}</Text>
                <Switch
                  value={workingHours[day]?.isOpen || false}
                  onValueChange={(value) => updateWorkingHours(day, 'isOpen', value)}
                  trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
                  thumbColor={workingHours[day]?.isOpen ? '#ffffff' : '#f4f3f4'}
                />
              </View>
              
              {workingHours[day]?.isOpen && (
                <View style={styles.timeInputs}>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>Başlangıç</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={workingHours[day]?.startTime || '09:00'}
                      onChangeText={(value) => updateWorkingHours(day, 'startTime', value)}
                      placeholder="09:00"
                    />
                  </View>
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeLabel}>Bitiş</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={workingHours[day]?.endTime || '18:00'}
                      onChangeText={(value) => updateWorkingHours(day, 'endTime', value)}
                      placeholder="18:00"
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Molalar</Text>
            <TouchableOpacity style={styles.addBreakButton} onPress={addBreakTime}>
              <Ionicons name="add" size={20} color="#0F4C4C" />
              <Text style={styles.addBreakText}>Mola Ekle</Text>
            </TouchableOpacity>
          </View>
          
          {breakTimes.map((breakTime) => (
            <View key={breakTime.id} style={styles.breakCard}>
              <View style={styles.breakInfo}>
                <Text style={styles.breakDay}>{breakTime.day}</Text>
                <Text style={styles.breakTime}>{breakTime.startTime} - {breakTime.endTime}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteBreakButton}
                onPress={() => removeBreakTime(breakTime.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>Müşteriler sadece açık saatlerde randevu alabilir</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>Saat formatı: HH:MM (24 saat)</Text>
          </View>
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
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  addBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  addBreakText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  breakCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  breakInfo: {
    flex: 1,
  },
  breakDay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  breakTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteBreakButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  infoSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});



