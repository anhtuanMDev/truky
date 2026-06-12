import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Theme } from '../../constants/theme';
import { Icon } from '../../components/base/Icon';
import { generateDocx } from '../../utils/docxGenerator';
import { CONTRACT_BASE64, CT01_BASE64 } from '../../assets/templates/templatesBase64';

export function CombinedPreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'CT01' | 'Contract'>('CT01');
  const scrollRef = useRef<ScrollView>(null);
  const { ct01FormData, contractFormData, primaryTenantName, hideContract, appAction, contractId } = route.params;

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / screenWidth);
    const newTab = pageIndex === 0 ? 'CT01' : 'Contract';
    setActiveTab(prev => (prev !== newTab ? newTab : prev));
  };

  const switchTab = (tab: 'CT01' | 'Contract') => {
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ x: tab === 'CT01' ? 0 : screenWidth, animated: true });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let message = '';
      if (activeTab === 'CT01') {
        const fileName = `CT01_${ct01FormData.fullName.replace(/\s+/g, '_')}_${Date.now()}.docx`;
        const filePath = await generateDocx(CT01_BASE64, ct01FormData, fileName);
        message = `Mẫu CT01 đã được tạo thành công tại:\n${filePath}`;
      } else {
        const fileName = `HopDongThueNha_${(primaryTenantName || 'Khach_thue').replace(/\s+/g, '_')}_${Date.now()}.docx`;
        const filePath = await generateDocx(CONTRACT_BASE64, contractFormData, fileName);
        message = `Mẫu Hợp đồng thuê nhà đã được tạo thành công tại:\n${filePath}`;
      }
      
      Alert.alert(
        'Xuất file thành công',
        message,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tạo file DOCX: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBoth = async () => {
    setIsExporting(true);
    try {
      const ct01FileName = `CT01_${ct01FormData.fullName.replace(/\s+/g, '_')}_${Date.now()}.docx`;
      const ct01FilePath = await generateDocx(CT01_BASE64, ct01FormData, ct01FileName);

      const contractFileName = `HopDongThueNha_${(primaryTenantName || 'Khach_thue').replace(/\s+/g, '_')}_${Date.now()}.docx`;
      const contractFilePath = await generateDocx(CONTRACT_BASE64, contractFormData, contractFileName);
      
      Alert.alert(
        'Xuất file thành công',
        `Đã xuất cả 2 hồ sơ:\n\n1. CT01: ${ct01FilePath}\n\n2. Hợp đồng: ${contractFilePath}`,
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
        <Text style={styles.headerTitle}>Hồ sơ Đăng ký tạm trú</Text>
        <View style={{ width: 40 }} />
      </View>

      {!hideContract && (
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'CT01' && styles.tabActive]} 
            onPress={() => switchTab('CT01')}
          >
            <Text style={[styles.tabText, activeTab === 'CT01' && styles.tabTextActive]}>Mẫu CT01</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Contract' && styles.tabActive]} 
            onPress={() => switchTab('Contract')}
          >
            <Text style={[styles.tabText, activeTab === 'Contract' && styles.tabTextActive]}>Hợp đồng thuê</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        ref={scrollRef}
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        scrollEnabled={!hideContract}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { width: screenWidth }]}>
          <View style={styles.documentPaper}>
            <Text style={styles.docHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
            <Text style={styles.docSubHeader}>Độc lập - Tự do - Hạnh phúc</Text>
            
            <Text style={styles.docTitle}>TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ</Text>
            <Text style={styles.docSubtitle}>Kính gửi: {ct01FormData.authorityName}</Text>

            <Text style={styles.sectionTitle}>1. Họ, chữ đệm và tên: <Text style={styles.docValue}>{ct01FormData.fullName}</Text></Text>
            <Text style={styles.docLabel}>2. Ngày, tháng, năm sinh: <Text style={styles.docValue}>{ct01FormData.dob}</Text></Text>
            <Text style={styles.docLabel}>3. Giới tính: <Text style={styles.docValue}>{ct01FormData.gender}</Text></Text>
            <Text style={styles.docLabel}>4. Số định danh cá nhân/CMND: <Text style={styles.docValue}>{ct01FormData.nationalId}</Text></Text>
            <Text style={styles.docLabel}>5. Số điện thoại liên hệ: <Text style={styles.docValue}>{ct01FormData.phone}</Text></Text>
            <Text style={styles.docLabel}>6. Email: <Text style={styles.docValue}>{ct01FormData.email}</Text></Text>
            <Text style={styles.docLabel}>7. Nơi thường trú: <Text style={styles.docValue}>{ct01FormData.permanentAddress}</Text></Text>
            <Text style={styles.docLabel}>8. Nơi tạm trú: <Text style={styles.docValue}>{ct01FormData.temporaryAddress}</Text></Text>
            <Text style={styles.docLabel}>9. Nơi ở hiện tại: <Text style={styles.docValue}>{ct01FormData.currentAddress}</Text></Text>
            <Text style={styles.docLabel}>10. Nghề nghiệp, nơi làm việc: <Text style={styles.docValue}>{ct01FormData.occupation}</Text></Text>
            <Text style={styles.docLabel}>11. Họ, chữ đệm và tên chủ hộ: <Text style={styles.docValue}>{ct01FormData.householderName}</Text></Text>
            <Text style={styles.docLabel}>12. Quan hệ với chủ hộ: <Text style={styles.docValue}>{ct01FormData.relationshipWithHouseholder}</Text></Text>
            <Text style={styles.docLabel}>13. Số định danh cá nhân/CMND của chủ hộ: <Text style={styles.docValue}>{ct01FormData.householderNationalId}</Text></Text>
            <Text style={styles.docLabel}>14. Nội dung đề nghị: <Text style={styles.docValue}>{ct01FormData.reason}</Text></Text>
          </View>
        </ScrollView>

        {!hideContract && (
          <ScrollView contentContainerStyle={[styles.scrollContent, { width: screenWidth }]}>
            <View style={styles.documentPaper}>
              <Text style={styles.docHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
              <Text style={styles.docSubHeader}>Độc lập – Tự do - Hạnh phúc</Text>
              
              <Text style={styles.docTitle}>HỢP ĐỒNG THUÊ /MƯỢN/Ở NHỜ NHÀ, PHÒNG TRỌ</Text>

              <Text style={styles.docLabel}>Hôm nay, ngày {contractFormData.dateDay} tháng {contractFormData.dateMonth} năm {contractFormData.dateYear}</Text>
              <Text style={styles.docLabel}>Tại căn nhà số: <Text style={styles.docValue}>{contractFormData.propertyAddress}</Text></Text>

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>BÊN CHO THUÊ/MƯỢN/Ở NHỜ NHÀ, PHÒNG TRỌ (Bên A)</Text>
              <Text style={styles.docLabel}>Ông/bà: <Text style={styles.docValue}>{contractFormData.ownerName}</Text></Text>
              <Text style={styles.docLabel}>Sinh năm: <Text style={styles.docValue}>{contractFormData.ownerDob}</Text></Text>
              <Text style={styles.docLabel}>CCCD: <Text style={styles.docValue}>{contractFormData.ownerNationalId}</Text></Text>
              <Text style={styles.docLabel}>Nơi đăng kí thường trú: <Text style={styles.docValue}>{contractFormData.ownerAddress}</Text></Text>

              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>BÊN THUÊ/MƯỢN/Ở NHỜ NHÀ, PHÒNG TRỌ (Bên B)</Text>
              {contractFormData.tenants.map((t: any, idx: number) => (
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
              <Text style={styles.docLabel}>Bên A đồng ý cho bên B thuê (mượn, ở nhờ) 01 phòng trọ số <Text style={styles.docValue}>{contractFormData.roomName}</Text> tại căn nhà số <Text style={styles.docValue}>{contractFormData.propertyAddress}</Text></Text>
              <Text style={styles.docLabel}>Thời hạn thuê: <Text style={styles.docValue}>{contractFormData.duration}</Text> năm</Text>
              <Text style={styles.docLabel}>Giá thuê: <Text style={styles.docValue}>{contractFormData.rentPrice}</Text></Text>
            </View>
          </ScrollView>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={[styles.exportButton, { flex: 1, backgroundColor: hideContract ? Theme.colors.primary : Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.primary }, isExporting && { opacity: 0.7 }, !hideContract && { marginRight: 8 }]} 
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color={hideContract ? '#fff' : Theme.colors.primary} />
            ) : (
              <Text style={[styles.exportButtonText, { color: hideContract ? '#fff' : Theme.colors.primary }]}>{hideContract ? 'Xuất Hồ Sơ' : 'Xuất File Này'}</Text>
            )}
          </TouchableOpacity>
          {!hideContract && (
            <TouchableOpacity 
              style={[styles.exportButton, { flex: 1.5 }, isExporting && { opacity: 0.7 }]} 
              onPress={handleExportBoth}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.exportButtonText}>Xuất Cả 2 Hồ Sơ</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md, backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: Theme.typography.size.subtitle, fontWeight: 'bold', color: Theme.colors.text },
  tabContainer: { flexDirection: 'row', backgroundColor: Theme.colors.surface, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Theme.colors.primary },
  tabText: { fontSize: Theme.typography.size.body, color: Theme.colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Theme.colors.primary, fontWeight: 'bold' },
  scrollContent: { padding: Theme.spacing.md, paddingBottom: 100 },
  documentPaper: { backgroundColor: '#fff', padding: 20, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, minHeight: 600 },
  docHeader: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  docSubHeader: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, textDecorationLine: 'underline' },
  docTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  docSubtitle: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  docLabel: { fontSize: 13, lineHeight: 22, marginBottom: 4 },
  docValue: { fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Theme.colors.surface, padding: Theme.spacing.lg, borderTopWidth: 1, borderTopColor: Theme.colors.border },
  exportButton: { backgroundColor: Theme.colors.primary, paddingVertical: 14, borderRadius: Theme.borderRadius.md, alignItems: 'center' },
  exportButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
