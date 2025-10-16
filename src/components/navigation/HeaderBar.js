import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HeaderBar({ navigation, onBack, rightIcon, onRightPress, backgroundColor = '#0F4C4C', showBack = true }) {
  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation && navigation.canGoBack()) navigation.goBack();
  };
  return (
    <SafeAreaView edges={['top']} style={[styles.wrap, { backgroundColor }]}> 
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={'#ffffff'} />
          </TouchableOpacity>
        ) : <View style={styles.spacer} />}
        <View style={styles.spacer} />
        {rightIcon ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={22} color={'#ffffff'} />
          </TouchableOpacity>
        ) : <View style={styles.spacer} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingBottom: 4 },
  row: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 36, height: 36 },
});


