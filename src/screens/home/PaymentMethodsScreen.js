import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.20:3001';

export default function PaymentMethodsScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/payment-methods/customer/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCards(response.data);
    } catch (error) {
      console.error('Kartlar yüklenirken hata:', error);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (type) => {
    switch (type) {
      case 'visa':
        return '#1a1f71';
      case 'mastercard':
        return '#eb001b';
      default:
        return '#6b7280';
    }
  };

  const setAsDefault = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/payment-methods/${id}/default`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setCards(prev => 
        prev.map(card => ({
          ...card,
          isDefault: card.id === id
        }))
      );
      
      Alert.alert('Başarılı', 'Kart varsayılan olarak ayarlandı');
    } catch (error) {
      console.error('Kart varsayılan yapılırken hata:', error);
      Alert.alert('Hata', 'Kart varsayılan yapılamadı');
    }
  };

  const deleteCard = (id) => {
    Alert.alert(
      'Kartı Sil',
      'Bu kartı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/payment-methods/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
              });
              
              setCards(prev => prev.filter(card => card.id !== id));
              Alert.alert('Başarılı', 'Kart başarıyla silindi');
            } catch (error) {
              console.error('Kart silinirken hata:', error);
              Alert.alert('Hata', 'Kart silinemedi');
            }
          }
        }
      ]
    );
  };

  const renderCard = (card) => (
    <View key={card.id} style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Ionicons 
            name={getCardIcon(card.cardType)} 
            size={24} 
            color={getCardColor(card.cardType)} 
          />
          <Text style={styles.cardType}>{card.cardType.toUpperCase()}</Text>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Varsayılan</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => deleteCard(card.id)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardDetails}>
        <Text style={styles.cardNumber}>**** **** **** {card.lastFour}</Text>
        <Text style={styles.cardExpiry}>{card.expiryDate}</Text>
      </View>
      
      <Text style={styles.cardHolder}>{card.cardHolder}</Text>
      
      {!card.isDefault && (
        <TouchableOpacity 
          style={styles.setDefaultButton}
          onPress={() => setAsDefault(card.id)}
        >
          <Text style={styles.setDefaultText}>Varsayılan Yap</Text>
        </TouchableOpacity>
      )}
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
        <Text style={styles.title}>Ödeme Yöntemleri</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCard')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {cards.length > 0 ? (
          <View style={styles.cardsList}>
            {cards.map(renderCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Henüz kart eklenmemiş</Text>
            <Text style={styles.emptySubtitle}>
              Ödeme yapmak için bir kart ekleyin
            </Text>
            <TouchableOpacity 
              style={styles.addCardButton}
              onPress={() => navigation.navigate('AddCard')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addCardText}>Kart Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>Güvenli ödeme</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={20} color="#10b981" />
            <Text style={styles.infoText}>SSL şifreleme</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="card" size={20} color="#10b981" />
            <Text style={styles.infoText}>Tüm kartlar kabul edilir</Text>
          </View>
        </View>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  cardsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  cardContainer: {
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
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  defaultBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 2,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardHolder: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  setDefaultButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: '#0F4C4C',
    fontSize: 14,
    fontWeight: '600',
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
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addCardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 24,
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
  },
});
