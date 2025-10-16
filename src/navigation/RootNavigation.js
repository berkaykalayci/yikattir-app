import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import HomeTabs from './HomeTabs';
import BusinessStack from './BusinessStack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import BusinessLoginScreen from '../screens/auth/BusinessLoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BusinessRegisterScreen from '../screens/auth/BusinessRegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F4C4C' }}>
      <ActivityIndicator size="large" color="white" />
      <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>Yükleniyor...</Text>
    </View>
  );
}

export default function RootNavigation() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? (user?.role === 'BUSINESS' ? "BusinessHome" : "MainApp") : "Welcome"}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animationTypeForReplace: 'push',
      }}
    >
      {isAuthenticated ? (
        // Kullanıcı giriş yapmışsa role göre uygulamayı göster
        user?.role === 'BUSINESS' ? (
          <Stack.Screen name="BusinessHome" component={BusinessStack} />
        ) : (
          <Stack.Screen name="MainApp" component={HomeTabs} />
        )
      ) : (
        // Kullanıcı giriş yapmamışsa auth ekranlarını göster
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="BusinessLogin" component={BusinessLoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="BusinessRegister" component={BusinessRegisterScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}



