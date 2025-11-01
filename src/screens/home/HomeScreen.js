import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { useBusinesses } from '../../store/BusinessContext';
import API_BASE_URL from '../../config/api';

// Şehir listesi - CitySelectionScreen'den alındı
const CITIES = [
  { id: 1, name: 'Adana', plate: '01' },
  { id: 2, name: 'Adıyaman', plate: '02' },
  { id: 3, name: 'Afyonkarahisar', plate: '03' },
  { id: 4, name: 'Ağrı', plate: '04' },
  { id: 5, name: 'Amasya', plate: '05' },
  { id: 6, name: 'Ankara', plate: '06' },
  { id: 7, name: 'Antalya', plate: '07' },
  { id: 8, name: 'Artvin', plate: '08' },
  { id: 9, name: 'Aydın', plate: '09' },
  { id: 10, name: 'Balıkesir', plate: '10' },
  { id: 11, name: 'Bilecik', plate: '11' },
  { id: 12, name: 'Bingöl', plate: '12' },
  { id: 13, name: 'Bitlis', plate: '13' },
  { id: 14, name: 'Bolu', plate: '14' },
  { id: 15, name: 'Burdur', plate: '15' },
  { id: 16, name: 'Bursa', plate: '16' },
  { id: 17, name: 'Çanakkale', plate: '17' },
  { id: 18, name: 'Çankırı', plate: '18' },
  { id: 19, name: 'Çorum', plate: '19' },
  { id: 20, name: 'Denizli', plate: '20' },
  { id: 21, name: 'Diyarbakır', plate: '21' },
  { id: 22, name: 'Edirne', plate: '22' },
  { id: 23, name: 'Elazığ', plate: '23' },
  { id: 24, name: 'Erzincan', plate: '24' },
  { id: 25, name: 'Erzurum', plate: '25' },
  { id: 26, name: 'Eskişehir', plate: '26' },
  { id: 27, name: 'Gaziantep', plate: '27' },
  { id: 28, name: 'Giresun', plate: '28' },
  { id: 29, name: 'Gümüşhane', plate: '29' },
  { id: 30, name: 'Hakkari', plate: '30' },
  { id: 31, name: 'Hatay', plate: '31' },
  { id: 32, name: 'Isparta', plate: '32' },
  { id: 33, name: 'Mersin', plate: '33' },
  { id: 34, name: 'İstanbul', plate: '34' },
  { id: 35, name: 'İzmir', plate: '35' },
  { id: 36, name: 'Kars', plate: '36' },
  { id: 37, name: 'Kastamonu', plate: '37' },
  { id: 38, name: 'Kayseri', plate: '38' },
  { id: 39, name: 'Kırklareli', plate: '39' },
  { id: 40, name: 'Kırşehir', plate: '40' },
  { id: 41, name: 'Kocaeli', plate: '41' },
  { id: 42, name: 'Konya', plate: '42' },
  { id: 43, name: 'Kütahya', plate: '43' },
  { id: 44, name: 'Malatya', plate: '44' },
  { id: 45, name: 'Manisa', plate: '45' },
  { id: 46, name: 'Kahramanmaraş', plate: '46' },
  { id: 47, name: 'Mardin', plate: '47' },
  { id: 48, name: 'Muğla', plate: '48' },
  { id: 49, name: 'Muş', plate: '49' },
  { id: 50, name: 'Nevşehir', plate: '50' },
  { id: 51, name: 'Niğde', plate: '51' },
  { id: 52, name: 'Ordu', plate: '52' },
  { id: 53, name: 'Rize', plate: '53' },
  { id: 54, name: 'Sakarya', plate: '54' },
  { id: 55, name: 'Samsun', plate: '55' },
  { id: 56, name: 'Siirt', plate: '56' },
  { id: 57, name: 'Sinop', plate: '57' },
  { id: 58, name: 'Sivas', plate: '58' },
  { id: 59, name: 'Tekirdağ', plate: '59' },
  { id: 60, name: 'Tokat', plate: '60' },
  { id: 61, name: 'Trabzon', plate: '61' },
  { id: 62, name: 'Tunceli', plate: '62' },
  { id: 63, name: 'Şanlıurfa', plate: '63' },
  { id: 64, name: 'Uşak', plate: '64' },
  { id: 65, name: 'Van', plate: '65' },
  { id: 66, name: 'Yozgat', plate: '66' },
  { id: 67, name: 'Zonguldak', plate: '67' },
  { id: 68, name: 'Aksaray', plate: '68' },
  { id: 69, name: 'Bayburt', plate: '69' },
  { id: 70, name: 'Karaman', plate: '70' },
  { id: 71, name: 'Kırıkkale', plate: '71' },
  { id: 72, name: 'Batman', plate: '72' },
  { id: 73, name: 'Şırnak', plate: '73' },
  { id: 74, name: 'Bartın', plate: '74' },
  { id: 75, name: 'Ardahan', plate: '75' },
  { id: 76, name: 'Iğdır', plate: '76' },
  { id: 77, name: 'Yalova', plate: '77' },
  { id: 78, name: 'Karabük', plate: '78' },
  { id: 79, name: 'Kilis', plate: '79' },
  { id: 80, name: 'Osmaniye', plate: '80' },
  { id: 81, name: 'Düzce', plate: '81' }
];





