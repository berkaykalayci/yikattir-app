import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Modal } from 'react-native';
import appLogo from '../../../assets/logo-alt.png';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://192.168.1.31:3001';

export default function BusinessDetailScreen({ navigation, route }) {
  const { item: initialItem } = route.params || { item: { name: 'Kuzenler OtoYıkama', rating: 4.2, lat: 40.35, lng: 27.97 } };
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200';
  const [business, setBusiness] = useState(initialItem);
  const [loading, setLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest'); // 'newest' | 'highest' | 'lowest'
  const [reviewPage, setReviewPage] = useState(1);
  const pageSize = 10;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [socketRef, setSocketRef] = useState(null);

  useEffect(() => {
    console.log('BusinessDetailScreen - initialItem:', initialItem);
    console.log('BusinessDetailScreen - initialItem.id:', initialItem.id);
    // Eğer initialItem'da ID varsa ve geçerli bir ID ise API'den detayları çek
    if (initialItem.id && typeof initialItem.id === 'string' && !initialItem.id.startsWith('sample_')) {
      console.log('API\'den detaylar çekiliyor...');
      loadBusinessDetails();
    } else {
      console.log('API\'den detaylar çekilmiyor, sebep:', {
        hasId: !!initialItem.id,
        isString: typeof initialItem.id === 'string',
        notSample: !initialItem.id.startsWith('sample_')
      });
    }
  }, [initialItem.id]);

  // Socket: müşteri odasına katıl ve favori/yorum değişimlerini dinle
  useEffect(() => {
    if (!user?.id) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    setSocketRef(socket);
    socket.on('connect', () => {
      socket.emit('join:customer', user.id);
      if (business?.city) {
        socket.emit('join:city', business.city);
      }
      if (business?.id) {
        socket.emit('join:business', business.id);
      }
    });
    socket.on('favorites:changed', (payload) => {
      if (!payload) return;
      if (payload.action === 'added' && payload.businessId === business?.id) {
        setIsFavorite(true);
      }
      if (payload.action === 'removed' && payload.businessId === business?.id) {
        setIsFavorite(false);
      }
    });
    socket.on('reviews:changed', (payload) => {
      if (payload?.businessId === business?.id) {
        // Rating’i ve yorumları tazelemek için detayı yeniden yükle
        loadBusinessDetails();
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user?.id, business?.id, business?.city]);

  // İsim maskeleme: "Berkay Kalayci" -> "Berkay K."
  const maskName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'Anonim';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const last = parts[parts.length - 1];
    const initial = last.charAt(0).toUpperCase();
    return `${first} ${initial}.`;
  };

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (_) { return ''; }
  };

  const getSortedReviews = () => {
    let arr = Array.isArray(reviews) ? [...reviews] : [];
    if (reviewSort === 'highest') {
      arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (reviewSort === 'lowest') {
      arr.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else { // newest
      arr.sort((a, b) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });
    }
    return arr;
  };

  // Sıralama/filtre değiştiğinde sayfayı resetle
  useEffect(() => {
    setReviewPage(1);
  }, [reviewSort]);

  // Favori durumunu kontrol et
  useEffect(() => {
    if (user && business.id) {
      checkFavoriteStatus();
    }
  }, [user, business.id]);

  const checkFavoriteStatus = async () => {
    if (!user || !business.id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/user/${user.id}/business/${business.id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      setIsFavorite(false);
    }
  };

  const loadBusinessDetails = async () => {
    try {
      console.log('loadBusinessDetails başladı, initialItem.id:', initialItem.id);
      setLoading(true);
      const url = `${API_BASE_URL}/businesses/${initialItem.id}`;
      console.log('API URL:', url);
      const response = await axios.get(url);
      console.log('API response:', response.data);
      setBusiness(response.data);
      
      // Reviews'ları ayrı olarak set et
      if (response.data.reviews) {
        setReviews(response.data.reviews);
      }
    } catch (error) {
      console.error('İşletme detayları yüklenirken hata:', error);
      console.error('Hata detayları:', error.response?.data);
      console.error('Status code:', error.response?.status);
      console.error('İşletme ID:', initialItem.id);
      // API hatası durumunda mevcut veriyi kullan (zaten setBusiness(initialItem) ile başlatıldı)
      // Ek olarak fallback veriler ekleyelim
      const fallbackBusiness = {
        ...initialItem,
        services: initialItem.services || [
          { id: 1, name: 'İç-Dış Yıkama', price: 300, durationMin: 45 },
          { id: 2, name: 'Detaylı Temizlik', price: 500, durationMin: 90 }
        ],
        workingHours: initialItem.workingHours || [
          { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
          { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00' },
          { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00' },
          { dayOfWeek: 7, isOpen: false, openTime: null, closeTime: null }
        ]
      };
      setBusiness(fallbackBusiness);
      
      // Fallback reviews
      setReviews([
        { id: 1, rating: 3.5, comment: 'Gayet temiz bir çalışma.', appointment: { customer: { name: 'Berat Luş' } } },
        { id: 2, rating: 4.0, comment: 'Hızlı ve özenli, tavsiye ederim.', appointment: { customer: { name: 'Ayşe K.' } } },
        { id: 3, rating: 5.0, comment: 'Harika hizmet, tekrar geleceğim.', appointment: { customer: { name: 'Mert D.' } } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Favori ekleme/çıkarma fonksiyonu
  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    try {
      if (isFavorite) {
        // Favoriden çıkar
        await axios.delete(`${API_BASE_URL}/favorites/user/${user.id}/business/${business.id}`);
        setIsFavorite(false);
        Alert.alert('Başarılı', 'İşletme favorilerden çıkarıldı');
      } else {
        // Favoriye ekle
        await axios.post(`${API_BASE_URL}/favorites`, {
          userId: user.id,
          businessId: business.id
        });
        setIsFavorite(true);
        Alert.alert('Başarılı', 'İşletme favorilere eklendi');
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      Alert.alert('Hata', 'Favori işlemi gerçekleştirilemedi');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const toRad = (x) => (x * Math.PI) / 180;
        const R = 6371;
        const a = { lat: cur.coords.latitude, lng: cur.coords.longitude };
        const b = { lat: business.lat, lng: business.lng };
        const dLat = toRad(b.lat - a.lat);
        const dLon = toRad(b.lng - a.lng);
        const lat1 = toRad(a.lat);
        const lat2 = toRad(b.lat);
        const s = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
        const d = 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
        setDistanceKm(d);
      } catch (e) {}
    })();
  }, [business]);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 80, 100) }]}
    >
      <View style={[styles.headerBar, { paddingTop: Math.max((insets?.top || 0) - 12, 0) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={'#ffffff'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleFavorite}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite ? "#ef4444" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.topInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Ionicons name="car-outline" size={16} color={'#0F4C4C'} />
          <Text style={styles.distance}>{distanceKm != null ? distanceKm.toFixed(1) + ' Km' : 'Konum bilgisi yok'}</Text>
        </View>
        <View style={styles.centerLogoWrap}>
          <View style={styles.logoCircle}>
            <Image source={appLogo} style={styles.logoImage} resizeMode="cover" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons key={i} name={i < Math.round(Number(business.rating || 0)) ? 'star' : 'star-outline'} size={14} color={'#0F4C4C'} />
          ))}
          <Text style={styles.scoreText}>{Number(business.rating || 0).toFixed(1)}</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 16, alignItems: 'center', marginTop: 12 }}>
        <Text style={styles.title}>{business.name}</Text>
      </View>
      <View style={styles.heroWrap}>
        {business?.imageUrl ? (
          <Image
            source={{ uri: business.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#6b7280', fontWeight: '700' }}>GÖRSEL</Text>
          </View>
        )}
      </View>
      <View style={styles.infoList}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={'#6b7280'} />
          <Text style={styles.infoText}>{business.address || `${business.district}, ${business.city}`}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={'#6b7280'} />
          <Text style={styles.infoText}>
            {business.workingHours && business.workingHours.length > 0 
              ? `${business.workingHours[0]?.openTime || '09:00'}-${business.workingHours[0]?.closeTime || '18:00'}`
              : '09:00-18:00'
            }
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hizmetler</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesScrollContainer}
        >
          {business.services && business.services.length > 0 ? (
            business.services.map((service, index) => (
              <View key={service.id || index} style={styles.serviceCard}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>{service.price} ₺</Text>
                <Text style={styles.serviceDuration}>{service.durationMin} dk</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: '#6b7280' }}>Bu işletme henüz hizmet eklememiş</Text>
          )}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <View style={styles.commentsHeader}>
          <Text style={styles.sectionTitle}>Yorumlar</Text>
          {reviews.length > 3 && (
            <TouchableOpacity onPress={() => setShowAllReviews(true)}>
              <Text style={styles.link}>Tümünü Gör</Text>
            </TouchableOpacity>
          )}
        </View>
        {reviews.length > 0 ? (
          (reviews.slice(-3)).map((review) => (
            <View key={review.id} style={styles.commentRow}>
              <Ionicons name="person-outline" size={18} color={'#0F4C4C'} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.commentAuthor}>{maskName(review.appointment?.customer?.name)}</Text>
                  <View style={styles.starsRow}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const full = i + 1 <= Math.floor(review.rating);
                      const half = !full && i < review.rating;
                      return (
                        <Ionicons
                          key={i}
                          name={full ? 'star' : half ? 'star-half' : 'star-outline'}
                          size={12}
                          color={'#0F4C4C'}
                        />
                      );
                    })}
                  </View>
                  <Text style={styles.commentRating}>{review.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.commentText}>{review.comment || 'Yorum yok'}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyReviews}>
            <Ionicons name="chatbubbles-outline" size={32} color="#d1d5db" />
            <Text style={styles.emptyReviewsText}>Henüz yorum yapılmamış</Text>
            <Text style={styles.emptyReviewsSubtext}>İlk yorumu siz yapın!</Text>
          </View>
        )}
      </View>

      {/* Tüm yorumlar için modal */}
      <Modal
        visible={showAllReviews}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAllReviews(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={[styles.headerBar, { paddingTop: Math.max((insets?.top || 0) - 12, 0), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowAllReviews(false)}>
              <Ionicons name="close" size={22} color={'#ffffff'} />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Tüm Yorumlar</Text>
            <View style={styles.iconBtn} />
          </View>
          {/* Sıralama seçenekleri */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              onPress={() => setReviewSort('newest')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: reviewSort === 'newest' ? '#0F4C4C' : '#f3f4f6',
              }}
            >
              <Text style={{ color: reviewSort === 'newest' ? '#fff' : '#374151', fontWeight: '600' }}>En yeni</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReviewSort('highest')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: reviewSort === 'highest' ? '#0F4C4C' : '#f3f4f6',
              }}
            >
              <Text style={{ color: reviewSort === 'highest' ? '#fff' : '#374151', fontWeight: '600' }}>En yüksek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setReviewSort('lowest')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 16,
                backgroundColor: reviewSort === 'lowest' ? '#0F4C4C' : '#f3f4f6',
              }}
            >
              <Text style={{ color: reviewSort === 'lowest' ? '#fff' : '#374151', fontWeight: '600' }}>En düşük</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 8 }}>
              {getSortedReviews().slice(0, reviewPage * pageSize).map((review) => (
                <View key={review.id} style={{ backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="person-circle-outline" size={24} color={'#0F4C4C'} />
                      <Text style={[styles.commentAuthor, { marginBottom: 0 }]}>{maskName(review.appointment?.customer?.name)}</Text>
                    </View>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>{formatDate(review.createdAt)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const full = i + 1 <= Math.floor(review.rating);
                        const half = !full && i < review.rating;
                        return (
                          <Ionicons
                            key={i}
                            name={full ? 'star' : half ? 'star-half' : 'star-outline'}
                            size={12}
                            color={'#0F4C4C'}
                          />
                        );
                      })}
                    </View>
                    <Text style={styles.commentRating}>{review.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.commentText, { marginTop: 6 }]}>{review.comment || 'Yorum yok'}</Text>
                </View>
              ))}
              {getSortedReviews().length > reviewPage * pageSize && (
                <TouchableOpacity
                  onPress={() => setReviewPage((p) => p + 1)}
                  style={{
                    marginTop: 8,
                    alignSelf: 'center',
                    backgroundColor: '#0F4C4C',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 24,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Daha Fazla</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
      <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Booking', { item: business })}>
        <Text style={styles.ctaText}>Randevu Al</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  headerBar: { backgroundColor: '#0F4C4C', paddingHorizontal: 16, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 36, paddingHorizontal: 0, marginBottom: 0 },
  iconBtn: { width: 36, height: 36, borderRadius: 18,  alignItems: 'center', justifyContent: 'center' },
  topInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 0, position: 'relative', backgroundColor: '#fff' },
  centerLogoWrap: { position: 'absolute', left: '50%', transform: [{ translateX: -24 }], alignItems: 'center', justifyContent: 'center' },
  distance: { color: '#0F4C4C', fontWeight: '700' },
  logoCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  logoText: { color: '#6b7280', fontWeight: '700', fontSize: 12 },
  scoreText: { color: '#0F4C4C', fontWeight: '600', marginLeft: 2 },
  heroWrap: { height: 180, backgroundColor: '#e5e7eb', marginHorizontal: 16, marginTop: 6, borderRadius: 8, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  infoList: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', marginTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { color: '#374151', flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#0F4C4C' },
  section: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  sectionTitle: { fontWeight: '700', color: '#0F4C4C', marginBottom: 10 },
  servicesScrollContainer: { paddingHorizontal: 8, paddingBottom: 12 },
  service: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#e5e7eb' },
  serviceCard: { 
    backgroundColor: '#f8f9fa', 
    padding: 12, 
    borderRadius: 12, 
    marginHorizontal: 4, 
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  serviceName: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#0F4C4C', 
    marginBottom: 4 
  },
  servicePrice: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#059669', 
    marginBottom: 2 
  },
  serviceDuration: { 
    fontSize: 12, 
    color: '#6b7280' 
  },
  cta: { backgroundColor: '#0F4C4C', paddingVertical: 14, borderRadius: 28, alignItems: 'center', margin: 16 },
  ctaText: { color: 'white', fontWeight: '700', fontSize: 16 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: '#0F4C4C', textDecorationLine: 'underline' },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 8, paddingVertical: 8 },
  commentAuthor: { color: '#111827', fontWeight: '700' },
  commentRating: { color: '#6b7280' },
  commentText: { color: '#374151' },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});



