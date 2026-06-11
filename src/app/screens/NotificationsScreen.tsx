import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { AlertCard } from '../components/AlertCard';
import { useNavigation } from '@react-navigation/native';
import { useProperties } from '../../hooks/useProperties';
import { useContracts } from '../../hooks/useContracts';

export function NotificationsScreen() {
  const navigation = useNavigation<any>();

  const { properties } = useProperties();
  const { contracts } = useContracts();

  const notifications = React.useMemo(() => {
    const pendingList: any[] = [];
    for (const p of properties) {
      const propertyContracts = contracts.filter(c => c.propertyId === p.id && c.type === 'Rental');
      if (propertyContracts.length > 0) {
        propertyContracts.sort((a, b) => b.createdAt - a.createdAt);
        const latestContract = propertyContracts[0];
        if (latestContract.contractStatus === 'Active' && !latestContract.releaseDate) {
          pendingList.push({
            id: `pending_${latestContract.id}`,
            message: `Phòng ${p.title} chưa có ngày hẹn trả kết quả đăng ký tạm trú (DVC).`,
            type: 'warning' as const,
            contractId: latestContract.id
          });
        }
      }
    }
    return pendingList;
  }, [properties, contracts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Không có thông báo mới.</Text>
        ) : (
          notifications.map(n => (
            <TouchableOpacity 
              key={n.id} 
              style={{ marginBottom: Theme.spacing.md }}
              onPress={() => {
                if (n.contractId) {
                  navigation.navigate('ContractDetails', { contractId: n.contractId });
                }
              }}
              activeOpacity={n.contractId ? 0.7 : 1}
            >
              <AlertCard message={n.message} type={n.type} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: Theme.typography.size.subtitle,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
    marginTop: 20,
    fontSize: Theme.typography.size.body,
  },
});
