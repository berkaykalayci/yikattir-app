import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';


export default function PriceListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      console.log('PriceListScreen: Hizmetler yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      console.log('PriceListScreen: İşletme ID aranıyor, userId:', user.id);
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      console.log('PriceListScreen: Bulunan işletme ID:', foundBusinessId);
      setBusinessId(foundBusinessId);
      
      // Hizmetleri API'den al
      const servicesUrl = `${API_BASE_URL}/services/business/${foundBusinessId}`;
      console.log('PriceListScreen: Hizmetler API URL:', servicesUrl);
      const response = await axios.get(servicesUrl);
      const servicesData = response.data;
      
      console.log('PriceListScreen: API\'den gelen hizmetler:', servicesData);
      
      setServices(servicesData);
      
    } catch (error) {
      console.error('PriceListScreen: Hizmetler yüklenirken hata:', error);
      console.error('PriceListScreen: Error response:', error.response?.data);
      console.error('PriceListScreen: Error status:', error.response?.status);
      
      // Eğer işletme bulunamadıysa veya 404 hatası varsa, boş liste göster
      if (error.response?.status === 404) {
        console.log('PriceListScreen: İşletme bulunamadı, boş liste gösteriliyor');
        setServices([]);
      } else {
        Alert.alert('Hata', `Hizmetler yüklenirken bir hata oluştu: ${error.response?.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription}>
          {item.vehicleType} • {item.durationMin} dakika
        </Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₺{item.price}</Text>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Fiyat Listesi</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Fiyat listesi yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Fiyat Listesi</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('Services')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmetlerim</Text>
          
          {services.length > 0 ? (
            <FlatList
              data={services}
              renderItem={renderService}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetag-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Henüz hizmet eklenmemiş</Text>
              <Text style={styles.emptyText}>İlk hizmetinizi eklemek için + butonuna tıklayın</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fiyat Bilgileri</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>Fiyatlar güncel ve geçerlidir</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>Süreler tahmini sürelerdir</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="car" size={20} color="#10b981" />
              <Text style={styles.infoText}>Araç tipine göre farklılık gösterebilir</Text>
            </View>
          </View>
        </View>
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
  editButton: {
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
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
});
