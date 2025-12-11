import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'E-posta ve şifre alanları zorunludur.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
    } else {
      Alert.alert('Giriş Hatası', result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>MÜŞTERİ GİRİŞİ</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={40} color="#0F4C4C" />
          </View>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput 
              placeholder="E-Posta" 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput 
              placeholder="Şifre" 
              style={styles.input} 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />
          </View>
          <TouchableOpacity 
            style={[styles.btn, loading && styles.btnDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnText}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            Hesabın yok mu?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
              Kayıt ol !
            </Text>
          </Text>
          <TouchableOpacity style={styles.businessLink} onPress={() => navigation.navigate('BusinessLogin')}>
            <Text style={styles.businessLinkText}>İşletme Girişi</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>YIKATTIR</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F4C4C' },
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
    paddingBottom: 16,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  card: { 
    width: '90%', 
    backgroundColor: 'white', 
    padding: 24, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: { 
    flex: 1,
    fontSize: 16, 
    paddingVertical: 16,
    color: '#374151',
  },
  btn: { 
    backgroundColor: '#0F4C4C', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 16,
    shadowColor: '#0F4C4C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  btnDisabled: { opacity: 0.6 },
  hint: { textAlign: 'center', marginTop: 6, color: '#2b2b2b' },
  link: { color: '#0F4C4C', fontWeight: '700' },
  businessLink: { 
    marginTop: 16, 
    paddingVertical: 8, 
    alignItems: 'center' 
  },
  businessLinkText: { 
    color: '#0F4C4C', 
    fontSize: 14, 
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  brandContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.1)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 4,
  },
});

