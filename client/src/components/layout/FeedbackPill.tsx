import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { useT } from '../../i18n/I18nContext.js';
import { apiClient } from '../../lib/apiClient.js';

export function FeedbackPill() {
  const { t } = useT();
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (rating: number) => {
    if (isSubmitting || submitted) return;
    setIsSubmitting(true);
    try {
      await apiClient.submitPageFeedback({
        page: location.pathname,
        rating,
      });
      setSubmitted(true);
    } catch {
      // Graceful fallback: set submitted locally even if network fails
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      aria-label="Page feedback"
      className="fixed bottom-5 right-5 z-40 select-none print:hidden"
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2 bg-pill text-surface rounded-pill shadow-lg text-xs">
        {submitted ? (
          <div className="flex items-center gap-1.5 text-xs text-surface font-medium animate-fadeIn">
            <Check size={14} className="text-accent" aria-hidden="true" />
            <span>{t('feedback.thanks', 'Thank you for your feedback!')}</span>
          </div>
        ) : (
          <>
            <MessageSquare size={13} className="text-muted shrink-0" aria-hidden="true" />
            <span className="font-medium text-[11px] text-surface">
              {t('feedback.pillQuestion', 'Was this helpful?')}
            </span>
            <div className="flex items-center gap-1 ml-1 border-l border-muted/40 pl-2">
              <button
                type="button"
                onClick={() => handleVote(5)}
                disabled={isSubmitting}
                className="p-1 hover:text-accent transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                aria-label={t('feedback.yes', 'Yes')}
              >
                <ThumbsUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => handleVote(1)}
                disabled={isSubmitting}
                className="p-1 hover:text-accent transition-colors rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                aria-label={t('feedback.no', 'No')}
              >
                <ThumbsDown size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
