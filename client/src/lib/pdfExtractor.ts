/**
 * In-browser PDF & text file extractor using pdfjs-dist.
 * Privacy invariant: All extraction executes purely in the browser. Zero files uploaded to the server.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker safely for browser environments
if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch {
    // Fail-soft if worker cannot be initialized
  }
}

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  fileName: string;
  fileSizeBytes: number;
}

/**
 * Extracts raw textual content from an uploaded PDF or plaintext file.
 */
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const fileName = file.name;
  const fileSizeBytes = file.size;

  // Max client file size: 10MB to prevent browser UI freezing
  if (fileSizeBytes > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit. Please upload a smaller file or copy-paste the text.');
  }

  if (file.type === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
    const text = await file.text();
    return {
      text: text.trim(),
      fileName,
      fileSizeBytes,
      pageCount: 1,
    };
  }

  if (file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const textParts: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .map((item) => ('str' in item ? (item as { str: string }).str : ''))
          .filter((str) => str.trim().length > 0);
        
        if (pageStrings.length > 0) {
          textParts.push(pageStrings.join(' '));
        }
      }

      const extracted = textParts.join('\n\n').trim();
      if (!extracted) {
        throw new Error(
          'No selectable text found in the PDF. Scanned images or password-protected documents cannot be read locally without OCR.'
        );
      }

      return {
        text: extracted,
        pageCount: numPages,
        fileName,
        fileSizeBytes,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('No selectable text')) {
        throw err;
      }
      throw new Error(
        'Failed to read PDF document. Please make sure the file is not corrupted or password-protected.'
      );
    }
  }

  throw new Error('Unsupported file format. Please upload a PDF (.pdf) or text (.txt) document.');
}

