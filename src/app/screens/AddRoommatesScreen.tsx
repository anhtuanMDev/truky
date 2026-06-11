import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { observer } from '@legendapp/state/react';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { roommateDraftStore } from '../../store/legend/roommateDraftStore';

export const AddRoommatesScreen = observer(() => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const drafts = roommateDraftStore.get();
  const activeRoommate = drafts[activeTab];

  const updateField = (field: keyof typeof activeRoommate, value: string) => {
    roommateDraftStore[activeTab][field].set(value as any);
  };

  const handleClear = () => {
    roommateDraftStore[activeTab].set({
      id: activeRoommate.id,
      fullName: '',
      nationalId: '',
      dateOfBirth: '',
      gender: '',
      relationshipToHouseholder: ''
    });
  };

  const isPartiallyFilled = (r: typeof activeRoommate) => {
    return r.fullName.trim() !== '' || r.nationalId.trim() !== '' || r.dateOfBirth.trim() !== '' || r.gender.trim() !== '' || r.relationshipToHouseholder.trim() !== '';
  };

  const handleSave = () => {
    // Validate
    for (let i = 0; i < drafts.length; i++) {
      const r = drafts[i];
      if (isPartiallyFilled(r)) {
        if (!r.fullName.trim()) {
          setActiveTab(i);
          return Alert.alert('Lỗi', `Người số ${i + 1} chưa nhập Họ và tên.`);
        }
        if (r.nationalId && r.nationalId.trim().length !== 12) {
          setActiveTab(i);
          return Alert.alert('Lỗi', `CCCD của người số ${i + 1} phải đủ 12 số.`);
        }
      }
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleSave}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Người Ở Ghép</Text>
        <TouchableOpacity onPress={handleClear} style={{ padding: 8 }}>
          <Text style={{ color: Theme.colors.danger, fontWeight: 'bold' }}>Xóa Form</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {drafts.map((_, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.tab, activeTab === index && styles.tabActive]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
              Người {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên *</Text>
            <TextInput style={styles.input} value={activeRoommate.fullName} onChangeText={v => updateField('fullName', v)} placeholder="Nhập họ tên đầy đủ" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số CCCD (12 số)</Text>
            <TextInput style={styles.input} value={activeRoommate.nationalId} onChangeText={v => updateField('nationalId', v)} placeholder="Nhập CCCD" keyboardType="number-pad" maxLength={12} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Theme.spacing.md }}>
            {/* Ngày sinh */}
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: activeRoommate.dateOfBirth ? Theme.colors.text : Theme.colors.textSecondary }}>
                  {activeRoommate.dateOfBirth || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Giới tính */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={{ flexDirection: 'row', height: 48 }}>
                <TouchableOpacity 
                  style={[styles.genderButton, activeRoommate.gender === 'Male' && styles.genderButtonActive, { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }]}
                  onPress={() => updateField('gender', 'Male')}
                >
                  <Text style={[styles.genderText, activeRoommate.gender === 'Male' && styles.genderTextActive]}>Nam</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderButton, activeRoommate.gender === 'Female' && styles.genderButtonActive, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  onPress={() => updateField('gender', 'Female')}
                >
                  <Text style={[styles.genderText, activeRoommate.gender === 'Female' && styles.genderTextActive]}>Nữ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={activeRoommate.dateOfBirth ? moment(activeRoommate.dateOfBirth, 'DD/MM/YYYY').toDate() : new Date(2000, 0, 1)}
              mode="date"
              display="default"
              positiveButton={{ label: 'Chọn', textColor: Theme.colors.primary }}
              negativeButton={{ label: 'Hủy', textColor: Theme.colors.textSecondary }}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  updateField('dateOfBirth', moment(selectedDate).format('DD/MM/YYYY'));
                }
              }}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quan hệ với chủ hộ</Text>
            <TextInput style={styles.input} value={activeRoommate.relationshipToHouseholder} onChangeText={v => updateField('relationshipToHouseholder', v)} placeholder="Ví dụ: Con, Vợ, Em trai" />
          </View>

          <Text style={styles.helperText}>
            Lưu ý: Nếu không nhập bất kỳ thông tin nào, người này sẽ bị bỏ qua.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
          <Text style={styles.submitButtonText}>Xác Nhận & Quay Lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text },
  tabContainer: { flexDirection: 'row', backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Theme.colors.primary },
  tabText: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Theme.colors.primary, fontWeight: 'bold' },
  formContainer: { padding: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, height: 48, justifyContent: 'center', fontSize: Theme.typography.size.body, color: Theme.colors.text, backgroundColor: Theme.colors.surface },
  genderButton: { flex: 1, borderWidth: 1, borderColor: Theme.colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md },
  genderButtonActive: { backgroundColor: Theme.colors.primaryLight, borderColor: Theme.colors.primary },
  genderText: { color: Theme.colors.textSecondary, fontSize: Theme.typography.size.small, fontWeight: '500' },
  genderTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  helperText: { marginTop: 16, fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, fontStyle: 'italic', textAlign: 'center' },
  footer: { padding: Theme.spacing.lg, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.md, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: Theme.colors.surface, fontSize: Theme.typography.size.body, fontWeight: 'bold' },
});
