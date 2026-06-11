import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useProperties } from '../../hooks/useProperties';
import { Property } from '../../domain/models/types';

export function PropertyListScreen() {
  const { properties } = useProperties();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.title}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="home" size={16} color={Theme.colors.textSecondary} />
        <Text style={styles.infoText}>{item.fullAddress || item.addressLine}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Nhà/Phòng</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddProperty')}>
          <Icon name="plus" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={properties}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có thông tin nhà/phòng nào.</Text>
            <Text style={styles.emptySubtext}>Nhấn dấu + để thêm nhà mới.</Text>
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
  },
  name: {
    fontSize: Theme.typography.size.body,
    fontWeight: '600',
    color: Theme.colors.text,
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
    flex: 1,
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
