import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const openLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Bağlantı açılamadı');
      }
    } catch (e) {
      Alert.alert('Hata', 'Bağlantı açılamadı');
    }
  };

  const handleWhatsApp = () => {
    // Türkiye numara örneği, gerekirse düzenleyin
    openLink('https://wa.me/905551112233');
  };

  const handleEmail = () => {
    openLink('mailto:destek@yikattir.app?subject=Destek Talebi');
  };

  const handlePhone = () => {
    openLink('tel:+905551112233');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım ve Destek</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + Math.max(insets.bottom - 8, 0) }]}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
          <Text style={styles.sectionText}>Uygulama kullanımıyla ilgili en yaygın soruların yanıtlarını görüntüleyin.</Text>
          <TouchableOpacity style={styles.cta} onPress={() => openLink('https://yikattir.app/sss')}>
            <Ionicons name="help-circle-outline" size={20} color="white" />
            <Text style={styles.ctaText}>SSS'yi Aç</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bize Ulaşın</Text>
          <TouchableOpacity style={styles.row} onPress={handleWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color="#16a34a" />
            <Text style={styles.rowText}>WhatsApp ile yazın</Text>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={22} color="#0F4C4C" />
            <Text style={styles.rowText}>E‑posta gönderin</Text>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handlePhone}>
            <Ionicons name="call-outline" size={22} color="#0F4C4C" />
            <Text style={styles.rowText}>Bizi arayın</Text>
            <Ionicons name="chevron-forward" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Geri Bildirim</Text>
          <Text style={styles.sectionText}>Öneri ve görüşleriniz uygulamayı geliştirmemize yardımcı olur.</Text>
          <TouchableOpacity style={styles.ctaSecondary} onPress={handleEmail}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#0F4C4C" />
            <Text style={styles.ctaSecondaryText}>Geri Bildirim Gönder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f3f4' },
  header: {
    backgroundColor: '#0F4C4C',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F4C4C', marginBottom: 8 },
  sectionText: { fontSize: 14, color: '#374151', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  rowText: { flex: 1, fontSize: 16, color: '#0F4C4C' },
  cta: {
    marginTop: 8,
    backgroundColor: '#0F4C4C',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: { color: 'white', fontSize: 16, fontWeight: '700' },
  ctaSecondary: {
    marginTop: 8,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  ctaSecondaryText: { color: '#0F4C4C', fontSize: 16, fontWeight: '700' },
});


