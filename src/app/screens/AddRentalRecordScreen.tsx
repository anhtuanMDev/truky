import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { observer } from '@legendapp/state/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { useProperties } from '../../hooks/useProperties';
import { usePeople } from '../../hooks/usePeople';
import { useContracts } from '../../hooks/useContracts';
import { generateId } from '../../utils/uuid';
import { Person, Contract } from '../../domain/models/types';
import {
  roommateDraftStore,
  clearRoommateDrafts,
  initRoommateDrafts,
} from '../../store/legend/roommateDraftStore';
import { CCCDSchema } from '../../domain/schemas/validation';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

type Mode = 'Lập hộ mới' | 'Vào hộ đã có';

const FormSchema = z
  .object({
    mode: z.enum(['Lập hộ mới', 'Vào hộ đã có']),
    propertyId: z.string().optional(),
    contractId: z.string().optional(),
    primaryName: z.string().min(2, 'Vui lòng nhập họ tên'),
    primaryPhone: z.string().optional(),
    primaryCCCD: CCCDSchema,
    primaryDOB: z.string().min(1, 'Vui lòng chọn ngày sinh'),
    primaryGender: z.enum(['Male', 'Female', 'Other']).optional(),
    startDate: z.string().min(1, 'Vui lòng chọn ngày'),
    guardianName: z.string().optional(),
    guardianCCCD: z.string().optional(),
    guardianDOB: z.string().optional(),
    guardianGender: z.enum(['Male', 'Female', 'Other']).optional(),
    guardianPhone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === 'Lập hộ mới' && !data.propertyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn nhà/phòng',
        path: ['propertyId'],
      });
    }
    if (data.mode === 'Vào hộ đã có' && !data.contractId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng chọn hộ gia đình',
        path: ['contractId'],
      });
    }
    if (data.mode === 'Lập hộ mới' && data.primaryDOB) {
      const dob = moment(data.primaryDOB, 'DD/MM/YYYY');
      if (moment().diff(dob, 'years') < 18) {
        if (!data.guardianName || data.guardianName.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vui lòng nhập họ tên người bảo hộ',
            path: ['guardianName'],
          });
        }
        if (!data.guardianCCCD || data.guardianCCCD.length !== 12) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'CCCD người bảo hộ phải đủ 12 số',
            path: ['guardianCCCD'],
          });
        }
        if (!data.guardianDOB || data.guardianDOB.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vui lòng chọn ngày sinh',
            path: ['guardianDOB'],
          });
        } else {
          const gDob = moment(data.guardianDOB, 'DD/MM/YYYY');
          if (moment().diff(gDob, 'years') < 18) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Người bảo hộ phải từ 18 tuổi trở lên',
              path: ['guardianDOB'],
            });
          }
        }
      }
    }
  });

type FormData = z.infer<typeof FormSchema>;

