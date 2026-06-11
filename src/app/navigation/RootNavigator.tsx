import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { PersonDetailsScreen } from '../screens/PersonDetailsScreen';
import { AddPropertyScreen } from '../screens/AddPropertyScreen';
import { AddContractScreen } from '../screens/AddContractScreen';
import { ContractDetailsScreen } from '../screens/ContractDetailsScreen';
import { CT01PreviewScreen } from '../screens/CT01PreviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddRentalRecordScreen } from '../screens/AddRentalRecordScreen';
import { AddRoommatesScreen } from '../screens/AddRoommatesScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen name="PersonDetails" component={PersonDetailsScreen} />
        <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
        <Stack.Screen name="AddContract" component={AddContractScreen} />
        <Stack.Screen name="ContractDetails" component={ContractDetailsScreen} />
        <Stack.Screen name="CT01Preview" component={CT01PreviewScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AddRentalRecord" component={AddRentalRecordScreen} />
        <Stack.Screen name="AddRoommates" component={AddRoommatesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
