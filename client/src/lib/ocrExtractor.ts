/**
 * Lazy-loaded client-side OCR extraction using Tesseract.js.
 * Privacy invariant: OCR executes entirely within the browser client. Zero files are uploaded.
 */

export type OcrLanguage = 'eng' | 'hin' | 'kan';

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 1
}

export interface OcrOptions {
  lang?: OcrLanguage;
  onProgress?: (progress: OcrProgress) => void;
  signal?: AbortSignal;
}

/**
 * Recognizes text from an image source (File, Blob, or Canvas) using Tesseract.js.
 */
export async function extractTextFromImage(
  imageSource: File | Blob | HTMLCanvasElement,
  options: OcrOptions = {}
): Promise<string> {
  const lang = options.lang || 'eng';

  if (options.signal?.aborted) {
    throw new Error('OCR extraction was cancelled.');
  }

  // Lazy-load tesseract.js to maintain small initial bundle size
  const { createWorker } = await import('tesseract.js');

  if (options.signal?.aborted) {
    throw new Error('OCR extraction was cancelled.');
  }

  options.onProgress?.({ status: 'Loading OCR engine...', progress: 0.1 });

  let worker: any = null;
  const abortHandler = () => {
    if (worker) {
      worker.terminate().catch(() => {});
    }
  };

  if (options.signal) {
    options.signal.addEventListener('abort', abortHandler, { once: true });
  }

  try {
    worker = await createWorker(lang, 1, {
      logger: (m: any) => {
        if (options.onProgress && m) {
          options.onProgress({
            status: m.status ? formatOcrStatus(m.status) : 'Processing OCR...',
            progress: typeof m.progress === 'number' ? Math.min(1, Math.max(0, m.progress)) : 0.5,
          });
        }
      },
    });

    if (options.signal?.aborted) {
      throw new Error('OCR extraction was cancelled.');
    }

    options.onProgress?.({ status: 'Recognizing text...', progress: 0.6 });
    const result = await worker.recognize(imageSource);

    if (options.signal?.aborted) {
      throw new Error('OCR extraction was cancelled.');
    }

    const text = result?.data?.text?.trim() || '';
    options.onProgress?.({ status: 'OCR Complete', progress: 1 });
    return text;
  } catch (err: any) {
    if (options.signal?.aborted || err?.message?.includes('cancelled')) {
      throw new Error('OCR extraction was cancelled.');
    }
    throw new Error(`OCR extraction failed: ${err?.message || 'Unknown error during text recognition'}`);
  } finally {
    if (options.signal) {
      options.signal.removeEventListener('abort', abortHandler);
    }
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Ignore worker cleanup errors
      }
    }
  }
}

function formatOcrStatus(rawStatus: string): string {
  switch (rawStatus) {
    case 'loading tesseract core':
      return 'Loading OCR core...';
    case 'loading language traineddata':
      return 'Loading language dictionary...';
    case 'initializing api':
      return 'Initializing OCR API...';
    case 'recognizing text':
      return 'Recognizing text from image...';
    default:
      return rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
  }
}
