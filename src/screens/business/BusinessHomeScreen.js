import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://192.168.1.20:3001';

export default function BusinessHomeScreen({ navigation }) {
  console.log('=== BusinessHomeScreen MOUNT OLDU ===');
  
  const insets = useSafeAreaInsets();
  const { user, loading: authLoading } = useAuth();

  console.log('BusinessHomeScreen render edildi, user:', user);
  console.log('User ID:', user?.id);
  console.log('User Role:', user?.role);
  console.log('Auth Loading:', authLoading);
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [stats, setStats] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [socketRef, setSocketRef] = useState(null);

  const quickActions = [
    { title: 'Hizmetlerimi Düzenle', icon: 'construct', onPress: () => navigation.navigate('Services') },
    { title: 'Çalışma Saatleri', icon: 'time', onPress: () => navigation.navigate('Schedule') },
    { title: 'Randevularım', icon: 'calendar', onPress: () => navigation.navigate('BusinessAppointments') },
    { title: 'İşletme Ayarları', icon: 'settings', onPress: () => navigation.navigate('BusinessProfile') },
  ];

  useEffect(() => {
    console.log('=== useEffect ÇALIŞTI ===');
    console.log('User:', user);
    
    if (user) {
      console.log('User var, loadBusinessData çağrılıyor');
      loadBusinessData();
    } else {
      console.log('User yok');
    }
  }, []);

  // Socket.IO: işletme odasına katıl ve randevu olaylarını dinle
  useEffect(() => {
    if (!businessId) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    setSocketRef(socket);
    socket.on('connect', () => {
      socket.emit('join:business', businessId);
    });
    socket.on('appointment:created', (payload) => {
      // Yeni pending randevuyu listeye en üste ekle
      setPendingAppointments((prev) => [{
        id: payload.id,
        customerName: payload.customerName || 'Müşteri',
        service: payload.serviceName || 'Hizmet',
        time: payload.time,
        date: payload.date,
        phone: payload.phone || 'Telefon yok',
      }, ...prev]);
    });
    socket.on('appointment:updated', (payload) => {
      // Eğer CONFIRMED olduysa upcoming’a ekle; CANCELLED/COMPLETED ise listelerden çıkar
      setPendingAppointments((prev) => prev.filter(p => p.id !== payload.id));
      setUpcomingAppointments((prev) => {
        // payload.status'a göre ekle/çıkar
        if (payload.status === 'CONFIRMED') {
          const exists = prev.some(p => p.id === payload.id);
          if (exists) return prev;
          const added = [...prev, {
            id: payload.id,
            customerName: '-',
            service: '-',
            time: payload.time,
            date: payload.date,
          }];
          // Zaman yaklaşımına göre sırala
          const toDateTime = (d, t) => new Date(`${d}T${t}:00`).getTime();
          const nowTs = Date.now();
          return added.sort((a, b) => (toDateTime(a.date, a.time) - nowTs) - (toDateTime(b.date, b.time) - nowTs));
        }
        // CONFIRMED dışındaki durumlarda varsa çıkar
        return prev.filter(p => p.id !== payload.id);
      });
    });
    socket.on('stats:invalidate', () => {
      // İstatistikleri yenile
      loadStats(businessId);
    });
    return () => {
      socket.disconnect();
    };
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      console.log('İşletme verileri yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      console.log('İşletme ID aranıyor, userId:', user.id);
      console.log('API URL:', `${API_BASE_URL}/businesses/owner/${user.id}`);
      
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      console.log('Business ID response:', businessIdResponse.data);
      
      const foundBusinessId = businessIdResponse.data.id;
      console.log('Bulunan işletme ID:', foundBusinessId);
      setBusinessId(foundBusinessId);
      
      // İşletme bilgilerini yükle
      await loadBusinessInfo(foundBusinessId);
      
      // İstatistikleri yükle
      await loadStats(foundBusinessId);
      
      // Randevuları yükle
      await loadAppointments(foundBusinessId);
      
    } catch (error) {
      console.error('İşletme verileri yüklenirken hata:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const findBusinessId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      setBusinessId(response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('İşletme ID bulunurken hata:', error);
      return null;
    }
  };

  const loadBusinessInfo = async (businessIdParam = businessId) => {
    try {
      console.log('İşletme bilgileri yükleniyor, businessId:', businessIdParam);
      // İşletme bilgilerini API'den al
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${businessIdParam}`);
      const businessData = response.data;
      
      console.log('API\'den gelen işletme verisi:', businessData);
      
      const businessInfo = {
        name: businessData.name || 'İşletme Adı',
        email: businessData.owner?.email || 'email@example.com',
        status: businessData.isOpen ? 'Açık' : 'Kapalı',
        hours: getWorkingHours(businessData.workingHours),
        isOpen: businessData.isOpen
      };
      
      console.log('Set edilecek işletme bilgisi:', businessInfo);
      setBusiness(businessInfo);
    } catch (error) {
      console.error('İşletme bilgileri yüklenirken hata:', error);
      // Fallback veriler
      setBusiness({
        name: user.name || 'İşletme Adı',
        email: user.email || 'email@example.com',
        status: 'Açık',
        hours: '09:00 - 18:00',
        isOpen: true
      });
    }
  };

  const getWorkingHours = (workingHours) => {
    console.log('getWorkingHours çağrıldı, workingHours:', workingHours);
    
    if (!workingHours || workingHours.length === 0) {
      console.log('Working hours boş, varsayılan döndürülüyor');
      return '09:00 - 18:00';
    }
    
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
    console.log('Bugünün günü:', today);
    const dayOfWeek = today === 0 ? 7 : today;
    console.log('Aranan dayOfWeek:', dayOfWeek);
    
    const todayHours = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    console.log('Bulunan bugünkü saatler:', todayHours);
    
    if (todayHours && todayHours.isOpen) {
      const hours = `${todayHours.openTime} - ${todayHours.closeTime}`;
      console.log('Açık saatler:', hours);
      return hours;
    }
    
    console.log('Kapalı döndürülüyor');
    return 'Kapalı';
  };

  const handleApproveAppointment = async (appointmentId) => {
    try {
      console.log('Randevu onaylanıyor:', appointmentId);
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        status: 'CONFIRMED'
      });
      console.log('Randevu onaylandı:', response.data);
      
      // Randevuları yeniden yükle
      await loadAppointments(businessId);
      
      Alert.alert('Başarılı', 'Randevu onaylandı');
    } catch (error) {
      console.error('Randevu onaylama hatası:', error);
      Alert.alert('Hata', 'Randevu onaylanamadı');
    }
  };

  const handleRejectAppointment = async (appointmentId) => {
    try {
      console.log('Randevu reddediliyor:', appointmentId);
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        status: 'CANCELLED'
      });
      console.log('Randevu reddedildi:', response.data);
      
      // Randevuları yeniden yükle
      await loadAppointments(businessId);
      
      Alert.alert('Başarılı', 'Randevu reddedildi');
    } catch (error) {
      console.error('Randevu reddetme hatası:', error);
      Alert.alert('Hata', 'Randevu reddedilemedi');
    }
  };

  const loadStats = async (businessIdParam = businessId) => {
    try {
      // İstatistikleri API'den al
      const response = await axios.get(`${API_BASE_URL}/businesses/stats/${businessIdParam}`);
      const statsData = response.data;
      
      setStats([
        { 
          label: 'Bugünkü Randevular', 
          value: statsData.todayAppointments.toString(), 
          icon: 'calendar', 
          color: '#0F4C4C' 
        },
        { 
          label: 'Bu Ay Gelir', 
          value: `₺${statsData.monthlyRevenue.toLocaleString()}`, 
          icon: 'cash', 
          color: '#10b981' 
        },
        { 
          label: 'Toplam Müşteri', 
          value: statsData.totalCustomers.toString(), 
          icon: 'people', 
          color: '#3b82f6' 
        },
        { 
          label: 'Ortalama Puan', 
          value: statsData.avgRating.toFixed(1), 
          icon: 'star', 
          color: '#f59e0b' 
        },
      ]);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      // Fallback veriler
      setStats([
        { label: 'Bugünkü Randevular', value: '0', icon: 'calendar', color: '#0F4C4C' },
        { label: 'Bu Ay Gelir', value: '₺0', icon: 'cash', color: '#10b981' },
        { label: 'Toplam Müşteri', value: '0', icon: 'people', color: '#3b82f6' },
        { label: 'Ortalama Puan', value: '0.0', icon: 'star', color: '#f59e0b' },
      ]);
    }
  };

  const loadAppointments = async (businessIdParam = businessId) => {
    try {
      console.log('loadAppointments başladı, businessIdParam:', businessIdParam);
      // Tüm randevuları API'den al (tarih filtresi olmadan)
      const url = `${API_BASE_URL}/appointments/business/${businessIdParam}`;
      console.log('Randevular API URL:', url);
      const response = await axios.get(url);
      const appointments = response.data;
      console.log('API\'den gelen randevular:', appointments);
      
      // Yaklaşan randevular (CONFIRMED durumundaki gelecek tarihli)
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const toDateTime = (d, t) => new Date(`${d}T${t}:00`);
      const nowTs = now.getTime();
      const upcoming = appointments
        .filter(apt => apt.status === 'CONFIRMED' && apt.date >= today)
        .map(apt => ({
          id: apt.id,
          customerName: apt.customer?.name || 'Müşteri',
          service: apt.service?.name || 'Hizmet',
          selectedServices: apt.selectedServices || null,
          time: apt.time,
          date: apt.date,
        }))
        .sort((a, b) => {
          const aTs = toDateTime(a.date, a.time).getTime() - nowTs;
          const bTs = toDateTime(b.date, b.time).getTime() - nowTs;
          return aTs - bTs;
        });
      
      setUpcomingAppointments(upcoming);

      // Onay bekleyen randevular (PENDING durumundaki gelecek tarihli)
      const pending = appointments
        .filter(apt => apt.status === 'PENDING' && apt.date >= today)
        .map(apt => ({
          id: apt.id,
          customerName: apt.customer?.name || 'Müşteri',
          service: apt.service?.name || 'Hizmet',
          selectedServices: apt.selectedServices || null,
          time: apt.time,
          date: apt.date,
          phone: apt.customer?.phone || 'Telefon yok',
        }));
      
      setPendingAppointments(pending);
    } catch (error) {
      console.error('Randevular yüklenirken hata:', error);
      // Fallback veriler
      setUpcomingAppointments([]);
      setPendingAppointments([]);
    }
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
              <Text style={styles.businessStatus}>Veriler getiriliyor</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>İşletme verileri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.businessInfo}>
          <View style={styles.businessLogo}>
            <Ionicons name="business" size={40} color="#0F4C4C" />
          </View>
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>{business?.name || 'İşletme Adı'}</Text>
            <Text style={styles.businessStatus}>{business?.status || 'Açık'} • {business?.hours || '09:00 - 18:00'}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* En üstte - Yaklaşan Randevular (yatay ve kompakt) */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.upcomingTitle}>Yaklaşan Randevular</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessAppointments')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {upcomingAppointments.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingHorizontal}
            >
              {upcomingAppointments.slice(0, 8).map((appointment) => (
                <View key={appointment.id} style={styles.upcomingCardCompact}>
                  <View style={styles.upcomingCardHeader}>
                    <View style={styles.upcomingTimePill}>
                      <Ionicons name="time-outline" size={12} color="#0F4C4C" />
                      <Text style={styles.upcomingTimePillText}>{appointment.time}</Text>
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.upcomingCustomerCompact}>{appointment.customerName}</Text>
                  {(() => {
                    // selectedServices JSON string olarak gelebilir, parse et
                    let services = appointment.selectedServices;
                    if (typeof services === 'string') {
                      try {
                        services = JSON.parse(services);
                      } catch (e) {
                        services = null;
                      }
                    }
                    
                    if (services && Array.isArray(services) && services.length > 0) {
                      return (
                        <Text numberOfLines={1} style={styles.upcomingServiceCompact}>
                          {services.length} hizmet seçildi
                        </Text>
                      );
                    } else {
                      return (
                        <Text numberOfLines={1} style={styles.upcomingServiceCompact}>
                          {appointment.service}
                        </Text>
                      );
                    }
                  })()}
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyStateCard}>
              <Ionicons name="calendar-outline" size={32} color="#9ca3af" />
              <Text style={styles.emptyStateText}>Yaklaşan bir randevunuz bulunmamaktadır</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const CardComponent = stat.label === 'Ortalama Puan' ? TouchableOpacity : View;
            const onPress = stat.label === 'Ortalama Puan' ? () => navigation.navigate('BusinessReviews') : undefined;
            return (
              <CardComponent key={index} style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </CardComponent>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon} size={28} color="#0F4C4C" />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hızlı işlemlerin altında - Onay Bekleyen Randevular */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Onay Bekleyen Randevular</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessAppointments')}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pendingList}>
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((appointment) => (
                <View key={appointment.id} style={styles.pendingCard}>
                  <View style={styles.pendingTime}>
                    <Text style={styles.pendingTimeText}>{appointment.time}</Text>
                  </View>
                  <View style={styles.pendingDetails}>
                    <Text style={styles.pendingCustomer}>{appointment.customerName}</Text>
                    {(() => {
                      // selectedServices JSON string olarak gelebilir, parse et
                      let services = appointment.selectedServices;
                      if (typeof services === 'string') {
                        try {
                          services = JSON.parse(services);
                        } catch (e) {
                          services = null;
                        }
                      }
                      
                      if (services && Array.isArray(services) && services.length > 0) {
                        return (
                          <Text style={styles.pendingService}>
                            {services.length} hizmet seçildi
                          </Text>
                        );
                      } else {
                        return (
                          <Text style={styles.pendingService}>
                            {appointment.service}
                          </Text>
                        );
                      }
                    })()}
                    <Text style={styles.pendingPhone}>{appointment.phone}</Text>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity 
                      style={styles.approveButton}
                      onPress={() => handleApproveAppointment(appointment.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectButton}
                      onPress={() => handleRejectAppointment(appointment.id)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateCard}>
                <Ionicons name="time-outline" size={32} color="#9ca3af" />
                <Text style={styles.emptyStateText}>Onay bekleyen bir randevunuz bulunmamaktadır</Text>
              </View>
            )}
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
  businessStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Alt bar için yeterli boşluk
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  appointmentsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentTime: {
    backgroundColor: '#0F4C4C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  timeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  appointmentDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  appointmentStatus: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  // Yaklaşan randevular (sade, bilgi amaçlı)
  upcomingSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F4C4C',
    marginBottom: 12,
  },
  upcomingList: {
    gap: 8,
  },
  upcomingHorizontal: {
    paddingVertical: 4,
    gap: 12,
    paddingRight: 4,
  },
  upcomingCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  upcomingCardCompact: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 12,
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upcomingTimePillText: {
    color: '#0F4C4C',
    fontWeight: '600',
    fontSize: 12,
  },
  upcomingCustomerCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  upcomingServiceCompact: {
    fontSize: 12,
    color: '#6b7280',
  },
  upcomingTime: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  upcomingTimeText: {
    color: '#0F4C4C',
    fontWeight: '600',
    fontSize: 12,
  },
  upcomingDetails: {
    flex: 1,
  },
  upcomingCustomer: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  upcomingService: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Onay bekleyen randevular (işlem yapılabilir)
  pendingList: {
    gap: 12,
  },
  pendingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingTime: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  pendingTimeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  pendingDetails: {
    flex: 1,
  },
  pendingCustomer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  pendingService: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  pendingPhone: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyStateCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});
