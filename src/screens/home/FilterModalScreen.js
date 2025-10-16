import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Screen from '../../components/layout/Screen';

export default function FilterModalScreen({ navigation, route }) {
  const { sortBy: initial } = route.params || { sortBy: 'distance_desc_rating' };
  const [sortBy, setSortBy] = useState(initial);

  const Item = ({ id, label }) => (
    <TouchableOpacity style={[styles.option, sortBy === id && styles.optionActive]} onPress={() => setSortBy(id)}>
      <Text style={[styles.optionText, sortBy === id && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Filtrele</Text>
      <Item id="distance_desc_rating" label="Yakına göre, puanı yüksek önce" />
      <Item id="rating_desc" label="Puana göre (yüksekten düşüğe)" />
      <Item id="distance_asc" label="Sadece mesafeye göre" />
      <TouchableOpacity style={styles.cta} onPress={() => navigation.goBack({ sortBy })}>
        <Text style={styles.ctaText}>Uygula</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#0F4C4C', marginBottom: 8 },
  option: { padding: 14, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12 },
  optionActive: { backgroundColor: '#0F4C4C22', borderColor: '#0F4C4C' },
  optionText: { color: '#111827' },
  optionTextActive: { color: '#0F4C4C', fontWeight: '700' },
  cta: { backgroundColor: '#0F4C4C', paddingVertical: 12, borderRadius: 28, alignItems: 'center', marginTop: 12 },
  ctaText: { color: 'white', fontWeight: '700' },
});



