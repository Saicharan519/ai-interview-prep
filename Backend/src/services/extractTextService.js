import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const DOCX_MIMETYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export async function extractTextFromFile(filePath, mimetype) {
  if (mimetype === 'application/pdf') {
    const buffer = await fs.readFile(filePath);
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  if (mimetype === DOCX_MIMETYPE) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  }

  throw new Error('Unsupported file type. Only PDF and DOCX are allowed.');
}
