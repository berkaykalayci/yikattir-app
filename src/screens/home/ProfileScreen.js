import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';


export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user: authUser, logout } = useAuth();

  useEffect(() => {
    if (authUser) {
      loadUserProfile();
    }
  }, [authUser]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users/${authUser.id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı profili yüklenirken hata:', error);
      // Fallback data
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone || '5551112233',
        addresses: [],
        paymentMethods: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // RootNavigation otomatik olarak Welcome ekranına yönlendirecek
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}>
        {/* Kullanıcı Bilgileri */}
        <View style={styles.userInfoCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#0F4C4C" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '5551112233'}</Text>
            {user?.city && user?.district && (
              <Text style={styles.userLocation}>{user.city}, {user.district}</Text>
            )}
          </View>
        </View>

        {/* Menü Öğeleri */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('ProfileInfo')}
          >
            <Ionicons name="person-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Profil Bilgileri</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <Ionicons name="card-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Ödeme Yöntemleri</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Addresses')}
          >
            <Ionicons name="location-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Adreslerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('AppointmentHistory')}
          >
            <Ionicons name="calendar-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Geçmiş Randevular</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('MyReviews')}
          >
            <Ionicons name="star-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Değerlendirmelerim</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Ionicons name="help-buoy-outline" size={24} color="#0F4C4C" />
            <Text style={styles.menuText}>Yardım ve Destek</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Çıkış Yap Butonu */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f4' },
  header: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#6b7280', fontSize: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3e3e3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', color: '#0F4C4C', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  userPhone: { fontSize: 14, color: '#6b7280' },
  userLocation: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  menuText: { flex: 1, fontSize: 16, color: '#0F4C4C', marginLeft: 12 },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});