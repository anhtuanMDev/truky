import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PeopleListScreen } from '../screens/PeopleListScreen';
import { PropertyListScreen } from '../screens/PropertyListScreen';
import { ContractListScreen } from '../screens/ContractListScreen';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';

const Tab = createBottomTabNavigator();

const GridIcon = ({ size, color }: { size: number, color: string }) => {
  const boxSize = (size - 3) / 2;
  return (
    <View style={{ width: size, height: size, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'space-between' }}>
      <View style={{ width: boxSize, height: boxSize, borderColor: color, borderWidth: 1.5, borderRadius: 3, backgroundColor: 'transparent' }} />
      <View style={{ width: boxSize, height: boxSize, borderColor: color, borderWidth: 1.5, borderRadius: 3, backgroundColor: 'transparent' }} />
      <View style={{ width: boxSize, height: boxSize, borderColor: color, borderWidth: 1.5, borderRadius: 3, backgroundColor: 'transparent' }} />
      <View style={{ width: boxSize, height: boxSize, borderColor: color, borderWidth: 1.5, borderRadius: 3, backgroundColor: 'transparent' }} />
    </View>
  );
};

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: Theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Tổng quan',
          tabBarIcon: ({ color }: { color: string }) => <GridIcon size={20} color={color} />
        }}
      />
      <Tab.Screen 
        name="PropertiesTab" 
        component={PropertyListScreen} 
        options={{
          tabBarLabel: 'Nhà/Phòng',
          tabBarIcon: ({ color }: { color: string }) => <Icon name="home" size={20} color={color} />
        }}
      />
      <Tab.Screen 
        name="PeopleTab" 
        component={PeopleListScreen} 
        options={{
          tabBarLabel: 'Khách thuê',
          tabBarIcon: ({ color }: { color: string }) => <Icon name="user" size={20} color={color} />
        }}
      />
      <Tab.Screen 
        name="ContractsTab" 
        component={ContractListScreen} 
        options={{
          tabBarLabel: 'Hợp đồng',
          tabBarIcon: ({ color }: { color: string }) => <Icon name="file-text" size={20} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
