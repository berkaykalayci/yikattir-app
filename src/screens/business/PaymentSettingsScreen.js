import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.31:3001';

export default function PaymentSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  
  // Ödeme ayarları state'leri
  const [cashEnabled, setCashEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(false);
  const [installmentEnabled, setInstallmentEnabled] = useState(false);
  const [autoPayment, setAutoPayment] = useState(false);
  const [paymentReminder, setPaymentReminder] = useState(true);
  const [commissionRate, setCommissionRate] = useState(2.5);
  const [minPaymentAmount, setMinPaymentAmount] = useState(50);

  useEffect(() => {
    if (user) {
      loadPaymentSettings();
    }
  }, [user]);

  const loadPaymentSettings = async () => {
    try {
      console.log('Ödeme ayarları yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      // İşletme bilgilerini API'den al
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      console.log('API\'den gelen ödeme ayarları:', businessData);
      
      // Form alanlarını doldur (şimdilik varsayılan değerler kullanıyoruz)
      // Gelecekte API'den bu ayarları alabiliriz
      
    } catch (error) {
      console.error('Ödeme ayarları yüklenirken hata:', error);
      Alert.alert('Hata', 'Ödeme ayarları yüklenirken bir hata oluştu');
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
        cashEnabled,
        cardEnabled,
        onlinePaymentEnabled,
        installmentEnabled,
        autoPayment,
        paymentReminder,
        commissionRate,
        minPaymentAmount
      };

      console.log('Güncellenecek ödeme ayarları:', settingsData);
      
      await axios.patch(`${API_BASE_URL}/businesses/${businessId}`, settingsData);
      
      Alert.alert('Başarılı', 'Ödeme ayarları güncellendi');
      
    } catch (error) {
      console.error('Ödeme ayarları güncelleme hatası:', error);
      Alert.alert('Hata', 'Ödeme ayarları güncellenirken bir hata oluştu');
    }
  };

  const paymentMethods = [
    { id: 1, name: 'Nakit', icon: 'cash', enabled: cashEnabled, onToggle: setCashEnabled },
    { id: 2, name: 'Kredi Kartı', icon: 'card', enabled: cardEnabled, onToggle: setCardEnabled },
    { id: 3, name: 'Online Ödeme', icon: 'globe', enabled: onlinePaymentEnabled, onToggle: setOnlinePaymentEnabled },
    { id: 4, name: 'Taksitli Ödeme', icon: 'calendar', enabled: installmentEnabled, onToggle: setInstallmentEnabled },
  ];


  const handleAddBankAccount = () => {
    Alert.alert('Banka Hesabı', 'Yeni banka hesabı ekleme sayfası açılacak');
  };

  const handlePaymentHistory = () => {
    Alert.alert('Ödeme Geçmişi', 'Ödeme geçmişi sayfası açılacak');
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
          <Text style={styles.headerTitle}>Ödeme Ayarları</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>Ödeme ayarları yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>Ödeme Ayarları</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ödeme Yöntemleri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Yöntemleri</Text>
          
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethodItem}>
              <View style={styles.methodInfo}>
                <View style={styles.methodIcon}>
                  <Ionicons name={method.icon} size={24} color="#0F4C4C" />
                </View>
                <Text style={styles.methodName}>{method.name}</Text>
              </View>
              <Switch
                value={method.enabled}
                onValueChange={method.onToggle}
                trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
                thumbColor={method.enabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* Otomatik Ödeme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otomatik Ödeme</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Otomatik Ödeme</Text>
              <Text style={styles.settingDescription}>Randevu sonrası otomatik ödeme al</Text>
            </View>
            <Switch
              value={autoPayment}
              onValueChange={setAutoPayment}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={autoPayment ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Ödeme Hatırlatması</Text>
              <Text style={styles.settingDescription}>Müşterilere ödeme hatırlatması gönder</Text>
            </View>
            <Switch
              value={paymentReminder}
              onValueChange={setPaymentReminder}
              trackColor={{ false: '#d1d5db', true: '#0F4C4C' }}
              thumbColor={paymentReminder ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Komisyon ve Limitler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Komisyon ve Limitler</Text>
          
          <View style={styles.rateCard}>
            <View style={styles.rateInfo}>
              <Text style={styles.rateLabel}>Platform Komisyonu</Text>
              <Text style={styles.rateDescription}>Her işlemden alınan komisyon oranı</Text>
            </View>
            <View style={styles.rateValue}>
              <Text style={styles.rateText}>%{commissionRate}</Text>
            </View>
          </View>

          <View style={styles.rateCard}>
            <View style={styles.rateInfo}>
              <Text style={styles.rateLabel}>Minimum Ödeme Tutarı</Text>
              <Text style={styles.rateDescription}>Kabul edilen minimum ödeme miktarı</Text>
            </View>
            <View style={styles.rateValue}>
              <Text style={styles.rateText}>₺{minPaymentAmount}</Text>
            </View>
          </View>
        </View>

        {/* Banka Hesapları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banka Hesapları</Text>
          
          <View style={styles.bankAccountCard}>
            <View style={styles.bankInfo}>
              <Ionicons name="business" size={24} color="#0F4C4C" />
              <View style={styles.bankDetails}>
                <Text style={styles.bankName}>Türkiye İş Bankası</Text>
                <Text style={styles.accountNumber}>**** 1234</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#0F4C4C" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addBankButton} onPress={handleAddBankAccount}>
            <Ionicons name="add" size={20} color="#0F4C4C" />
            <Text style={styles.addBankText}>Banka Hesabı Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Ödeme Geçmişi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
          
          <TouchableOpacity style={styles.historyButton} onPress={handlePaymentHistory}>
            <View style={styles.historyInfo}>
              <Ionicons name="time" size={24} color="#0F4C4C" />
              <View style={styles.historyDetails}>
                <Text style={styles.historyTitle}>Ödeme Geçmişi</Text>
                <Text style={styles.historyDescription}>Tüm ödeme işlemlerini görüntüle</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Özet Kartı */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bu Ay Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Gelir</Text>
            <Text style={styles.summaryValue}>₺32,400</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Komisyonu</Text>
            <Text style={styles.summaryValue}>₺810</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Gelir</Text>
            <Text style={[styles.summaryValue, styles.netIncome]}>₺31,590</Text>
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
  saveButton: {
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
  paymentMethodItem: {
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
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
  rateCard: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
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
  rateInfo: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  rateDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  rateValue: {
    alignItems: 'flex-end',
  },
  rateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  bankAccountCard: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankDetails: {
    marginLeft: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#6b7280',
  },
  editButton: {
    padding: 8,
  },
  addBankButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F4C4C',
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addBankText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  historyButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyDetails: {
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  historyDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#0F4C4C',
    padding: 20,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  netIncome: {
    fontSize: 18,
    fontWeight: '700',
  },
});