export const AddRentalRecordScreen = observer(() => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialMode: Mode = route.params?.mode || 'Lập hộ mới';

  const scrollViewRef = useRef<ScrollView>(null);

  const { properties } = useProperties();
  const { savePerson, people } = usePeople();
  const { contracts, saveContract } = useContracts();

  const [showPropertyModal, setShowPropertyModal] = useState<boolean>(false);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);
  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  const [showGuardianDOBPicker, setShowGuardianDOBPicker] = useState(false);



  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mode: initialMode,
      propertyId: '',
      contractId: '',
      primaryName: '',
      primaryPhone: '',
      primaryCCCD: '',
      primaryDOB: '',
      primaryGender: 'Male',
      startDate: moment().format('DD/MM/YYYY'),
      guardianName: '',
      guardianCCCD: '',
      guardianDOB: '',
      guardianGender: 'Male',
      guardianPhone: '',
    },
  });

  const mode = watch('mode');
  const selectedPropertyId = watch('propertyId');
  const selectedContractId = watch('contractId');
  const startDateValue = watch('startDate');
  const dobValue = watch('primaryDOB');
  const genderValue = watch('primaryGender');
  const guardianDOBValue = watch('guardianDOB');
  const guardianGenderValue = watch('guardianGender');

  const isUnder18 = useMemo(() => {
    if (!dobValue) return false;
    const dob = moment(dobValue, 'DD/MM/YYYY');
    return moment().diff(dob, 'years') < 18;
  }, [dobValue]);

  const drafts = roommateDraftStore.get();
  // Filter out those who have entered data
  const activeRoommates = drafts.filter(
    r =>
      r.fullName.trim() !== '' ||
      r.nationalId.trim() !== '' ||
      r.dateOfBirth.trim() !== '' ||
      r.gender.trim() !== '' ||
      r.relationshipToHouseholder.trim() !== '',
  );

  const maxRoommatesAllowed = useMemo(() => {
    if (!selectedPropertyId) return 0;
    const p = properties.find(x => x.id === selectedPropertyId);
    if (!p) return 0;
    const capacity = p.maxCapacity || 5;
    return Math.max(0, capacity - 1);
  }, [selectedPropertyId, properties]);

  useEffect(() => {
    if (mode === 'Lập hộ mới') {
      initRoommateDrafts(maxRoommatesAllowed);
    } else {
      clearRoommateDrafts();
    }
  }, [selectedPropertyId, mode, maxRoommatesAllowed]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearRoommateDrafts();
  }, []);

  const isSubmittedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isSubmittedRef.current) return;

      const currentData = watch();
      const hasUnsavedChanges =
        currentData.primaryName.trim() !== '' ||
        currentData.primaryPhone?.trim() !== '' ||
        currentData.primaryCCCD?.trim() !== '' ||
        currentData.primaryDOB?.trim() !== '' ||
        activeRoommates.length > 0;

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
  }, [navigation, watch, activeRoommates.length]);

  useEffect(() => {
    clearErrors();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [mode, clearErrors]);

  const rentalGroups = useMemo(() => {
    // Collect active "Rental" contracts representing households
    const activeRentals = contracts.filter(
      c => c.type === 'Rental' && c.contractStatus === 'Active',
    );
    return activeRentals.map(c => {
      const property = properties.find(p => p.id === c.propertyId);
      const primaryTenant = people.find(p => p.id === c.tenantPersonIds[0]);
      return {
        id: c.id,
        contract: c,
        propertyTitle: property?.title || 'Phòng không xác định',
        householderName: primaryTenant?.fullName || 'Chưa có chủ hộ',
        currentTenantCount: c.tenantPersonIds.length,
      };
    });
  }, [contracts, properties, people]);

  const onSubmit = (data: FormData) => {
    if (data.mode === 'Lập hộ mới') {
      for (const r of activeRoommates) {
        if (!r.fullName.trim())
          return Alert.alert(
            'Lỗi',
            'Vui lòng nhập tên cho tất cả người ở ghép đã chọn.',
          );
        if (r.nationalId && r.nationalId.length !== 12)
          return Alert.alert('Lỗi', `CCCD của ${r.fullName} phải đủ 12 số.`);
      }

      const now = Date.now();
      const primaryId = generateId();

      let noteStr = undefined;
      if (
        isUnder18 &&
        data.guardianName &&
        data.guardianCCCD &&
        data.guardianDOB
      ) {
        noteStr = `Người bảo hộ: ${data.guardianName} (CCCD: ${
          data.guardianCCCD
        }, SĐT: ${data.guardianPhone || 'Không có'}, NS: ${
          data.guardianDOB
        }, GT: ${
          data.guardianGender === 'Male'
            ? 'Nam'
            : data.guardianGender === 'Female'
            ? 'Nữ'
            : 'Khác'
        })`;
      }

      const primaryPerson: Person = {
        id: primaryId,
        fullName: data.primaryName.trim(),
        phone: data.primaryPhone?.trim(),
        nationalId: data.primaryCCCD?.trim(),
        dateOfBirth: data.primaryDOB?.trim(),
        gender: data.primaryGender ? (data.primaryGender as any) : undefined,
        note: noteStr,
        createdAt: now,
        updatedAt: now,
      };
      savePerson(primaryPerson);

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

      const newContract: Contract = {
        id: generateId(),
        propertyId: data.propertyId!,
        landlordPersonId: 'owner',
        tenantPersonIds: [primaryId, ...roommateIds],
        type: 'Đăng ký tạm trú',
        startDate: data.startDate,
        contractStatus: 'Active',
        createdAt: now,
        updatedAt: now,
      };
      saveContract(newContract);

      Alert.alert(
        'Thành công',
        'Đã lưu hồ sơ tạm trú! Bạn có muốn tạo Hợp đồng thuê nhà không?',
        [
          {
            text: 'Không (Chỉ tạm trú)',
            style: 'cancel',
            onPress: () => {
              isSubmittedRef.current = true;
              navigation.goBack();
            },
          },
          {
            text: 'Có tạo HĐ',
            onPress: () => {
              isSubmittedRef.current = true;
              navigation.replace('AddContract', { initialGroupId: newContract.id, initialContractType: 'Rental' });
            },
          },
        ],
      );
    } else {
      // Vào hộ đã có
      const selectedGroup = rentalGroups.find(g => g.id === data.contractId);
      if (!selectedGroup)
        return Alert.alert('Lỗi', 'Không tìm thấy hộ đã chọn.');

      // Dynamic Validation limit
      const property = properties.find(
        p => p.id === selectedGroup.contract.propertyId,
      );
      const capacity = property?.maxCapacity || 5;

      if (selectedGroup.currentTenantCount >= capacity) {
        return Alert.alert(
          'Thất bại',
          `Số lượng cho phép ở ghép đã vượt quá giới hạn (Tối đa ${capacity} người/phòng).`,
        );
      }

      const now = Date.now();
      const newPersonId = generateId();
      const newPerson: Person = {
        id: newPersonId,
        fullName: data.primaryName.trim(),
        phone: data.primaryPhone?.trim(),
        nationalId: data.primaryCCCD?.trim(),
        dateOfBirth: data.primaryDOB?.trim(),
        gender: data.primaryGender ? (data.primaryGender as any) : undefined,
        createdAt: now,
        updatedAt: now,
      };
      savePerson(newPerson);

      // Update existing contract to add new person
      const updatedContract: Contract = {
        ...selectedGroup.contract,
        tenantPersonIds: [
          ...selectedGroup.contract.tenantPersonIds,
          newPersonId,
        ],
        type:
          selectedGroup.contract.type === 'Rental'
            ? 'Rental'
            : 'Đăng ký tạm trú',
        updatedAt: now,
      };
      saveContract(updatedContract);

      Alert.alert(
        'Thành công',
        `Đã thêm ${newPerson.fullName} vào hộ! Bạn có muốn cập nhật thời gian thuê Hợp đồng không?`,
        [
          {
            text: 'Không',
            style: 'cancel',
            onPress: () => {
              isSubmittedRef.current = true;
              navigation.goBack();
            },
          },
          {
            text: 'Có',
            onPress: () => {
              isSubmittedRef.current = true;
              navigation.replace('AddContract', { initialGroupId: updatedContract.id, initialContractType: 'Rental' });
            },
          },
        ],
      );
    }
  };

  const propertiesWithStatus = useMemo(() => {
    const activeContracts = contracts.filter(
      c => c.type === 'Rental' && c.contractStatus === 'Active',
    );
    return properties.map(p => {
      const activeContract = activeContracts.find(c => c.propertyId === p.id);
      const isOccupied = !!activeContract;
      let householderName = '';
      if (isOccupied && activeContract) {
        const primaryTenantId = activeContract.tenantPersonIds[0];
        const person = people.find(person => person.id === primaryTenantId);
        if (person) {
          householderName = person.fullName;
        }
      }
      return {
        ...p,
        isOccupied,
        householderName,
      };
    });
  }, [properties, contracts, people]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ thuê nhà</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mode === 'Lập hộ mới' && styles.toggleButtonActive,
          ]}
          onPress={() => setValue('mode', 'Lập hộ mới')}
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'Lập hộ mới' && styles.toggleTextActive,
            ]}
          >
            Lập hộ mới
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mode === 'Vào hộ đã có' && styles.toggleButtonActive,
          ]}
          onPress={() => setValue('mode', 'Vào hộ đã có')}
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'Vào hộ đã có' && styles.toggleTextActive,
            ]}
          >
            Vào hộ đã có
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
        >
          {mode === 'Lập hộ mới' ? (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginBottom: Theme.spacing.sm },
                ]}
              >
                1. Chọn Nhà/Phòng{' '}
                <Text style={{ color: Theme.colors.danger }}>*</Text>
              </Text>
              {properties.length === 0 ? (
                <Text style={styles.warningText}>
                  Chưa có Nhà/Phòng. Hãy vào tab Nhà/Phòng để thêm trước.
                </Text>
              ) : !selectedPropertyId ? (
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={() => setShowPropertyModal(true)}
                >
                  <Icon name="search" size={20} color={Theme.colors.primary} />
                  <Text style={styles.textButtonLabel}>Nhấn để chọn phòng</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.selectedPropertyContainer,
                    errors.propertyId && styles.inputError,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
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
              {errors.propertyId && (
                <Text style={styles.errorText}>
                  {errors.propertyId.message}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginBottom: Theme.spacing.sm },
                ]}
              >
                1. Chọn Hộ gia đình (Phòng){' '}
                <Text style={{ color: Theme.colors.danger }}>*</Text>
              </Text>
              {rentalGroups.length === 0 ? (
                <Text style={styles.warningText}>
                  Chưa có hộ gia đình nào đang thuê.
                </Text>
              ) : !selectedContractId ? (
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={() => setShowGroupModal(true)}
                >
                  <Icon name="user" size={20} color={Theme.colors.primary} />
                  <Text style={styles.textButtonLabel}>
                    Nhấn để chọn hộ gia đình
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.selectedPropertyContainer,
                    errors.contractId && styles.inputError,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Icon name="user" size={24} color={Theme.colors.primary} />
                    <View style={{ marginLeft: 12 }}>
                      <Text
                        style={[styles.selectedPropertyText, { marginLeft: 0 }]}
                      >
                        {
                          rentalGroups.find(g => g.id === selectedContractId)
                            ?.propertyTitle
                        }
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: Theme.colors.textSecondary,
                        }}
                      >
                        Chủ hộ:{' '}
                        {
                          rentalGroups.find(g => g.id === selectedContractId)
                            ?.householderName
                        }
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowGroupModal(true)}>
                    <Text style={styles.addText}>Thay đổi</Text>
                  </TouchableOpacity>
                </View>
              )}
              {errors.contractId && (
                <Text style={styles.errorText}>
                  {errors.contractId.message}
                </Text>
              )}
            </View>
          )}

          {/* Section 2: Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {mode === 'Lập hộ mới'
                ? '2. Chủ hộ (Người đứng tên)'
                : '2. Thông tin Người mới'}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Họ và tên <Text style={{ color: Theme.colors.danger }}>*</Text>
              </Text>
              <Controller
                control={control}
                name="primaryName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.primaryName && styles.inputError,
                    ]}
                    placeholder="Nhập họ tên đầy đủ"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.primaryName && (
                <Text style={styles.errorText}>
                  {errors.primaryName.message}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <Controller
                control={control}
                name="primaryPhone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.primaryPhone && styles.inputError,
                    ]}
                    placeholder="Nhập SĐT"
                    keyboardType="phone-pad"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.primaryPhone && (
                <Text style={styles.errorText}>
                  {errors.primaryPhone.message}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Số CCCD (12 số){' '}
                <Text style={{ color: Theme.colors.danger }}>*</Text>
              </Text>
              <Controller
                control={control}
                name="primaryCCCD"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.primaryCCCD && styles.inputError,
                    ]}
                    placeholder="Nhập CCCD"
                    keyboardType="number-pad"
                    maxLength={12}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.primaryCCCD && (
                <Text style={styles.errorText}>
                  {errors.primaryCCCD.message}
                </Text>
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: Theme.spacing.md,
              }}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>
                  Ngày sinh{' '}
                  <Text style={{ color: Theme.colors.danger }}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.input, errors.primaryDOB && styles.inputError]}
                  onPress={() => setShowDOBPicker(true)}
                >
                  <Text
                    style={{
                      color: dobValue
                        ? Theme.colors.text
                        : Theme.colors.textSecondary,
                    }}
                  >
                    {dobValue || 'Chọn ngày'}
                  </Text>
                </TouchableOpacity>
                {errors.primaryDOB && (
                  <Text style={styles.errorText}>
                    {errors.primaryDOB.message}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Giới tính</Text>
                <View style={{ flexDirection: 'row', height: 48 }}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      genderValue === 'Male' && styles.genderButtonActive,
                      {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderRightWidth: 0,
                      },
                    ]}
                    onPress={() => setValue('primaryGender', 'Male')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        genderValue === 'Male' && styles.genderTextActive,
                      ]}
                    >
                      Nam
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      genderValue === 'Female' && styles.genderButtonActive,
                      { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                    ]}
                    onPress={() => setValue('primaryGender', 'Female')}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        genderValue === 'Female' && styles.genderTextActive,
                      ]}
                    >
                      Nữ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {mode === 'Lập hộ mới' && isUnder18 && (
              <View
                style={{
                  marginTop: Theme.spacing.sm,
                  paddingTop: Theme.spacing.lg,
                  borderTopWidth: 1,
                  borderTopColor: Theme.colors.border,
                  borderStyle: 'dashed',
                }}
              >
                <Text
                  style={{
                    fontSize: Theme.typography.size.body,
                    fontWeight: 'bold',
                    color: Theme.colors.primaryDark,
                    marginBottom: 4,
                  }}
                >
                  Thông tin Người Bảo Hộ
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: Theme.colors.textSecondary,
                    fontStyle: 'italic',
                    marginBottom: Theme.spacing.md,
                  }}
                >
                  Bắt buộc nhập do chủ hộ chưa đủ 18 tuổi.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Họ tên người bảo hộ{' '}
                    <Text style={{ color: Theme.colors.danger }}>*</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="guardianName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.guardianName && styles.inputError,
                        ]}
                        placeholder="Nhập họ tên người bảo hộ"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.guardianName && (
                    <Text style={styles.errorText}>
                      {errors.guardianName.message}
                    </Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại người bảo hộ</Text>
                  <Controller
                    control={control}
                    name="guardianPhone"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.guardianPhone && styles.inputError,
                        ]}
                        placeholder="Nhập SĐT"
                        keyboardType="phone-pad"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.guardianPhone && (
                    <Text style={styles.errorText}>
                      {errors.guardianPhone.message}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.inputGroup,
                    { marginBottom: Theme.spacing.md },
                  ]}
                >
                  <Text style={styles.label}>
                    Số CCCD người bảo hộ (12 số){' '}
                    <Text style={{ color: Theme.colors.danger }}>*</Text>
                  </Text>
                  <Controller
                    control={control}
                    name="guardianCCCD"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          errors.guardianCCCD && styles.inputError,
                        ]}
                        placeholder="Nhập CCCD"
                        keyboardType="number-pad"
                        maxLength={12}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  {errors.guardianCCCD && (
                    <Text style={styles.errorText}>
                      {errors.guardianCCCD.message}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 0,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>
                      Ngày sinh{' '}
                      <Text style={{ color: Theme.colors.danger }}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        errors.guardianDOB && styles.inputError,
                      ]}
                      onPress={() => setShowGuardianDOBPicker(true)}
                    >
                      <Text
                        style={{
                          color: guardianDOBValue
                            ? Theme.colors.text
                            : Theme.colors.textSecondary,
                        }}
                      >
                        {guardianDOBValue || 'Chọn ngày'}
                      </Text>
                    </TouchableOpacity>
                    {errors.guardianDOB && (
                      <Text style={styles.errorText}>
                        {errors.guardianDOB.message}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={{ flexDirection: 'row', height: 48 }}>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          guardianGenderValue === 'Male' &&
                            styles.genderButtonActive,
                          {
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            borderRightWidth: 0,
                          },
                        ]}
                        onPress={() => setValue('guardianGender', 'Male')}
                      >
                        <Text
                          style={[
                            styles.genderText,
                            guardianGenderValue === 'Male' &&
                              styles.genderTextActive,
                          ]}
                        >
                          Nam
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.genderButton,
                          guardianGenderValue === 'Female' &&
                            styles.genderButtonActive,
                          { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                        ]}
                        onPress={() => setValue('guardianGender', 'Female')}
                      >
                        <Text
                          style={[
                            styles.genderText,
                            guardianGenderValue === 'Female' &&
                              styles.genderTextActive,
                          ]}
                        >
                          Nữ
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {showGuardianDOBPicker && (
            <DateTimePicker
              value={
                guardianDOBValue
                  ? moment(guardianDOBValue, 'DD/MM/YYYY').toDate()
                  : new Date()
              }
              mode="date"
              display="default"
              maximumDate={new Date()}
              positiveButton={{
                label: 'Chọn',
                textColor: Theme.colors.primary,
              }}
              negativeButton={{
                label: 'Hủy',
                textColor: Theme.colors.textSecondary,
              }}
              onChange={(event, selectedDate) => {
                setShowGuardianDOBPicker(false);
                if (event.type === 'set' && selectedDate) {
                  setValue(
                    'guardianDOB',
                    moment(selectedDate).format('DD/MM/YYYY'),
                  );
                }
              }}
            />
          )}

          {showDOBPicker && (
            <DateTimePicker
              value={
                dobValue ? moment(dobValue, 'DD/MM/YYYY').toDate() : new Date()
              }
              mode="date"
              display="default"
              maximumDate={new Date()}
              positiveButton={{
                label: 'Chọn',
                textColor: Theme.colors.primary,
              }}
              negativeButton={{
                label: 'Hủy',
                textColor: Theme.colors.textSecondary,
              }}
              onChange={(event, selectedDate) => {
                setShowDOBPicker(false);
                if (event.type === 'set' && selectedDate) {
                  setValue(
                    'primaryDOB',
                    moment(selectedDate).format('DD/MM/YYYY'),
                  );
                }
              }}
            />
          )}

          {/* Section 3: Roommates (ONLY for Lập hộ mới) */}
          {mode === 'Lập hộ mới' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  3. Người Ở Ghép ({activeRoommates.length}/
                  {maxRoommatesAllowed})
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (!selectedPropertyId) {
                      Alert.alert(
                        'Lưu ý',
                        'Vui lòng chọn Nhà/Phòng trước khi thêm người ở ghép để hệ thống kiểm tra sức chứa.',
                      );
                      return;
                    }
                    if (maxRoommatesAllowed === 0) {
                      Alert.alert(
                        'Thất bại',
                        'Phòng này đã hết chỗ (Sức chứa tối đa 1 người, đã dành cho chủ hộ).',
                      );
                      return;
                    }
                    navigation.navigate('AddRoommates');
                  }}
                  style={{
                    opacity:
                      !selectedPropertyId || maxRoommatesAllowed === 0
                        ? 0.5
                        : 1,
                  }}
                >
                  <Text style={styles.addText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              </View>

              {activeRoommates.map((r, idx) => (
                <View key={idx} style={styles.compactRoommateItem}>
                  <Icon
                    name="user"
                    size={16}
                    color={Theme.colors.textSecondary}
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.compactRoommateName}>
                      {r.fullName || 'Chưa nhập tên'}
                    </Text>
                    <Text style={styles.compactRoommateInfo}>
                      {r.nationalId ? `CCCD: ${r.nationalId} • ` : ''}
                      {r.relationshipToHouseholder
                        ? r.relationshipToHouseholder
                        : 'Cùng phòng'}
                    </Text>
                  </View>
                </View>
              ))}

              {activeRoommates.length === 0 && (
                <Text style={styles.noteText}>
                  Chưa có người ở ghép nào. Bấm "Chỉnh sửa" để thêm.
                </Text>
              )}
            </View>
          )}

          {/* Section 4: Contract / Entry Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {mode === 'Lập hộ mới'
                ? '4. Thông tin hợp đồng'
                : '3. Thời gian gia nhập'}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Ngày bắt đầu ở{' '}
                <Text style={{ color: Theme.colors.danger }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text
                  style={{
                    color: startDateValue
                      ? Theme.colors.text
                      : Theme.colors.textSecondary,
                  }}
                >
                  {startDateValue || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={
                startDateValue
                  ? moment(startDateValue, 'DD/MM/YYYY').toDate()
                  : new Date()
              }
              mode="date"
              display="default"
              positiveButton={{
                label: 'Chọn',
                textColor: Theme.colors.primary,
              }}
              negativeButton={{
                label: 'Hủy',
                textColor: Theme.colors.textSecondary,
              }}
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (event.type === 'set' && selectedDate) {
                  setValue(
                    'startDate',
                    moment(selectedDate).format('DD/MM/YYYY'),
                  );
                }
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>
            {mode === 'Lập hộ mới' ? 'Lưu Hồ Sơ ' : 'Thêm Người Vào Hộ'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Property Selection Modal (Lập hộ mới) */}
      <Modal
        visible={showPropertyModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Chọn Nhà/Phòng</Text>
              <TouchableOpacity onPress={() => setShowPropertyModal(false)}>
                <Text
                  style={{
                    color: Theme.colors.textSecondary,
                    fontWeight: 'bold',
                  }}
                >
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {propertiesWithStatus.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.selectionItem,
                    selectedPropertyId === p.id && styles.selectionItemActive,
                    p.isOccupied && { opacity: 0.5 },
                  ]}
                  activeOpacity={p.isOccupied ? 1 : 0.7}
                  onPress={() => {
                    if (p.isOccupied) return;
                    setValue('propertyId', p.id);
                    setShowPropertyModal(false);
                  }}
                >
                  <Icon
                    name="home"
                    size={20}
                    color={
                      selectedPropertyId === p.id
                        ? Theme.colors.primary
                        : Theme.colors.textSecondary
                    }
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        styles.selectionText,
                        selectedPropertyId === p.id &&
                          styles.selectionTextActive,
                        { marginLeft: 0 },
                      ]}
                    >
                      {p.title}
                    </Text>
                    {p.isOccupied && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: Theme.colors.danger,
                          marginTop: 2,
                        }}
                      >
                        Đã thuê: {p.householderName || 'Không rõ'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Group Selection Modal (Vào hộ đã có) */}
      <Modal visible={showGroupModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Chọn Hộ gia đình</Text>
              <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                <Text
                  style={{
                    color: Theme.colors.textSecondary,
                    fontWeight: 'bold',
                  }}
                >
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {rentalGroups.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.selectionItem,
                    selectedContractId === g.id && styles.selectionItemActive,
                  ]}
                  onPress={() => {
                    setValue('contractId', g.id);
                    setShowGroupModal(false);
                  }}
                >
                  <Icon
                    name="user"
                    size={20}
                    color={
                      selectedContractId === g.id
                        ? Theme.colors.primary
                        : Theme.colors.textSecondary
                    }
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={[
                        styles.selectionText,
                        { marginLeft: 0 },
                        selectedContractId === g.id &&
                          styles.selectionTextActive,
                      ]}
                    >
                      {g.propertyTitle}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color:
                          selectedContractId === g.id
                            ? Theme.colors.primaryDark
                            : Theme.colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      Chủ hộ: {g.householderName} • Hiện có:{' '}
                      {g.currentTenantCount} người
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {rentalGroups.length === 0 && (
                <Text
                  style={{
                    textAlign: 'center',
                    color: Theme.colors.textSecondary,
                    marginTop: 20,
                  }}
                >
                  Không có hộ nào đang thuê.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Lease Modal */}

    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  toggleContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  toggleButtonActive: { borderBottomColor: Theme.colors.primary },
  toggleText: {
    fontSize: Theme.typography.size.body,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: { color: Theme.colors.primary, fontWeight: 'bold' },
  scrollContent: { padding: Theme.spacing.lg },
  section: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.body,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 0,
  },
  addText: { color: Theme.colors.primary, fontWeight: 'bold' },
  warningText: { color: Theme.colors.danger, fontStyle: 'italic' },
  noteText: { color: Theme.colors.textSecondary, fontStyle: 'italic' },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 8,
  },
  selectionItemActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.primaryLight,
  },
  selectionText: {
    marginLeft: 12,
    fontSize: Theme.typography.size.body,
    color: Theme.colors.text,
  },
  selectionTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  inputGroup: { marginBottom: Theme.spacing.md },
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
    height: 48,
    justifyContent: 'center',
    fontSize: Theme.typography.size.small,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.background,
  },
  inputError: { borderColor: Theme.colors.danger },
  errorText: { color: Theme.colors.danger, fontSize: 12, marginTop: 4 },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
  },
  genderButtonActive: {
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary,
  },
  genderText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.size.small,
    fontWeight: '500',
  },
  genderTextActive: { color: Theme.colors.primaryDark, fontWeight: 'bold' },
  compactRoommateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Theme.colors.background,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  compactRoommateName: {
    fontSize: Theme.typography.size.small,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  compactRoommateInfo: {
    fontSize: 13,
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
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  textButtonLabel: {
    marginLeft: 8,
    fontSize: Theme.typography.size.body,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  selectedPropertyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  selectedPropertyText: {
    marginLeft: 12,
    fontSize: Theme.typography.size.body,
    color: Theme.colors.primaryDark,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Theme.spacing.lg,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  bottomSheetTitle: {
    fontSize: Theme.typography.size.subtitle,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
});
