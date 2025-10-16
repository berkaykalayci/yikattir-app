import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function BusinessLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const handleBusinessLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre alanları zorunludur.');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email.trim(), password.trim(), 'BUSINESS');
      
      if (result.success) {
        // AuthContext state değişikliği RootNavigation'ı otomatik güncelleyecek
        // navigation.replace gerekmez
      } else {
        Alert.alert('Giriş Hatası', result.error);
      }
    } catch (error) {
      console.error('İşletme giriş hatası:', error);
      Alert.alert('Hata', 'Giriş işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>İŞLETME GİRİŞİ</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.card}>
        <TextInput placeholder="E-Posta" style={styles.input} value={email} onChangeText={setEmail} />
        <TextInput placeholder="Şifre" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={handleBusinessLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          İşletme hesabın yok mu?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('BusinessRegister')}>
            Kayıt ol !
          </Text>
        </Text>
        <TouchableOpacity style={styles.customerLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.customerLinkText}>Müşteri Girişi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F4C4C', alignItems: 'center', justifyContent: 'center' },
  header: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 16,
    paddingBottom: 16
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700' },
  placeholder: { width: 40 },
  card: { width: '86%', backgroundColor: '#e3e3e3', padding: 20, borderRadius: 20, gap: 12 },
  input: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  btn: { backgroundColor: 'white', paddingVertical: 12, borderRadius: 24, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0F4C4C', fontWeight: '700' },
  hint: { textAlign: 'center', marginTop: 6, color: '#2b2b2b' },
  link: { color: '#0F4C4C', fontWeight: '700' },
  customerLink: { 
    marginTop: 16, 
    paddingVertical: 8, 
    alignItems: 'center' 
  },
  customerLinkText: { 
    color: '#0F4C4C', 
    fontSize: 14, 
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
});
