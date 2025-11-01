import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://192.168.1.20:3001';

export default function BusinessImageSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadBusiness();
  }, [user]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const id = res.data?.id;
      setBusinessId(id);
      if (id) {
        const profile = await axios.get(`${API_BASE_URL}/businesses/profile/${id}`);
        setImageUrl(profile.data?.imageUrl || '');
      }
    } catch (e) {
      console.error('İşletme yüklenirken hata:', e);
      Alert.alert('Hata', 'İşletme bilgisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin gerekli', 'Fotoğraf galerisine erişim izni gerekiyor');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      const localUri = result.assets[0].uri;
      // Not: Şu an sunucuda dosya upload yok, bu yüzden local URI’yi doğrudan kaydetmek yerine
      // geçici olarak URL alanına yazıyoruz. Harici barındırılan URL tercih edilir.
      setImageUrl(localUri);
      Alert.alert('Bilgi', 'Yerel görsel seçildi. URL alanına yazıldı. Dosya yükleme eklenirse doğrudan yüklenecek.');
    }
  };

  const saveImageUrl = async () => {
    if (!businessId) {
      console.log('saveImageUrl: businessId yok, işlem iptal');
      Alert.alert('Bilgi', 'İşletme bilgisi yüklenmeden kaydedilemez');
      return;
    }
    try {
      setSaving(true);
      // Eğer alan yerel dosya URI ise upload et; değilse URL güncelle
      if (imageUrl && imageUrl.startsWith('file://')) {
        console.log('saveImageUrl: upload akışı, businessId=', businessId, 'imageUrl=', imageUrl);
        const formData = new FormData();
        formData.append('image', {
          uri: imageUrl,
          name: 'business.jpg',
          type: 'image/jpeg',
        });
        const res = await axios.post(`${API_BASE_URL}/businesses/${businessId}/image/upload`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setImageUrl(res.data?.imageUrl || imageUrl);
        Alert.alert('Başarılı', 'Görsel yüklendi');
      } else {
        console.log('saveImageUrl: URL güncelleme akışı, businessId=', businessId, 'imageUrl=', imageUrl);
        await axios.put(`${API_BASE_URL}/businesses/${businessId}/image`, { imageUrl }, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          }
        });
        Alert.alert('Başarılı', 'Görsel güncellendi');
      }
      navigation.goBack();
    } catch (e) {
      console.error('Görsel kaydedilirken hata:', e);
      Alert.alert('Hata', 'Görsel kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const clearImage = async () => {
    if (!businessId) return;
    try {
      setSaving(true);
      await axios.delete(`${API_BASE_URL}/businesses/${businessId}/image`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        }
      });
      setImageUrl('');
      Alert.alert('Başarılı', 'Görsel kaldırıldı');
    } catch (e) {
      console.error('Görsel kaldırılırken hata:', e);
      Alert.alert('Hata', 'Görsel kaldırılamadı');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#0F4C4C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Görsel Ayarları</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.previewCard}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="image-outline" size={48} color="#9ca3af" />
              <Text style={{ color: '#6b7280', marginTop: 8 }}>Henüz görsel yok</Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Görsel URL</Text>
          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://..."
            autoCapitalize="none"
            style={styles.input}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery}>
              <Ionicons name="images-outline" size={18} color="#0F4C4C" />
              <Text style={styles.secondaryBtnText}>Galeriden Seç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerBtn} onPress={clearImage} disabled={saving}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={styles.dangerBtnText}>Görseli Kaldır</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, (!businessId || saving) && { opacity: 0.6 }]} onPress={saveImageUrl} disabled={saving || !businessId}>
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Kaydet</Text>
            )}
          </TouchableOpacity>
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
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  previewCard: { backgroundColor: 'white', margin: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  previewImage: { width: '100%', height: 200, backgroundColor: '#f3f4f6' },
  previewPlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center' },
  form: { backgroundColor: 'white', marginHorizontal: 16, marginTop: 8, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  input: { height: 42, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryBtn: { backgroundColor: '#0F4C4C', paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginTop: 16 },
  primaryBtnText: { color: 'white', fontWeight: '700' },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flex: 1, justifyContent: 'center' },
  secondaryBtnText: { color: '#0F4C4C', fontWeight: '600' },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, flex: 1, justifyContent: 'center' },
  dangerBtnText: { color: '#ef4444', fontWeight: '600' },
});


