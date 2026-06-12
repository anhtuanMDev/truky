import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useContracts } from '../../hooks/useContracts';
import { useProperties } from '../../hooks/useProperties';
import { usePeople } from '../../hooks/usePeople';
import { Contract } from '../../domain/models/types';

export function ContractListScreen() {
  const { contracts } = useContracts();
  const { properties } = useProperties();
  const { people } = usePeople();
  const navigation = useNavigation<any>();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Extract unique properties that have contracts
  const availableProperties = useMemo(() => {
    const propIds = Array.from(new Set(contracts.map(c => c.propertyId)));
    return properties.filter(p => propIds.includes(p.id));
  }, [contracts, properties]);

  const filteredContracts = useMemo(() => {
    if (!selectedPropertyId) return contracts;
    return contracts.filter(c => c.propertyId === selectedPropertyId);
  }, [contracts, selectedPropertyId]);

  const renderItem = ({ item }: { item: Contract }) => {
    const property = properties.find(p => p.id === item.propertyId);
    const primaryTenant = people.find(p => p.id === item.tenantPersonIds[0]);

    const title = `${property?.title || 'Phòng trống'} - ${primaryTenant?.fullName || 'Chưa có tên'}`;

    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ContractDetails', { contractId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.name} numberOfLines={1}>{title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.type === 'Rental' ? 'Thuê nhà' : item.type}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="file-text" size={16} color={Theme.colors.textSecondary} />
          <Text style={styles.infoText}>Ngày đăng ký: {item.startDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="user" size={16} color={Theme.colors.textSecondary} />
          <Text style={styles.infoText}>Hạn dự kiến: {item.endDate || 'Không có'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Hợp đồng</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddContract')}>
          <Icon name="plus" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {contracts.length > 0 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterChip, selectedPropertyId === null && styles.filterChipActive]}
              onPress={() => setSelectedPropertyId(null)}
            >
              <Text style={[styles.filterText, selectedPropertyId === null && styles.filterTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            
            {availableProperties.map(p => (
              <TouchableOpacity 
                key={p.id}
                style={[styles.filterChip, selectedPropertyId === p.id && styles.filterChipActive]}
                onPress={() => setSelectedPropertyId(p.id)}
              >
                <Text style={[styles.filterText, selectedPropertyId === p.id && styles.filterTextActive]}>{p.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredContracts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có hợp đồng nào.</Text>
            <Text style={styles.emptySubtext}>Nhấn dấu + để thêm hợp đồng mới.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  title: { fontSize: Theme.typography.size.title, fontWeight: 'bold', color: Theme.colors.text },
  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  
  filterContainer: { paddingHorizontal: Theme.spacing.lg, paddingVertical: Theme.spacing.sm },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, marginRight: 8 },
  filterChipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  filterText: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Theme.colors.surface, fontWeight: 'bold' },

  listContent: { padding: Theme.spacing.lg, paddingTop: Theme.spacing.sm },
  card: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm },
  name: { flex: 1, fontSize: Theme.typography.size.body, fontWeight: '600', color: Theme.colors.text, marginRight: 8 },
  statusBadge: { backgroundColor: Theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, color: Theme.colors.primaryDark, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { marginLeft: Theme.spacing.sm, fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, flex: 1 },
  emptyContainer: { padding: Theme.spacing.xl, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: Theme.typography.size.body, color: Theme.colors.text, fontWeight: '500', marginBottom: 8 },
  emptySubtext: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary },
});
