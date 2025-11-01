import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';


export default function AddCardScreen({ navigation }) {
  const [form, setForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    isDefault: false
  });
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (text) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');
    // 4'erli gruplar halinde formatla
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };

  const formatExpiryDate = (text) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');
    // MM/YY formatında
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    if (!form.cardNumber || form.cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Hata', 'Geçerli bir kart numarası giriniz');
      return false;
    }
    if (!form.expiryDate || form.expiryDate.length !== 5) {
      Alert.alert('Hata', 'Geçerli bir son kullanma tarihi giriniz');
      return false;
    }
    if (!form.cvv || form.cvv.length !== 3) {
      Alert.alert('Hata', 'Geçerli bir CVV kodu giriniz');
      return false;
    }
    if (!form.cardHolder.trim()) {
      Alert.alert('Hata', 'Kart sahibi adını giriniz');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      await axios.post(`${API_BASE_URL}/payment-methods/customer/${user.id}`, {
        cardNumber: form.cardNumber,
        expiryDate: form.expiryDate,
        cvv: form.cvv,
        cardHolder: form.cardHolder,
        isDefault: form.isDefault
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      Alert.alert('Başarılı', 'Kart başarıyla eklendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Kart eklenirken hata:', error);
      Alert.alert('Hata', error.response?.data?.error || 'Kart eklenemedi');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label, field, placeholder, keyboardType = 'default', maxLength = null) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[field]}
        onChangeText={(value) => {
          if (field === 'cardNumber') {
            updateField(field, formatCardNumber(value));
          } else if (field === 'expiryDate') {
            updateField(field, formatExpiryDate(value));
          } else if (field === 'cvv') {
            updateField(field, value.replace(/\D/g, ''));
          } else {
            updateField(field, value);
          }
        }}
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={field === 'cvv'}
        autoCapitalize={field === 'cardHolder' ? 'words' : 'none'}
        autoCorrect={field === 'cardHolder'}
        textContentType={field === 'cardHolder' ? 'name' : 'none'}
      />
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
        <Text style={styles.title}>Kart Ekle</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
        style={{ flex: 1, backgroundColor: '#f9fafb' }}
      >
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardPreview}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={32} color="white" />
            <Text style={styles.cardType}>VISA</Text>
          </View>
          <Text style={styles.cardNumber}>
            {form.cardNumber || '**** **** **** ****'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardHolder}>
              {form.cardHolder || 'KART SAHİBİ'}
            </Text>
            <Text style={styles.cardExpiry}>
              {form.expiryDate || 'MM/YY'}
            </Text>
          </View>
        </View>

        <View style={styles.formSection}>
          {renderField('Kart Numarası', 'cardNumber', '1234 5678 9012 3456', 'numeric', 19)}
          {renderField('Son Kullanma Tarihi', 'expiryDate', 'MM/YY', 'numeric', 5)}
          {renderField('CVV', 'cvv', '123', 'numeric', 3)}
          {renderField('Kart Sahibi', 'cardHolder', 'Ad Soyad', 'default', 40)}
          
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => updateField('isDefault', !form.isDefault)}
          >
            <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
              {form.isDefault && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text style={styles.checkboxText}>Varsayılan kart olarak ayarla</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>Kart bilgileriniz güvenli şekilde şifrelenir</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={20} color="#10b981" />
            <Text style={styles.infoText}>256-bit SSL şifreleme kullanılır</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Kaydediliyor...' : 'Kartı Kaydet'}</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
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
  cardPreview: {
    backgroundColor: '#0F4C4C',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHolder: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cardExpiry: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
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
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#0F4C4C',
    borderColor: '#0F4C4C',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  infoSection: {
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
  saveButton: {
    backgroundColor: '#0F4C4C',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});
