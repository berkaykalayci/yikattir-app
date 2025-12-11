import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';


export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/addresses/user/${user.id}`);
      setAddresses(response.data);
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const setAsDefault = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/addresses/${id}/set-default`);
      setAddresses(prev => 
        prev.map(address => ({
          ...address,
          isDefault: address.id === id
        }))
      );
      Alert.alert('Başarılı', 'Varsayılan adres güncellendi');
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      Alert.alert('Hata', 'Varsayılan adres güncellenemedi');
    }
  };

  const deleteAddress = (id) => {
    Alert.alert(
      'Adresi Sil',
      'Bu adresi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/addresses/${id}`);
              setAddresses(prev => prev.filter(address => address.id !== id));
              Alert.alert('Başarılı', 'Adres silindi');
            } catch (error) {
              logError('$(basename "$file" .js)', 'Hata');
              Alert.alert('Hata', 'Adres silinemedi');
            }
          }
        }
      ]
    );
  };

  const renderAddress = (address) => (
    <View key={address.id} style={styles.addressContainer}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Ionicons name="location" size={20} color="#0F4C4C" />
          <Text style={styles.addressTitle}>{address.title}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Varsayılan</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditAddress', { address })}
          >
            <Ionicons name="create-outline" size={18} color="#0F4C4C" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteAddress(address.id)}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.addressText}>{address.addressLine1}</Text>
      {address.addressLine2 && (
        <Text style={styles.addressText}>{address.addressLine2}</Text>
      )}
      <Text style={styles.addressLocation}>{address.district}, {address.city}</Text>
      {address.postalCode && (
        <Text style={styles.addressPhone}>Posta Kodu: {address.postalCode}</Text>
      )}
      
      {!address.isDefault && (
        <TouchableOpacity 
          style={styles.setDefaultButton}
          onPress={() => setAsDefault(address.id)}
        >
          <Text style={styles.setDefaultText}>Varsayılan Yap</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Adreslerim</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAddress')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F4C4C" />
            <Text style={styles.loadingText}>Adresler yükleniyor...</Text>
          </View>
        ) : addresses.length > 0 ? (
          <View style={styles.addressesList}>
            {addresses.map(renderAddress)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Henüz adres eklenmemiş</Text>
            <Text style={styles.emptySubtitle}>
              Randevu almak için bir adres ekleyin
            </Text>
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => navigation.navigate('AddAddress')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addAddressText}>Adres Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>Adres bilgileriniz güvende</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={20} color="#10b981" />
            <Text style={styles.infoText}>Yakın işletmeleri bulun</Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  addressesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  addressContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  addressLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  setDefaultButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: '#0F4C4C',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addAddressText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  },
});
