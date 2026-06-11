import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any; 
  color: string;
  bgColor?: string;
}

export function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={[styles.iconWrapper, { backgroundColor: bgColor || Theme.colors.background }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    marginRight: 8,
  },
  value: {
    fontSize: Theme.typography.size.title,
    fontWeight: 'bold',
  },
});
