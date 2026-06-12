import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { usePeople } from '../../hooks/usePeople';
import { Person } from '../../domain/models/types';

export function OwnerListScreen() {
  const navigation = useNavigation<any>();
  const { people } = usePeople();
  const owners = people.filter((p: Person) => p.isOwner || p.id === 'owner');

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('OwnerProfile', { personId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Icon name="user" size={20} color={Theme.colors.primary} />
        <Text style={styles.cardTitle}>{item.fullName}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>CCCD: {item.nationalId || 'Chưa có'}</Text>
        <Text style={styles.cardText}>SĐT: {item.phone || 'Chưa có'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách Chủ nhà</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('OwnerProfile')}
        >
          <Icon name="plus" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={owners}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color={Theme.colors.border} />
            <Text style={styles.emptyText}>Chưa có thông tin chủ nhà nào.</Text>
            <Text style={styles.emptySubText}>Bấm nút + ở góc phải để thêm mới.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  addButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  listContainer: { padding: Theme.spacing.md },
  card: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.md, marginBottom: Theme.spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: Theme.colors.text },
  cardBody: { paddingLeft: 28 },
  cardText: { fontSize: 14, color: Theme.colors.textSecondary, marginBottom: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: Theme.colors.textSecondary, marginTop: 16 },
  emptySubText: { fontSize: 14, color: Theme.colors.textSecondary, marginTop: 8 },
});
