/**
 * In-browser PDF & document file extractor with Tesseract.js OCR fallback.
 * Privacy invariant: All extraction executes purely in the browser. Zero files uploaded to the server.
 */
import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromImage, type OcrLanguage, type OcrProgress } from './ocrExtractor.js';

// Configure worker safely for browser environments
if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch {
    // Fail-soft if worker cannot be initialized
  }
}

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per specification

export const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
]);

export const ALLOWED_EXTENSIONS = new Set([
  'txt',
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'bmp',
]);

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  fileName: string;
  fileSizeBytes: number;
  isOcrFallback?: boolean;
  isImageOcr?: boolean;
}

export interface ExtractionOptions {
  ocrLang?: OcrLanguage;
  onOcrProgress?: (progress: OcrProgress) => void;
  signal?: AbortSignal;
}

/**
 * Validates file size and format before reading.
 */
export function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds the 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file or copy-paste the text directly.`
    );
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const isMimeAllowed = file.type ? ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) : false;
  const isExtAllowed = ALLOWED_EXTENSIONS.has(extension);

  if (!isMimeAllowed && !isExtAllowed) {
    throw new Error(
      'Unsupported file format. Please upload an image (.png, .jpg, .webp), PDF (.pdf), or text (.txt) document.'
    );
  }
}

/**
 * Extracts raw textual content from an uploaded PDF, Image, or plaintext file.
 */
export async function extractTextFromFile(
  file: File,
  options: ExtractionOptions = {}
): Promise<ExtractionResult> {
  const fileName = file.name;
  const fileSizeBytes = file.size;

  // 1. Strict security check against oversized or odd files
  validateFile(file);

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const isImage =
    file.type.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(extension);

  // 2. Plaintext extraction
  if (file.type === 'text/plain' || extension === 'txt') {
    let text = '';
    if (typeof FileReader !== 'undefined') {
      text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    } else if (typeof file.text === 'function') {
      text = await file.text();
    }
    return {
      text: text.trim(),
      fileName,
      fileSizeBytes,
      pageCount: 1,
    };
  }

  // 3. Image OCR extraction
  if (isImage) {
    options.onOcrProgress?.({ status: 'Starting image OCR...', progress: 0.05 });
    const text = await extractTextFromImage(file, {
      lang: options.ocrLang || 'eng',
      onProgress: options.onOcrProgress,
      signal: options.signal,
    });

    if (!text || text.length < 5) {
      throw new Error(
        'Could not detect readable text in the image. Please ensure the screenshot is clear and in a supported language (English, Hindi, or Kannada).'
      );
    }

    return {
      text,
      fileName,
      fileSizeBytes,
      pageCount: 1,
      isImageOcr: true,
    };
  }

  // 4. PDF extraction (native text first, OCR fallback if scanned)
  if (file.type === 'application/pdf' || extension === 'pdf') {
    let pdf: any;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });
      pdf = await loadingTask.promise;
    } catch {
      throw new Error(
        'Failed to read PDF document. Please make sure the file is not corrupted or password-protected.'
      );
    }

    const numPages = pdf.numPages;
    const textParts: string[] = [];

    // Attempt direct text extraction from text layer
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .filter((str: string) => str.trim().length > 0);

      if (pageStrings.length > 0) {
        textParts.push(pageStrings.join(' '));
      }
    }

    const extracted = textParts.join('\n\n').trim();

    // If native selectable text was found (>= 25 chars), return it immediately
    if (extracted && extracted.length >= 25) {
      return {
        text: extracted,
        pageCount: numPages,
        fileName,
        fileSizeBytes,
      };
    }

    // Scanned PDF fallback: render pages to canvas and perform OCR
    options.onOcrProgress?.({
      status: 'Scanned PDF detected. Initializing OCR fallback...',
      progress: 0.1,
    });

    const maxOcrPages = Math.min(numPages, 5); // Limit scanned PDF to first 5 pages to prevent browser crash
    const ocrParts: string[] = [];

    for (let i = 1; i <= maxOcrPages; i++) {
      if (options.signal?.aborted) {
        throw new Error('OCR extraction was cancelled.');
      }

      options.onOcrProgress?.({
        status: `Running OCR on page ${i} of ${maxOcrPages}...`,
        progress: 0.1 + (i / maxOcrPages) * 0.8,
      });

      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        if (typeof document !== 'undefined') {
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise;
            const pageText = await extractTextFromImage(canvas, {
              lang: options.ocrLang || 'eng',
              signal: options.signal,
            });
            if (pageText.trim()) {
              ocrParts.push(pageText.trim());
            }
          }
        }
      } catch (pageErr: any) {
        if (options.signal?.aborted) throw pageErr;
        // Continue to next page if one page fails
      }
    }

    const ocrResult = ocrParts.join('\n\n').trim();
    if (!ocrResult) {
      throw new Error(
        'No readable text could be extracted from this scanned PDF. Please upload a clearer copy or paste the text directly.'
      );
    }

    return {
      text: ocrResult,
      pageCount: numPages,
      fileName,
      fileSizeBytes,
      isOcrFallback: true,
    };
  }

  throw new Error('Unsupported file format. Please upload an image, PDF, or text file.');
}
