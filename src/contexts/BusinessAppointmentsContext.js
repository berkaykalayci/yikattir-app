import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.20:3001';

const BusinessAppointmentsContext = createContext(null);

export function BusinessAppointmentsProvider({ children }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState(null);

  const loadAppointments = async (businessIdParam = null) => {
    const targetBusinessId = businessIdParam || businessId;
    if (!targetBusinessId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/appointments/business/${targetBusinessId}`);
      setAppointments(response.data);
      if (businessIdParam) {
        setBusinessId(businessIdParam);
      }
    } catch (error) {
      console.error('İşletme randevuları yüklenirken hata:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      loadAppointments();
    }
  }, [businessId]);


  const refreshAppointments = () => {
    loadAppointments();
  };

  const value = {
    appointments,
    loading,
    refreshAppointments,
    loadAppointments,
    setBusinessId
  };

  return (
    <BusinessAppointmentsContext.Provider value={value}>
      {children}
    </BusinessAppointmentsContext.Provider>
  );
}

export function useBusinessAppointments() {
  const ctx = useContext(BusinessAppointmentsContext);
  if (!ctx) throw new Error('useBusinessAppointments must be used within BusinessAppointmentsProvider');
  return ctx;
}
