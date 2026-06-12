const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const EXPORT_DIR = path.join(__dirname, '../exports');

try {
  // Ensure exports directory exists
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR);
  }

  console.log('Đang tìm kiếm các file DOCX trong máy ảo...');
  // List files
  const output = execSync('adb exec-out run-as com.truky ls -1 files/').toString();
  const files = output.split('\n').map(f => f.trim()).filter(f => f.endsWith('.docx'));

  if (files.length === 0) {
    console.log('Không có file DOCX nào trong máy ảo.');
    process.exit(0);
  }

  console.log(`Tìm thấy ${files.length} file. Bắt đầu tải về...`);

  files.forEach(file => {
    const dest = path.join(EXPORT_DIR, file);
    console.log(`- Đang tải: ${file}`);
    execSync(`adb exec-out run-as com.truky cat files/${file} > "${dest}"`);
  });

  console.log('Đang dọn dẹp file trong máy ảo để giải phóng dung lượng...');
  execSync('adb exec-out run-as com.truky sh -c "rm files/*.docx"');

  console.log(`\nHoàn tất! Tất cả các file đã được lưu tại thư mục: ./exports/`);
} catch (error) {
  console.error('Đã xảy ra lỗi:', error.message);
  console.log('Vui lòng đảm bảo máy ảo Android đang chạy và app TruKy đã được cài đặt.');
}
