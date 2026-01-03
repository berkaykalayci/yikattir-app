import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { logError } from '../utils/errorMessages';

const AppointmentsContext = createContext(null);

export function AppointmentsProvider({ children }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = useCallback(async () => {
    // Sadece CUSTOMER rolü için çalış
    if (!user?.id || user?.role !== 'CUSTOMER') {
      setAppointments([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/appointments/customer/${user.id}`, { timeout: 10000 });
      setAppointments(response.data || []);
    } catch (error) {
      if (__DEV__) {
        console.error('[AppointmentsContext] Randevular yüklenirken hata:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: `${API_BASE_URL}/appointments/customer/${user.id}`
        });
      }
      logError('AppointmentsContext', 'Randevular yüklenirken hata', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.id && user?.role === 'CUSTOMER') {
      loadAppointments();
    } else {
      setAppointments([]);
    }
  }, [user?.id, user?.role, loadAppointments]);


  const refreshAppointments = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  const value = {
    appointments,
    loading,
    refreshAppointments,
    loadAppointments
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentsProvider');
  return ctx;
}
