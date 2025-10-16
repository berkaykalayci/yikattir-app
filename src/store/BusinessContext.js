import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.31:3001';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);


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


