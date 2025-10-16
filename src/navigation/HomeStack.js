import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import BusinessDetailScreen from '../screens/home/BusinessDetailScreen';
import BookingScreen from '../screens/home/BookingScreen';
import BookingConfirmScreen from '../screens/home/BookingConfirmScreen';
import FilterModalScreen from '../screens/home/FilterModalScreen';
import CitySelectionScreen from '../screens/home/CitySelectionScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import NotificationDetailScreen from '../screens/home/NotificationDetailScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={BusinessDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Randevu' }} />
      <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Filter" component={FilterModalScreen} options={{ presentation: 'modal', title: 'Filtre' }} />
      <Stack.Screen name="CitySelection" component={CitySelectionScreen} options={{ presentation: 'modal', title: 'Şehir Seç' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}


