import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import FavoritesScreen from '../screens/home/FavoritesScreen';
import ProfileStack from './ProfileStack';
import AppointmentsScreen from '../screens/home/AppointmentsScreen';
import SearchScreen from '../screens/home/SearchScreen';

const Tab = createBottomTabNavigator();

export default function HomeTabs() {
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
          if (route.name === 'HomeTab') iconName = 'home-outline';
          else if (route.name === 'Appointments') iconName = 'calendar-outline';
          else if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Favorites') iconName = 'heart-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          if (route.name === 'Search') {
            return (
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? '#d1d5db' : '#e5e7eb',
                marginTop: -18,
              }}>
                <Ionicons name={iconName} size={28} color={'#0F4C4C'} />
              </View>
            );
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Randevular' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Arama' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoriler' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Hesabım' }} />
    </Tab.Navigator>
  );
}

