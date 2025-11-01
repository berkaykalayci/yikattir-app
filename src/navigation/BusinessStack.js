import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

export default function BusinessStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      }}
    >
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
