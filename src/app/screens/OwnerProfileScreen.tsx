import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { usePeople } from '../../hooks/usePeople';
import { Person } from '../../domain/models/types';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

import { generateId } from '../../utils/uuid';

export function OwnerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { personId } = route.params || {};
  const { people, savePerson, deletePerson } = usePeople();
  const owner = personId ? people.find((p: Person) => p.id === personId) : undefined;

  const [fullName, setFullName] = useState(owner?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(owner?.dateOfBirth || '');
  const [nationalId, setNationalId] = useState(owner?.nationalId || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(owner?.gender || 'Male');
  const [permanentAddress, setPermanentAddress] = useState(owner?.permanentAddress || '');
  const [phone, setPhone] = useState(owner?.phone || '');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const ownersList = people.filter((p: Person) => p.isOwner || p.id === 'owner');
  const uniqueAddresses = Array.from(new Set(ownersList.map(o => o.permanentAddress).filter(Boolean))) as string[];

  const isSubmittedRef = useRef(false);

  const hasUnsavedChanges = useMemo(() => {
    return (
      fullName !== (owner?.fullName || '') ||
      dateOfBirth !== (owner?.dateOfBirth || '') ||
      nationalId !== (owner?.nationalId || '') ||
      permanentAddress !== (owner?.permanentAddress || '') ||
      phone !== (owner?.phone || '')
    );
  }, [fullName, dateOfBirth, nationalId, permanentAddress, phone, owner]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isSubmittedRef.current) return;
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        'Xác nhận rời đi',
        'Có thông tin chưa được lưu. Nếu bạn quay lại bây giờ, các thay đổi sẽ bị mất. Bạn có chắc chắn muốn rời đi?',
        [
          { text: 'Ở lại', style: 'cancel', onPress: () => {} },
          {
            text: 'Rời đi',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Họ và tên');
      return;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Ngày sinh');
      return;
    }
    if (!nationalId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Số CCCD/CMND');
      return;
    }
    if (!permanentAddress.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Nơi đăng ký thường trú');
      return;
    }

    const updatedOwner: Person = {
      ...(owner || {}),
      id: owner?.id || generateId(),
      fullName,
      dateOfBirth,
      nationalId,
      permanentAddress,
      phone,
      gender,
      isOwner: true,
      createdAt: owner?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    savePerson(updatedOwner);
    isSubmittedRef.current = true;
    Alert.alert('Thành công', 'Thông tin Chủ nhà đã được lưu!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Chủ nhà</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            Thông tin dưới đây sẽ được sử dụng làm "Bên A" (Bên cho thuê) trong các Hợp đồng thuê nhà.
          </Text>

          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="VD: NGUYỄN VĂN A"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Male' && styles.genderButtonActive, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                  onPress={() => setGender('Male')}
                >
                  <Text style={[styles.genderText, gender === 'Male' && styles.genderTextActive]}>Nam</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'Female' && styles.genderButtonActive, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  onPress={() => setGender('Female')}
                >
                  <Text style={[styles.genderText, gender === 'Female' && styles.genderTextActive]}>Nữ</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="VD: 0901234567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày sinh <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: dateOfBirth ? Theme.colors.text : Theme.colors.textSecondary }}>
                  {dateOfBirth || 'Chọn Ngày sinh'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth ? moment(dateOfBirth, 'DD/MM/YYYY').toDate() : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  positiveButton={{ label: 'Chọn', textColor: Theme.colors.primary }}
                  negativeButton={{ label: 'Hủy', textColor: Theme.colors.textSecondary }}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setDateOfBirth(moment(selectedDate).format('DD/MM/YYYY'));
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số CCCD/CMND <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <TextInput
                style={styles.input}
                value={nationalId}
                onChangeText={setNationalId}
                placeholder="VD: 079080123456"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { zIndex: 10 }]}>
              <Text style={styles.label}>Nơi đăng ký thường trú <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={permanentAddress}
                onChangeText={setPermanentAddress}
                placeholder="VD: 123 Đường A, Phường B, Quận C, TP.HCM"
                multiline
                onFocus={() => setShowAddressSuggestions(true)}
                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
              />
              {showAddressSuggestions && uniqueAddresses.length > 0 && (
                <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, marginTop: 4 }}>
                  {uniqueAddresses.map((address, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{ padding: 12, borderBottomWidth: idx < uniqueAddresses.length - 1 ? 1 : 0, borderBottomColor: Theme.colors.border }}
                      onPress={() => {
                        setPermanentAddress(address);
                        setShowAddressSuggestions(false);
                      }}
                    >
                      <Text>{address}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>Lưu thông tin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  scrollContent: { padding: Theme.spacing.lg, paddingBottom: 100 },
  description: { fontSize: 14, color: Theme.colors.textSecondary, marginBottom: Theme.spacing.lg, lineHeight: 20 },
  section: { backgroundColor: Theme.colors.surface, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  inputGroup: { marginBottom: Theme.spacing.md },
  label: { fontSize: Theme.typography.size.small, fontWeight: '600', color: Theme.colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: 12, paddingVertical: 12, fontSize: Theme.typography.size.body, color: Theme.colors.text, backgroundColor: Theme.colors.background },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  primaryButton: { backgroundColor: Theme.colors.primary, paddingVertical: 14, borderRadius: Theme.borderRadius.md, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  genderButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, backgroundColor: Theme.colors.background },
  genderButtonActive: { backgroundColor: Theme.colors.primaryLight, borderColor: Theme.colors.primary },
  genderText: { fontSize: Theme.typography.size.body, color: Theme.colors.text },
  genderTextActive: { color: Theme.colors.primary, fontWeight: 'bold' },
});
