import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Image, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import * as ImagePicker from 'expo-image-picker';
import { logError } from '../../utils/errorMessages';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function BusinessSetupScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1); // 1: Çalışma Saatleri, 2: Hizmetler, 3: Görsel
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Çalışma Saatleri
  const [workingHours, setWorkingHours] = useState({});
  const [slotIntervalMin, setSlotIntervalMin] = useState('30');

  // Hizmetler
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');

  // Görsel
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const businessRes = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      
      if (!businessRes.data || !businessRes.data.id) {
        Alert.alert('Hata', 'İşletme bilgisi bulunamadı. Lütfen destek ekibi ile iletişime geçin.');
        return;
      }
      
      const id = businessRes.data.id;
      setBusinessId(id);

      const profileRes = await axios.get(`${API_BASE_URL}/businesses/profile/${id}`);
      const businessData = profileRes.data;

      // Çalışma saatlerini yükle
      if (businessData.workingHours && businessData.workingHours.length > 0) {
        const hours = {};
        businessData.workingHours.forEach(wh => {
          hours[DAYS[wh.dayOfWeek - 1]] = {
            isOpen: wh.isOpen,
            startTime: wh.openTime || '09:00',
            endTime: wh.closeTime || '18:00'
          };
        });
        setWorkingHours(hours);
      } else {
        // Varsayılan saatler
        const defaultHours = {};
        DAYS.forEach(day => {
          defaultHours[day] = {
            isOpen: day !== 'Pazar',
            startTime: '09:00',
            endTime: '18:00'
          };
        });
        setWorkingHours(defaultHours);
      }

      setSlotIntervalMin(businessData.slotIntervalMin?.toString() || '30');
      setServices(businessData.services || []);
      setImageUrl(businessData.imageUrl || '');
    } catch (error) {
      logError('BusinessSetupScreen', 'Veri yükleme hatası');
      if (error.response && error.response.status === 404) {
        Alert.alert('Hata', 'İşletme bilgisi bulunamadı. Lütfen destek ekibi ile iletişime geçin.');
      } else {
        Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const saveWorkingHours = async () => {
    try {
      const workingHoursData = DAYS.map((day, index) => ({
        dayOfWeek: index + 1,
        isOpen: workingHours[day]?.isOpen || false,
        openTime: workingHours[day]?.isOpen ? workingHours[day].startTime : null,
        closeTime: workingHours[day]?.isOpen ? workingHours[day].endTime : null,
      }));

      await axios.put(`${API_BASE_URL}/businesses/working-hours/${businessId}`, {
        workingHours: workingHoursData,
        slotIntervalMin: parseInt(slotIntervalMin || '30', 10)
      });

      return true;
    } catch (error) {
      logError('BusinessSetupScreen', 'Çalışma saatleri kaydetme hatası');
      Alert.alert('Hata', 'Çalışma saatleri kaydedilirken bir hata oluştu');
      return false;
    }
  };

  const addService = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Uyarı', 'Hizmet adı giriniz');
      return;
    }
    if (!servicePrice || isNaN(Number(servicePrice)) || Number(servicePrice) <= 0) {
      Alert.alert('Uyarı', 'Geçerli bir ücret giriniz');
      return;
    }
    if (!serviceDuration || isNaN(Number(serviceDuration)) || Number(serviceDuration) <= 0) {
      Alert.alert('Uyarı', 'Geçerli bir süre giriniz');
      return;
    }

    try {
      const newService = {
        name: serviceName.trim(),
        price: Number(servicePrice),
        durationMin: Number(serviceDuration),
        vehicleType: 'SEDAN',
        businessId: businessId
      };

      await axios.post(`${API_BASE_URL}/services`, newService);
      await loadBusinessData();

      setServiceName('');
      setServicePrice('');
      setServiceDuration('');
    } catch (error) {
      logError('BusinessSetupScreen', 'Hizmet ekleme hatası');
      Alert.alert('Hata', 'Hizmet eklenirken bir hata oluştu');
    }
  };

  const removeService = async (serviceId) => {
    try {
      await axios.delete(`${API_BASE_URL}/services/${serviceId}`);
      await loadBusinessData();
    } catch (error) {
      logError('BusinessSetupScreen', 'Hizmet silme hatası');
      Alert.alert('Hata', 'Hizmet silinirken bir hata oluştu');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf galerisine erişim izni gerekiyor');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'image/jpeg',
        name: 'business-image.jpg',
      });

      const response = await axios.post(
        `${API_BASE_URL}/businesses/${businessId}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${user.token}`,
          },
        }
      );

      setImageUrl(response.data.imageUrl);
    } catch (error) {
      logError('BusinessSetupScreen', 'Görsel yükleme hatası');
      Alert.alert('Hata', 'Görsel yüklenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // En az bir gün açık olmalı
      const hasOpenDay = Object.values(workingHours).some(wh => wh.isOpen);
      return hasOpenDay;
    } else if (currentStep === 2) {
      // En az bir hizmet olmalı
      return services.length > 0;
    } else if (currentStep === 3) {
      // Görsel yüklenmiş olmalı
      return !!imageUrl;
    }
    return false;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const saved = await saveWorkingHours();
      if (saved) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await completeSetup();
    }
  };

  const completeSetup = async () => {
    try {
      setSaving(true);
      await axios.post(
        `${API_BASE_URL}/businesses/setup/complete`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        }
      );

      Alert.alert('Başarılı', 'İşletme kurulumu tamamlandı!', [
        {
          text: 'Tamam',
          onPress: () => {
            // Navigation'ı resetle ve ana ekrana git
            if (navigation && navigation.reset) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'BusinessTabs' }],
              });
            } else {
              // Fallback: navigate kullan
              navigation?.navigate('BusinessTabs');
            }
          }
        }
      ]);
    } catch (error) {
      logError('BusinessSetupScreen', 'Setup tamamlama hatası');
      Alert.alert('Hata', 'Kurulum tamamlanırken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0F4C4C" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>İşletme Kurulumu</Text>
        <Text style={styles.subtitle}>Adım {currentStep} / 3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Adım 1: Çalışma Saatleri */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Çalışma Saatleri</Text>
            <Text style={styles.sectionDescription}>
              İşletmenizin çalışma saatlerini belirleyin. En az bir gün açık olmalıdır.
            </Text>

            <View style={styles.intervalContainer}>
              <Text style={styles.label}>Randevu Aralığı (dakika)</Text>
              <TextInput
                style={styles.intervalInput}
                value={slotIntervalMin}
                onChangeText={setSlotIntervalMin}
                keyboardType="numeric"
                placeholder="30"
              />
            </View>

            {DAYS.map((day) => (
              <View key={day} style={styles.dayRow}>
                <View style={styles.dayInfo}>
                  <Switch
                    value={workingHours[day]?.isOpen || false}
                    onValueChange={(value) => updateWorkingHours(day, 'isOpen', value)}
                    trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
                  />
                  <Text style={styles.dayName}>{day}</Text>
                </View>
                {workingHours[day]?.isOpen && (
                  <View style={styles.timeInputs}>
                    <TextInput
                      style={styles.timeInput}
                      value={workingHours[day]?.startTime || '09:00'}
                      onChangeText={(value) => updateWorkingHours(day, 'startTime', value)}
                      placeholder="09:00"
                    />
                    <Text style={styles.timeSeparator}>-</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={workingHours[day]?.endTime || '18:00'}
                      onChangeText={(value) => updateWorkingHours(day, 'endTime', value)}
                      placeholder="18:00"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Adım 2: Hizmetler */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Hizmetler</Text>
            <Text style={styles.sectionDescription}>
              İşletmenizin sunduğu hizmetleri ekleyin. En az bir hizmet eklemelisiniz.
            </Text>

            <View style={styles.serviceForm}>
              <TextInput
                style={styles.input}
                placeholder="Hizmet Adı"
                value={serviceName}
                onChangeText={setServiceName}
              />
              <View style={styles.serviceRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Fiyat (₺)"
                  value={servicePrice}
                  onChangeText={setServicePrice}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 8 }]}
                  placeholder="Süre (dk)"
                  value={serviceDuration}
                  onChangeText={setServiceDuration}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity style={styles.addButton} onPress={addService}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Hizmet Ekle</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.servicesList}>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDetails}>
                      {service.price}₺ - {service.durationMin} dakika
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeService(service.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Adım 3: Görsel */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.sectionTitle}>İşletme Görseli</Text>
            <Text style={styles.sectionDescription}>
              İşletmenizin görselini yükleyin. Bu görsel müşteriler tarafından görünecektir.
            </Text>

            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={64} color="#9ca3af" />
                  <Text style={styles.imagePlaceholderText}>Görsel Yükle</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => setCurrentStep(currentStep - 1)}
            disabled={saving}
          >
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.nextButton, !canProceedToNextStep() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceedToNextStep() || saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Tamamla' : 'İleri'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#0F4C4C',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F4C4C',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  intervalContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  intervalInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dayRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 8,
    width: 80,
    textAlign: 'center',
    fontSize: 14,
  },
  timeSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  serviceForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#0F4C4C',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#f3f4f6',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#0F4C4C',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.5,
  },
});

