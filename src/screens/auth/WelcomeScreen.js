import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.tagline}>Cepte Kolayı Var</Text>
      <View style={{ width: '85%', gap: 12 }}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.btnSecondaryText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F4C4C', alignItems: 'center', justifyContent: 'center', gap: 24 },
  logo: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 8 },
  tagline: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 16 },
  btn: { backgroundColor: 'white', paddingVertical: 14, borderRadius: 28, alignItems: 'center' },
  btnText: { color: '#0F4C4C', fontWeight: '700', fontSize: 16 },
  btnSecondary: { backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 14, borderRadius: 28, alignItems: 'center' },
  btnSecondaryText: { color: '#0F4C4C', fontWeight: '700', fontSize: 16 },
});

