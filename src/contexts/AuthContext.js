import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.31:3001';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        const userData = JSON.parse(storedUser);
        userData.token = storedToken; // Token'ı user objesine ekle
        setUser(userData);
        
        // Token'ı axios header'ına ekle
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Token'ın geçerli olup olmadığını kontrol et
        try {
          await axios.get(`${API_BASE_URL}/auth/profile`);
        } catch (error) {
          // Token geçersizse temizle
          await logout();
        }
      }
    } catch (error) {
      console.error('Stored auth yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role = 'CUSTOMER') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        role,
      });

      const { user: userData, token: authToken } = response.data;

      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // State'i güncelle
      userData.token = authToken; // Token'ı user objesine ekle
      setUser(userData);
      setToken(authToken);

      // Axios header'ına ekle
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true, user: userData };
    } catch (error) {
      console.error('Giriş hatası:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Giriş yapılamadı' 
      };
    }
  };

  const register = async (name, email, phone, password, city, district, role = 'CUSTOMER', address = '') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        city,
        district,
        address,
        role,
      });

      const { user: userData, token: authToken } = response.data;

      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // State'i güncelle
      userData.token = authToken; // Token'ı user objesine ekle
      setUser(userData);
      setToken(authToken);

      // Axios header'ına ekle
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true, user: userData };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Kayıt olunamadı' 
      };
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      // AsyncStorage'ı güncelle
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // State'i güncelle
      setUser(updatedUserData);
      
      return { success: true };
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      return { success: false, error: 'Kullanıcı güncellenemedi' };
    }
  };

  const logout = async () => {
    try {
      // AsyncStorage'dan temizle
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      // State'i temizle
      setUser(null);
      setToken(null);

      // Axios header'ından kaldır
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const updateUserSync = (userData) => {
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateUserSync,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
