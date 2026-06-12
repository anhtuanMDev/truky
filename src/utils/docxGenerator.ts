import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

export const generateDocx = async (
  base64Template: string,
  data: any,
  outputFileName: string
): Promise<string> => {
  try {
    const zip = new PizZip(base64Template, { base64: true });
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    doc.render(data);
    
    const out = doc.getZip().generate({
      type: 'base64',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    
    const targetPath = `${RNFS.DocumentDirectoryPath}/${outputFileName}`;
    await RNFS.writeFile(targetPath, out, 'base64');
    
    return targetPath;
  } catch (error: any) {
    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map(function (error: any) {
        return error.properties.explanation;
      }).join('\n');
      console.error('Lỗi chi tiết từ DOCX:', errorMessages);
      throw new Error(errorMessages);
    }
    console.error('Lỗi khi tạo file DOCX:', error);
    throw error;
  }
};
