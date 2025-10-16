import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen({ children, style, scroll = false, contentContainerStyle }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top','bottom']}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
        {scroll ? (
          <ScrollView
            style={[styles.flex, style]}
            contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, style]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  padded: { },
});



