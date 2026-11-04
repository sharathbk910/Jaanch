import React from 'react';
import { type VerificationStatus } from '@jaanch/shared';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { buildWhatsAppShareUrl } from '../../lib/whatsappShare.js';
import { Button } from '../ui/Button.js';

export interface WhatsAppShareButtonProps {
  status: VerificationStatus;
  publicId?: string;
  matchedIndicators?: string[];
  claimedOrg?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

/**
 * Accessible WhatsApp Share Button
 * Invariant: Shares strictly confirmed threat indicators or official safety checklists.
 * Zero student text or unredacted submissions are ever included in the share intent.
 */
export const WhatsAppShareButton: React.FC<WhatsAppShareButtonProps> = ({
  status,
  publicId,
  matchedIndicators,
  claimedOrg,
  variant = 'outline',
  size = 'sm',
  className = '',
  label,
}) => {
  const { currentLang, t } = useLanguage();

  const shareUrl = buildWhatsAppShareUrl({
    status,
    publicId,
    matchedIndicators,
    claimedOrg,
    language: currentLang,
  });

  const buttonText = label || t('results.shareWhatsApp') || 'Share Warning on WhatsApp';

  const handleShare = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={`w-full justify-center text-xs font-semibold ${className}`}
        aria-label={buttonText}
        title={t('results.shareWhatsAppDesc')}
      >
        <svg
          className="mr-1.5 h-3.5 w-3.5 fill-current flex-shrink-0"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.06-1.09-.068-.258-.083-.591-.219-1.026-.407-1.848-.801-3.05-2.658-3.143-2.78-.093-.122-.756-1.006-.756-1.92 0-.913.479-1.362.65-1.545.171-.183.374-.229.499-.229.125 0 .25.001.359.006.115.006.27-.044.422.321.157.377.534 1.306.581 1.402.047.096.078.209.016.333-.063.125-.094.203-.187.312-.093.109-.196.244-.28.328-.093.094-.19.196-.082.381.109.186.483.797 1.037 1.29.712.636 1.312.833 1.499.926.187.094.296.079.405-.047.109-.125.467-.544.592-.73.125-.187.25-.156.422-.094.171.062 1.09.514 1.277.608.187.093.312.14.359.219.046.078.046.452-.098.857zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.175L2 22l4.966-1.302A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.167c-1.637 0-3.15-.494-4.417-1.343l-.317-.213-2.943.772.786-2.87-.208-.332A8.136 8.136 0 013.833 12c0-4.503 3.664-8.167 8.167-8.167 4.503 0 8.167 3.664 8.167 8.167 0 4.503-3.664 8.167-8.167 8.167z" />
        </svg>
        <span>{buttonText}</span>
      </Button>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">
        {t('results.shareWhatsAppDesc')}
      </span>
    </div>
  );
};
