import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  maxCapacity: z.string().min(1, 'Vui lòng nhập sức chứa').refine(val => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0;
  }, 'Sức chứa tối đa phải lớn hơn 0'),
  note: z.string().optional(),
});

type FormData = z.infer<typeof FormSchema>;

export function AddPropertyScreen() {
  const navigation = useNavigation();
  const { properties, saveProperty } = useProperties();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      addressLine: '',
      ward: '',
      city: 'TP Hồ Chí Minh',
      maxCapacity: '5',
      note: '',
    },
  });

  const currentAddressLine = watch('addressLine');

  // Find unique properties for autocomplete
  const uniqueProperties = useMemo(() => {
    const map = new Map<string, Property>();
    properties.forEach(p => {
      if (p.addressLine && !map.has(p.addressLine.toLowerCase())) {
        map.set(p.addressLine.toLowerCase(), p);
      }
    });
    return Array.from(map.values());
  }, [properties]);

  const filteredSuggestions = useMemo(() => {
    if (!currentAddressLine) return uniqueProperties;
    return uniqueProperties.filter(p => 
      p.addressLine.toLowerCase().includes(currentAddressLine.toLowerCase())
    );
  }, [currentAddressLine, uniqueProperties]);

  const handleSelectSuggestion = (p: Property) => {
    setValue('addressLine', p.addressLine, { shouldValidate: true });
    if (p.ward) setValue('ward', p.ward);
    if (p.city) setValue('city', p.city);
    setShowSuggestions(false);
  };

  const onSubmit = (data: FormData) => {
    const now = Date.now();
    const newProperty: Property = {
      ...data,
      id: generateId(),
      fullAddress: `${data.addressLine}, ${data.ward ? data.ward + ', ' : ''}${data.city}`,
      maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity, 10) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    saveProperty(newProperty);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm nhà/khu trọ</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin nhà</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên khu trọ / Số nhà <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
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
              {errors.title && (
                <Text style={styles.errorText}>{errors.title.message}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { zIndex: 10 }]}>
              <Text style={styles.label}>Địa chỉ (Đường/Hẻm) <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <Controller
                control={control}
                name="addressLine"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.addressLine && styles.inputError,
                    ]}
                    placeholder="VD: 00/00 Đường Nguyễn Văn A"
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      onBlur();
                      // Timeout to allow click on suggestion
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {filteredSuggestions.map((p, index) => (
                    <TouchableOpacity 
                      key={p.id} 
                      style={[styles.suggestionItem, index < filteredSuggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: Theme.colors.border }]}
                      onPress={() => handleSelectSuggestion(p)}
                    >
                      <Text style={styles.suggestionText}>{p.addressLine}</Text>
                      {(p.ward || p.city) && (
                        <Text style={styles.suggestionSubText}>
                          {p.ward ? p.ward + ', ' : ''}{p.city}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.addressLine && (
                <Text style={styles.errorText}>
                  {errors.addressLine.message}
                </Text>
              )}
            </View>

            <View style={styles.row}>
              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginRight: Theme.spacing.sm },
                ]}
              >
                <Text style={styles.label}>Phường/Xã <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
                <Controller
                  control={control}
                  name="ward"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.ward && styles.inputError]}
                      placeholder="VD: Linh Xuân"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.ward && (
                  <Text style={styles.errorText}>{errors.ward.message}</Text>
                )}
              </View>

              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginLeft: Theme.spacing.sm },
                ]}
              >
                <Text style={styles.label}>Tỉnh/Thành phố <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.city && styles.inputError]}
                      placeholder="VD: TP Hồ Chí Minh"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.city && (
                  <Text style={styles.errorText}>{errors.city.message}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số người ở tối đa <Text style={{ color: Theme.colors.danger }}>*</Text></Text>
              <Controller
                control={control}
                name="maxCapacity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.maxCapacity && styles.inputError]}
                    placeholder="VD: 5"
                    keyboardType="number-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.maxCapacity && (
                <Text style={styles.errorText}>{errors.maxCapacity.message}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>Lưu nhà mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
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
  scrollContent: { padding: Theme.spacing.lg },
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
  inputGroup: { marginBottom: Theme.spacing.md },
  row: { flexDirection: 'row' },
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
  inputError: { borderColor: Theme.colors.danger },
  errorText: { color: Theme.colors.danger, fontSize: 12, marginTop: 4 },
  
  suggestionsContainer: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    marginTop: 4,
    maxHeight: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
  },
  suggestionText: {
    fontSize: Theme.typography.size.small,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  suggestionSubText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
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
