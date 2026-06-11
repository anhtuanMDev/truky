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
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Icon name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="PropertiesTab" 
        component={PropertyListScreen} 
        options={{
          tabBarLabel: 'Nhà/Phòng',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Icon name="home" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="PeopleTab" 
        component={PeopleListScreen} 
        options={{
          tabBarLabel: 'Khách thuê',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Icon name="user" size={size} color={color} />
        }}
      />
      <Tab.Screen 
        name="ContractsTab" 
        component={ContractListScreen} 
        options={{
          tabBarLabel: 'Hợp đồng',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Icon name="file-text" size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}
