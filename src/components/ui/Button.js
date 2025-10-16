import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress, variant = 'primary', style, textStyle }) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity onPress={onPress} style={[styles.base, isPrimary ? styles.primary : styles.secondary, style]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 28, alignItems: 'center' },
  primary: { backgroundColor: '#0F4C4C' },
  secondary: { backgroundColor: 'white' },
  text: { fontWeight: '700' },
  primaryText: { color: 'white' },
  secondaryText: { color: '#0F4C4C' },
});



