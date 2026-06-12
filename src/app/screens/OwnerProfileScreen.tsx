import React, { useState, useEffect } from 'react';
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
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { usePeople } from '../../hooks/usePeople';
import { Person } from '../../domain/models/types';
import moment from 'moment';

export function OwnerProfileScreen() {
  const navigation = useNavigation<any>();
  const { people, savePerson } = usePeople();
  const owner = people.find((p: Person) => p.id === 'owner');

  const [fullName, setFullName] = useState(owner?.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(owner?.dateOfBirth || '');
  const [nationalId, setNationalId] = useState(owner?.nationalId || '');
  const [permanentAddress, setPermanentAddress] = useState(owner?.permanentAddress || '');
  const [phone, setPhone] = useState(owner?.phone || '');

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    const updatedOwner: Person = {
      ...(owner || {}),
      id: 'owner',
      fullName,
      dateOfBirth,
      nationalId,
      permanentAddress,
      phone,
      gender: owner?.gender || 'Male',
      createdAt: owner?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    savePerson(updatedOwner);
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
              <Text style={styles.label}>Ngày sinh</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="VD: 01/01/1980"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số CCCD/CMND</Text>
              <TextInput
                style={styles.input}
                value={nationalId}
                onChangeText={setNationalId}
                placeholder="VD: 079080123456"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nơi đăng ký thường trú</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={permanentAddress}
                onChangeText={setPermanentAddress}
                placeholder="VD: 123 Đường A, Phường B, Quận C, TP.HCM"
                multiline
              />
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
});
