import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { logError } from '../../utils/errorMessages';


export default function BusinessProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  useEffect(() => {
    if (user) {
      loadBusinessProfile();
    }
  }, [user]);

  const loadBusinessProfile = async () => {
    try {
      setLoading(true);
      
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      const businessInfo = {
        name: businessData.name || 'İşletme Adı',
        email: businessData.owner?.email || user.email || 'email@example.com',
        phone: businessData.owner?.phone || 'Telefon',
        address: businessData.address || 'Adres bilgisi',
        city: businessData.city || 'Şehir',
        district: businessData.district || 'İlçe',
        isOpen: businessData.isOpen,
        logoUrl: businessData.logoUrl,
        rating: businessData.rating || 0,
        totalAppointments: businessData.totalAppointments || 0,
        totalCustomers: businessData.totalCustomers || 0,
        monthlyRevenue: businessData.monthlyRevenue || 0
      };
      
      setBusiness(businessInfo);
      
    } catch (error) {
      logError('BusinessProfileScreen', 'İşletme profili yüklenirken hata');
      setBusiness({
        name: user.name || 'İşletme Adı',
        email: user.email || 'email@example.com',
        phone: user.phone || 'Telefon',
        address: 'Adres bilgisi',
        city: user.city || 'Şehir',
        district: user.district || 'İlçe',
        isOpen: true,
        logoUrl: null,
        rating: 0,
        totalAppointments: 0,
        totalCustomers: 0,
        monthlyRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const findBusinessId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      setBusinessId(response.data.id);
    } catch (error) {
      logError('BusinessProfileScreen', 'İşletme ID bulunurken hata');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'İşletme hesabından çıkmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={styles.businessInfo}>
            <View style={styles.businessLogo}>
              <Ionicons name="business" size={40} color="#0F4C4C" />
            </View>
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>Yükleniyor...</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>İşletme profili yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.businessInfo}>
          <View style={styles.businessLogo}>
            {business?.logoUrl ? (
              <Image 
                source={{ uri: business.logoUrl }} 
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="business" size={40} color="#0F4C4C" />
            )}
          </View>
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{business?.name || 'İşletme Adı'}</Text>
            <Text style={styles.businessEmail}>{business?.email || 'email@example.com'}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: business?.isOpen ? '#10b981' : '#ef4444' }]} />
              <Text style={[styles.statusText, { color: business?.isOpen ? '#10b981' : '#ef4444' }]}>
                {business?.isOpen ? 'Açık' : 'Kapalı'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşletme Bilgileri</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('BusinessDetails')}
          >
            <Ionicons name="business-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>İşletme Detayları</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('BusinessAddress')}
          >
            <Ionicons name="location-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Adres Bilgileri</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('BusinessContact')}
          >
            <Ionicons name="call-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>İletişim Bilgileri</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BusinessImageSettings')}>
            <Ionicons name="image-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Görsel Ayarları</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hizmet Yönetimi</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Services')}>
            <Ionicons name="construct-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Hizmetlerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Schedule')}>
            <Ionicons name="time-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Çalışma Saatleri</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PriceList')}
          >
            <Ionicons name="pricetag-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Fiyat Listesi</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Randevu Yönetimi</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BusinessAppointments')}>
            <Ionicons name="calendar-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Randevularım</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BusinessReviews')}>
            <Ionicons name="star-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Değerlendirmelerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BlockedSlots')}>
            <Ionicons name="time-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Saat Engelleme</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('AppointmentSettings')}
          >
            <Ionicons name="settings-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Randevu Ayarları</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finansal</Text>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('IncomeReports')}
          >
            <Ionicons name="card-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Gelir Raporları</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('PaymentSettings')}
          >
            <Ionicons name="wallet-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Ödeme Ayarları</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Yardım & Destek</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Hakkında</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  businessLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  businessEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Alt bar için yeterli boşluk
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
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
