import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';


const SAMPLE_FAVORITES = [
  {
    id: 1,
    name: 'Kuzenler OtoYıkama',
    district: 'Paşakonak',
    rating: 4.2,
    distance: '2.3 km',
    address: 'Paşakonak, Çamlık Sk. no:9/A',
    phone: '0532 123 45 67',
    services: ['Tam Yıkama', 'İç Temizlik', 'Motor Temizliği'],
    priceRange: '200-500 ₺',
    image: null
  },
  {
    id: 2,
    name: 'Temiz Oto',
    district: 'Merkez',
    rating: 4.5,
    distance: '1.8 km',
    address: 'Merkez, Atatürk Cd. no:15',
    phone: '0533 987 65 43',
    services: ['Dış Yıkama', 'İç Temizlik'],
    priceRange: '150-350 ₺',
    image: null
  },
  {
    id: 3,
    name: 'Hızlı Yıkama',
    district: 'Yeni Mahalle',
    rating: 4.0,
    distance: '3.1 km',
    address: 'Yeni Mahalle, İnönü Sk. no:3',
    phone: '0534 555 44 33',
    services: ['Hızlı Yıkama', 'Kurulama'],
    priceRange: '100-250 ₺',
    image: null
  },
];

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [socketRef, setSocketRef] = useState(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // Socket: müşteri odasına katıl, favoriler değişince listeyi yenile
  useEffect(() => {
    if (!user?.id) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    setSocketRef(socket);
    socket.on('connect', () => {
      socket.emit('join:customer', user.id);
    });
    socket.on('favorites:changed', (payload) => {
      if (!payload) return;
      // Sadece bu kullanıcıya ait odadan geliyor; listeyi güncelle
      loadFavorites();
    });
    socket.on('reviews:changed', (payload) => {
      // Favorilerdeki işletmelerden birinin puanı değiştiyse liste yeniden render edilsin
      setFavorites((prev) => [...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/favorites/user/${user.id}`);
      setFavorites(response.data);
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
      // Fallback data
      setFavorites(SAMPLE_FAVORITES);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (businessId) => {
    try {
      await axios.delete(`${API_BASE_URL}/favorites/user/${user.id}/business/${businessId}`);
      loadFavorites(); // Favorileri yeniden yükle
    } catch (error) {
      console.error('Favoriden çıkarma hatası:', error);
      Alert.alert('Hata', 'Favoriden çıkarılamadı');
    }
  };

  const renderFavorite = ({ item }) => {
    const business = item.business || item; // API'den gelen veri veya fallback
    return (
      <TouchableOpacity 
        style={styles.favoriteCard}
        onPress={() => navigation.navigate('HomeTab', { screen: 'Detail', params: { item: business } })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.businessInfo}>
            <View style={styles.businessLogo}>
              <Ionicons name="business" size={24} color="#0F4C4C" />
            </View>
            <View style={styles.businessDetails}>
              <Text style={styles.businessName}>{business.name}</Text>
              <Text style={styles.businessDistrict}>{business.district}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => removeFromFavorites(business.id)}
          >
            <Ionicons name="heart" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name={star <= Math.floor(business.rating) ? "star" : "star-outline"} 
                  size={14} 
                  color="#fbbf24" 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{business.rating.toFixed(1)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{business.address || 'Adres bilgisi yok'}</Text>
          </View>

          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>Hizmetler:</Text>
            <View style={styles.servicesList}>
              {business.services && business.services.slice(0, 3).map((service, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceText}>{service.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              {business.services && business.services.length > 0 
                ? `${Math.min(...business.services.map(s => s.price))}-${Math.max(...business.services.map(s => s.price))} ₺`
                : 'Fiyat bilgisi yok'
              }
            </Text>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => navigation.navigate('HomeTab', { screen: 'Booking', params: { item: business } })}
            >
              <Text style={styles.bookButtonText}>Randevu Al</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <Text style={styles.title}>Favorilerim</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavorite}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadFavorites}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Henüz favoriniz yok</Text>
            <Text style={styles.emptySubtitle}>
              Beğendiğiniz işletmeleri favorilere ekleyerek burada görebilirsiniz
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.exploreButtonText}>İşletmeleri Keşfet</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  favoriteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  businessDistrict: {
    fontSize: 14,
    color: '#6b7280',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  servicesContainer: {
    marginTop: 8,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  bookButton: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

