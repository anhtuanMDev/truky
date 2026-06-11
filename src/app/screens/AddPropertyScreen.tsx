import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { z } from 'zod';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { Property } from '../../domain/models/types';
import { useProperties } from '../../hooks/useProperties';
import { generateId } from '../../utils/uuid';

const FormSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên nhà/căn hộ'),
  addressLine: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  ward: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export function AddPropertyScreen() {
  const navigation = useNavigation();
  const { saveProperty } = useProperties();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      addressLine: '',
      ward: '',
      district: '',
      city: 'TP Hồ Chí Minh',
      note: '',
    }
  });

  const onSubmit = (data: FormData) => {
    const now = Date.now();
    const newProperty: Property = {
      ...data,
      id: generateId(),
      fullAddress: `${data.addressLine}, ${data.ward ? data.ward + ', ' : ''}${data.district ? data.district + ', ' : ''}${data.city}`,
      createdAt: now,
      updatedAt: now,
    };
    saveProperty(newProperty);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm nhà/khu trọ</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin nhà</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên khu trọ / Số nhà *</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="VD: Trọ cô Ba, Nhà số 10..."
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ (Đường/Hẻm) *</Text>
              <Controller
                control={control}
                name="addressLine"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.addressLine && styles.inputError]}
                    placeholder="VD: 115/17 Đường số 5"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.addressLine && <Text style={styles.errorText}>{errors.addressLine.message}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: Theme.spacing.sm }]}>
                <Text style={styles.label}>Phường/Xã</Text>
                <Controller
                  control={control}
                  name="ward"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} placeholder="VD: Linh Xuân" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.sm }]}>
                <Text style={styles.label}>Quận/Huyện</Text>
                <Controller
                  control={control}
                  name="district"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput style={styles.input} placeholder="VD: Thủ Đức" onBlur={onBlur} onChangeText={onChange} value={value} />
                  )}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh/Thành phố</Text>
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="VD: TP Hồ Chí Minh" onBlur={onBlur} onChangeText={onChange} value={value} />
                )}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitButtonText}>Lưu nhà mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  scrollContent: { padding: Theme.spacing.lg },
  section: { backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderRadius: Theme.borderRadius.md, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, marginBottom: Theme.spacing.xl },
  sectionTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text, marginBottom: Theme.spacing.lg },
  inputGroup: { marginBottom: Theme.spacing.md },
  row: { flexDirection: 'row' },
  label: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: Theme.colors.border, borderRadius: Theme.borderRadius.md, paddingHorizontal: Theme.spacing.md, paddingVertical: 12, fontSize: Theme.typography.size.small, color: Theme.colors.text, backgroundColor: Theme.colors.background },
  inputError: { borderColor: Theme.colors.danger },
  errorText: { color: Theme.colors.danger, fontSize: 12, marginTop: 4 },
  footer: { padding: Theme.spacing.lg, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.md, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: Theme.colors.surface, fontSize: Theme.typography.size.body, fontWeight: 'bold' },
});
