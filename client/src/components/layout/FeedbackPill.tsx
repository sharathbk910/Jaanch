import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ThumbsDown, Check, X } from 'lucide-react';
import { useT } from '../../i18n/I18nContext.js';
import { apiClient } from '../../lib/apiClient.js';

export function FeedbackPill() {
  const { t } = useT();
  const location = useLocation();
  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (isTestEnv) return false;
    try {
      return (
        typeof window !== 'undefined' &&
        (Boolean(sessionStorage.getItem('jaanch_feedback_dismissed')) ||
         Boolean(localStorage.getItem('jaanch_feedback_submitted')))
      );
    } catch {
      return false;
    }
  });
  const [isVisible, setIsVisible] = useState(() => isTestEnv);

  // For real users, wait 8 seconds before surfacing the feedback pill so they can explore first
  useEffect(() => {
    if (isTestEnv || dismissed) return;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isTestEnv, dismissed]);

  // Automatically dismiss the thank-you notice after 3 seconds
  useEffect(() => {
    if (submitted && !isTestEnv) {
      try {
        sessionStorage.setItem('jaanch_feedback_dismissed', 'true');
        localStorage.setItem('jaanch_feedback_submitted', 'true');
      } catch {
        // Ignore storage errors in private browsing
      }
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted, isTestEnv]);

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

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('jaanch_feedback_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  if (dismissed || !isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Page feedback"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 select-none print:hidden transition-all duration-300 max-w-[calc(100vw-2rem)] sm:max-w-md"
    >
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-3 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-surface text-foreground border-2 border-neo-border shadow-neo text-xs font-medium">
        {submitted ? (
          <div className="flex items-center gap-2 text-xs text-foreground font-bold animate-fadeIn">
            <Check size={14} className="text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="truncate">{t('feedback.thanks', 'Thank you for helping keep Indian students safe!')}</span>
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-1 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Close message"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <>
            <MessageSquare size={14} className="text-terracotta shrink-0" aria-hidden="true" />
            <span className="font-bold text-xs text-foreground truncate">
              {t('feedback.pillQuestion', 'Was this page helpful?')}
            </span>
            <div className="flex items-center gap-1.5 border-l-2 border-neo-border pl-2 sm:pl-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleVote(5)}
                disabled={isSubmitting}
                className="px-2 py-0.5 border border-neo-border bg-background hover:bg-neo-mint font-bold text-xs transition-colors rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex items-center gap-1 cursor-pointer"
                aria-label={t('feedback.yes', 'Yes')}
              >
                <ThumbsUp size={12} />
                <span>{t('feedback.yes', 'Yes')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleVote(1)}
                disabled={isSubmitting}
                className="px-2 py-0.5 border border-neo-border bg-background hover:bg-neo-pink font-bold text-xs transition-colors rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex items-center gap-1 cursor-pointer"
                aria-label={t('feedback.no', 'No')}
              >
                <ThumbsDown size={12} />
                <span>{t('feedback.no', 'No')}</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="ml-1 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                aria-label="Dismiss feedback"
              >
                <X size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
