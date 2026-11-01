import { describe, it, expect, vi } from 'vitest';
import {
  extractTextFromFile,
  validateFile,
  MAX_FILE_SIZE_BYTES,
} from '../lib/pdfExtractor.js';
import * as ocrExtractor from '../lib/ocrExtractor.js';
import { redactText } from '@jaanch/shared';

describe('Phase 6B – PDF & OCR Extraction Pipeline', () => {
  it('validates and rejects oversized files exceeding 5MB', () => {
    const oversizedBlob = new Blob([new Uint8Array(MAX_FILE_SIZE_BYTES + 1024)], {
      type: 'application/pdf',
    });
    const oversizedFile = new File([oversizedBlob], 'huge_document.pdf', {
      type: 'application/pdf',
    });

    expect(() => validateFile(oversizedFile)).toThrow(/exceeds the 5MB limit/i);
  });

  it('validates and rejects odd/unsupported file types', () => {
    const invalidFile = new File(['executable binary'], 'malicious.exe', {
      type: 'application/x-msdownload',
    });

    expect(() => validateFile(invalidFile)).toThrow(/Unsupported file format/i);

    const zipFile = new File(['zip archive'], 'archive.zip', {
      type: 'application/zip',
    });
    expect(() => validateFile(zipFile)).toThrow(/Unsupported file format/i);
  });

  it('extracts text from small real sample text file', async () => {
    const sampleText =
      'Congratulations! You have been selected for the TCS Python Developer Internship Program 2026. Official verification via careers.tcs.com.';
    const textFile = new File([sampleText], 'tcs_internship.txt', {
      type: 'text/plain',
    });

    const result = await extractTextFromFile(textFile);
    expect(result.text).toBe(sampleText);
    expect(result.fileName).toBe('tcs_internship.txt');
    expect(result.pageCount).toBe(1);
  });

  it('extracts text from real sample image using OCR module', async () => {
    const spy = vi
      .spyOn(ocrExtractor, 'extractTextFromImage')
      .mockResolvedValue('TCS INTERNSHIP SELECTION LETTER 2026');

    const imageFile = new File(['dummy-png-binary'], 'offer_screenshot.png', {
      type: 'image/png',
    });

    const onProgress = vi.fn();
    const result = await extractTextFromFile(imageFile, {
      ocrLang: 'eng',
      onOcrProgress: onProgress,
    });

    expect(spy).toHaveBeenCalledWith(imageFile, expect.objectContaining({ lang: 'eng' }));
    expect(result.text).toBe('TCS INTERNSHIP SELECTION LETTER 2026');
    expect(result.isImageOcr).toBe(true);

    spy.mockRestore();
  });

  it('verifies client-side PII redaction on extracted text before transmission', () => {
    const rawOffer =
      'Contact HR Priya Sharma at priya.hr@tcs-careers.org or WhatsApp +91 98765 43210. Send ₹3,500 deposit to hr.tcs@okaxis with Aadhaar 1234 5678 9012.';

    const redaction = redactText(rawOffer);

    console.log('\n--- REAL REDACTED TEXT (CLIENT-SIDE PREVIEW) ---');
    console.log(redaction.redactedText);
    console.log('--- REDACTION METRICS ---');
    console.log(`Masked items count: ${redaction.redactionCount}`);

    // Invariant: Phone, Aadhaar, UPI ID, and Email user part are redacted
    expect(redaction.redactedText).toContain('[PHONE]');
    expect(redaction.redactedText).toContain('[AADHAAR]');
    expect(redaction.redactedText).toContain('[UPI]');
    expect(redaction.redactedText).toContain('[EMAIL]@tcs-careers.org');
    expect(redaction.redactedText).not.toContain('98765 43210');
    expect(redaction.redactedText).not.toContain('1234 5678 9012');
    expect(redaction.redactionCount).toBe(4);
  });
});
