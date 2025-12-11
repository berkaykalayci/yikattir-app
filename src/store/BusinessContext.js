import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import API_BASE_URL from '../config/api';
import { logError } from '../utils/errorMessages';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false); // Hemen false yap
  const { user } = useAuth();

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (!user) return; // User yoksa socket bağlantısı kurma
    
    let socket;
    try {
      socket = io(API_BASE_URL, { 
        transports: ['websocket'], 
        forceNew: true,
        timeout: 5000,
      });
      
      socket.on('connect', () => {
        const cityName = user?.city || 'izmir';
        socket.emit('join:city', cityName);
      });

    socket.on('reviews:changed', (payload) => {
      if (payload?.businessId && payload?.rating) {
        setBusinesses(prevBusinesses => 
          prevBusinesses.map(business => 
            business.id === payload.businessId 
              ? { ...business, rating: payload.rating }
              : business
          )
        );
      }
    });

    socket.on('businesses:changed', () => {
      loadBusinesses();
    });

      socket.on('error', (error) => {
        logError('BusinessContext', 'Socket hatası');
      });
    } catch (error) {
      logError('BusinessContext', 'Socket bağlantı hatası');
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.city]);


  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/businesses`, { timeout: 10000 });
      setBusinesses(response.data || []);
    } catch (error) {
      logError('BusinessContext', 'İşletmeler yüklenirken hata', error);
      if (__DEV__) {
        console.error('BusinessContext hata detayları:', {
          url: `${API_BASE_URL}/businesses`,
          error: error.response?.data || error.message,
          status: error.response?.status,
        });
      }
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


