import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';


export default function ServicesScreen({ navigation }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      console.log('Hizmetler yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      console.log('İşletme ID aranıyor, userId:', user.id);
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      console.log('Bulunan işletme ID:', foundBusinessId);
      setBusinessId(foundBusinessId);
      
      // Hizmetleri API'den yükle
      console.log('Hizmetler API\'den alınıyor...');
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      console.log('API\'den gelen hizmetler:', businessData.services);
      setServices(businessData.services || []);
      
    } catch (error) {
      console.error('Hizmetler yüklenirken hata:', error);
      console.error('Hata detayları:', error.response?.data);
      console.error('Status code:', error.response?.status);
      Alert.alert('Hata', 'Hizmetler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const findBusinessId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      setBusinessId(response.data.id);
    } catch (error) {
      console.error('İşletme ID bulunurken hata:', error);
    }
  };

  const add = async () => {
    if (!name.trim()) {
      Alert.alert('Uyarı', 'Hizmet adı giriniz');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Uyarı', 'Geçerli bir ücret giriniz');
      return;
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert('Uyarı', 'Geçerli bir süre giriniz');
      return;
    }
    
    try {
      const newService = {
        name: name.trim(),
        price: Number(price),
        durationMin: Number(duration),
        vehicleType: 'SEDAN',
        businessId: businessId
      };
      
      const response = await axios.post(`${API_BASE_URL}/services`, newService);
      
      // Başarılı olursa listeyi yenile
      await loadServices();
      
      setName('');
      setPrice('');
      setDuration('');
      
      Alert.alert('Başarılı', 'Hizmet başarıyla eklendi');
    } catch (error) {
      console.error('Hizmet eklenirken hata:', error);
      Alert.alert('Hata', 'Hizmet eklenirken bir hata oluştu');
    }
  };

  const remove = async (serviceId) => {
    Alert.alert(
      'Hizmeti Sil',
      'Bu hizmeti silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/services/${serviceId}`);
              await loadServices();
              Alert.alert('Başarılı', 'Hizmet başarıyla silindi');
            } catch (error) {
              console.error('Hizmet silinirken hata:', error);
              Alert.alert('Hata', 'Hizmet silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
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
          <Text style={styles.title}>Hizmetlerimi Düzenle</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Hizmetler yükleniyor...</Text>
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
        <Text style={styles.title}>Hizmetlerimi Düzenle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Yeni Hizmet Ekle</Text>
          <View style={styles.formRow}>
            <TextInput 
              placeholder="Hizmet adı" 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
            />
          </View>
          <View style={styles.formRow}>
            <TextInput 
              placeholder="Ücret (₺)" 
              style={[styles.input, styles.halfInput]} 
              value={price} 
              onChangeText={setPrice} 
              keyboardType="numeric" 
            />
            <TextInput 
              placeholder="Süre (dk)" 
              style={[styles.input, styles.halfInput]} 
              value={duration} 
              onChangeText={setDuration} 
              keyboardType="numeric" 
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={add}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Hizmet Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Mevcut Hizmetler ({services.length})</Text>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{service.price} ₺</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{service.durationMin} dk</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => remove(service.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
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
  addSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  halfInput: {
    width: '48%',
  },
  addButton: {
    backgroundColor: '#0F4C4C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  servicesSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
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



