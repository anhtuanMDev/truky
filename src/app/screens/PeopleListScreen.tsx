import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { usePeople } from '../../hooks/usePeople';
import { useContracts } from '../../hooks/useContracts';
import { useProperties } from '../../hooks/useProperties';
import { Person } from '../../domain/models/types';

export function PeopleListScreen() {
  const { people } = usePeople();
  const { contracts } = useContracts();
  const { properties } = useProperties();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: Person }) => {
    const activeContracts = contracts.filter(
      c => c.contractStatus === 'Active' && c.tenantPersonIds.includes(item.id)
    );
    activeContracts.sort((a, b) => b.createdAt - a.createdAt);
    const currentContract = activeContracts.length > 0 ? activeContracts[0] : null;

    let roomName = 'Chưa xếp phòng';
    let householderInfo = '';

    if (currentContract) {
      const property = properties.find(p => p.id === currentContract.propertyId);
      if (property) roomName = property.title;

      if (currentContract.tenantPersonIds[0] === item.id) {
        householderInfo = 'Bản thân';
      } else {
        const householder = people.find(p => p.id === currentContract.tenantPersonIds[0]);
        householderInfo = householder ? householder.fullName : 'Không rõ';
      }
    }

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PersonDetails', { personId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.fullName}</Text>
          {currentContract?.tenantPersonIds[0] === item.id && (
            <View style={styles.householderBadge}>
              <Text style={styles.householderBadgeText}>Chủ hộ</Text>
            </View>
          )}
        </View>
        <View style={styles.infoRow}>
          <Icon name="home" size={16} color={Theme.colors.primary} />
          <Text style={[styles.infoText, { color: Theme.colors.primary, fontWeight: '500' }]}>
            Phòng: {roomName}
          </Text>
        </View>

        {item.phone && (
          <View style={styles.infoRow}>
            <Icon name="user" size={16} color={Theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.phone}</Text>
          </View>
        )}

        {(item.nationalId || (currentContract && currentContract.tenantPersonIds[0] !== item.id)) && (
          <View style={styles.infoRow}>
            {item.nationalId && (
              <>
                <Icon name="file-text" size={16} color={Theme.colors.textSecondary} />
                <Text style={styles.infoText}>CCCD: {item.nationalId}</Text>
              </>
            )}
            {currentContract && currentContract.tenantPersonIds[0] !== item.id && (
              <>
                {item.nationalId && <Text style={{ color: Theme.colors.border, marginHorizontal: 8 }}>|</Text>}
                <Icon name="user" size={14} color={Theme.colors.textSecondary} />
                <Text style={[styles.infoText, { flex: 1, marginLeft: 4 }]} numberOfLines={1}>
                  Chủ hộ: {householderInfo}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Khách thuê</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddRentalRecord', { mode: 'Vào hộ đã có' })}>
          <Icon name="plus" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={people}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có khách thuê nào.</Text>
            <Text style={styles.emptySubtext}>Nhấn dấu + để thêm mới.</Text>
          </View>
        }
      />
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
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    fontSize: Theme.typography.size.title,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: Theme.typography.size.body,
    fontWeight: '600',
    color: Theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  householderBadge: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  householderBadgeText: {
    fontSize: 10,
    color: Theme.colors.primaryDark,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Theme.typography.size.body,
    color: Theme.colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
  },
});
