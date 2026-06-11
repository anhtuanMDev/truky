import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useContracts } from '../../hooks/useContracts';
import { Contract } from '../../domain/models/types';

export function ContractListScreen() {
  const { contracts } = useContracts();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: Contract }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>Hợp đồng {item.type}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.contractStatus}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Icon name="file-text" size={16} color={Theme.colors.textSecondary} />
        <Text style={styles.infoText}>Bắt đầu: {item.startDate}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="user" size={16} color={Theme.colors.textSecondary} />
        <Text style={styles.infoText}>Số người: {item.tenantPersonIds.length}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Hợp đồng</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddContract')}>
          <Icon name="plus" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contracts}
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
  listContent: { padding: Theme.spacing.lg },
  card: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.sm },
  name: { fontSize: Theme.typography.size.body, fontWeight: '600', color: Theme.colors.text },
  statusBadge: { backgroundColor: Theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, color: Theme.colors.primaryDark, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { marginLeft: Theme.spacing.sm, fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, flex: 1 },
  emptyContainer: { padding: Theme.spacing.xl, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: Theme.typography.size.body, color: Theme.colors.text, fontWeight: '500', marginBottom: 8 },
  emptySubtext: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary },
});
