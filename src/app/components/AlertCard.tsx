import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';

interface AlertCardProps {
  message: string;
  type?: 'warning' | 'danger';
}

export function AlertCard({ message, type = 'warning' }: AlertCardProps) {
  const isWarning = type === 'warning';
  const bgColor = isWarning ? Theme.colors.warningLight : Theme.colors.dangerLight;
  const color = isWarning ? Theme.colors.warning : Theme.colors.danger;

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <Icon name="file-text" size={20} color={color} />
      <Text style={[styles.message, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  message: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    fontSize: Theme.typography.size.small,
    fontWeight: '500',
  },
});
