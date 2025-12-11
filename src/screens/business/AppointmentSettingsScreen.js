import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';


export default function AppointmentSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  
  const [autoApprove, setAutoApprove] = useState(false);
  const [advanceBooking, setAdvanceBooking] = useState(true);
  const [sameDayBooking, setSameDayBooking] = useState(true);
  const [cancellationAllowed, setCancellationAllowed] = useState(true);
  const [reschedulingAllowed, setReschedulingAllowed] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [minAdvanceHours, setMinAdvanceHours] = useState(2);
  const [slotDuration, setSlotDuration] = useState(30);
  const [maxDailyAppointments, setMaxDailyAppointments] = useState(20);

  useEffect(() => {
    if (user) {
      loadAppointmentSettings();
    }
  }, [user]);

  const loadAppointmentSettings = async () => {
    try {
      setLoading(true);
      
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      
      
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Randevu ayarları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!businessId) {
        Alert.alert('Hata', 'İşletme ID bulunamadı');
        return;
      }

      const settingsData = {
        autoApprove,
        advanceBooking,
        sameDayBooking,
        cancellationAllowed,
        reschedulingAllowed,
        reminderEnabled,
        maxAdvanceDays,
        minAdvanceHours,
        slotDuration,
        maxDailyAppointments
      };

      
      await axios.patch(`${API_BASE_URL}/businesses/${businessId}`, settingsData);
      
      Alert.alert('Başarılı', 'Randevu ayarları güncellendi');
      
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Randevu ayarları güncellenirken bir hata oluştu');
    }
  };


  const handleReset = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm randevu ayarları varsayılan değerlere sıfırlanacak. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: () => {
          setAutoApprove(false);
          setAdvanceBooking(true);
          setSameDayBooking(true);
          setCancellationAllowed(true);
          setReschedulingAllowed(true);
          setReminderEnabled(true);
          setMaxAdvanceDays(30);
          setMinAdvanceHours(2);
          setSlotDuration(30);
          setMaxDailyAppointments(20);
        }}
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Randevu Ayarları</Text>
          <View style={styles.resetButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Randevu ayarları yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Randevu Ayarları</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otomatik Onay</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Otomatik Onay</Text>
              <Text style={styles.settingDescription}>Randevular otomatik olarak onaylansın</Text>
            </View>
            <Switch
              value={autoApprove}
              onValueChange={setAutoApprove}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={autoApprove ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Randevu Alma Kuralları</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>İleri Tarihli Randevu</Text>
              <Text style={styles.settingDescription}>Müşteriler ileri tarihli randevu alabilsin</Text>
            </View>
            <Switch
              value={advanceBooking}
              onValueChange={setAdvanceBooking}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={advanceBooking ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Aynı Gün Randevu</Text>
              <Text style={styles.settingDescription}>Müşteriler aynı gün randevu alabilsin</Text>
            </View>
            <Switch
              value={sameDayBooking}
              onValueChange={setSameDayBooking}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={sameDayBooking ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>İptal Etme</Text>
              <Text style={styles.settingDescription}>Müşteriler randevu iptal edebilsin</Text>
            </View>
            <Switch
              value={cancellationAllowed}
              onValueChange={setCancellationAllowed}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={cancellationAllowed ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Tarih Değiştirme</Text>
              <Text style={styles.settingDescription}>Müşteriler randevu tarihini değiştirebilsin</Text>
            </View>
            <Switch
              value={reschedulingAllowed}
              onValueChange={setReschedulingAllowed}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={reschedulingAllowed ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Hatırlatma Bildirimleri</Text>
              <Text style={styles.settingDescription}>Müşterilere randevu hatırlatması gönder</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={reminderEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zaman Sınırları</Text>
          
          <View style={styles.timeSetting}>
            <Text style={styles.timeLabel}>Maksimum İleri Tarih (Gün)</Text>
            <View style={styles.timeSelector}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setMaxAdvanceDays(Math.max(1, maxAdvanceDays - 1))}
              >
                <Ionicons name="remove" size={20} color="#0F4C4C" />
              </TouchableOpacity>
              <Text style={styles.timeValue}>{maxAdvanceDays}</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setMaxAdvanceDays(Math.min(365, maxAdvanceDays + 1))}
              >
                <Ionicons name="add" size={20} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeSetting}>
            <Text style={styles.timeLabel}>Minimum İleri Tarih (Saat)</Text>
            <View style={styles.timeSelector}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setMinAdvanceHours(Math.max(1, minAdvanceHours - 1))}
              >
                <Ionicons name="remove" size={20} color="#0F4C4C" />
              </TouchableOpacity>
              <Text style={styles.timeValue}>{minAdvanceHours}</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setMinAdvanceHours(Math.min(24, minAdvanceHours + 1))}
              >
                <Ionicons name="add" size={20} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeSetting}>
            <Text style={styles.timeLabel}>Randevu Süresi (Dakika)</Text>
            <View style={styles.timeSelector}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setSlotDuration(Math.max(15, slotDuration - 15))}
              >
                <Ionicons name="remove" size={20} color="#0F4C4C" />
              </TouchableOpacity>
              <Text style={styles.timeValue}>{slotDuration}</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setSlotDuration(Math.min(180, slotDuration + 15))}
              >
                <Ionicons name="add" size={20} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeSetting}>
            <Text style={styles.timeLabel}>Günlük Maksimum Randevu</Text>
            <View style={styles.timeSelector}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setMaxDailyAppointments(Math.max(1, maxDailyAppointments - 1))}
              >
                <Ionicons name="remove" size={20} color="#0F4C4C" />
              </TouchableOpacity>
              <Text style={styles.timeValue}>{maxDailyAppointments}</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setMaxDailyAppointments(Math.min(100, maxDailyAppointments + 1))}
              >
                <Ionicons name="add" size={20} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save" size={20} color="white" />
          <Text style={styles.saveButtonText}>Ayarları Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeSetting: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#0F4C4C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
