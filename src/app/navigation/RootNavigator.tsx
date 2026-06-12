import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { PersonDetailsScreen } from '../screens/PersonDetailsScreen';
import { AddPropertyScreen } from '../screens/AddPropertyScreen';
import { PropertyDetailsScreen } from '../screens/PropertyDetailsScreen';
import { AddContractScreen } from '../screens/AddContractScreen';
import { ContractDetailsScreen } from '../screens/ContractDetailsScreen';
import { CT01PreviewScreen } from '../screens/CT01PreviewScreen';
import { ContractPreviewScreen } from '../screens/ContractPreviewScreen';
import { CombinedPreviewScreen } from '../screens/CombinedPreviewScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddRentalRecordScreen } from '../screens/AddRentalRecordScreen';
import { AddRoommatesScreen } from '../screens/AddRoommatesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { OwnerProfileScreen } from '../screens/OwnerProfileScreen';
import { OwnerListScreen } from '../screens/OwnerListScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen name="PersonDetails" component={PersonDetailsScreen} />
        <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
        <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
        <Stack.Screen name="AddContract" component={AddContractScreen} />
        <Stack.Screen name="ContractDetails" component={ContractDetailsScreen} />
        <Stack.Screen name="CT01Preview" component={CT01PreviewScreen} />
        <Stack.Screen name="ContractPreview" component={ContractPreviewScreen} />
        <Stack.Screen name="CombinedPreview" component={CombinedPreviewScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AddRentalRecord" component={AddRentalRecordScreen} />
        <Stack.Screen name="AddRoommates" component={AddRoommatesScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="OwnerList" component={OwnerListScreen} />
        <Stack.Screen name="OwnerProfile" component={OwnerProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
