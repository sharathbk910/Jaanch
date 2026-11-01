import { redactText } from '../privacy/redact.js';

export interface BuildScamAlertOptions {
  language?: 'en' | 'hi' | 'kn';
  publicId: string;
  confirmedAt?: string;
  originalText?: string;
  includeExcerpt?: boolean;
  maxEncodedUrlLength?: number;
  jaanchUrl?: string;
}

export interface ScamAlertResult {
  headline: string;
  verificationLine: string;
  excerpt?: string;
  tips: string[];
  helpline: string;
  fullMessage: string;
  shareUrl: string;
  isTrimmed: boolean;
  trimmedReason?: string;
}

const CONTROL_AND_BIDI_REGEX =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Strips dangerous control and bidirectional override characters that could be used
 * for terminal/browser text spoofing or homograph injection.
 */
export function sanitizeShareText(text: string): string {
  return text.replace(CONTROL_AND_BIDI_REGEX, '');
}

interface LocalizedCopy {
  headline: string;
  verificationPrefix: string;
  confirmedOnPrefix: string;
  excerptHeader: string;
  tipsHeader: string;
  tips: string[];
  helplineLine: string;
  verifyLine: string;
  trimmedNotice: string;
}

const COPY: Record<'en' | 'hi' | 'kn', LocalizedCopy> = {
  en: {
    headline: '⚠️ SCAM ALERT: Verified Fraud Warning',
    verificationPrefix: 'Matched a moderator-confirmed scam record',
    confirmedOnPrefix: 'confirmed on',
    excerptHeader: 'Redacted excerpt of reported offer:',
    tipsHeader: 'Safety advisory for students:',
    tips: [
      '• Never transfer registration fees, laptop security deposits, or verification charges.',
      '• Never share OTPs, debit card numbers, or approve UPI collect requests.',
      '• Never install remote access applications (AnyDesk, TeamViewer, RustDesk) for interviews.',
      '• Verify all job and internship offers directly on official portals (MCA, NCS, AICTE, NSP).',
    ],
    helplineLine: 'National Cybercrime Helpline: 1930 | Report online: https://cybercrime.gov.in',
    verifyLine: 'Verify any student offer safely at: https://jaanch.ai',
    trimmedNotice: 'Excerpt trimmed to fit safe WhatsApp message length limits.',
  },
  hi: {
    headline: '⚠️ धोखाधड़ी चेतावनी: सत्यापित फर्जीवाड़ा सूचना',
    verificationPrefix: 'मॉडरेटर द्वारा पुष्ट धोखाधड़ी रिकॉर्ड',
    confirmedOnPrefix: 'पुष्टिकरण तिथि:',
    excerptHeader: 'रिपोर्ट किए गए संदेश का संशोधित अंश:',
    tipsHeader: 'छात्रों के लिए सुरक्षा सलाह:',
    tips: [
      '• पंजीकरण, लैपटॉप सुरक्षा जमा या दस्तावेज सत्यापन शुल्क कभी न दें।',
      '• ओटीपी, डेबिट कार्ड विवरण साझा न करें और यूपीआई कलेक्ट अनुरोध कभी स्वीकार न करें।',
      '• साक्षात्कार के लिए एनीडेस्क या टीमव्यूअर जैसे रिमोट एक्सेस ऐप कभी इंस्टॉल न करें।',
      '• सभी प्रस्तावों की सीधे आधिकारिक पोर्टलों (MCA, NCS, AICTE, NSP) पर पुष्टि करें।',
    ],
    helplineLine: 'राष्ट्रीय साइबर हेल्पलाइन: 1930 | ऑनलाइन रिपोर्ट: https://cybercrime.gov.in',
    verifyLine: 'किसी भी छात्र प्रस्ताव की सुरक्षित जाँच करें: https://jaanch.ai',
    trimmedNotice: 'व्हाट्सएप संदेश सीमा के अनुसार अंश को छोटा किया गया है।',
  },
  kn: {
    headline: '⚠️ ವಂಚನೆ ಎಚ್ಚರಿಕೆ: ಪರಿಶೀಲಿತ ವಂಚನೆ ಮಾಹಿತಿ',
    verificationPrefix: 'ಮಾಡರೇಟರ್ ದೃಢಪಡಿಸಿದ ವಂಚನೆ ದಾಖಲೆ',
    confirmedOnPrefix: 'ದೃಢೀಕರಿಸಿದ ದಿನಾಂಕ:',
    excerptHeader: 'ವರದಿ ಮಾಡಲಾದ ಆಫರ್‌ನ ಪರಿಷ್ಕೃತ ಸಾರಾಂಶ:',
    tipsHeader: 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸುರಕ್ಷತಾ ಸಲಹೆ:',
    tips: [
      '• ನೋಂದಣಿ, ಲ್ಯಾಪ್‌ಟಾಪ್ ಭದ್ರತಾ ಠೇವಣಿ ಅಥವಾ ಪರಿಶೀಲನಾ ಶುಲ್ಕವನ್ನು ಎಂದಿಗೂ ಪಾವತಿಸಬೇಡಿ.',
      '• ಒಟಿಪಿ, ಡೆಬಿಟ್ ಕಾರ್ಡ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ ಅಥವಾ ಯುಪಿಐ ಕಲೆಕ್ಟ್ ವಿನಂತಿಯನ್ನು ಅನುಮೋದಿಸಬೇಡಿ.',
      '• ಸಂದರ್ಶನಗಳಿಗಾಗಿ ಎನಿಡೆಸ್ಕ್ ಅಥವಾ ಟೀಮ್‌ವೀವರ್‌ನಂತಹ ರಿಮೋಟ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಸ್ಥಾಪಿಸಬೇಡಿ.',
      '• ಎಲ್ಲಾ ಆಫರ್‌ಗಳನ್ನು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ (MCA, NCS, AICTE, NSP) ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ.',
    ],
    helplineLine: 'ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಹೆಲ್ಪ್‌ಲೈನ್: 1930 | ಆನ್‌ಲೈನ್ ವರದಿ: https://cybercrime.gov.in',
    verifyLine: 'ಯಾವುದೇ ವಿದ್ಯಾರ್ಥಿ ಆಫರ್ ಅನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ: https://jaanch.ai',
    trimmedNotice: 'ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಮಿತಿಗೆ ತಕ್ಕಂತೆ ಸಾರಾಂಶವನ್ನು ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಲಾಗಿದೆ.',
  },
};

