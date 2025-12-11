import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { BusinessProvider } from './src/store/BusinessContext';
import { AppointmentsProvider } from './src/contexts/AppointmentsContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import RootNavigation from './src/navigation/RootNavigation';

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <AppointmentsProvider>
          <NotificationProvider>
            <NavigationContainer>
              <RootNavigation />
            </NavigationContainer>
          </NotificationProvider>
        </AppointmentsProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}