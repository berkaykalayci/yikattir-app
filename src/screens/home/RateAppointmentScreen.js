import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { logError, getErrorMessage } from '../../utils/errorMessages';


export default function RateAppointmentScreen({ navigation, route, onSuccess }) {
  const { appointment } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#FFD700" : "#d1d5db"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Çok Kötü';
      case 2:
        return 'Kötü';
      case 3:
        return 'Orta';
      case 4:
        return 'İyi';
      case 5:
        return 'Mükemmel';
      default:
        return 'Puanınızı seçin';
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Uyarı', 'Lütfen bir puan seçin');
      return;
    }

    if (!appointment?.id) {
      Alert.alert('Hata', 'Randevu bilgisi bulunamadı');
      return;
    }
    
    try {
      setLoading(true);
      
      const requestData = {
        appointmentId: appointment.id,
        rating: rating,
        comment: comment.trim() || null
      };
      
      const response = await axios.post(`${API_BASE_URL}/reviews`, requestData);
      
      Alert.alert(
        'Değerlendirme Gönderildi',
        'Değerlendirmeniz başarıyla kaydedildi',
        [
          { text: 'Tamam', onPress: () => {
            if (onSuccess) {
              onSuccess();
            } else {
              navigation.goBack();
            }
          }}
        ]
      );
    } catch (error) {
      logError('RateAppointmentScreen', 'Review oluşturma hatası');
      const errorMessage = getErrorMessage(error);
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Değerlendir</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
      >
        <View style={styles.appointmentCard}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{appointment?.business?.name || 'İşletme Adı'}</Text>
            <Text style={styles.businessLocation}>{appointment?.business?.address || 'Adres bilgisi yok'}</Text>
            <Text style={styles.serviceText}>{appointment?.service?.name || 'Hizmet Adı'}</Text>
            <Text style={styles.dateText}>
              {appointment?.date ? new Date(appointment.date).toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'Tarih bilgisi yok'} - {appointment?.time || 'Saat bilgisi yok'}
            </Text>
          </View>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.cardTitle}>Hizmeti Nasıl Değerlendiriyorsunuz?</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          <Text style={[styles.ratingText, { color: rating > 0 ? '#0F4C4C' : '#9ca3af' }]}>
            {getRatingText()}
          </Text>
        </View>

        <View style={styles.commentCard}>
          <Text style={styles.cardTitle}>Yorumunuz (İsteğe Bağlı)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Deneyiminizi paylaşın..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.commentHint}>
            Yorumunuz diğer müşterilere yardımcı olacak
          </Text>
        </View>

        <View style={styles.criteriaCard}>
          <Text style={styles.cardTitle}>Değerlendirme Kriterleri</Text>
          
          <View style={styles.criteriaItem}>
            <Ionicons name="time-outline" size={20} color="#0F4C4C" />
            <Text style={styles.criteriaText}>Zamanında hizmet</Text>
          </View>
          
          <View style={styles.criteriaItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#0F4C4C" />
            <Text style={styles.criteriaText}>Hizmet kalitesi</Text>
          </View>
          
          <View style={styles.criteriaItem}>
            <Ionicons name="people-outline" size={20} color="#0F4C4C" />
            <Text style={styles.criteriaText}>Personel davranışı</Text>
          </View>
          
          <View style={styles.criteriaItem}>
            <Ionicons name="cash-outline" size={20} color="#0F4C4C" />
            <Text style={styles.criteriaText}>Fiyat uygunluğu</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>Değerlendirmeniz anonim olarak işletmeye iletilecek</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={20} color="#10b981" />
            <Text style={styles.infoText}>Yüksek puanlar işletmeyi öne çıkarır</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Değerlendirmeyi Gönder</Text>
          )}
        </TouchableOpacity>
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
  placeholder: { width: 40 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  appointmentCard: {
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
  businessInfo: {
    alignItems: 'center',
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  businessLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentCard: {
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
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#f9fafb',
    marginBottom: 8,
    minHeight: 100,
  },
  commentHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  criteriaCard: {
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
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  criteriaText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  infoCard: {
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
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#0F4C4C',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});
