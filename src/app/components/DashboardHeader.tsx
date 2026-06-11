import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';

export function DashboardHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Xin chào,</Text>
        <Text style={styles.title}>Tổng quan</Text>
      </View>
      <View style={styles.iconContainer}>
        <Icon name="user" size={24} color={Theme.colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  greeting: {
    fontSize: Theme.typography.size.body,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: Theme.typography.size.title,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
