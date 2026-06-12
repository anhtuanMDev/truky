import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { generateDocx } from '../../utils/docxGenerator';
import { CONTRACT_BASE64 } from '../../assets/templates/templatesBase64';

export function ContractPreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [isExporting, setIsExporting] = useState(false);
  const { formData, primaryTenantName } = route.params;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fileName = `HopDongThueNha_${(primaryTenantName || 'Khach_thue').replace(/\s+/g, '_')}_${Date.now()}.docx`;
      const filePath = await generateDocx(CONTRACT_BASE64, formData, fileName);
      
      Alert.alert(
        'Xuất hợp đồng thành công',
        `Mẫu Hợp đồng thuê nhà đã được tạo thành công tại:\n${filePath}`,
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
        <Text style={styles.headerTitle}>Xem trước Hợp đồng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.documentPaper}>
          <Text style={styles.docHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
          <Text style={styles.docSubHeader}>Độc lập – Tự do - Hạnh phúc</Text>
          
          <Text style={styles.docTitle}>HỢP ĐỒNG THUÊ /MƯỢN/Ở NHỜ NHÀ, PHÒNG TRỌ</Text>

          <Text style={styles.docLabel}>Hôm nay, ngày {formData.dateDay} tháng {formData.dateMonth} năm {formData.dateYear}</Text>
          <Text style={styles.docLabel}>Tại căn nhà số: <Text style={styles.docValue}>{formData.propertyAddress}</Text></Text>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>BÊN CHO THUÊ/MƯỢN/Ở NHỜ NHÀ, PHÒNG TRỌ (Bên A)</Text>
          <Text style={styles.docLabel}>Ông/bà: <Text style={styles.docValue}>{formData.ownerName}</Text></Text>
          <Text style={styles.docLabel}>Sinh năm: <Text style={styles.docValue}>{formData.ownerDob}</Text></Text>
          <Text style={styles.docLabel}>CCCD: <Text style={styles.docValue}>{formData.ownerNationalId}</Text></Text>
          <Text style={styles.docLabel}>Nơi đăng kí thường trú: <Text style={styles.docValue}>{formData.ownerAddress}</Text></Text>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>BÊN THUÊ/MƯỢN/Ở NHỜ NHÀ, PHÒNG TRỌ (Bên B)</Text>
          {formData.tenants.map((t: any, idx: number) => (
            <View key={idx} style={{ marginBottom: 8 }}>
              <Text style={styles.docLabel}>
                {t.index}. Ông/bà: <Text style={styles.docValue}>{t.fullName}</Text>
              </Text>
              <Text style={styles.docLabel}>
                Sinh năm: <Text style={styles.docValue}>{t.dob}</Text> - CCCD: <Text style={styles.docValue}>{t.nationalId}</Text>
              </Text>
              <Text style={styles.docLabel}>Nơi thường trú: <Text style={styles.docValue}>{t.address}</Text></Text>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>NỘI DUNG THỎA THUẬN</Text>
          <Text style={styles.docLabel}>Bên A đồng ý cho bên B thuê (mượn, ở nhờ) 01 phòng trọ số <Text style={styles.docValue}>{formData.roomName}</Text> tại căn nhà số <Text style={styles.docValue}>{formData.propertyAddress}</Text></Text>
          <Text style={styles.docLabel}>Thời hạn thuê: <Text style={styles.docValue}>{formData.duration}</Text> năm</Text>
          <Text style={styles.docLabel}>Giá thuê: <Text style={styles.docValue}>{formData.rentPrice}</Text></Text>

        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.exportButton, isExporting && { opacity: 0.7 }]} 
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exportButtonText}>Xuất File Word (DOCX)</Text>
          )}
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
  scrollContent: { padding: Theme.spacing.md },
  documentPaper: { backgroundColor: '#fff', padding: 24, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  docHeader: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  docSubHeader: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', textDecorationLine: 'underline', marginBottom: 24, color: '#000' },
  docTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: '#000' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline', marginBottom: 8, color: '#000' },
  docLabel: { fontSize: 13, color: '#000', marginBottom: 6, lineHeight: 20 },
  docValue: { fontWeight: 'bold' },
  footer: { padding: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  exportButton: { backgroundColor: Theme.colors.primaryDark, paddingVertical: 14, borderRadius: Theme.borderRadius.md, alignItems: 'center' },
  exportButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
