import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';


export default function MyReviewsScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reviews/user/${user.id}`);
      setReviews(response.data);
    } catch (error) {
      logError('$(basename "$file" .js)', 'Hata');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Ionicons key={i} name="star" size={18} color="#FFD700" />);
      } else if (rating >= i - 0.5) {
        stars.push(<Ionicons key={i} name="star-half" size={18} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={18} color="#d1d5db" />);
      }
    }
    return stars;
  };

  const deleteReview = (id) => {
    Alert.alert(
      'Değerlendirmeyi Sil',
      'Bu değerlendirmeyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/reviews/${id}`);
              setReviews(prev => prev.filter(review => review.id !== id));
              Alert.alert('Başarılı', 'Değerlendirme silindi');
            } catch (error) {
              logError('$(basename "$file" .js)', 'Hata');
              Alert.alert('Hata', 'Değerlendirme silinemedi');
            }
          }
        }
      ]
    );
  };

  const editReview = (review) => {
    Alert.alert('Düzenle', 'Değerlendirme düzenleme özelliği yakında eklenecek');
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.businessName}</Text>
          <Text style={styles.businessLocation}>{item.businessLocation}</Text>
        </View>
        <View style={styles.actions}>
          {item.canEdit && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => editReview(item)}
            >
              <Ionicons name="create-outline" size={18} color="#0F4C4C" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteReview(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.serviceInfo}>
        <Ionicons name="car-outline" size={16} color="#6b7280" />
        <Text style={styles.serviceText}>{item.service}</Text>
      </View>

      <View style={styles.ratingSection}>
        <View style={styles.ratingStars}>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        <Text style={styles.reviewDate}>{item.date}</Text>
      </View>

      <Text style={styles.commentText}>{item.comment}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.businessButton}
          onPress={() => navigation.navigate('HomeTab', { 
            screen: 'Detail', 
            params: { 
              item: {
                id: item.businessId,
                name: item.businessName,
                city: item.businessLocation.split(', ')[1],
                district: item.businessLocation.split(', ')[0]
              }
            } 
          })}
        >
          <Ionicons name="business-outline" size={16} color="#0F4C4C" />
          <Text style={styles.businessButtonText}>İşletmeyi Görüntüle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getAverageRating = () => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
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
        <Text style={styles.title}>Değerlendirmelerim</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F4C4C" />
            <Text style={styles.loadingText}>Değerlendirmeler yükleniyor...</Text>
          </View>
        ) : reviews.length > 0 ? (
          <>
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Ionicons name="star" size={32} color="#FFD700" />
                <View style={styles.statsInfo}>
                  <Text style={styles.averageRating}>{getAverageRating()}</Text>
                  <Text style={styles.statsLabel}>Ortalama Puanınız</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{reviews.length}</Text>
                  <Text style={styles.statLabel}>Toplam Değerlendirme</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {reviews.filter(r => r.rating >= 4).length}
                  </Text>
                  <Text style={styles.statLabel}>Pozitif Değerlendirme</Text>
                </View>
              </View>
            </View>

            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderReview}
              scrollEnabled={false}
              contentContainerStyle={styles.reviewsList}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Henüz değerlendirme yapmamışsınız</Text>
            <Text style={styles.emptySubtitle}>
              Tamamlanan randevularınızı değerlendirin
            </Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsInfo: {
    marginLeft: 16,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  statsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  reviewsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
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
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 'auto',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  businessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  businessButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C4C',
  },
});
