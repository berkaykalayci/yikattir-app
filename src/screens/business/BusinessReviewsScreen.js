import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import io from 'socket.io-client';


export default function BusinessReviewsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState('newest'); // newest | highest | lowest

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
        setBusinessId(res.data.id);
      } catch (e) {}
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!businessId) return;
    loadReviews();
  }, [businessId]);

  // Socket: işletme odasında reviews değişimini dinle
  useEffect(() => {
    if (!businessId) return;
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    socket.on('connect', () => {
      socket.emit('join:business', businessId);
    });
    socket.on('reviews:changed', (payload) => {
      if (payload?.businessId === businessId) {
        loadReviews();
      }
    });
    return () => socket.disconnect();
  }, [businessId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Önce profil üzerinden detay çekelim ve içindeki reviews listesini kullanalım
      const res = await axios.get(`${API_BASE_URL}/businesses/profile/${businessId}`);
      const raw = Array.isArray(res.data?.reviews) ? res.data.reviews : [];
      const normalized = raw.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        appointmentId: r.appointmentId,
        customerName: r.appointment?.customer?.name || 'Anonim',
        serviceName: r.appointment?.service?.name || (r.appointment?.serviceName || 'Hizmet'),
      }));
      setReviews(normalized);
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => {
    const arr = [...reviews];
    if (sort === 'highest') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sort === 'lowest') arr.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    else arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return arr;
  }, [reviews, sort]);

  const maskName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return 'Anonim';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const last = parts[parts.length - 1];
    return `${first} ${last.charAt(0).toUpperCase()}.`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.leftRow}>
          <Ionicons name="person-circle-outline" size={24} color="#0F4C4C" />
          <Text style={styles.author}>{maskName(item.customerName)}</Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
      </View>
      <View style={styles.ratingRow}>
        <View style={styles.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i + 1 <= Math.floor(item.rating) ? 'star' : 'star-outline'}
              size={14}
              color={'#0F4C4C'}
            />
          ))}
        </View>
        <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
      </View>
      {Boolean(item.comment) && <Text style={styles.comment}>{item.comment}</Text>}
      <View style={styles.serviceRow}>
        <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
        <Text style={styles.serviceText}>{item.serviceName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Değerlendirmelerim</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filters}>
        <TouchableOpacity onPress={() => setSort('newest')} style={[styles.chip, sort === 'newest' && styles.chipActive]}>
          <Text style={[styles.chipText, sort === 'newest' && styles.chipTextActive]}>En yeni</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSort('highest')} style={[styles.chip, sort === 'highest' && styles.chipActive]}>
          <Text style={[styles.chipText, sort === 'highest' && styles.chipTextActive]}>En yüksek</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSort('lowest')} style={[styles.chip, sort === 'lowest' && styles.chipActive]}>
          <Text style={[styles.chipText, sort === 'lowest' && styles.chipTextActive]}>En düşük</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#0F4C4C" />
        </View>
      ) : reviews.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Ionicons name="chatbubbles-outline" size={40} color="#9ca3af" />
          <Text style={{ marginTop: 8, color: '#6b7280' }}>Henüz değerlendirme bulunmuyor</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={loadReviews}
          refreshing={loading}
        />
      )}
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
  title: { color: '#fff', fontWeight: '700' },
  filters: { flexDirection: 'row', gap: 8, padding: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#f3f4f6' },
  chipActive: { backgroundColor: '#0F4C4C' },
  chipText: { color: '#374151', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 24 },
  loadingWrap: { padding: 16, alignItems: 'center' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  author: { color: '#111827', fontWeight: '700' },
  date: { color: '#6b7280', fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#6b7280' },
  comment: { color: '#374151', marginTop: 6 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  serviceText: { color: '#6b7280' },
});


