import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { usePerson, usePeople } from '../../hooks/usePeople';
import { useContracts } from '../../hooks/useContracts';
import { Person } from '../../domain/models/types';
import moment from 'moment';

export function PersonDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { deletePerson, people } = usePeople();
  const { contracts } = useContracts();
  const personId = route.params?.personId;
  const person = usePerson(personId);

  // Find active contract
  const activeContracts = contracts.filter(c => c.contractStatus === 'Active' && c.tenantPersonIds.includes(personId));
  activeContracts.sort((a, b) => b.createdAt - a.createdAt);
  const currentContract = activeContracts.length > 0 ? activeContracts[0] : null;

  // Find roommates
  const roommates = currentContract 
    ? people.filter(p => currentContract.tenantPersonIds.includes(p.id) && p.id !== personId)
    : [];

  if (!person) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={24} color={Theme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Không tìm thấy thông tin khách thuê.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa khách thuê này không? Dữ liệu sẽ không thể khôi phục.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            deletePerson(personId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết khách thuê</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="user" size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.name}>{person.fullName}</Text>
            {person.phone && <Text style={styles.subtitle}>{person.phone}</Text>}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CCCD/CMND</Text>
              <Text style={styles.infoValue}>{person.nationalId || 'Chưa cập nhật'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>
                {person.gender === 'Male' ? 'Nam' : person.gender === 'Female' ? 'Nữ' : 'Khác'}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quê quán</Text>
              <Text style={styles.infoValue}>{person.permanentAddress || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Hệ thống lưu trữ</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày tạo</Text>
              <Text style={styles.infoValue}>{moment(person.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
            </View>
          </View>

          {roommates.length > 0 && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Người ở chung ({roommates.length})</Text>
              {roommates.map((r, index) => (
                <React.Fragment key={r.id}>
                  <TouchableOpacity 
                    style={styles.roommateRow}
                    onPress={() => navigation.push('PersonDetails', { personId: r.id })}
                  >
                    <View style={styles.roommateInfo}>
                      <Icon name="user" size={16} color={Theme.colors.primary} />
                      <Text style={styles.roommateName}>{r.fullName}</Text>
                      {currentContract?.tenantPersonIds[0] === r.id && (
                        <View style={styles.householderBadge}>
                          <Text style={styles.householderBadgeText}>Chủ hộ</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {index < roommates.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Xóa khách thuê</Text>
        </TouchableOpacity>
      </ScrollView>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.size.body,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  name: {
    fontSize: Theme.typography.size.title,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Theme.typography.size.body,
    color: Theme.colors.textSecondary,
  },
  infoSection: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.size.small,
    fontWeight: 'bold',
    color: Theme.colors.primaryDark,
    marginBottom: Theme.spacing.md,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
  },
  infoLabel: {
    fontSize: Theme.typography.size.body,
    color: Theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: Theme.typography.size.body,
    color: Theme.colors.text,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 4,
  },
  roommateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  roommateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roommateName: {
    marginLeft: Theme.spacing.sm,
    fontSize: Theme.typography.size.body,
    color: Theme.colors.text,
    fontWeight: '500',
  },
  householderBadge: {
    marginLeft: Theme.spacing.sm,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  householderBadgeText: {
    fontSize: 10,
    color: Theme.colors.primaryDark,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: Theme.colors.dangerLight,
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.danger,
  },
  deleteButtonText: {
    color: Theme.colors.danger,
    fontSize: Theme.typography.size.body,
    fontWeight: 'bold',
  },
});
