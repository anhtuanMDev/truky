import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { Contract } from '../../domain/models/types';
import { useContracts } from '../../hooks/useContracts';
import { usePeople } from '../../hooks/usePeople';
import { useProperties } from '../../hooks/useProperties';
import { generateId } from '../../utils/uuid';
import moment from 'moment';

export function AddContractScreen() {
  const navigation = useNavigation();
  const { saveContract } = useContracts();
  const { people } = usePeople();
  const { properties } = useProperties();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(moment().format('DD/MM/YYYY'));

  const toggleTenant = (id: string) => {
    if (selectedTenantIds.includes(id)) {
      setSelectedTenantIds(prev => prev.filter(t => t !== id));
    } else {
      if (selectedTenantIds.length >= 5) {
        Alert.alert('Lỗi', 'Chỉ được chọn tối đa 5 người thuê cho một phòng.');
        return;
      }
      setSelectedTenantIds(prev => [...prev, id]);
    }
  };

  const handleSave = () => {
    if (!selectedPropertyId) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhà/phòng.');
      return;
    }
    if (selectedTenantIds.length === 0) {
      Alert.alert('Lỗi', 'Phải có ít nhất 1 người thuê.');
      return;
    }

    const now = Date.now();
    const newContract: Contract = {
      id: generateId(),
      propertyId: selectedPropertyId,
      landlordPersonId: 'owner', // Defaulting to owner for MVP
      tenantPersonIds: selectedTenantIds,
      type: 'Rental',
      startDate,
      contractStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    saveContract(newContract);
    navigation.goBack();
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Chọn nhà */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chọn Nhà/Phòng</Text>
          {properties.length === 0 ? (
            <Text style={styles.warningText}>Bạn chưa thêm Nhà/Phòng nào. Hãy thêm nhà trước khi tạo hợp đồng.</Text>
          ) : (
            properties.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={[styles.selectionItem, selectedPropertyId === p.id && styles.selectionItemActive]}
                onPress={() => setSelectedPropertyId(p.id)}
              >
                <Icon name="home" size={20} color={selectedPropertyId === p.id ? Theme.colors.primary : Theme.colors.textSecondary} />
                <Text style={[styles.selectionText, selectedPropertyId === p.id && styles.selectionTextActive]}>{p.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Chọn Khách thuê */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Chọn Khách Thuê ({selectedTenantIds.length}/5)</Text>
          {people.length === 0 ? (
            <Text style={styles.warningText}>Bạn chưa thêm Khách thuê nào. Hãy thêm khách trước.</Text>
          ) : (
            people.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={[styles.selectionItem, selectedTenantIds.includes(p.id) && styles.selectionItemActive]}
                onPress={() => toggleTenant(p.id)}
              >
                <View style={[styles.checkbox, selectedTenantIds.includes(p.id) && styles.checkboxActive]}>
                  {selectedTenantIds.includes(p.id) && <Icon name="plus" size={14} color={Theme.colors.surface} />}
                </View>
                <Text style={[styles.selectionText, selectedTenantIds.includes(p.id) && styles.selectionTextActive]}>{p.fullName} - {p.phone}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Thông tin khác */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Thông tin Hợp đồng</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày bắt đầu (DD/MM/YYYY)</Text>
            <TextInput 
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="VD: 01/06/2026"
            />
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Tạo hợp đồng</Text>
        </TouchableOpacity>
      </View>
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
  warningText: { color: Theme.colors.danger, fontSize: Theme.typography.size.small, fontStyle: 'italic' },
  selectionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, marginBottom: 8 },
  selectionItemActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
  selectionText: { marginLeft: 12, fontSize: Theme.typography.size.body, color: Theme.colors.text },
  selectionTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: Theme.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.background },
  checkboxActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, fontSize: Theme.typography.size.small, color: Theme.colors.text, backgroundColor: Theme.colors.background },
  footer: { padding: Theme.spacing.lg, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.md, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: Theme.colors.surface, fontSize: Theme.typography.size.body, fontWeight: 'bold' },
});
