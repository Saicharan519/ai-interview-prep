import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const buffer = await fs.readFile(filePath);
      const result = await pdfParse(buffer);
      return result.text.trim();
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    } else {
      throw new Error(
        'Unsupported file type. Only PDF and DOCX are allowed.'
      );
    }
  } catch (error) {
    throw error;
  }
}
