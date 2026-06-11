import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { z } from 'zod';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { CCCDSchema } from '../../domain/schemas/validation';
import { Person } from '../../domain/models/types';
import { usePeople } from '../../hooks/usePeople';
import { generateId } from '../../utils/uuid';

const FormSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên'),
  nationalId: CCCDSchema.optional().or(z.literal('')),
  phone: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dateOfBirth: z.string().optional(),
  permanentAddress: z.string().optional(),
  occupation: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export function AddPersonScreen() {
  const navigation = useNavigation();
  const { savePerson } = usePeople();

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: '',
      nationalId: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '',
      permanentAddress: '',
      occupation: '',
    }
  });

  const genderValue = watch('gender');

  const onSubmit = (data: FormData) => {
    const now = Date.now();
    const newPerson: Person = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    savePerson(newPerson);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm khách thuê</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="VD: Nguyễn Văn A"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số CCCD/CMND</Text>
              <Controller
                control={control}
                name="nationalId"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.nationalId && styles.inputError]}
                    placeholder="Nhập 12 số CCCD"
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    maxLength={12}
                  />
                )}
              />
              {errors.nationalId && <Text style={styles.errorText}>{errors.nationalId.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.genderRow}>
                <TouchableOpacity 
                  style={[styles.genderButton, genderValue === 'Male' && styles.genderButtonActive]}
                  onPress={() => setValue('gender', 'Male')}
                >
                  <Text style={[styles.genderText, genderValue === 'Male' && styles.genderTextActive]}>Nam</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderButton, genderValue === 'Female' && styles.genderButtonActive]}
                  onPress={() => setValue('gender', 'Female')}
                >
                  <Text style={[styles.genderText, genderValue === 'Female' && styles.genderTextActive]}>Nữ</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ thường trú</Text>
              <Controller
                control={control}
                name="permanentAddress"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập địa chỉ quê quán..."
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitButtonText}>Lưu thông tin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Theme.typography.size.subtitle,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  section: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.body,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
    fontSize: Theme.typography.size.small,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.background,
  },
  inputError: {
    borderColor: Theme.colors.danger,
  },
  errorText: {
    color: Theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  genderButtonActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  genderText: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  genderTextActive: {
    color: Theme.colors.primaryDark,
    fontWeight: '600',
  },
  footer: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Theme.colors.surface,
    fontSize: Theme.typography.size.body,
    fontWeight: 'bold',
  },
});
