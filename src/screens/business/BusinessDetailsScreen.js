import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.20:3001';

export default function BusinessDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const businessTypes = [
    { value: 'OTO_YIKAMA', label: 'Oto Yıkama' },
    { value: 'OTO_TAMIR', label: 'Oto Tamir' },
    { value: 'OTO_LASTIK', label: 'Oto Lastik' },
    { value: 'OTO_ELEKTRIK', label: 'Oto Elektrik' },
    { value: 'OTO_BOYA', label: 'Oto Boya' },
    { value: 'OTO_DETAY', label: 'Oto Detay' },
  ];

  useEffect(() => {
    if (user) {
      loadBusinessDetails();
    }
  }, [user]);

  const loadBusinessDetails = async () => {
    try {
      console.log('İşletme detayları yükleniyor, user:', user);
      setLoading(true);
      
      // Önce işletme ID'sini bul
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      // İşletme bilgilerini API'den al
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      console.log('API\'den gelen işletme detayları:', businessData);
      
      // Form alanlarını doldur
      setBusinessName(businessData.name || '');
      setBusinessType(businessData.type || 'OTO_YIKAMA');
      setDescription(businessData.description || '');
      setWebsite(businessData.website || '');
      
    } catch (error) {
      console.error('İşletme detayları yüklenirken hata:', error);
      Alert.alert('Hata', 'İşletme bilgileri yüklenirken bir hata oluştu');
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

      const updateData = {
        name: businessName,
        type: businessType,
        description: description,
        website: website
      };

      console.log('Güncellenecek veri:', updateData);
      
      await axios.patch(`${API_BASE_URL}/businesses/${businessId}`, updateData);
      
      Alert.alert('Başarılı', 'İşletme bilgileri güncellendi');
      setIsEditing(false);
      
    } catch (error) {
      console.error('İşletme güncelleme hatası:', error);
      Alert.alert('Hata', 'İşletme bilgileri güncellenirken bir hata oluştu');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
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
          <Text style={styles.headerTitle}>İşletme Detayları</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>İşletme bilgileri yükleniyor...</Text>
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
        <Text style={styles.headerTitle}>İşletme Detayları</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons name={isEditing ? "close" : "create-outline"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Adı</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={businessName}
              onChangeText={setBusinessName}
              editable={isEditing}
              placeholder="İşletme adını girin"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>İşletme Türü</Text>
            <TouchableOpacity
              style={[styles.input, !isEditing && styles.inputDisabled]}
              onPress={() => isEditing && setShowTypeModal(true)}
              disabled={!isEditing}
            >
              <Text style={[styles.inputText, !isEditing && styles.inputTextDisabled]}>
                {businessTypes.find(type => type.value === businessType)?.label || 'İşletme türünü seçin'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={isEditing ? "#0F4C4C" : "#9ca3af"} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.textArea, !isEditing && styles.inputDisabled]}
              value={description}
              onChangeText={setDescription}
              editable={isEditing}
              placeholder="İşletme açıklaması girin"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Web Sitesi</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={website}
              onChangeText={setWebsite}
              editable={isEditing}
              placeholder="Web sitesi URL'si"
              keyboardType="url"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşletme Durumu</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.statusText}>İşletme Onaylandı</Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="time" size={20} color="#f59e0b" />
              <Text style={styles.statusText}>Aktif Durumda</Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text style={styles.statusText}>4.8 Puan</Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* İşletme Türü Seçim Modal'ı */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İşletme Türü Seçin</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color="#0F4C4C" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {businessTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.modalItem,
                    businessType === type.value && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setBusinessType(type.value);
                    setShowTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    businessType === type.value && styles.modalItemTextSelected
                  ]}>
                    {type.label}
                  </Text>
                  {businessType === type.value && (
                    <Ionicons name="checkmark" size={20} color="#0F4C4C" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  inputDisabled: {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0F4C4C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  inputTextDisabled: {
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
  modalItemTextSelected: {
    color: '#0F4C4C',
    fontWeight: '600',
  },
});