/**
 * Formats a date string into YYYY-MM-DD or standard readable format.
 */
function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

/**
 * Builds the deterministic WhatsApp alert text and shareable URL.
 */
export function buildScamAlert(options: BuildScamAlertOptions): ScamAlertResult {
  const {
    language = 'en',
    publicId,
    confirmedAt,
    originalText = '',
    includeExcerpt = true,
    maxEncodedUrlLength = 2000,
    jaanchUrl = 'https://jaanch.ai',
  } = options;

  const copy = COPY[language] || COPY.en;
  const cleanPublicId = sanitizeShareText(publicId.trim());
  const formattedDate = formatDate(confirmedAt);

  // 1. Verification Line
  let verificationLine = `${copy.verificationPrefix} [${cleanPublicId}]`;
  if (formattedDate) {
    verificationLine += `, ${copy.confirmedOnPrefix} ${formattedDate}`;
  }

  // 2. Redacted Excerpt Preparation (Max 300 chars, no raw PII)
  let excerpt = '';
  if (includeExcerpt && originalText.trim().length > 0) {
    const redacted = redactText(sanitizeShareText(originalText));
    excerpt = redacted.redactedText.trim();
    if (excerpt.length > 300) {
      excerpt = excerpt.slice(0, 297) + '...';
    }
  }

  // 3. Assemble message with length monitoring
  let activeTips = [...copy.tips];
  let isTrimmed = false;
  let trimmedReason: string | undefined = undefined;

  const composeMessage = (currentExcerpt: string, currentTips: string[]): string => {
    const sections: string[] = [copy.headline, '', verificationLine];

    if (includeExcerpt && currentExcerpt.length > 0) {
      sections.push('', copy.excerptHeader, `"${currentExcerpt}"`);
    }

    sections.push('', copy.tipsHeader);
    for (const tip of currentTips) {
      sections.push(tip);
    }

    sections.push('', copy.helplineLine);
    const verifyLink = jaanchUrl ? copy.verifyLine.replace('https://jaanch.ai', jaanchUrl) : copy.verifyLine;
    sections.push(verifyLink);

    return sections.join('\n');
  };

  const WA_ME_PREFIX = 'https://wa.me/?text=';
  let message = composeMessage(excerpt, activeTips);
  let encodedUrl = `${WA_ME_PREFIX}${encodeURIComponent(message)}`;

  // Trim excerpt first if URL exceeds maximum safe length
  if (encodedUrl.length > maxEncodedUrlLength && excerpt.length > 0) {
    isTrimmed = true;
    trimmedReason = copy.trimmedNotice;

    // Step-down excerpt length
    const stepDowns = [200, 100, 50, 0];
    for (const len of stepDowns) {
      const trimmedExcerpt = len > 0 ? excerpt.slice(0, len) + '...' : '';
      message = composeMessage(trimmedExcerpt, activeTips);
      encodedUrl = `${WA_ME_PREFIX}${encodeURIComponent(message)}`;
      if (encodedUrl.length <= maxEncodedUrlLength) {
        excerpt = trimmedExcerpt;
        break;
      }
    }
  }

  // If still oversized, reduce tips from 4 down to 3
  if (encodedUrl.length > maxEncodedUrlLength && activeTips.length > 3) {
    isTrimmed = true;
    trimmedReason = copy.trimmedNotice;
    activeTips = activeTips.slice(0, 3);
    message = composeMessage(excerpt, activeTips);
    encodedUrl = `${WA_ME_PREFIX}${encodeURIComponent(message)}`;
  }

  return {
    headline: copy.headline,
    verificationLine,
    excerpt: includeExcerpt && excerpt.length > 0 ? excerpt : undefined,
    tips: activeTips,
    helpline: copy.helplineLine,
    fullMessage: message,
    shareUrl: encodedUrl,
    isTrimmed,
    trimmedReason,
  };
}

