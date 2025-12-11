import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { logError } from '../../utils/errorMessages';


export default function BusinessContactScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBusinessContact();
    }
  }, [user]);

  const loadBusinessContact = async () => {
    try {
      setLoading(true);
      
      const businessIdResponse = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const foundBusinessId = businessIdResponse.data.id;
      setBusinessId(foundBusinessId);
      
      const response = await axios.get(`${API_BASE_URL}/businesses/profile/${foundBusinessId}`);
      const businessData = response.data;
      
      setPhone(businessData.owner?.phone || '');
      setEmail(businessData.owner?.email || user.email || '');
      setWebsite(businessData.website || '');
      setInstagram(businessData.instagram || '');
      setWhatsapp(businessData.whatsapp || businessData.owner?.phone || '');
      
    } catch (error) {
      logError('BusinessContactScreen', 'İşletme iletişim bilgileri yüklenirken hata');
      Alert.alert('Hata', 'İletişim bilgileri yüklenirken bir hata oluştu');
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
        website: website,
        instagram: instagram,
        whatsapp: whatsapp
      };

      
      await axios.patch(`${API_BASE_URL}/businesses/${businessId}`, updateData);
      
      Alert.alert('Başarılı', 'İletişim bilgileri güncellendi');
      setIsEditing(false);
      
    } catch (error) {
      logError('BusinessContactScreen', 'İletişim güncelleme hatası');
      Alert.alert('Hata', 'İletişim bilgileri güncellenirken bir hata oluştu');
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
          <Text style={styles.headerTitle}>İletişim Bilgileri</Text>
          <View style={styles.editButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F4C4C" />
          <Text style={styles.loadingText}>İletişim bilgileri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${whatsapp.replace(/[^0-9]/g, '')}`);
  };

  const handleWebsite = () => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İletişim Bilgileri</Text>
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
          <Text style={styles.sectionTitle}>Temel İletişim</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                placeholder="Telefon numarası"
                keyboardType="phone-pad"
              />
              {!isEditing && (
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <Ionicons name="call" size={20} color="#0F4C4C" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={email}
                onChangeText={setEmail}
                editable={isEditing}
                placeholder="E-posta adresi"
                keyboardType="email-address"
              />
              {!isEditing && (
                <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                  <Ionicons name="mail" size={20} color="#0F4C4C" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Web Sitesi</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={website}
                onChangeText={setWebsite}
                editable={isEditing}
                placeholder="Web sitesi URL'si"
                keyboardType="url"
              />
              {!isEditing && (
                <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
                  <Ionicons name="open" size={20} color="#0F4C4C" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sosyal Medya</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={instagram}
                onChangeText={setInstagram}
                editable={isEditing}
                placeholder="@kullaniciadi"
              />
              {!isEditing && (
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <View style={styles.inputWithButton}>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={whatsapp}
                onChangeText={setWhatsapp}
                editable={isEditing}
                placeholder="WhatsApp numarası"
                keyboardType="phone-pad"
              />
              {!isEditing && (
                <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İletişim</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleCall}>
              <Ionicons name="call" size={24} color="white" />
              <Text style={styles.quickActionText}>Ara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="white" />
              <Text style={styles.quickActionText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton} onPress={handleEmail}>
              <Ionicons name="mail" size={24} color="white" />
              <Text style={styles.quickActionText}>E-posta</Text>
            </TouchableOpacity>
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
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
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
  actionButton: {
    marginLeft: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#0F4C4C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
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
});
