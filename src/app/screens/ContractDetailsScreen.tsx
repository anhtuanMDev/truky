import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useContract } from '../../hooks/useContracts';
import { useProperties } from '../../hooks/useProperties';
import { usePeople } from '../../hooks/usePeople';
import { CT01Mapper } from '../../domain/mappers/CT01Mapper';

export function ContractDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { properties } = useProperties();
  const { people } = usePeople();
  
  const contractId = route.params?.contractId;
  const contract = useContract(contractId);

  if (!contract) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}><Text>Không tìm thấy hợp đồng.</Text></View>
      </SafeAreaView>
    );
  }

  const property = properties.find(p => p.id === contract.propertyId);
  const tenants = contract.tenantPersonIds.map(id => people.find(p => p.id === id)).filter(p => !!p);
  const primaryTenant = tenants[0];
  const coTenants = tenants.slice(1);

  const handleGenerateCT01 = () => {
    if (!primaryTenant || !property) {
      Alert.alert('Lỗi', 'Dữ liệu không đủ để tạo CT01.');
      return;
    }
    const formData = CT01Mapper.mapToForm(
      primaryTenant,
      property,
      { reason: 'Đăng ký tạm trú', authorityName: '' } as any,
      coTenants as any,
      undefined
    );
    navigation.navigate('CT01Preview', { formData });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Hợp đồng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nhà / Phòng: {property?.title || 'Không rõ'}</Text>
          <Text style={styles.infoText}>{property?.fullAddress}</Text>
          <View style={styles.divider} />
          <Text style={styles.infoText}>Bắt đầu: {contract.startDate}</Text>
          <Text style={styles.infoText}>Trạng thái: {contract.contractStatus}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Danh sách người thuê ({tenants.length})</Text>
          {tenants.map((t, idx) => (
            <View key={t?.id} style={styles.tenantRow}>
              <Icon name="user" size={16} color={idx === 0 ? Theme.colors.primary : Theme.colors.textSecondary} />
              <View style={styles.tenantInfoContainer}>
                <Text style={styles.tenantName}>{t?.fullName} {idx === 0 ? '(Chủ hộ)' : ''}</Text>
                <Text style={styles.tenantCCCD}>CCCD: {t?.nationalId || 'Chưa cập nhật'}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateCT01}>
          <Icon name="file-text" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}> Xuất mẫu CT01 (Tạm trú)</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Theme.colors.successLight }]} onPress={() => Alert.alert('Gia hạn', 'Tính năng sao chép và gia hạn hợp đồng đang phát triển.')}>
            <Icon name="file-text" size={20} color={Theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: Theme.colors.success }]}> Gia hạn</Text>
          </TouchableOpacity>
          <View style={styles.actionSpacer} />
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Theme.colors.dangerLight }]} onPress={() => Alert.alert('Chấm dứt', 'Tính năng kết thúc sớm hợp đồng đang phát triển.')}>
            <Icon name="chevron-left" size={20} color={Theme.colors.danger} />
            <Text style={[styles.actionButtonText, { color: Theme.colors.danger }]}> Chấm dứt</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Theme.spacing.lg },
  card: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 8 },
  infoText: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 12 },
  tenantRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Theme.colors.background },
  tenantName: { fontSize: Theme.typography.size.body, fontWeight: '600', color: Theme.colors.text },
  tenantCCCD: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginTop: 2 },
  primaryButton: { backgroundColor: Theme.colors.primary, flexDirection: 'row', paddingVertical: 16, borderRadius: Theme.borderRadius.md, alignItems: 'center', justifyContent: 'center', marginTop: Theme.spacing.xl },
  primaryButtonText: { color: '#fff', fontSize: Theme.typography.size.body, fontWeight: 'bold', marginLeft: 8 },
  actionRow: { flexDirection: 'row', marginTop: 12 },
  actionButton: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: Theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { fontSize: Theme.typography.size.small, fontWeight: 'bold' },
  placeholder: { width: 40 },
  tenantInfoContainer: { marginLeft: 8 },
  actionSpacer: { width: 12 },
});
