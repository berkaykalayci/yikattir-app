import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingConfirmScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.check, 
          { 
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim 
          }
        ]}
      >
        <Ionicons name="checkmark" size={80} color="white" style={styles.checkIcon} />
      </Animated.View>
      <Text style={styles.text}>Randevunuz Onaylanmıştır</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })}
        >
          <Ionicons name="home-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Ana Sayfa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Appointments')}
        >
          <Ionicons name="calendar-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Randevularım</Text>
         </TouchableOpacity>
       </View>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F4C4C', alignItems: 'center', justifyContent: 'center', gap: 24 },
  check: { 
    width: 160, 
    height: 160, 
    borderRadius: 80, 
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkIcon: {
    textAlign: 'center',
    lineHeight: 80,
  },
  text: { color: 'white', fontSize: 18, fontWeight: '600' },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});



