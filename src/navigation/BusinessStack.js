import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import BusinessTabs from './BusinessTabs';
import BusinessDetailsScreen from '../screens/business/BusinessDetailsScreen';
import BusinessAddressScreen from '../screens/business/BusinessAddressScreen';
import BusinessContactScreen from '../screens/business/BusinessContactScreen';
import PriceListScreen from '../screens/business/PriceListScreen';
import AppointmentSettingsScreen from '../screens/business/AppointmentSettingsScreen';
import IncomeReportsScreen from '../screens/business/IncomeReportsScreen';
import PaymentSettingsScreen from '../screens/business/PaymentSettingsScreen';
import BusinessReviewsScreen from '../screens/business/BusinessReviewsScreen';
import BusinessImageSettingsScreen from '../screens/business/BusinessImageSettingsScreen';
import BlockedSlotsScreen from '../screens/business/BlockedSlotsScreen';
import BusinessSetupScreen from '../screens/business/BusinessSetupScreen';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Stack = createNativeStackNavigator();

export default function BusinessStack({ navigation }) {
  const { user } = useAuth();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const checkSetupStatus = React.useCallback(async () => {
    if (!user || user.role !== 'BUSINESS') {
      setCheckingSetup(false);
      return;
    }

    try {
      // Önce owner endpoint'inden işletmeyi bul
      const businessRes = await axios.get(`${API_BASE_URL}/businesses/owner/${user.id}`);
      const business = businessRes.data;
      
      if (business && business.setupCompleted === false) {
        setNeedsSetup(true);
      } else {
        setNeedsSetup(false);
      }
    } catch (error) {
      // 404 hatası işletme bulunamadı demektir - bu durumda setup gerekmez
      if (error.response && error.response.status === 404) {
        console.log('[BusinessStack] İşletme bulunamadı - setup gerekmez');
        setNeedsSetup(false);
      } else {
        console.error('[BusinessStack] Setup durumu kontrol edilirken hata:', error);
        // Hata durumunda varsayılan olarak setup gerekmez
        setNeedsSetup(false);
      }
    } finally {
      setCheckingSetup(false);
    }
  }, [user]);

  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  if (checkingSetup) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F4C4C' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={needsSetup ? "BusinessSetup" : "BusinessTabs"}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
      <Stack.Screen name="BusinessTabs" component={BusinessTabs} />
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="BusinessAddress" component={BusinessAddressScreen} />
      <Stack.Screen name="BusinessContact" component={BusinessContactScreen} />
      <Stack.Screen name="PriceList" component={PriceListScreen} />
      <Stack.Screen name="AppointmentSettings" component={AppointmentSettingsScreen} />
      <Stack.Screen name="IncomeReports" component={IncomeReportsScreen} />
      <Stack.Screen name="PaymentSettings" component={PaymentSettingsScreen} />
      <Stack.Screen name="BusinessReviews" component={BusinessReviewsScreen} />
      <Stack.Screen name="BusinessImageSettings" component={BusinessImageSettingsScreen} />
      <Stack.Screen name="BlockedSlots" component={BlockedSlotsScreen} />
    </Stack.Navigator>
  );
}
