import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/home/ProfileScreen';
import ProfileInfoScreen from '../screens/home/ProfileInfoScreen';
import PaymentMethodsScreen from '../screens/home/PaymentMethodsScreen';
import AddCardScreen from '../screens/home/AddCardScreen';
import AddressesScreen from '../screens/home/AddressesScreen';
import AddAddressScreen from '../screens/home/AddAddressScreen';
import EditAddressScreen from '../screens/home/EditAddressScreen';
import AppointmentHistoryScreen from '../screens/home/AppointmentHistoryScreen';
import AppointmentDetailScreen from '../screens/home/AppointmentDetailScreen';
import RateAppointmentScreen from '../screens/home/RateAppointmentScreen';
import MyReviewsScreen from '../screens/home/MyReviewsScreen';
import ServicesScreen from '../screens/business/ServicesScreen';
import ScheduleScreen from '../screens/business/ScheduleScreen';
import HelpSupportScreen from '../screens/home/HelpSupportScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="ProfileInfo" component={ProfileInfoScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      <Stack.Screen name="AppointmentHistory" component={AppointmentHistoryScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="RateAppointment" component={RateAppointmentScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}



