import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { Contract } from '../../domain/models/types';
import { useContracts } from '../../hooks/useContracts';
import { usePeople } from '../../hooks/usePeople';
import { useProperties } from '../../hooks/useProperties';
import { generateId } from '../../utils/uuid';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

export function AddContractScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialGroupId = route.params?.initialGroupId;
  const draftPropertyId = route.params?.draftPropertyId;
  const draftTenantIds = route.params?.draftTenantIds;
  const initialContractType = route.params?.initialContractType || 'Đăng ký tạm trú';
  const terminateContractId = route.params?.terminateContractId;
  
  const { contracts, saveContract } = useContracts();
  const { people } = usePeople();
  const { properties } = useProperties();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || ''); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [contractType, setContractType] = useState<Contract['type']>(initialContractType);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const [startDate, setStartDate] = useState(moment().format('DD/MM/YYYY'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [durationYears, setDurationYears] = useState('1');
  const [durationMonths, setDurationMonths] = useState('0');
  
  const [rentPrice, setRentPrice] = useState('');
  const [deposit, setDeposit] = useState('');

  // Group existing contracts to represent "Householder + Room"
  const rentalGroups = useMemo(() => {
    // To avoid duplicates, we might just take unique tenant groups. 
    // But taking all active contracts is the easiest way.
    return contracts.map(c => {
      const property = properties.find(p => p.id === c.propertyId);
      const primaryTenant = people.find(p => p.id === c.tenantPersonIds[0]);
      const roommates = people.filter(p => c.tenantPersonIds.slice(1).includes(p.id));
      
      const searchString = `${property?.title || ''} ${primaryTenant?.fullName || ''} ${primaryTenant?.nationalId || ''} ${roommates.map(r => (r.fullName || '') + ' ' + (r.nationalId || '')).join(' ')}`.toLowerCase();

      return {
        id: c.id,
        sourceContract: c,
        property,
        primaryTenant,
        roommates,
        searchString
      };
    }).filter(g => g.primaryTenant && g.property); // Only valid ones
  }, [contracts, properties, people]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return rentalGroups;
    const lowerQ = searchQuery.toLowerCase();
    return rentalGroups.filter(g => g.searchString.includes(lowerQ));
  }, [rentalGroups, searchQuery]);

  const selectedGroup = useMemo(() => {
    if (draftPropertyId && draftTenantIds) {
      const property = properties.find(p => p.id === draftPropertyId);
      const primaryTenant = people.find(p => p.id === draftTenantIds[0]);
      const roommates = people.filter(p => draftTenantIds.slice(1).includes(p.id));
      return {
        id: 'draft',
        sourceContract: { tenantPersonIds: draftTenantIds } as any,
        property,
        primaryTenant,
        roommates,
        searchString: ''
      };
    }
    return rentalGroups.find(g => g.id === selectedGroupId);
  }, [rentalGroups, selectedGroupId, draftPropertyId, draftTenantIds, properties, people]);

  const handleSave = () => {
    if (!selectedGroup) {
      Alert.alert('Lỗi', 'Vui lòng chọn Hồ sơ thuê (Chủ hộ & Phòng).');
      return;
    }

    const durationY = parseInt(durationYears, 10) || 0;
    const durationM = parseInt(durationMonths, 10) || 0;
    
    if (durationY === 0 && durationM === 0) {
      Alert.alert('Lỗi', 'Thời gian hợp đồng phải lớn hơn 0.');
      return;
    }

    const startMoment = moment(startDate, 'DD/MM/YYYY');
    const endDate = startMoment.add(durationY, 'years').add(durationM, 'months').format('DD/MM/YYYY');

    const now = Date.now();
    const newContract: Contract = {
      id: generateId(),
      propertyId: selectedGroup.property!.id,
      landlordPersonId: 'owner', // Defaulting to owner for MVP
      tenantPersonIds: selectedGroup.sourceContract.tenantPersonIds,
      type: contractType,
      startDate,
      endDate,
      contractStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    if (contractType === 'Rental') {
      const parsedRent = parseInt(rentPrice.replace(/[^0-9]/g, ''), 10);
      const parsedDeposit = parseInt(deposit.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedRent)) newContract.rentPrice = parsedRent;
      if (!isNaN(parsedDeposit)) newContract.deposit = parsedDeposit;
    }

    saveContract(newContract);
    
    if (terminateContractId) {
      const oldContract = contracts.find(c => c.id === terminateContractId);
      if (oldContract) {
        saveContract({
          ...oldContract,
          contractStatus: 'Terminated',
          updatedAt: Date.now()
        });
      }
      Alert.alert('Hoàn tất', 'Đã tạo hợp đồng Xóa tạm trú. Hợp đồng thuê cũ đã chính thức chấm dứt, phòng đã trở về trạng thái trống!', [
        { text: 'OK', onPress: () => navigation.navigate('DashboardTab') }
      ]);
    } else {
      Alert.alert('Thành công', 'Đã tạo hợp đồng mới!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const getContractTypeName = (type: Contract['type']) => {
    return type; // Now we just use the string directly since it's in Vietnamese
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo hợp đồng mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Section 1: Chọn Khách Thuê & Phòng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Chọn Hồ sơ (Chủ hộ & Phòng)</Text>
            
            {!selectedGroup ? (
              <TouchableOpacity style={styles.textButton} onPress={() => {
                if (draftPropertyId) return; // Disable changing if draft
                setShowGroupModal(true);
              }}>
                <Icon name="search" size={20} color={Theme.colors.primary} />
                <Text style={styles.textButtonLabel}>Tìm & Chọn hồ sơ thuê</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedPropertyContainer}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="home" size={16} color={Theme.colors.primary} />
                    <Text style={styles.selectedPropertyText}> {selectedGroup.property?.title}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="user" size={16} color={Theme.colors.textSecondary} />
                    <Text style={[styles.selectedPropertyText, { color: Theme.colors.text, fontWeight: 'normal' }]}> {selectedGroup.primaryTenant?.fullName}</Text>
                  </View>
                  {selectedGroup.roommates.length > 0 && (
                    <Text style={{ fontSize: 12, color: Theme.colors.textSecondary, marginLeft: 20, marginTop: 2 }}>
                      + {selectedGroup.roommates.length} người ở ghép
                    </Text>
                  )}
                </View>
                {!draftPropertyId && (
                  <TouchableOpacity onPress={() => setShowGroupModal(true)}>
                    <Text style={styles.addText}>Thay đổi</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Section 2: Thông tin Hợp đồng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Thông tin Hợp đồng</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại hợp đồng</Text>
              <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
                <Text style={styles.dropdownText}>{getContractTypeName(contractType)}</Text>
                <Text style={{ color: Theme.colors.textSecondary, fontSize: 12 }}>{showTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showTypeDropdown && (
                <View style={styles.dropdownList}>
                  {/* Removed Rental option as requested */}
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => { setContractType('Đăng ký tạm trú'); setShowTypeDropdown(false); }}>
                    <Text style={[styles.dropdownItemText, contractType === 'Đăng ký tạm trú' && styles.dropdownItemTextActive]}>Đăng ký tạm trú</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dropdownItem} onPress={() => { setContractType('Gia hạn tạm trú'); setShowTypeDropdown(false); }}>
                    <Text style={[styles.dropdownItemText, contractType === 'Gia hạn tạm trú' && styles.dropdownItemTextActive]}>Gia hạn tạm trú</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.dropdownItem, { borderBottomWidth: 0 }]} onPress={() => { setContractType('Xóa tạm trú'); setShowTypeDropdown(false); }}>
                    <Text style={[styles.dropdownItemText, contractType === 'Xóa tạm trú' && styles.dropdownItemTextActive]}>Xóa tạm trú</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.md }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Ngày bắt đầu</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                  <Text style={{ color: startDate ? Theme.colors.text : Theme.colors.textSecondary }}>
                    {startDate || 'Chọn ngày'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, marginRight: contractType === 'Đăng ký tạm trú' ? 0 : 8 }}>
                <Text style={styles.label}>Số năm</Text>
                <TextInput 
                  style={styles.input} 
                  value={durationYears} 
                  onChangeText={setDurationYears} 
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              {contractType !== 'Đăng ký tạm trú' && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Số tháng</Text>
                  <TextInput 
                    style={styles.input} 
                    value={durationMonths} 
                    onChangeText={setDurationMonths} 
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              )}
            </View>

            {contractType === 'Rental' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.md }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Giá thuê (VNĐ)</Text>
                  <TextInput 
                    style={styles.input} 
                    value={rentPrice} 
                    onChangeText={setRentPrice} 
                    keyboardType="numeric"
                    placeholder="VD: 3000000"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Tiền cọc (VNĐ)</Text>
                  <TextInput 
                    style={styles.input} 
                    value={deposit} 
                    onChangeText={setDeposit} 
                    keyboardType="numeric"
                    placeholder="VD: 3000000"
                  />
                </View>
              </View>
            )}
            
            {showDatePicker && (
              <DateTimePicker
                value={startDate ? moment(startDate, 'DD/MM/YYYY').toDate() : new Date()}
                mode="date"
                display="default"
                positiveButton={{ label: 'Chọn', textColor: Theme.colors.primary }}
                negativeButton={{ label: 'Hủy', textColor: Theme.colors.textSecondary }}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setStartDate(moment(selectedDate).format('DD/MM/YYYY'));
                }}
              />
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Tạo hợp đồng</Text>
        </TouchableOpacity>
      </View>

      {/* Group Selection Modal */}
      <Modal visible={showGroupModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { maxHeight: '60%' }]}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Chọn Hồ sơ (Chủ hộ & Phòng)</Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                <Text style={{ color: Theme.colors.textSecondary, fontWeight: 'bold' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Icon name="search" size={16} color={Theme.colors.textSecondary} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Tìm tên, CCCD, số phòng..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={{ color: Theme.colors.textSecondary, fontWeight: 'bold' }}>Xóa</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={{ flex: 1 }}>
              {filteredGroups.length === 0 ? (
                <Text style={styles.warningText}>Không tìm thấy hồ sơ nào.</Text>
              ) : (
                filteredGroups.map(g => (
                  <TouchableOpacity 
                    key={g.id} 
                    style={[styles.selectionItem, selectedGroupId === g.id && styles.selectionItemActive]}
                    onPress={() => {
                      setSelectedGroupId(g.id);
                      setShowGroupModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.selectionText, selectedGroupId === g.id && styles.selectionTextActive]}>
                        Phòng: {g.property?.title}
                      </Text>
                      <Text style={{ marginLeft: 12, fontSize: 14, color: Theme.colors.textSecondary, marginTop: 4 }}>
                        Chủ hộ: {g.primaryTenant?.fullName} {g.primaryTenant?.nationalId ? `(${g.primaryTenant.nationalId})` : ''}
                      </Text>
                      {g.roommates.length > 0 && (
                        <Text style={{ marginLeft: 12, fontSize: 12, color: Theme.colors.textSecondary }}>
                          + {g.roommates.length} người ở ghép
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  scrollContent: { padding: Theme.spacing.lg },
  section: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text, marginBottom: Theme.spacing.lg },
  warningText: { color: Theme.colors.danger, fontSize: Theme.typography.size.small, fontStyle: 'italic', marginTop: Theme.spacing.md, textAlign: 'center' },
  selectionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, marginBottom: 8 },
  selectionItemActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
  selectionText: { marginLeft: 12, fontSize: Theme.typography.size.body, color: Theme.colors.text, fontWeight: '500' },
  selectionTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, height: 48, justifyContent: 'center', fontSize: Theme.typography.size.small, color: Theme.colors.text, backgroundColor: Theme.colors.background },
  footer: { padding: Theme.spacing.lg, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.md, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: Theme.colors.surface, fontSize: Theme.typography.size.body, fontWeight: 'bold' },
  
  textButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  textButtonLabel: { marginLeft: 8, fontSize: Theme.typography.size.body, color: Theme.colors.primary, fontWeight: '500' },
  selectedPropertyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md, backgroundColor: Theme.colors.primaryLight, borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: Theme.colors.primary },
  selectedPropertyText: { marginLeft: 8, fontSize: Theme.typography.size.body, color: Theme.colors.primaryDark, fontWeight: 'bold' },
  addText: { color: Theme.colors.primary, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: Theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Theme.spacing.lg },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
  bottomSheetTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.background, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, height: 44, marginBottom: Theme.spacing.lg },
  searchInput: { flex: 1, marginLeft: 8, fontSize: Theme.typography.size.small, color: Theme.colors.text },

  dropdownButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, height: 48, backgroundColor: Theme.colors.background },
  dropdownText: { fontSize: Theme.typography.size.small, color: Theme.colors.text },
  dropdownList: { marginTop: 4, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, backgroundColor: Theme.colors.surface, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: Theme.spacing.md, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  dropdownItemText: { fontSize: Theme.typography.size.small, color: Theme.colors.text },
  dropdownItemTextActive: { color: Theme.colors.primary, fontWeight: 'bold' },
});
