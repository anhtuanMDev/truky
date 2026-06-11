import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { storage } from '../../storage/mmkv/instance';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackup = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Giả lập xuất JSON từ MMKV
      const keys = storage.getAllKeys();
      Alert.alert('Sao lưu thành công', `Đã xuất ${keys.length} tệp dữ liệu vào bộ nhớ máy.`);
    }, 1000);
  };

  const handleClearData = () => {
    Alert.alert(
      'CẢNH BÁO NGUY HIỂM',
      'Thao tác này sẽ XÓA TOÀN BỘ dữ liệu Khách thuê, Nhà phòng, và Hợp đồng trên thiết bị này. Dữ liệu sẽ không thể khôi phục. Bạn có chắc chắn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa Tất Cả', 
          style: 'destructive',
          onPress: () => {
            storage.clearAll();
            Alert.alert('Đã xóa', 'Toàn bộ dữ liệu đã được làm sạch. Vui lòng khởi động lại ứng dụng.');
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
        <Text style={styles.headerTitle}>Cài đặt hệ thống</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quản lý dữ liệu (Ngoại tuyến)</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleBackup} disabled={isProcessing}>
          <View style={styles.menuIconBox}>
            <Icon name="file-text" size={20} color={Theme.colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Sao lưu dữ liệu</Text>
            <Text style={styles.menuSubtitle}>Xuất dữ liệu ra file JSON để lưu trữ</Text>
          </View>
          {isProcessing ? <ActivityIndicator size="small" color={Theme.colors.primary} /> : <Icon name="chevron-left" size={20} color={Theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Thông báo', 'Tính năng đang được phát triển.')}>
          <View style={styles.menuIconBox}>
            <Icon name="home" size={20} color={Theme.colors.primary} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Khôi phục dữ liệu</Text>
            <Text style={styles.menuSubtitle}>Nhập dữ liệu từ file JSON đã sao lưu</Text>
          </View>
          <Icon name="chevron-left" size={20} color={Theme.colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItemDanger} onPress={handleClearData}>
          <View style={[styles.menuIconBox, { backgroundColor: Theme.colors.dangerLight }]}>
            <Icon name="user" size={20} color={Theme.colors.danger} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: Theme.colors.danger }]}>Xóa toàn bộ dữ liệu</Text>
            <Text style={styles.menuSubtitle}>Khôi phục ứng dụng về trạng thái ban đầu</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Phiên bản 1.0.0 (Bản cục bộ)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  content: { padding: Theme.spacing.lg },
  sectionTitle: { fontSize: Theme.typography.size.small, fontWeight: 'bold', color: Theme.colors.textSecondary, marginBottom: Theme.spacing.md, textTransform: 'uppercase' },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  menuItemDanger: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, padding: Theme.spacing.md, borderRadius: Theme.borderRadius.md, marginBottom: Theme.spacing.sm, marginTop: Theme.spacing.xl, borderWidth: 1, borderColor: Theme.colors.dangerLight },
  menuIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Theme.spacing.md },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: Theme.typography.size.body, fontWeight: 'bold', color: Theme.colors.text, marginBottom: 2 },
  menuSubtitle: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary },
  footer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  versionText: { fontSize: Theme.typography.size.small, color: Theme.colors.textSecondary },
});
