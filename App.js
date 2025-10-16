import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { BusinessProvider } from './src/store/BusinessContext';
import { AppointmentsProvider } from './src/contexts/AppointmentsContext';
import RootNavigation from './src/navigation/RootNavigation';

export default function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <AppointmentsProvider>
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
        </AppointmentsProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}