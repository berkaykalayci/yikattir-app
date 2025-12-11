import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { BusinessProvider } from './src/store/BusinessContext';
import { AppointmentsProvider } from './src/contexts/AppointmentsContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import RootNavigation from './src/navigation/RootNavigation';
import SplashScreen from './src/screens/SplashScreen';

function AppContent() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [minSplashTime, setMinSplashTime] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinSplashTime(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = () => {
    if (!loading && !minSplashTime) {
      setShowSplash(false);
    }
  };

  useEffect(() => {
    if (!loading && !minSplashTime && showSplash) {
      setShowSplash(false);
    }
  }, [loading, minSplashTime, showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <BusinessProvider>
      <AppointmentsProvider>
        <NotificationProvider>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
        </NotificationProvider>
      </AppointmentsProvider>
    </BusinessProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}