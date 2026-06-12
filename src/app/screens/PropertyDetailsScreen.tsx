import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useProperties } from '../../hooks/useProperties';
import { useContracts } from '../../hooks/useContracts';
import { usePeople } from '../../hooks/usePeople';

export function PropertyDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { properties } = useProperties();
  const { contracts } = useContracts();
  const { people } = usePeople();
  
  const propertyId = route.params?.propertyId;
  const property = properties.find(p => p.id === propertyId);

  if (!property) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}><Text>Không tìm thấy nhà/phòng.</Text></View>
      </SafeAreaView>
    );
  }

  // Find active contract for this property
  const activeContracts = contracts.filter(c => c.propertyId === property.id && c.contractStatus === 'Active');
  const isOccupied = activeContracts.length > 0;
  
  let currentTenants: any[] = [];
  let activeContract: any = null;
  if (isOccupied) {
    activeContract = activeContracts[0];
    currentTenants = activeContract.tenantPersonIds.map((id: string) => people.find(p => p.id === id)).filter((p: any) => !!p);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Nhà/Phòng</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('AddProperty', { editPropertyId: property.id })}>
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>{property.title}</Text>
            <View style={[styles.statusBadge, isOccupied ? styles.statusOccupied : styles.statusVacant]}>
              <Text style={[styles.statusText, isOccupied ? styles.statusTextOccupied : styles.statusTextVacant]}>
                {isOccupied ? 'Đã thuê' : 'Trống'}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="home" size={16} color={Theme.colors.textSecondary} />
            <Text style={styles.infoText}>{property.fullAddress}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sức chứa</Text>
              <Text style={styles.gridValue}>Tối đa {property.maxCapacity || 5} người</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Khu vực</Text>
              <Text style={styles.gridValue}>{property.ward ? `${property.ward}, ${property.city}` : 'Chưa cập nhật'}</Text>
            </View>
          </View>
          
          {property.note && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.gridLabel}>Ghi chú</Text>
              <Text style={{ fontSize: 14, color: Theme.colors.text }}>{property.note}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Khách đang thuê ({currentTenants.length}/{property.maxCapacity || 5})</Text>
          {currentTenants.length > 0 ? (
            currentTenants.map((t, idx) => (
              <TouchableOpacity 
                key={t?.id} 
                style={styles.tenantRow}
                onPress={() => navigation.navigate('PersonDetails', { personId: t.id })}
              >
                <Icon name="user" size={16} color={idx === 0 ? Theme.colors.primary : Theme.colors.textSecondary} />
                <View style={styles.tenantInfoContainer}>
                  <Text style={styles.tenantName}>{t?.fullName} {idx === 0 ? '(Chủ hộ)' : ''}</Text>
                  <Text style={styles.tenantCCCD}>CCCD: {t?.nationalId || 'Chưa cập nhật'}</Text>
                  {activeContract && (
                    <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: activeContract.type === 'Rental' ? Theme.colors.success : Theme.colors.warning, marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: Theme.colors.textSecondary }}>
                        {activeContract.type === 'Rental' ? 'Hợp đồng chính thức' : 'Đăng ký tạm trú'}
                      </Text>
                    </View>
                  )}
                </View>
                <Icon name="chevron-left" size={16} color={Theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có người thuê.</Text>
          )}
        </View>

        {activeContract && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin hợp đồng hiện tại</Text>
            
            <View style={{ marginTop: 12 }}>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Loại hợp đồng</Text>
                  <Text style={styles.gridValue}>{activeContract.type === 'Rental' ? 'Thuê nhà' : activeContract.type}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Ngày bắt đầu</Text>
                  <Text style={styles.gridValue}>{activeContract.startDate || 'Chưa cập nhật'}</Text>
                </View>
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Ngày kết thúc</Text>
                  <Text style={styles.gridValue}>{activeContract.endDate || 'Chưa xác định'}</Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Giá thuê</Text>
                  <Text style={[styles.gridValue, { color: Theme.colors.primary }]}>
                    {activeContract.rentPrice ? `${activeContract.rentPrice.toLocaleString()} đ` : 'Chưa cập nhật'}
                  </Text>
                </View>
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>Tiền cọc</Text>
                  <Text style={styles.gridValue}>
                    {activeContract.deposit ? `${activeContract.deposit.toLocaleString()} đ` : 'Không có'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  placeholder: { width: 40 },
  editButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  editButtonText: { fontSize: 16, color: Theme.colors.primary, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Theme.spacing.lg },
  card: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  infoText: { marginLeft: 8, fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, flex: 1 },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: Theme.spacing.md },
  grid: { flexDirection: 'row', marginBottom: Theme.spacing.md },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 12, color: Theme.colors.textSecondary, marginBottom: 4 },
  gridValue: { fontSize: Theme.typography.size.body, color: Theme.colors.text, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  statusVacant: { backgroundColor: Theme.colors.successLight },
  statusTextVacant: { color: Theme.colors.success, fontSize: 12, fontWeight: 'bold' },
  statusOccupied: { backgroundColor: Theme.colors.dangerLight },
  statusTextOccupied: { color: Theme.colors.danger, fontSize: 12, fontWeight: 'bold' },
  tenantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.background },
  tenantInfoContainer: { marginLeft: 12, flex: 1 },
  tenantName: { fontSize: Theme.typography.size.body, fontWeight: '500', color: Theme.colors.text },
  tenantCCCD: { fontSize: 13, color: Theme.colors.textSecondary, marginTop: 2 },
  emptyText: { color: Theme.colors.textSecondary, fontStyle: 'italic', marginTop: 12 }
});
