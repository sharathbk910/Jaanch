import { type VerificationStatus } from './schemas/index.js';

export interface WhatsAppShareOptions {
  status: VerificationStatus;
  publicId?: string;
  matchedIndicators?: string[];
  claimedOrg?: string;
  language?: 'en' | 'hi' | 'kn';
}

/**
 * Builds safe, confirmed-only WhatsApp advisory text.
 * INVARIANT: Zero student text or unredacted submissions are ever included.
 * Only verified record IDs, verified organization warning names, masked indicators,
 * and public portal links (1930, cybercrime.gov.in, jaanch.ai) are shared.
 */
export function formatWhatsAppShareText(options: WhatsAppShareOptions): string {
  const { status, publicId, matchedIndicators = [], claimedOrg, language = 'en' } = options;

  if (status === 'CONFIRMED_SCAM') {
    if (language === 'hi') {
      return `🚨 धोखाधड़ी चेतावनी [जाँच सत्यापन ${publicId || ''}]\n${claimedOrg ? `${claimedOrg} के नाम पर फर्जी प्रस्ताव` : 'यह प्रस्ताव'} जाँच मॉडरेटर द्वारा धोखाधड़ी के रूप में पुष्ट किया गया है।\n${matchedIndicators.length > 0 ? `संकेतक: ${matchedIndicators.join(', ')}\n` : ''}⚠️ कोई भी पंजीकरण शुल्क या सुरक्षा जमा राशि न दें।\nराष्ट्रीय साइबर हेल्पलाइन: 1930 / cybercrime.gov.in\nसत्यापित करें: https://jaanch.ai`;
    }
    if (language === 'kn') {
      return `🚨 ವಂಚನೆ ಎಚ್ಚರಿಕೆ [ಜಾಂಚ್ ಪರಿಶೀಲನೆ ${publicId || ''}]\n${claimedOrg ? `${claimedOrg} ಹೆಸರಿನಲ್ಲಿ ನಕಲಿ ಆಫರ್` : 'ಈ ಆಫರ್'} ಅನ್ನು ಜಾಂಚ್ ಮಾಡರೇಟರ್‌ಗಳು ವಂಚನೆ ಎಂದು ದೃಢಪಡಿಸಿದ್ದಾರೆ.\n${matchedIndicators.length > 0 ? `ಸೂಚಕಗಳು: ${matchedIndicators.join(', ')}\n` : ''}⚠️ ಯಾವುದೇ ನೋಂದಣಿ ಶುಲ್ಕ ಅಥವಾ ಠೇವಣಿ ಪಾವತಿಸಬೇಡಿ.\nರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಹೆಲ್ಪ್‌ಲೈನ್: 1930 / cybercrime.gov.in\nಪರಿಶೀಲಿಸಿ: https://jaanch.ai`;
    }
    return `🚨 SCAM ALERT [Jaanch Verification ${publicId || ''}]\nAn offer claiming to be from ${claimedOrg || 'this organization'} has been confirmed as fraudulent by Jaanch moderators.\n${matchedIndicators.length > 0 ? `Indicators: ${matchedIndicators.join(', ')}\n` : ''}⚠️ Never transfer registration fees, laptop deposits, or share OTPs.\nNational Cybercrime Helpline: 1930 / cybercrime.gov.in\nVerify any offer safely: https://jaanch.ai`;
  }

  if (status === 'HIGH_CONCERN') {
    if (language === 'hi') {
      return `⚠️ सुरक्षा सलाह [जाँच AI]\nएक छात्र नौकरी/इंटर्नशिप प्रस्ताव में उच्च जोखिम वाले संकेत मिले हैं (अनधिकृत शुल्क या क्रेडेंशियल मांगे गए)।\nहमेशा आधिकारिक पोर्टलों पर स्वतंत्र रूप से पुष्टि करें।\nहेल्पलाइन: 1930 / cybercrime.gov.in\nनिःशुल्क सत्यापन टूल: https://jaanch.ai`;
    }
    if (language === 'kn') {
      return `⚠️ ಸುರಕ್ಷತಾ ಸಲಹೆ [ಜಾಂಚ್ AI]\nವಿದ್ಯಾರ್ಥಿ ಉದ್ಯೋಗ/ಇಂಟರ್ನ್‌ಶಿಪ್ ಆಫರ್‌ನಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯದ ಸೂಚನೆಗಳು ಪತ್ತೆಯಾಗಿವೆ (ಅನಧಿಕೃತ ಶುಲ್ಕ ಅಥವಾ ವಿವರಗಳ ಬೇಡಿಕೆ).\nಯಾವಾಗಲೂ ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.\nಹೆಲ್ಪ್‌ಲೈನ್: 1930 / cybercrime.gov.in\nಉಚಿತ ಪರಿಶೀಲನಾ ಸಾಧನ: https://jaanch.ai`;
    }
    return `⚠️ SAFETY ADVISORY [Jaanch AI]\nA student job/internship offer was flagged with high concern (unauthorized payment/credentials demanded).\nAlways corroborate independently on official portals.\nHelpline: 1930 / cybercrime.gov.in\nFree verification tool: https://jaanch.ai`;
  }

  if (language === 'hi') {
    return `ℹ️ जाँच सत्यापन चेकलिस्ट\nजवाब देने से पहले हमेशा प्रस्तावों की पुष्टि करें:\n1. कॉर्पोरेट मामलों के मंत्रालय (mca.gov.in) पर कंपनी सत्यापित करें\n2. AICTE इंटर्नशिप पोर्टल (internship.aicte-india.org) जांचें\n3. वैध नियोक्ता कभी भर्ती शुल्क नहीं मांगते।\nहेल्पलाइन: 1930 / https://jaanch.ai`;
  }
  if (language === 'kn') {
    return `ℹ️ ಜಾಂಚ್ ಪರಿಶೀಲನಾ ಪರಿಶೀಲನಾಪಟ್ಟಿ\nಉತ್ತರಿಸುವ ಮೊದಲು ಯಾವಾಗಲೂ ಆಫರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ:\n1. ಕಾರ್ಪೊರೇಟ್ ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯದಲ್ಲಿ (mca.gov.in) ಕಂಪನಿ ಪರಿಶೀಲಿಸಿ\n2. AICTE ಇಂಟರ್ನ್‌ಶಿಪ್ ಪೋರ್ಟಲ್ (internship.aicte-india.org) ಪರಿಶೀಲಿಸಿ\n3. ಅಧಿಕೃತ ಸಂಸ್ಥೆಗಳು ಎಂದಿಗೂ ನೋಂದಣಿ ಶುಲ್ಕ ಕೇಳುವುದಿಲ್ಲ.\nಹೆಲ್ಪ್‌ಲೈನ್: 1930 / https://jaanch.ai`;
  }
  return `ℹ️ JAANCH VERIFICATION CHECKLIST\nAlways check offers before replying:\n1. Verify organization on Ministry of Corporate Affairs (mca.gov.in)\n2. Check AICTE Internship Portal (internship.aicte-india.org)\n3. Legitimate employers never charge recruitment fees.\nHelpline: 1930 / https://jaanch.ai`;
}

/**
 * Builds the WhatsApp intent URL: https://api.whatsapp.com/send?text=...
 */
export function buildWhatsAppShareUrl(options: WhatsAppShareOptions): string {
  const text = formatWhatsAppShareText(options);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
