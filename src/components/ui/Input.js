import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

export default function Input({ label, underline = false, ...props }) {
  return (
    <View style={{ width: '100%' }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[underline ? styles.underline : styles.input, props.style]}
        placeholderTextColor={underline ? 'rgba(255,255,255,0.8)' : '#6b7280'}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6, color: '#374151', letterSpacing: 0.5 },
  input: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  underline: { borderBottomWidth: 1.5, borderBottomColor: 'white', color: 'white', paddingVertical: 8 },
});



