import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.20:3001';

export default function IncomeReportsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [incomeData, setIncomeData] = useState({
    today: { amount: 0, appointments: 0, average: 0 },
    week: { amount: 0, appointments: 0, average: 0 },
    month: { amount: 0, appointments: 0, average: 0 },
    year: { amount: 0, appointments: 0, average: 0 }
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      loadIncomeData();
    }
  }, [user]);

  const loadIncomeData = async () => {
    try {
      console.log('Gelir verileri yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      // Randevuları API'den al
      const response = await axios.get(`${API_BASE_URL}/appointments/business/${foundBusinessId}`);
      const appointments = response.data;
      
      console.log('API\'den gelen randevular:', appointments);
      
      // Gelir verilerini hesapla
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const calculateIncome = (appointments, startDate) => {
        const filtered = appointments.filter(apt => 
          apt.status === 'COMPLETED' && apt.date >= startDate
        );
        const amount = filtered.reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
        const count = filtered.length;
        const average = count > 0 ? Math.round(amount / count) : 0;
        return { amount, appointments: count, average };
      };
      
      const newIncomeData = {
        today: calculateIncome(appointments, today),
        week: calculateIncome(appointments, weekAgo),
        month: calculateIncome(appointments, monthAgo),
        year: calculateIncome(appointments, yearAgo)
      };
      
      setIncomeData(newIncomeData);
      
      // Son işlemleri al
      const recent = appointments
        .filter(apt => apt.status === 'COMPLETED')
        .slice(0, 10)
        .map(apt => ({
          id: apt.id,
          customer: apt.customer?.name || 'Müşteri',
          service: apt.service?.name || 'Hizmet',
          amount: apt.totalPrice || 0,
          time: apt.time,
          status: 'completed'
        }));
      
      setRecentTransactions(recent);
      
    } catch (error) {
      console.error('Gelir verileri yüklenirken hata:', error);
      Alert.alert('Hata', 'Gelir verileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const currentData = incomeData[selectedPeriod];

  const periods = [
    { key: 'today', label: 'Bugün', icon: 'today' },
    { key: 'week', label: 'Bu Hafta', icon: 'calendar' },
    { key: 'month', label: 'Bu Ay', icon: 'calendar-outline' },
    { key: 'year', label: 'Bu Yıl', icon: 'calendar-sharp' }
  ];

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.customerName}>{item.customer}</Text>
        <Text style={styles.serviceName}>{item.service}</Text>
        <Text style={styles.transactionTime}>{item.time}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={styles.amount}>₺{item.amount}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
          <Text style={styles.statusText}>Tamamlandı</Text>
        </View>
      </View>
    </View>
  );

  const handleExport = () => {
    Alert.alert('Dışa Aktar', 'Gelir raporu PDF olarak dışa aktarılacak');
  };

  const handleShare = () => {
    Alert.alert('Paylaş', 'Gelir raporu paylaşılacak');
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
          <Text style={styles.headerTitle}>Gelir Raporları</Text>
          <View style={styles.headerButtons} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Gelir verileri yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Gelir Raporları</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
            <Ionicons name="download-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dönem Seçimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dönem Seçimi</Text>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Ionicons 
                  name={period.icon} 
                  size={20} 
                  color={selectedPeriod === period.key ? '#0F4C4C' : '#6b7280'} 
                />
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gelir Özeti */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gelir Özeti</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₺{currentData.amount.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Toplam Gelir</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{currentData.appointments}</Text>
              <Text style={styles.summaryLabel}>Randevu Sayısı</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>₺{currentData.average}</Text>
              <Text style={styles.summaryLabel}>Ortalama</Text>
            </View>
          </View>
        </View>

        {/* Son İşlemler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          {recentTransactions.length > 0 ? (
            <FlatList
              data={recentTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Henüz işlem yok</Text>
              <Text style={styles.emptyText}>Tamamlanan randevular burada görünecek</Text>
            </View>
          )}
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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  periodButtonActive: {
    backgroundColor: '#f0f9ff',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#0F4C4C',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  transactionItem: {
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
  transactionInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
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
});