import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { generateDocx } from '../../utils/docxGenerator';
import { CT01_BASE64 } from '../../assets/templates/templatesBase64';

export function CT01PreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [isExporting, setIsExporting] = useState(false);
  const { formData } = route.params;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fileName = `CT01_${formData.fullName.replace(/\s+/g, '_')}_${Date.now()}.docx`;
      const filePath = await generateDocx(CT01_BASE64, formData, fileName);
      
      Alert.alert(
        'Xuất file thành công',
        `Mẫu CT01 đã được tạo thành công tại:\n${filePath}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tạo file DOCX: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color={Theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản xem trước CT01</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.documentPaper}>
          <Text style={styles.docHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
          <Text style={styles.docSubHeader}>Độc lập - Tự do - Hạnh phúc</Text>
          
          <Text style={styles.docTitle}>TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ</Text>
          <Text style={styles.docSubtitle}>Kính gửi: {formData.authorityName}</Text>

          <View style={styles.docSection}>
            <Text style={styles.docLabel}>1. Họ, chữ đệm và tên: <Text style={styles.docValue}>{formData.fullName}</Text></Text>
            <Text style={styles.docLabel}>2. Ngày, tháng, năm sinh: <Text style={styles.docValue}>{formData.dob}</Text></Text>
            <Text style={styles.docLabel}>3. Giới tính: <Text style={styles.docValue}>{formData.gender}</Text></Text>
            <Text style={styles.docLabel}>4. Số định danh cá nhân/CMND: <Text style={styles.docValue}>{formData.nationalId}</Text></Text>
            <Text style={styles.docLabel}>5. Số điện thoại liên hệ: <Text style={styles.docValue}>{formData.phone}</Text></Text>
            <Text style={styles.docLabel}>6. Email: <Text style={styles.docValue}>{formData.email}</Text></Text>
            <Text style={styles.docLabel}>7. Nơi thường trú: <Text style={styles.docValue}>{formData.permanentAddress}</Text></Text>
            <Text style={styles.docLabel}>8. Nơi tạm trú: <Text style={styles.docValue}>{formData.currentAddress}</Text></Text>
            <Text style={styles.docLabel}>9. Nghề nghiệp, nơi làm việc: <Text style={styles.docValue}>{formData.occupation}</Text></Text>
            <Text style={styles.docLabel}>10. Họ tên chủ hộ: <Text style={styles.docValue}>{formData.householderName}</Text></Text>
            <Text style={styles.docLabel}>11. Quan hệ với chủ hộ: <Text style={styles.docValue}>{formData.relationshipToHouseholder}</Text></Text>
            <Text style={styles.docLabel}>12. Nội dung đề nghị: <Text style={styles.docValue}>{formData.reason}</Text></Text>
          </View>

          {formData.coOccupants && formData.coOccupants.length > 0 && (
            <View style={styles.docSection}>
              <Text style={styles.docLabelBold}>13. Những thành viên trong hộ gia đình cùng thay đổi:</Text>
              {formData.coOccupants.map((co: any, idx: number) => (
                <View key={idx} style={styles.coOccupantRow}>
                  <Text style={styles.docLabel}>- Họ tên: <Text style={styles.docValue}>{co.fullName}</Text></Text>
                  <Text style={styles.docLabel}>  Ngày sinh: <Text style={styles.docValue}>{co.dob}</Text></Text>
                  <Text style={styles.docLabel}>  Giới tính: <Text style={styles.docValue}>{co.gender}</Text></Text>
                  <Text style={styles.docLabel}>  CCCD: <Text style={styles.docValue}>{co.nationalId}</Text></Text>
                  <Text style={styles.docLabel}>  Quan hệ: <Text style={styles.docValue}>{co.relationship}</Text></Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleExport} disabled={isExporting}>
          {isExporting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Xuất File Word (DOCX)</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  scrollContent: { padding: Theme.spacing.lg },
  documentPaper: { backgroundColor: '#fff', padding: Theme.spacing.xl, borderRadius: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginBottom: Theme.spacing.xl },
  docHeader: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  docSubHeader: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#000', marginBottom: 20, textDecorationLine: 'underline' },
  docTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#000', marginBottom: 8 },
  docSubtitle: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', color: '#000', marginBottom: 24 },
  docSection: { marginBottom: 16 },
  docLabel: { fontSize: 13, color: '#333', marginBottom: 6, lineHeight: 20 },
  docLabelBold: { fontSize: 13, color: '#000', fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  docValue: { fontWeight: 'bold', color: '#000' },
  coOccupantRow: { marginLeft: 12, marginBottom: 12, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#ddd' },
  footer: { padding: Theme.spacing.lg, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  submitButton: { backgroundColor: Theme.colors.primary, borderRadius: Theme.borderRadius.md, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: Theme.colors.surface, fontSize: Theme.typography.size.body, fontWeight: 'bold' },
});