export default function HomeScreen({ navigation }) {
  const { businesses, loading: businessesLoading } = useBusinesses();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [sortBy, setSortBy] = useState('distance_desc_rating');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCity, setSelectedCity] = useState(null);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Favori durumunu kontrol et
  const checkFavoriteStatus = useCallback(async (businessId) => {
    if (!user) return false;
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/user/${user.id}/business/${businessId}`);
      return response.data.isFavorite;
    } catch (error) {
      return false;
    }
  }, [user]);

  // Tüm işletmelerin favori durumunu yükle
  const loadFavoriteStatuses = useCallback(async () => {
    if (!user || !businesses.length) return;
    
    const favoriteSet = new Set();
    for (const business of businesses) {
      const isFavorite = await checkFavoriteStatus(business.id);
      if (isFavorite) {
        favoriteSet.add(business.id);
      }
    }
    setFavorites(favoriteSet);
  }, [user, businesses, checkFavoriteStatus]);

  useEffect(() => {
    if (user && businesses.length) {
      loadFavoriteStatuses();
    }
  }, [user, businesses, loadFavoriteStatuses]);


  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    try {
      console.log('🚀 loadInitialData başlatıldı');
      console.log('👤 user:', user);
      console.log('🏙️ user?.city:', user?.city);
      
      // Önce kullanıcının kayıtlı olduğu şehri otomatik seç
      if (user?.city) {
        const userCity = CITIES.find(city => city.name.toLowerCase() === user.city.toLowerCase());
        console.log('🔍 CITIES listesinde aranan şehir:', user.city);
        console.log('🔍 Bulunan şehir:', userCity);
        if (userCity) {
          console.log('✅ Kullanıcının kayıtlı şehri otomatik seçiliyor:', user.city);
          setSelectedCity(userCity);
        } else {
          console.log('❌ Kullanıcının şehri CITIES listesinde bulunamadı:', user.city);
          console.log('🔍 Mevcut şehirler:', CITIES.map(c => c.name).slice(0, 10));
        }
      } else {
        console.log('⚠️ user?.city yok, şehir seçimi yapılmadı');
      }
      
      console.log('Konum izni isteniyor...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Konum izni durumu:', status);
      
      if (status === 'granted') {
        console.log('Konum alınıyor...');
        const cur = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
          maximumAge: 300000 // 5 dakika cache
        });
        console.log('Konum alındı:', cur.coords);
        setLocation({ lat: cur.coords.latitude, lng: cur.coords.longitude });
        // GPS konumu alındığında şehir seçimini temizle (GPS öncelikli)
        setSelectedCity(null);
      } else {
        console.log('Konum izni verilmedi, kullanıcı şehrine göre filtreleme devam ediyor');
      }
    } catch (error) {
      console.error('Konum verileri yüklenirken hata:', error);
      console.log('Hata durumunda kullanıcı şehrine göre filtreleme devam ediyor');
    }
  };

  // Socket.IO: Şehir odasına katıl (sadece şehir bazlı filtreleme için)
  useEffect(() => {
    const cityName = selectedCity?.name || user?.city;
    if (!cityName) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    socket.on('connect', () => {
      socket.emit('join:city', cityName);
    });
    return () => {
      socket.disconnect();
    };
  }, [selectedCity?.name, user?.city]);

  const withDistance = useMemo(() => {
    const haversine = (a, b) => {
      if (!a || !b || !a.lat || !a.lng || !b.lat || !b.lng) return null;
      const toRad = (x) => (x * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const s =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
      return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };
    const source = businesses && businesses.length ? businesses : [];
    console.log('Mesafe hesaplanıyor, konum:', location, 'işletme sayısı:', source.length);
    return source.map((x) => {
      const distance = location ? haversine(location, { lat: x.lat, lng: x.lng }) : null;
      console.log(`İşletme: ${x.name}, Koordinat: (${x.lat}, ${x.lng}), Mesafe: ${distance}km`);
      return { 
        ...x, 
        distanceKm: distance
      };
    });
  }, [location, businesses]);

  // Favori ekleme/çıkarma fonksiyonları
  const toggleFavorite = async (businessId) => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız.');
      return;
    }

    const isFavorite = favorites.has(businessId);

    try {
      if (isFavorite) {
        // Favoriden çıkar
        await axios.delete(`${API_BASE_URL}/favorites/user/${user.id}/business/${businessId}`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(businessId);
          return newSet;
        });
      } else {
        // Favoriye ekle
        await axios.post(`${API_BASE_URL}/favorites`, {
          userId: user.id,
          businessId: businessId
        });
        setFavorites(prev => new Set([...prev, businessId]));
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      Alert.alert('Hata', 'Favori işlemi gerçekleştirilemedi');
    }
  };

  const data = useMemo(() => {
    let arr = withDistance.filter((x) => x.name.toLowerCase().includes(query.toLowerCase()));
    console.log('🔍 Filtreleme öncesi işletme sayısı:', arr.length);
    console.log('🏙️ selectedCity:', selectedCity);
    console.log('👤 user?.city:', user?.city);

    // Şehir seçimi varsa o şehirdeki işletmeleri filtrele
    if (selectedCity) {
      console.log('📍 Manuel şehir filtresi uygulanıyor:', selectedCity.name);
      arr = arr.filter((x) => x.city === selectedCity.name);
      console.log('📍 Manuel şehir filtresi sonrası işletme sayısı:', arr.length);
    } else if (user?.city) {
      // Eğer manuel şehir seçimi yoksa, kullanıcının kayıtlı olduğu şehri kullan
      console.log('👤 Kullanıcının kayıtlı şehrine göre filtreleme:', user.city);
      // Büyük/küçük harf duyarsız karşılaştırma
      arr = arr.filter((x) => x.city.toLowerCase() === user.city.toLowerCase());
      console.log('👤 Kullanıcı şehri filtresi sonrası işletme sayısı:', arr.length);
    } else {
      console.log('⚠️ Hiçbir şehir filtresi uygulanmadı!');
    }

    if (sortBy === 'distance_desc_rating') {
      arr.sort((a, b) => {
        // Önce koordinatı olanları öne al
        if (a.distanceKm === null && b.distanceKm !== null) return 1;
        if (a.distanceKm !== null && b.distanceKm === null) return -1;
        if (a.distanceKm === null && b.distanceKm === null) return b.rating - a.rating;
        // Mesafe farkı çok küçükse rating'e göre sırala
        const distanceDiff = a.distanceKm - b.distanceKm;
        if (Math.abs(distanceDiff) < 0.1) {
          return b.rating - a.rating;
        }
        return distanceDiff;
      });
    } else if (sortBy === 'rating_desc') {
      arr.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'distance_asc') {
      arr.sort((a, b) => {
        // Önce koordinatı olanları öne al
        if (a.distanceKm === null && b.distanceKm !== null) return 1;
        if (a.distanceKm !== null && b.distanceKm === null) return -1;
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        return a.distanceKm - b.distanceKm;
      });
    }
    return arr;
  }, [withDistance, query, sortBy, selectedCity, user?.city]);

  // Featured businesses - Kullanıcının şehrindeki en yüksek puanlıları al
  const featuredBusinesses = useMemo(() => {
    if (!businesses || businesses.length === 0) return [];

    let filteredBusinesses = businesses;

    // Öncelik: manuel seçilen şehir
    if (selectedCity?.name) {
      filteredBusinesses = businesses.filter(biz => (biz.city || '').toLowerCase() === selectedCity.name.toLowerCase());
      console.log('Öne çıkanlar için manuel şehir filtresi:', selectedCity.name, 'sayı:', filteredBusinesses.length);
    } else if (user?.city) {
      // Manuel seçim yoksa kullanıcının şehri
      filteredBusinesses = businesses.filter(biz => (biz.city || '').toLowerCase() === user.city.toLowerCase());
      console.log('Öne çıkanlar için kullanıcı şehri filtresi:', user.city, 'sayı:', filteredBusinesses.length);
    }

    return filteredBusinesses
      .filter(biz => (typeof biz.rating === 'number' ? biz.rating : 0) >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
      .map(biz => ({
        ...biz,
        image: biz.imageUrl || null,
        discount: 'Öne Çıkan',
        services: Array.isArray(biz.services) ? biz.services.map(s => s.name) : []
      }));
  }, [businesses, selectedCity?.name, user?.city]);

  const renderFeaturedBusiness = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredCard}
      onPress={() => navigation.navigate('Detail', { item })}
    >
      <View style={styles.featuredImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.featuredImagePlaceholder}>
            <Text style={styles.featuredImageText}>GÖRSEL</Text>
          </View>
        )}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
      </View>
      
      <View style={styles.featuredContent}>
        <Text style={styles.featuredName}>{item.name}</Text>
        <Text style={styles.featuredLocation}>{item.district}, {item.city}</Text>
        
        <View style={styles.featuredRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.featuredRatingText}>{item.rating.toFixed(1)}</Text>
        </View>
        
        <View style={styles.featuredServices}>
          {item.services.slice(0, 2).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
      >
        <Ionicons 
          name={favorites.has(item.id) ? "heart" : "heart-outline"} 
          size={20} 
          color={favorites.has(item.id) ? "#ef4444" : "#9ca3af"} 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('CitySelection', {
            onCitySelect: (city) => setSelectedCity(city)
          })}
        >
          <Ionicons name="location-outline" size={22} color="#0F4C4C" />
        </TouchableOpacity>
        <View style={styles.searchWrap}>
          <TextInput placeholder="Oto yıkama ara..." style={styles.searchInput} value={query} onChangeText={setQuery} />
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={22} color="#0F4C4C" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}
        showsVerticalScrollIndicator={false}
      >
        {(selectedCity || user?.city) && (
          <View style={styles.cityIndicator}>
            <Ionicons name="location" size={16} color="#0F4C4C" />
            <View style={styles.cityTextContainer}>
              <Text style={styles.cityText}>
                {selectedCity ? `${selectedCity.name} (${selectedCity.plate})` : user?.city}
              </Text>
              {!selectedCity && user?.city && (
                <Text style={styles.autoText}>• Otomatik</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setSelectedCity(null)}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Öne Çıkan İşletmeler Slider */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Öne Çıkan İşletmeler</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={featuredBusinesses}
            keyExtractor={(item) => item.id}
            renderItem={renderFeaturedBusiness}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Tüm İşletmeler */}
        <View style={styles.businessSection}>
          <Text style={styles.sectionTitle}>Tüm İşletmeler</Text>
          {businessesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>İşletmeler yükleniyor...</Text>
            </View>
          ) : (
            <View style={styles.businessList}>
              {data.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card} onPress={() => navigation.navigate('Detail', { item })}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.listImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.listImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }]}>
                    <Text style={{ color: '#6b7280', fontWeight: '600' }}>GÖRSEL</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.name}</Text>
                  <Text style={styles.meta}>{item.district} • {(item.distanceKm !== null && !isNaN(item.distanceKm)) ? item.distanceKm.toFixed(1) + ' km' : 'Konum bilgisi yok'}</Text>
                  <Text style={styles.meta}>Puan: {item.rating.toFixed(1)}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.favoriteButtonSmall, favorites.has(item.id) && styles.favoriteButtonSmallActive]}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                >
                  <Ionicons 
                    name={favorites.has(item.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={favorites.has(item.id) ? "#ef4444" : "#9ca3af"} 
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f4' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#0F4C4C',
    borderRadius: 0,
    marginTop: 0,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  searchWrap: { flex: 1, backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 14, elevation: 2, height: 40, justifyContent: 'center' },
  searchInput: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingBottom: 80, // Alt bar için yeterli boşluk - dinamik padding ScrollView'da eklenir
  },
  cityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cityTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  cityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 280,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
    height: 140,
  },
  featuredImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredImagePlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredContent: {
    padding: 16,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 4,
  },
  featuredLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  featuredServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  businessSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  businessList: {
    marginTop: 16,
  },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#0F4C4C', 
    borderRadius: 16, 
    padding: 12, 
    gap: 12, 
    marginBottom: 12 
  },
  listImage: { width: 100, height: 70, backgroundColor: '#e5e7eb', borderRadius: 8 },
  title: { color: 'white', fontWeight: '700', marginBottom: 4 },
  meta: { color: 'white', opacity: 0.9 },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  favoriteButtonSmallActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 2,
  },
});

