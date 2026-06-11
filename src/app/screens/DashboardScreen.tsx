import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { StatCard } from '../components/StatCard';
import { ActionCard } from '../components/ActionCard';
import { AlertCard } from '../components/AlertCard';
import { useNavigation } from '@react-navigation/native';
import { usePeople } from '../../hooks/usePeople';
import { useContracts } from '../../hooks/useContracts';
import { useProperties } from '../../hooks/useProperties';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const { people } = usePeople();
  const { contracts } = useContracts();
  const { properties } = useProperties();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { people: [], properties: [], contracts: [] };
    const q = searchQuery.toLowerCase();
    return {
      people: people.filter(p => p.fullName.toLowerCase().includes(q) || p.nationalId?.includes(q) || p.phone?.includes(q)),
      properties: properties.filter(p => p.title.toLowerCase().includes(q) || p.fullAddress?.toLowerCase().includes(q)),
      contracts: contracts.filter(c => c.govContractId?.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    };
  }, [searchQuery, people, properties, contracts]);

  const handleSearch = () => {
    // Optional: could trigger a full search page
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.title}>Quản lý Trọ Của Bạn</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <View style={styles.avatar}>
              <Icon name="user" size={24} color={Theme.colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* FR-9.1: Global Text Search Box */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên, CCCD, mã ĐK Tạm trú..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        
        {searchQuery.trim().length > 0 ? (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
            
            {searchResults.people.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.resultGroupTitle}>Khách thuê ({searchResults.people.length})</Text>
                {searchResults.people.map(p => (
                  <TouchableOpacity key={p.id} style={styles.resultItem} onPress={() => navigation.navigate('PersonDetails', { personId: p.id })}>
                    <Icon name="user" size={16} color={Theme.colors.primary} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultTitle}>{p.fullName}</Text>
                      <Text style={styles.resultSubtitle}>CCCD: {p.nationalId || 'Chưa cập nhật'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {searchResults.properties.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.resultGroupTitle}>Nhà / Phòng ({searchResults.properties.length})</Text>
                {searchResults.properties.map(p => (
                  <TouchableOpacity key={p.id} style={styles.resultItem} onPress={() => navigation.navigate('PropertiesTab')}>
                    <Icon name="home" size={16} color={Theme.colors.success} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultTitle}>{p.title}</Text>
                      <Text style={styles.resultSubtitle}>{p.addressLine}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {searchResults.contracts.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.resultGroupTitle}>Hợp đồng ({searchResults.contracts.length})</Text>
                {searchResults.contracts.map(c => (
                  <TouchableOpacity key={c.id} style={styles.resultItem} onPress={() => navigation.navigate('ContractDetails', { contractId: c.id })}>
                    <Icon name="file-text" size={16} color={Theme.colors.text} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultTitle}>Hợp đồng {c.type}</Text>
                      <Text style={styles.resultSubtitle}>Mã cổng: {c.govContractId || 'Chưa ĐK'}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {searchResults.people.length === 0 && searchResults.properties.length === 0 && searchResults.contracts.length === 0 && (
              <Text style={{ textAlign: 'center', color: Theme.colors.textSecondary, marginTop: 20 }}>Không tìm thấy kết quả nào.</Text>
            )}
          </View>
        ) : (
          <>
            <View style={styles.alertsContainer}>
              <AlertCard message="2 hợp đồng sắp hết hạn" type="warning" />
              <AlertCard message="1 khách thuê chưa khai báo tạm trú" type="danger" />
            </View>

            <View style={styles.statsRow}>
              <StatCard 
                title="Khách thuê" 
                value={people.length} 
                icon="user" 
                color={Theme.colors.primary} 
                bgColor={Theme.colors.primaryLight} 
              />
              <View style={{ width: Theme.spacing.md }} />
              <StatCard 
                title="Phòng trống" 
                value={properties.length} 
                icon="home" 
                color={Theme.colors.success} 
                bgColor={Theme.colors.successLight} 
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chức năng chính</Text>
              <ActionCard 
                title="Thêm hồ sơ thuê nhà"
                subtitle="Đăng ký khách, ghép phòng, lập HĐ"
                icon="plus"
                onPress={() => navigation.navigate('AddRentalRecord', { mode: 'Lập hộ mới' })}
              />
              <ActionCard 
                title="Tra cứu thông tin"
                subtitle="Tìm khách thuê, hợp đồng, phòng"
                icon="search"
                onPress={() => navigation.navigate('PeopleTab')}
              />
            </View>
          </>
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
  scrollContent: {
    paddingBottom: Theme.spacing.xxl,
  },
  alertsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  section: {
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.subtitle,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    marginBottom: Theme.spacing.lg,
  },
  greeting: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: Theme.typography.size.title,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    height: 48,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.size.body,
    color: Theme.colors.text,
  },
  searchResultsContainer: {
    paddingHorizontal: Theme.spacing.lg,
  },
  resultGroup: {
    marginBottom: Theme.spacing.lg,
  },
  resultGroupTitle: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  resultTextContainer: {
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: Theme.typography.size.body,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  resultSubtitle: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
  },
});
