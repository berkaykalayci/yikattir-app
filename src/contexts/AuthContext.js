import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { getErrorMessage, logError } from '../utils/errorMessages';

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
      setLoading(true);
      
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        const userData = JSON.parse(storedUser);
        userData.token = storedToken;
        setUser(userData);
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        Promise.race([
          axios.get(`${API_BASE_URL}/auth/profile`, { timeout: 5000 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]).then(() => {
        }).catch((error) => {
          if (error.response && error.response.status === 401) {
            logError('AuthContext', 'Token kontrolü başarısız - Geçersiz token');
            setUser(null);
            setToken(null);
            AsyncStorage.removeItem('authToken');
            AsyncStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
          } else {
            logError('AuthContext', 'Token kontrolü başarısız - Bağlantı hatası');
          }
        });
      }
    } catch (error) {
      logError('AuthContext', 'Stored auth yükleme hatası');
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

      // Token ve userData kontrolü
      if (!authToken) {
        console.error('[AuthContext] Login başarılı ama token döndürülmedi');
        return { 
          success: false, 
          error: 'Giriş başarılı ancak oturum açılamadı. Lütfen tekrar deneyin.' 
        };
      }

      if (!userData) {
        console.error('[AuthContext] Login başarılı ama user data döndürülmedi');
        return { 
          success: false, 
          error: 'Giriş başarılı ancak kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.' 
        };
      }

      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      userData.token = authToken; // Token'ı user objesine ekle
      setUser(userData);
      setToken(authToken);

      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true, user: userData };
    } catch (error) {
      // Detaylı hata loglama
      if (__DEV__) {
        console.error('[AuthContext] Giriş hatası detayları:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: `${API_BASE_URL}/auth/login`
        });
      }
      logError('AuthContext', 'Giriş hatası');
      
      // Özel hata mesajı belirleme
      let errorMessage = 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.';
      
      if (error.response?.data?.error) {
        // Backend'den gelen özel hata mesajı
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        // 401 için giriş ekranına uygun mesaj
        errorMessage = 'Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.';
      } else if (error.response?.status === 403) {
        // 403 için backend'den gelen mesajı kullan
        errorMessage = error.response.data?.error || 'Bu işlem için yetkiniz bulunmamaktadır.';
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      } else {
        // Diğer hatalar için genel mesaj
        errorMessage = getErrorMessage(error) || errorMessage;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (name, email, phone, password, city, district, role = 'CUSTOMER', address = '', tcNo = '', vergiNo = '', ownerName = '', businessName = '') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        city,
        district,
        address,
        tcNo,
        vergiNo,
        role,
        ownerName,
        businessName,
      });

      // BUSINESS rolü için token döndürülmez, onay bekliyor mesajı döner
      if (role === 'BUSINESS' || response.data.requiresApproval) {
        // BUSINESS rolü için kesinlikle token kaydetme
        console.log('BUSINESS kayıt - Token kaydedilmiyor, requiresApproval:', response.data.requiresApproval);
        return { 
          success: true, 
          requiresApproval: true,
          message: response.data.message || 'Kayıt işleminiz başarıyla tamamlandı. Hesabınız yönetici onayı beklemektedir.',
          user: response.data.user 
        };
      }

      // CUSTOMER rolü için token döndürülür
      const { user: userData, token: authToken } = response.data;

      // Token kontrolü - token yoksa kaydetme
      if (!authToken) {
        console.log('Token yok - kayıt başarısız');
        return { 
          success: false, 
          error: 'Kayıt işlemi tamamlandı ancak giriş yapılamadı. Lütfen giriş ekranından giriş yapın.' 
        };
      }

      // Token varsa kaydet
      console.log('Token kaydediliyor - CUSTOMER kayıt');
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      userData.token = authToken; // Token'ı user objesine ekle
      setUser(userData);
      setToken(authToken);

      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true, user: userData };
    } catch (error) {
      logError('AuthContext', 'Kayıt hatası');
      return { 
        success: false, 
        error: getErrorMessage(error) || 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.' 
      };
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      
      setUser(updatedUserData);
      
      return { success: true };
    } catch (error) {
      logError('AuthContext', 'Kullanıcı güncelleme hatası');
      return { success: false, error: 'Bilgileriniz güncellenemedi. Lütfen tekrar deneyin.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');

      setUser(null);
      setToken(null);

      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      logError('AuthContext', 'Çıkış hatası');
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
