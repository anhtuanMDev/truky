import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/base/Typography';
import { Icon } from '../../components/base/Icon';
import { Theme } from '../../constants/theme';

export function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="heading" weight="bold">Tổng quan</Typography>
          <Typography variant="subtitle" color={Theme.colors.textSecondary}>
            Quản lý nhà trọ của bạn
          </Typography>
        </View>

        <View style={styles.statsContainer}>
          <StatCard title="Khách thuê" count={12} icon="user" color={Theme.colors.primary} />
          <StatCard title="Hợp đồng" count={5} icon="file-text" color={Theme.colors.success} />
        </View>

        <View style={styles.section}>
          <Typography variant="title" weight="bold" style={styles.sectionTitle}>
            Tác vụ nhanh
          </Typography>
          
          <ActionCard 
            title="Thêm khách thuê mới" 
            icon="plus" 
            onPress={() => {}} 
          />
          <ActionCard 
            title="Tạo hợp đồng mới" 
            icon="plus" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.section}>
          <Typography variant="title" weight="bold" style={styles.sectionTitle}>
            Cần chú ý
          </Typography>
          <AlertCard title="2 hợp đồng sắp hết hạn" />
          <AlertCard title="1 người chưa đăng ký tạm trú" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ title, count, icon, color }: { title: string, count: number, icon: any, color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={32} color={color} />
        <Typography variant="heading" weight="bold">{count}</Typography>
      </View>
      <Typography variant="subtitle">{title}</Typography>
    </View>
  );
}

function ActionCard({ title, icon, onPress }: { title: string, icon: any, onPress: () => void }) {
  return (
    <TouchableOpacity 
      style={styles.actionCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.actionIcon}>
        <Icon name={icon} size={28} color={Theme.colors.primary} />
      </View>
      <Typography variant="subtitle" weight="medium" style={styles.actionTitle}>
        {title}
      </Typography>
      <Icon name="chevron-left" size={24} color={Theme.colors.textSecondary} /> 
    </TouchableOpacity>
  );
}

function AlertCard({ title }: { title: string }) {
  return (
    <View style={styles.alertCard}>
      <Icon name="search" size={28} color={Theme.colors.warning} />
      <Typography variant="subtitle" weight="medium" style={styles.alertTitle}>
        {title}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  actionTitle: {
    flex: 1,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  alertTitle: {
    marginLeft: Theme.spacing.md,
    color: Theme.colors.warning,
    flex: 1,
  },
});
