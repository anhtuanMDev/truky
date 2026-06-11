import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { observer } from '@legendapp/state/react';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useProperties } from '../../hooks/useProperties';
import { usePeople } from '../../hooks/usePeople';
import { useContracts } from '../../hooks/useContracts';
import { generateId } from '../../utils/uuid';
import { Person, Contract } from '../../domain/models/types';
import { roommateDraftStore, clearRoommateDrafts } from '../../store/legend/roommateDraftStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

export const AddRentalRecordScreen = observer(() => {
  const navigation = useNavigation<any>();
  const { properties } = useProperties();
  const { savePerson } = usePeople();
  const { saveContract } = useContracts();

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [showPropertyModal, setShowPropertyModal] = useState<boolean>(false);
  
  // Primary Tenant
  const [primaryName, setPrimaryName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [primaryCCCD, setPrimaryCCCD] = useState('');
  const [primaryDOB, setPrimaryDOB] = useState('');
  const [primaryGender, setPrimaryGender] = useState('');

  const [startDate, setStartDate] = useState(moment().format('DD/MM/YYYY'));
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const drafts = roommateDraftStore.get();
  // Filter out those who have entered data
  const activeRoommates = drafts.filter(r => 
    r.fullName.trim() !== '' || r.nationalId.trim() !== '' || r.dateOfBirth.trim() !== '' || r.gender.trim() !== '' || r.relationshipToHouseholder.trim() !== ''
  );

  useEffect(() => {
    // Clear drafts when this screen mounts/unmounts
    clearRoommateDrafts();
    return () => clearRoommateDrafts();
  }, []);

  const handleSave = () => {
    if (!selectedPropertyId) return Alert.alert('Lỗi', 'Vui lòng chọn nhà/phòng.');
    if (!primaryName.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập tên chủ hộ.');
    if (primaryCCCD && primaryCCCD.length !== 12) return Alert.alert('Lỗi', 'CCCD chủ hộ phải đủ 12 số.');
    
    for (const r of activeRoommates) {
      if (!r.fullName.trim()) return Alert.alert('Lỗi', 'Vui lòng nhập tên cho tất cả người ở ghép đã chọn.');
      if (r.nationalId && r.nationalId.length !== 12) return Alert.alert('Lỗi', `CCCD của ${r.fullName} phải đủ 12 số.`);
    }

    const now = Date.now();
    
    // 1. Create Primary Tenant
    const primaryId = generateId();
    const primaryPerson: Person = {
      id: primaryId,
      fullName: primaryName.trim(),
      phone: primaryPhone.trim(),
      nationalId: primaryCCCD.trim(),
      dateOfBirth: primaryDOB.trim(),
      gender: primaryGender ? (primaryGender as any) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    savePerson(primaryPerson);

    // 2. Create Roommates
    const roommateIds: string[] = [];
    activeRoommates.forEach(r => {
      const p: Person = {
        id: generateId(),
        fullName: r.fullName.trim(),
        nationalId: r.nationalId.trim(),
        dateOfBirth: r.dateOfBirth.trim(),
        gender: r.gender ? (r.gender as any) : undefined,
        relationshipToHouseholder: r.relationshipToHouseholder.trim(),
        createdAt: now,
        updatedAt: now,
      };
      savePerson(p);
      roommateIds.push(p.id);
    });

    // 3. Create Contract
    const newContract: Contract = {
      id: generateId(),
      propertyId: selectedPropertyId,
      landlordPersonId: 'owner',
      tenantPersonIds: [primaryId, ...roommateIds],
      type: 'Rental',
      startDate,
      contractStatus: 'Active',
      createdAt: now,
      updatedAt: now,
    };
    saveContract(newContract);

    Alert.alert('Thành công', 'Đã lưu hồ sơ khách thuê và tạo hợp đồng!', [
      { text: 'OK', onPress: () => navigation.navigate('ContractsTab') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký Khách thuê mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Section 1: Room */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Chọn Nhà/Phòng</Text>
            {properties.length === 0 ? (
              <Text style={styles.warningText}>Chưa có Nhà/Phòng. Hãy vào tab Nhà/Phòng để thêm trước.</Text>
            ) : !selectedPropertyId ? (
              <TouchableOpacity style={styles.textButton} onPress={() => setShowPropertyModal(true)}>
                <Icon name="search" size={20} color={Theme.colors.primary} />
                <Text style={styles.textButtonLabel}>Nhấn để chọn phòng</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedPropertyContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="home" size={24} color={Theme.colors.primary} />
                  <Text style={styles.selectedPropertyText}>
                    {properties.find(p => p.id === selectedPropertyId)?.title}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowPropertyModal(true)}>
                  <Text style={styles.addText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Section 2: Primary Tenant */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Chủ hộ (Người đứng tên)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput style={styles.input} value={primaryName} onChangeText={setPrimaryName} placeholder="Nhập họ tên đầy đủ" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput style={styles.input} value={primaryPhone} onChangeText={setPrimaryPhone} placeholder="Nhập SĐT" keyboardType="phone-pad" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số CCCD (12 số)</Text>
              <TextInput style={styles.input} value={primaryCCCD} onChangeText={setPrimaryCCCD} placeholder="Nhập CCCD" keyboardType="number-pad" maxLength={12} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.md }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Ngày sinh</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDOBPicker(true)}>
                  <Text style={{ color: primaryDOB ? Theme.colors.text : Theme.colors.textSecondary }}>
                    {primaryDOB || 'Chọn ngày'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={{ flexDirection: 'row', height: 48 }}>
                  <TouchableOpacity 
                    style={[styles.genderButton, primaryGender === 'Male' && styles.genderButtonActive, { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                    onPress={() => setPrimaryGender('Male')}
                  >
                    <Text style={[styles.genderText, primaryGender === 'Male' && styles.genderTextActive]}>Nam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.genderButton, primaryGender === 'Female' && styles.genderButtonActive, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                    onPress={() => setPrimaryGender('Female')}
                  >
                    <Text style={[styles.genderText, primaryGender === 'Female' && styles.genderTextActive]}>Nữ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {showDOBPicker && (
            <DateTimePicker
              value={primaryDOB ? moment(primaryDOB, 'DD/MM/YYYY').toDate() : new Date(1990, 0, 1)}
              mode="date"
              display="default"
              positiveButton={{ label: 'Chọn', textColor: Theme.colors.primary }}
              negativeButton={{ label: 'Hủy', textColor: Theme.colors.textSecondary }}
              onChange={(event, selectedDate) => {
                setShowDOBPicker(false);
                if (selectedDate) setPrimaryDOB(moment(selectedDate).format('DD/MM/YYYY'));
              }}
            />
          )}

          {/* Section 3: Roommates (Navigate to specific screen) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>3. Người Ở Ghép ({activeRoommates.length}/4)</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddRoommates')}>
                <Text style={styles.addText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
            
            {activeRoommates.map((r, idx) => (
              <View key={idx} style={styles.compactRoommateItem}>
                <Icon name="user" size={16} color={Theme.colors.textSecondary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.compactRoommateName}>{r.fullName || 'Chưa nhập tên'}</Text>
                  <Text style={styles.compactRoommateInfo}>
                    {r.nationalId ? `CCCD: ${r.nationalId} • ` : ''}
                    {r.relationshipToHouseholder ? r.relationshipToHouseholder : 'Cùng phòng'}
                  </Text>
                </View>
              </View>
            ))}

            {activeRoommates.length === 0 && (
              <Text style={styles.noteText}>Chưa có người ở ghép nào. Bấm "Chỉnh sửa" để thêm.</Text>
            )}
          </View>

          {/* Section 4: Contract */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Thông tin hợp đồng</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày bắt đầu</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowStartDatePicker(true)}>
                <Text style={{ color: startDate ? Theme.colors.text : Theme.colors.textSecondary }}>
                  {startDate || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate ? moment(startDate, 'DD/MM/YYYY').toDate() : new Date()}
              mode="date"
              display="default"
              positiveButton={{ label: 'Chọn', textColor: Theme.colors.primary }}
              negativeButton={{ label: 'Hủy', textColor: Theme.colors.textSecondary }}
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) setStartDate(moment(selectedDate).format('DD/MM/YYYY'));
              }}
            />
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Lưu Hồ Sơ & Tạo Hợp Đồng</Text>
        </TouchableOpacity>
      </View>

      {/* Property Selection Bottom Sheet Modal */}
      <Modal visible={showPropertyModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Chọn Nhà/Phòng</Text>
              <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
                <Text style={{ color: Theme.colors.textSecondary, fontWeight: 'bold' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {properties.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.selectionItem, selectedPropertyId === p.id && styles.selectionItemActive]}
                  onPress={() => {
                    setSelectedPropertyId(p.id);
                    setShowPropertyModal(false);
                  }}
                >
                  <Icon name="home" size={20} color={selectedPropertyId === p.id ? Theme.colors.primary : Theme.colors.textSecondary} />
                  <Text style={[styles.selectionText, selectedPropertyId === p.id && styles.selectionTextActive]}>{p.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  scrollContent: { padding: Theme.spacing.lg },
  section: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
  sectionTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 0 },
  addText: { color: Theme.colors.primary, fontWeight: 'bold' },
  warningText: { color: Theme.colors.danger, fontStyle: 'italic' },
  noteText: { color: Theme.colors.textSecondary, fontStyle: 'italic' },
  selectionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, marginBottom: 8 },
  selectionItemActive: { borderColor: Theme.colors.primary, backgroundColor: Theme.colors.primaryLight },
  selectionText: { marginLeft: 12, fontSize: Theme.typography.size.body, color: Theme.colors.text },
  selectionTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, height: 48, justifyContent: 'center', fontSize: Theme.typography.size.small, color: Theme.colors.text, backgroundColor: Theme.colors.background },
  genderButton: { flex: 1, borderWidth: 1, borderColor: Theme.colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background, borderRadius: Theme.borderRadius.md },
  genderButtonActive: { backgroundColor: Theme.colors.primaryLight, borderColor: Theme.colors.primary },
  genderText: { color: Theme.colors.textSecondary, fontSize: Theme.typography.size.small, fontWeight: '500' },
  genderTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  compactRoommateItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: Theme.colors.background, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: Theme.colors.border },
  compactRoommateName: { fontSize: Theme.typography.size.small, fontWeight: 'bold', color: Theme.colors.text },
  compactRoommateInfo: { fontSize: 13, color: Theme.colors.textSecondary, marginTop: 2 },
  footer: { padding: Theme.spacing.lg, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.md, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: Theme.colors.surface, fontSize: Theme.typography.size.body, fontWeight: 'bold' },
  textButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  textButtonLabel: { marginLeft: 8, fontSize: Theme.typography.size.body, color: Theme.colors.primary, fontWeight: '500' },
  selectedPropertyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Theme.spacing.md, backgroundColor: Theme.colors.primaryLight, borderRadius: Theme.borderRadius.md, borderWidth: 1, borderColor: Theme.colors.primary },
  selectedPropertyText: { marginLeft: 12, fontSize: Theme.typography.size.body, color: Theme.colors.primaryDark, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: Theme.colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Theme.spacing.lg },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.lg },
  bottomSheetTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
});
