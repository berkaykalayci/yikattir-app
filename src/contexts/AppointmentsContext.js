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
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/appointments/customer/${user.id}`, { timeout: 10000 });
      setAppointments(response.data || []);
    } catch (error) {
      logError('AppointmentsContext', 'Randevular yüklenirken hata', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id]);


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
