import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import BusinessHomeScreen from '../screens/business/BusinessHomeScreen';
import BusinessAppointmentsScreen from '../screens/business/BusinessAppointmentsScreen';
import BusinessProfileScreen from '../screens/business/BusinessProfileScreen';
import ServicesScreen from '../screens/business/ServicesScreen';
import ScheduleScreen from '../screens/business/ScheduleScreen';
import BusinessDetailsScreen from '../screens/business/BusinessDetailsScreen';
import BusinessAddressScreen from '../screens/business/BusinessAddressScreen';
import BusinessContactScreen from '../screens/business/BusinessContactScreen';

const Tab = createBottomTabNavigator();

export default function BusinessTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#d1d5db',
        tabBarShowLabel: false,
        tabBarItemStyle: { paddingTop: 8 },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 56 + Math.max(insets.bottom - 8, 0),
          paddingBottom: Math.max(insets.bottom - 8, 0),
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 0,
          borderRadius: 24,
          backgroundColor: '#0F4C4C',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'ellipse';
          if (route.name === 'BusinessHome') iconName = 'home-outline';
          else if (route.name === 'BusinessAppointments') iconName = 'calendar-outline';
          else if (route.name === 'Services') iconName = 'construct-outline';
          else if (route.name === 'Schedule') iconName = 'time-outline';
          else if (route.name === 'BusinessProfile') iconName = 'person-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="BusinessHome" component={BusinessHomeScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="BusinessAppointments" component={BusinessAppointmentsScreen} options={{ title: 'Randevular' }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ title: 'Hizmetler' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Saatler' }} />
      <Tab.Screen name="BusinessProfile" component={BusinessProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
