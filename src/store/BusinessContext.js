import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://192.168.1.20:3001';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadBusinesses();
  }, []);

  // Socket.IO: Review değişikliklerini dinle
  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ['websocket'], forceNew: true });
    
    socket.on('connect', () => {
      console.log('BusinessContext: Socket bağlandı');
      // Kullanıcının şehrine join ol
      const cityName = user?.city || 'izmir';
      socket.emit('join:city', cityName);
      console.log(`BusinessContext: City room'a join oldu: ${cityName}`);
    });

    socket.on('reviews:changed', (payload) => {
      console.log('BusinessContext: Review değişikliği alındı:', payload);
      if (payload?.businessId && payload?.rating) {
        // İşletmenin rating'ini güncelle
        setBusinesses(prevBusinesses => 
          prevBusinesses.map(business => 
            business.id === payload.businessId 
              ? { ...business, rating: payload.rating }
              : business
          )
        );
      }
    });

    socket.on('businesses:changed', (payload) => {
      console.log('BusinessContext: İşletme değişikliği alındı:', payload);
      // İşletme listesini yeniden yükle
      loadBusinesses();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.city]);


  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/businesses`);
      console.log('API\'den gelen işletmeler:', response.data);
      setBusinesses(response.data);
    } catch (error) {
      console.error('İşletmeler yüklenirken hata:', error);
      // Hata durumunda boş array kullan
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const addBusiness = (biz) => {
    setBusinesses((prev) => [{ id: Date.now(), rating: 4.5, ...biz }, ...prev]);
  };

  const value = useMemo(() => ({ 
    businesses, 
    addBusiness, 
    loading, 
    refreshBusinesses: loadBusinesses 
  }), [businesses, loading]);
  
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>; 
}

export function useBusinesses() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusinesses must be used within BusinessProvider');
  return ctx;
}


