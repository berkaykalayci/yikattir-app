import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Screen from '../../components/layout/Screen';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectionScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hangi rolü seçiyorsunuz?</Text>
        <Text style={styles.subtitle}>Uygulamayı nasıl kullanmak istediğinizi seçin</Text>
      </View>

      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={styles.roleCard} 
          onPress={() => navigation.navigate('Home')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="person" size={48} color="#0F4C4C" />
          </View>
          <Text style={styles.roleTitle}>Müşteri</Text>
          <Text style={styles.roleDescription}>
            Araç yıkama hizmeti almak ve randevu oluşturmak için
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>Randevu oluştur</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>İşletmeleri keşfet</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>Değerlendirme yap</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.roleCard} 
          onPress={() => navigation.navigate('BusinessHome')}
        >
          <View style={styles.roleIcon}>
            <Ionicons name="business" size={48} color="#0F4C4C" />
          </View>
          <Text style={styles.roleTitle}>İşletme</Text>
          <Text style={styles.roleDescription}>
            İşletmenizi yönetmek ve müşteri randevularını takip etmek için
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>Randevuları yönet</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>Hizmetleri düzenle</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.featureText}>Gelir takibi</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Daha sonra rolünüzü değiştirebilirsiniz
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F4C4C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  roleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 20,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F4C4C',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
