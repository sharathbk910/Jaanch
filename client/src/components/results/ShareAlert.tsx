import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { type IntelMatch, buildScamAlert } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';

interface ShareAlertProps {
  intelMatch?: IntelMatch;
  originalText?: string;
  language?: 'en' | 'hi' | 'kn';
}

const UI_COPY = {
  en: {
    cardTitle: 'Share WhatsApp Scam Alert',
    triggerButton: 'Share on WhatsApp',
    triggerSub: 'Warn friends and student groups about this confirmed scam',
    modalTitle: 'Share Scam Warning on WhatsApp',
    modalNotice:
      'Review and edit the alert message below before opening WhatsApp. You choose the recipient or group inside WhatsApp and press send. Jaanch never automatically sends messages.',
    includeExcerpt: 'Include redacted message excerpt',
    editLabel: 'Alert message preview (editable):',
    openWhatsApp: 'Open WhatsApp',
    copyMessage: 'Copy Message',
    copied: 'Copied!',
    close: 'Close',
    chars: 'characters',
    trimmedNotice: 'Notice: Message was trimmed to fit safe WhatsApp message limits.',
    userPressSendNotice: 'Important: You must tap send inside WhatsApp. No automated messages are dispatched.',
  },
  hi: {
    cardTitle: 'व्हाट्सएप पर धोखाधड़ी चेतावनी साझा करें',
    triggerButton: 'व्हाट्सएप पर साझा करें',
    triggerSub: 'इस पुष्ट धोखाधड़ी के बारे में दोस्तों और छात्र समूहों को सचेत करें',
    modalTitle: 'व्हाट्सएप पर धोखाधड़ी चेतावनी साझा करें',
    modalNotice:
      'व्हाट्सएप खोलने से पहले नीचे दिए गए संदेश की समीक्षा करें और संपादित करें। आप व्हाट्सएप में प्राप्तकर्ता या समूह चुनते हैं और स्वयं भेजते हैं। जाँच कभी भी स्वचालित रूप से संदेश नहीं भेजता है।',
    includeExcerpt: 'संशोधित संदेश का अंश शामिल करें',
    editLabel: 'चेतावनी संदेश पूर्वावलोकन (संपादनीय):',
    openWhatsApp: 'व्हाट्सएप खोलें',
    copyMessage: 'संदेश कॉपी करें',
    copied: 'कॉपी हो गया!',
    close: 'बंद करें',
    chars: 'अक्षर',
    trimmedNotice: 'सूचना: व्हाट्सएप संदेश सीमा के अनुसार अंश को छोटा किया गया है।',
    userPressSendNotice: 'महत्वपूर्ण: आपको व्हाट्सएप में स्वयं सेंड बटन दबाना होगा। कोई स्वचालित संदेश नहीं भेजा जाता है।',
  },
  kn: {
    cardTitle: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವಂಚನೆ ಎಚ್ಚರಿಕೆ ಹಂಚಿಕೊಳ್ಳಿ',
    triggerButton: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    triggerSub: 'ಈ ದೃಢಪಡಿಸಿದ ವಂಚನೆಯ ಬಗ್ಗೆ ಸ್ನೇಹಿತರು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ಗುಂಪುಗಳಿಗೆ ಎಚ್ಚರಿಕೆ ನೀಡಿ',
    modalTitle: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವಂಚನೆ ಎಚ್ಚರಿಕೆ ಹಂಚಿಕೊಳ್ಳಿ',
    modalNotice:
      'ವಾಟ್ಸಾಪ್ ತೆರೆಯುವ ಮೊದಲು ಕೆಳಗಿನ ಸಂದೇಶವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಂಪಾದಿಸಿ. ನೀವು ವಾಟ್ಸಾಪ್ ಒಳಗೆ ಸ್ವೀಕರಿಸುವವರನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಕಳುಹಿಸಬೇಕು. ಜಾಂಚ್ ಎಂದಿಗೂ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸುವುದಿಲ್ಲ.',
    includeExcerpt: 'ಪರಿಷ್ಕೃತ ಸಂದೇಶದ ಸಾರಾಂಶವನ್ನು ಸೇರಿಸಿ',
    editLabel: 'ಎಚ್ಚರಿಕೆ ಸಂದೇಶ ಮುನ್ನೋಟ (ಸಂಪಾದಿಸಬಹುದಾದ):',
    openWhatsApp: 'ವಾಟ್ಸಾಪ್ ತೆರೆಯಿರಿ',
    copyMessage: 'ಸಂದೇಶ ನಕಲಿಸಿ',
    copied: 'ನಕಲಿಸಲಾಗಿದೆ!',
    close: 'ಮುಚ್ಚಿ',
    chars: 'ಅಕ್ಷರಗಳು',
    trimmedNotice: 'ಸೂಚನೆ: ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಮಿತಿಗೆ ತಕ್ಕಂತೆ ಸಾರಾಂಶವನ್ನು ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸಲಾಗಿದೆ.',
    userPressSendNotice: 'ಪ್ರಮುಖ: ನೀವು ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ನೀವೇ ಕಳುಹಿಸುವ ಬಟನ್ ಒತ್ತಬೇಕು. ಯಾವುದೇ ಸ್ವಯಂಚಾಲಿತ ಸಂದೇಶಗಳನ್ನು ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ.',
  },
};

