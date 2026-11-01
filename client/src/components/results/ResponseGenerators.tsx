import React, { useState } from 'react';
import { Copy, Check, Mail, MessageSquare, ShieldAlert, ShieldCheck } from 'lucide-react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

export interface ResponseGeneratorsProps {
  status: VerificationStatus;
  claimedOrg?: string;
  senderEmail?: string;
  domain?: string;
}

export function ResponseGenerators({
  status,
  claimedOrg = 'your organization',
  senderEmail,
  domain,
}: ResponseGeneratorsProps) {
  const { t, currentLang } = useLanguage();
  const language = currentLang;
  const [activeTab, setActiveTab] = useState<'safeReply' | 'challengeEmail'>(() => {
    // If high concern or confirmed scam, default to challenge email
    return status === 'HIGH_CONCERN' || status === 'CONFIRMED_SCAM' ? 'challengeEmail' : 'safeReply';
  });
  const [copiedSafeReply, setCopiedSafeReply] = useState(false);
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  const isHighConcern = status === 'HIGH_CONCERN' || status === 'CONFIRMED_SCAM';

  // Localized deterministic templates
  const safeReplyTemplates: Record<string, string> = {
    en: `Dear Hiring Team at ${claimedOrg},

Thank you for reaching out regarding this opportunity. To proceed with the application process, could you please provide:
1. The official job requisition link posted on your organization's official careers portal.
2. A formal confirmation sent from your verified corporate email address (matching ${claimedOrg}'s primary domain).

In line with standard safety guidelines, I do not transfer any security deposits, registration fees, or submit unredacted personal identification documents prior to formal verification.

Thank you for your time and understanding.

Best regards,
[Your Name]
[Contact Information]`,

    hi: `प्रिय भर्ती टीम (${claimedOrg}),

इस अवसर के संबंध में संपर्क करने के लिए धन्यवाद। आवेदन प्रक्रिया को आगे बढ़ाने के लिए, कृपया निम्नलिखित विवरण प्रदान करें:
1. आपकी संस्था के आधिकारिक करियर पोर्टल पर पोस्ट किया गया आधिकारिक जॉब रिक्विजिशन लिंक।
2. आपके सत्यापित कॉर्पोरेट ईमेल पते (${claimedOrg} के प्राथमिक डोमेन) से भेजा गया औपचारिक पुष्टि ईमेल।

मानक सुरक्षा दिशानिर्देशों के अनुसार, मैं औपचारिक सत्यापन से पहले कोई सुरक्षा जमा, पंजीकरण शुल्क या निजी पहचान दस्तावेज साझा नहीं करता/करती।

आपके समय और समझ के लिए धन्यवाद।

सादर,
[आपका नाम]
[संपर्क सूत्र]`,

    kn: `ಆತ್ಮೀಯ ನೇಮಕಾತಿ ತಂಡ (${claimedOrg}),

ಈ ಅವಕಾಶದ ಬಗ್ಗೆ ಸಂಪರ್ಕಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಲು, ದಯವಿಟ್ಟು ಈ ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಒದಗಿಸಿ:
1. ನಿಮ್ಮ ಸಂಸ್ಥೆಯ ಅಧಿಕೃತ ಕೆರಿಯರ್ ಪೋರ್ಟಲ್‌ನಲ್ಲಿರುವ ಅಧಿಕೃತ ಉದ್ಯೋಗ ಲಿಂಕ್.
2. ನಿಮ್ಮ ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಪೊರೇಟ್ ಇಮೇಲ್ ವಿಳಾಸದಿಂದ (${claimedOrg} ಪ್ರಾಥಮಿಕ ಡೊಮೇನ್) ಕಳುಹಿಸಲಾದ ಔಪಚಾರಿಕ ದೃಢೀಕರಣ.

ಪ್ರಮಾಣಿತ ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳ ಪ್ರಕಾರ, ಅಧಿಕೃತ ಪರಿಶೀಲನೆಗೆ ಮುಂಚಿತವಾಗಿ ನಾನು ಯಾವುದೇ ಭದ್ರತಾ ಠೇವಣಿ, ನೋಂದಣಿ ಶುಲ್ಕ ಅಥವಾ ವೈಯಕ್ತಿಕ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.

ಧನ್ಯವಾದಗಳೊಂದಿಗೆ,
[ನಿಮ್ಮ ಹೆಸರು]
[ಸಂಪರ್ಕ ಮಾಹಿತಿ]`,
  };

  const challengeEmailTemplates: Record<string, string> = {
    en: `Subject: Verification Inquiry regarding Opportunity Reference – ${claimedOrg}

Dear Human Resources / Recruitment Team,

I am writing regarding the recent communication I received regarding a job or internship opportunity representing ${claimedOrg}${senderEmail ? ` from ${senderEmail}` : ''}.

As required by my academic institution's placement cell verification protocol, I need to corroborate the authentic enterprise credentials of all prospective opportunities before taking any further steps:

1. Corporate Identification: Please share the Ministry of Corporate Affairs (MCA) Corporate Identification Number (CIN) or official AICTE/NCS post reference number.
2. Formal Offer Verification: Please confirm this opening through an official corporate email domain (matching ${claimedOrg}'s primary website domain) or direct portal verification link.
3. Fee Policy Attestation: Kindly confirm that this opportunity involves zero upfront deposits, training charges, or processing fees.

Thank you for assisting in maintaining transparent student recruitment standards.

Sincerely,
[Your Full Name]
[College / University Name]
[Roll Number / Degree / Branch]`,

    hi: `विषय: अवसर संदर्भ सत्यापन पूछताछ – ${claimedOrg}

प्रिय मानव संसाधन / भर्ती दल,

मैं ${claimedOrg} के नाम से प्राप्त नौकरी या इंटर्नशिप के संदर्भ में लिख रहा/रही हूँ${senderEmail ? ` (${senderEmail})` : ''}।

मेरे शैक्षणिक संस्थान के प्लेसमेंट सेल सत्यापन नियमों के अनुसार, आगे की प्रक्रिया से पहले अवसर के प्रमाणिक कॉर्पोरेट क्रेडेंशियल की पुष्टि आवश्यक है:

1. कॉर्पोरेट पहचान: कृपया कॉर्पोरेट कार्य मंत्रालय (MCA) की कंपनी पहचान संख्या (CIN) या AICTE/NCS आधिकारिक पद संदर्भ साझा करें।
2. औपचारिक सत्यापन: कृपया इस अवसर की पुष्टि आधिकारिक कॉर्पोरेट डोमेन ईमेल या करियर पोर्टल लिंक के माध्यम से करें।
3. शून्य शुल्क नीति: कृपया पुष्टि करें कि इस अवसर में कोई अग्रिम प्रशिक्षण शुल्क, लैपटॉप जमा या पंजीकरण राशि शामिल नहीं है।

छात्र भर्ती सुरक्षा में सहयोग के लिए धन्यवाद।

भवदीय,
[आपका पूरा नाम]
[कॉलेज / विश्वविद्यालय का नाम]
[रोल नंबर / शाखा]`,

    kn: `ವಿಷಯ: ಅವಕಾಶದ ಉಲ್ಲೇಖ ಮತ್ತು ಅಧಿಕೃತ ಪರಿಶೀಲನಾ ವಿಚಾರಣೆ – ${claimedOrg}

ಆತ್ಮೀಯ ಮಾನವ ಸಂಪನ್ಮೂಲ / ನೇಮಕಾತಿ ತಂಡ,

${claimedOrg} ಹೆಸರಿನಲ್ಲಿ ಸ್ವೀಕರಿಸಲಾದ ಉದ್ಯೋಗ ಅಥವಾ ಇಂಟರ್ನ್‌ಶಿಪ್ ಅವಕಾಶದ ಕುರಿತು ನಾನು ಬರೆಯುತ್ತಿದ್ದೇನೆ${senderEmail ? ` (${senderEmail})` : ''}.

ನನ್ನ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ಪ್ಲೇಸ್‌ಮೆಂಟ್ ಸೆಲ್‌ನ ಸುರಕ್ಷತಾ ನಿಯಮಗಳ ಪ್ರಕಾರ, ಮುಂದಿನ ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಈ ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಬೇಕಾಗಿದೆ:

1. ಕಾರ್ಪೊರೇಟ್ ಗುರುತು: ದಯವಿಟ್ಟು ಕಾರ್ಪೊರೇಟ್ ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯದ (MCA) ಕಂಪನಿ ಗುರುತಿನ ಸಂಖ್ಯೆ (CIN) ಅಥವಾ AICTE/NCS ಅಧಿಕೃತ ಉಲ್ಲೇಖವನ್ನು ಒದಗಿಸಿ.
2. ಔಪಚಾರಿಕ ದೃಢೀಕರಣ: ದಯವಿಟ್ಟು ಈ ಹುದ್ದೆಯನ್ನು ಅಧಿಕೃತ ಕಾರ್ಪೊರೇಟ್ ಇಮೇಲ್ ಅಥವಾ ಅಧಿಕೃತ ಕೆರಿಯರ್ ಪೋರ್ಟಲ್ ಮೂಲಕ ಖಚಿತಪಡಿಸಿ.
3. ಶೂನ್ಯ ಶುಲ್ಕ ದೃಢೀಕರಣ: ಈ ಅವಕಾಶದಲ್ಲಿ ಯಾವುದೇ ತರಬೇತಿ ಶುಲ್ಕ, ಲ್ಯಾಪ್ಟಾಪ್ ಠೇವಣಿ ಅಥವಾ ನೋಂದಣಿ ಶುಲ್ಕವಿಲ್ಲ ಎಂದು ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಿ.

ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತೆಗೆ ಸಹಕರಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.

ವಿಧೇಯಪೂರ್ವಕವಾಗಿ,
[ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು]
[ಕಾಲೇಜು / ವಿಶ್ವವಿದ್ಯಾಲಯದ ಹೆಸರು]
[ರೋಲ್ ಸಂಖ್ಯೆ / ವಿಭಾಗ]`,
  };

  const currentSafeReply = safeReplyTemplates[language] || safeReplyTemplates.en;
  const currentChallengeEmail = challengeEmailTemplates[language] || challengeEmailTemplates.en;

  const handleCopySafeReply = async () => {
    try {
      await navigator.clipboard.writeText(currentSafeReply);
      setCopiedSafeReply(true);
      setTimeout(() => setCopiedSafeReply(false), 2500);
    } catch {
      // Graceful fallback
    }
  };

  const handleCopyChallengeEmail = async () => {
    try {
      await navigator.clipboard.writeText(currentChallengeEmail);
      setCopiedChallenge(true);
      setTimeout(() => setCopiedChallenge(false), 2500);
    } catch {
      // Graceful fallback
    }
  };

  return (
    <section
      id="response-generators"
      className="p-5 sm:p-6 bg-surface border border-border rounded-card space-y-4"
    >
      <div>
        <div className="flex items-center justify-between pb-1">
          <span className="font-mono text-[11px] text-muted-foreground uppercase font-medium">
            COMMUNICATION UTILITIES
          </span>
          <span className="font-mono text-[11px] text-muted-foreground uppercase">
            {language.toUpperCase()}
          </span>
        </div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
          {t('results.responseGeneratorsTitle')}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {t('results.responseGeneratorsSubtitle')}
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex p-1 bg-background border border-border rounded-chip gap-1 text-xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab('challengeEmail')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-chip font-medium transition-all ${
            activeTab === 'challengeEmail'
              ? 'bg-foreground text-background font-semibold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail size={13} />
          <span>{t('results.challengeEmailTitle')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('safeReply')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-chip font-medium transition-all ${
            activeTab === 'safeReply'
              ? 'bg-foreground text-background font-semibold shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare size={13} />
          <span>{t('results.safeReplyTitle')}</span>
          {isHighConcern && (
            <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-status-high-concern-bg text-status-high-concern-fg">
              Hidden
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Challenge Email */}
      {activeTab === 'challengeEmail' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t('results.challengeEmailDesc')}
            </span>
            <button
              type="button"
              onClick={handleCopyChallengeEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-chip text-xs font-semibold text-foreground hover:border-foreground/50 transition-colors"
            >
              {copiedChallenge ? (
                <>
                  <Check size={13} className="text-status-genuine-fg" />
                  <span>{t('results.copiedNotice')}</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>{t('results.copyTemplateBtn')}</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-background border border-border rounded-card text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap select-all">
            {currentChallengeEmail}
          </pre>
        </div>
      )}

      {/* Tab 2: Safe Reply */}
      {activeTab === 'safeReply' && (
        <div className="space-y-3">
          {isHighConcern ? (
            <div
              role="alert"
              className="p-4 bg-status-high-concern-bg border border-status-high-concern-border rounded-card text-xs text-status-high-concern-fg space-y-2"
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                <ShieldAlert size={16} />
                <span>SAFE REPLY DISABLED FOR HIGH RISK OFFERS</span>
              </div>
              <p className="leading-relaxed font-medium">
                {t('results.safeReplyDisabled')}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Polite response asking for official careers link and corporate domain.
                </span>
                <button
                  type="button"
                  onClick={handleCopySafeReply}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-chip text-xs font-semibold text-foreground hover:border-foreground/50 transition-colors"
                >
                  {copiedSafeReply ? (
                    <>
                      <Check size={13} className="text-status-genuine-fg" />
                      <span>{t('results.copiedNotice')}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{t('results.copyTemplateBtn')}</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-background border border-border rounded-card text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap select-all">
                {currentSafeReply}
              </pre>
            </>
          )}
        </div>
      )}
    </section>
  );
}
