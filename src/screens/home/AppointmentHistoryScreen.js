import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { logError } from '../../utils/errorMessages';
import { useAuth } from '../../contexts/AuthContext';


export default function AppointmentHistoryScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id]);

  const formatTurkishDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE_URL}/appointments/customer/${user.id}`);
      const list = Array.isArray(resp.data) ? resp.data : [];
      const mapped = list.map((a) => {
        const businessName = a.business?.name || 'İşletme';
        const businessLocation = a.business ? `${a.business.district || ''}${a.business.district && a.business.city ? ', ' : ''}${a.business.city || ''}` : '';
        const serviceName = a.service?.name || 'Hizmet';
        const firstReview = Array.isArray(a.reviews) && a.reviews.length ? a.reviews[0] : null;
        return {
          id: a.id,
          businessName,
          businessLocation,
          service: serviceName,
          date: formatTurkishDate(a.date),
          time: a.time,
          status: a.status, // PENDING | CONFIRMED | CANCELLED | COMPLETED | REJECTED
          rating: firstReview ? firstReview.rating : null,
          price: a.totalPrice || 0,
          canRate: a.status === 'COMPLETED' && !firstReview,
          raw: a,
        };
      });
      setAppointments(mapped);
    } catch (error) {
      logError('AppointmentHistoryScreen', 'Geçmiş randevular yüklenirken hata');
      Alert.alert('Hata', getErrorMessage(error) || 'Geçmiş randevular getirilemedi. Lütfen tekrar deneyin.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  }, [loadAppointments]);

  const filteredAppointments = useMemo(() => {
    const onlyHistory = appointments.filter((x) => x.status === 'COMPLETED' || x.status === 'CANCELLED');
    if (filter === 'all') return onlyHistory;
    if (filter === 'completed') return onlyHistory.filter((a) => a.status === 'COMPLETED');
    if (filter === 'cancelled') return onlyHistory.filter((a) => a.status === 'CANCELLED');
    return onlyHistory;
  }, [appointments, filter]);

  const getStatusColor = (status) => {
    const normalizedStatus = status ? String(status).toUpperCase().trim() : '';
    
    switch (normalizedStatus) {
      case 'COMPLETED':
      case 'completed':
        return '#10b981';
      case 'CANCELLED':
      case 'CANCELED':
      case 'cancelled':
      case 'canceled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = status ? String(status).toUpperCase().trim() : '';
    
    switch (normalizedStatus) {
      case 'COMPLETED':
      case 'completed':
        return 'Tamamlandı';
      case 'CANCELLED':
      case 'CANCELED':
      case 'cancelled':
      case 'canceled':
        return 'İptal Edildi';
      default:
        return normalizedStatus || 'Bilinmiyor';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (rating >= i - 0.5) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#d1d5db" />);
      }
    }
    return stars;
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>{item.businessName}</Text>
          <Text style={styles.businessLocation}>{item.businessLocation}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.serviceInfo}>
        <Ionicons name="car-outline" size={16} color="#6b7280" />
        <Text style={styles.serviceText}>{item.service}</Text>
      </View>

      <View style={styles.dateTimeInfo}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.dateTimeText}>{item.date}</Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.dateTimeText}>{item.time}</Text>
        </View>
      </View>

      {item.rating && (
        <View style={styles.ratingSection}>
          <View style={styles.ratingStars}>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.priceText}>{item.price} ₺</Text>
        <View style={styles.actionButtons}>
          {item.canRate && (
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => navigation.navigate('RateAppointment', { appointment: item.raw })}
            >
              <Ionicons name="star-outline" size={16} color="#0F4C4C" />
              <Text style={styles.rateButtonText}>Değerlendir</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => navigation.navigate('AppointmentDetail', { appointment: item.raw })}
          >
            <Text style={styles.detailButtonText}>Detay</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.title}>Geçmiş Randevular</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Tamamlanan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'cancelled' && styles.activeFilter]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.activeFilterText]}>
            İptal Edilen
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAppointment}
        contentContainerStyle={[styles.appointmentsList, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Geçmiş randevu bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? 'Henüz randevu almadınız'
                : filter === 'completed'
                ? 'Tamamlanan randevu bulunamadı'
                : 'İptal edilen randevu bulunamadı'
              }
            </Text>
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilter: {
    backgroundColor: '#0F4C4C',
    borderColor: '#0F4C4C',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: 'white',
  },
  appointmentsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  appointmentCard: {
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  dateTimeInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F4C4C',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 4,
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F4C4C',
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F4C4C',
  },
  detailButtonText: {
    fontSize: 12,
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
  },
});