export function ShareAlert({ intelMatch, originalText = '', language: propLang }: ShareAlertProps) {
  const { currentLang } = useLanguage();
  const effectiveLang: 'en' | 'hi' | 'kn' = propLang || (currentLang as 'en' | 'hi' | 'kn') || 'en';
  const t = UI_COPY[effectiveLang] || UI_COPY.en;

  const [isOpen, setIsOpen] = useState(false);
  const [includeExcerpt, setIncludeExcerpt] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTrimmed, setIsTrimmed] = useState(false);

  // STRICT INVARIANT: Shown ONLY when intelMatch.status === confirmed
  if (!intelMatch || intelMatch.status !== 'confirmed') {
    return null;
  }

  // Generate deterministic alert message whenever options change or modal opens
  useEffect(() => {
    if (isOpen) {
      const alert = buildScamAlert({
        language: effectiveLang,
        publicId: intelMatch.publicId,
        confirmedAt: intelMatch.confirmedAt,
        originalText,
        includeExcerpt,
      });
      setCustomMessage(alert.fullMessage);
      setIsTrimmed(alert.isTrimmed);
    }
  }, [isOpen, includeExcerpt, effectiveLang, intelMatch.publicId, intelMatch.confirmedAt, originalText]);

  // Log optional audit event with NO message content
  const logShareAudit = async (action: 'share_opened' | 'copied') => {
    try {
      await fetch('/api/whatsapp/audit-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: intelMatch.publicId, action }),
      });
    } catch {
      // Fail-soft: audit failure never disrupts user flow
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      logShareAudit('copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const encodedUrl = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;

  return (
    <>
      {/* High-visibility Action Card in Sidebar / Audit Details */}
      <div className="p-4 rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-surface border border-border text-terracotta shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-primary">
              {t.cardTitle}
            </h4>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {t.triggerSub}
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-primary bg-surface border border-border hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-terracotta transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-terracotta" aria-hidden="true" />
              <span>{t.triggerButton}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview & Review Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-alert-modal-title"
        >
          <div className="relative w-full max-w-xl rounded-xl bg-surface border border-border shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-surface border border-border text-terracotta">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    id="share-alert-modal-title"
                    className="text-base font-semibold text-primary"
                  >
                    {t.modalTitle}
                  </h3>
                  <p className="text-xs font-mono text-terracotta mt-0.5">
                    {intelMatch.publicId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-primary p-1.5 rounded-md hover:bg-canvas transition-colors"
                aria-label={t.close}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Explanation & User Control Notice */}
            <div className="p-3.5 rounded-lg bg-canvas border border-border text-xs text-muted leading-relaxed">
              <p>{t.modalNotice}</p>
              <p className="mt-1 font-semibold text-primary">
                {t.userPressSendNotice}
              </p>
            </div>

            {/* Excerpt Toggle */}
            {originalText.trim().length > 0 && (
              <label className="flex items-center gap-2.5 text-xs text-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeExcerpt}
                  onChange={(e) => setIncludeExcerpt(e.target.checked)}
                  className="rounded border-border text-terracotta focus:ring-terracotta h-4 w-4"
                />
                <span>{t.includeExcerpt}</span>
              </label>
            )}

            {/* Trimming Notice */}
            {isTrimmed && (
              <div className="p-3 rounded-md bg-canvas border border-border text-xs text-terracotta flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.trimmedNotice}</span>
              </div>
            )}

            {/* Editable Textarea for Review */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label
                  htmlFor="whatsapp-alert-text"
                  className="font-semibold text-primary"
                >
                  {t.editLabel}
                </label>
                <span className="font-mono text-muted text-[11px]">
                  {customMessage.length} {t.chars}
                </span>
              </div>
              <textarea
                id="whatsapp-alert-text"
                rows={8}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-3 rounded-lg bg-canvas border border-border text-body font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-terracotta resize-y"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold text-body bg-surface border border-border hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-terracotta transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-terracotta" aria-hidden="true" />
                    <span>{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.copyMessage}</span>
                  </>
                )}
              </button>

              <a
                href={encodedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logShareAudit('share_opened')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-semibold text-canvas bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-terracotta transition-opacity shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.openWhatsApp}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
