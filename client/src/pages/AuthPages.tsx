import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Key,
  Shield,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Globe,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.js';
import { useLanguage } from '../i18n/LanguageContext.js';
import { apiClient } from '../lib/apiClient.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { SEOHead } from '../components/seo/SEOHead.js';

/* -------------------------------------------------------------------------- */
/*                                 LOGIN PAGE                                 */
/* -------------------------------------------------------------------------- */

export function LoginPage() {
  const { user, signInWithPassword, signInWithGoogle, isLoading: authLoading } = useAuth();
  const { dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const rawFrom = (location.state as any)?.from?.pathname || '/';
  const from = (rawFrom === '/login' || rawFrom === '/signup' || rawFrom === '/logout') ? '/' : rawFrom;

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message || 'Failed to sign in. Please verify your credentials.');
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const { error: googleError } = await signInWithGoogle(from);
      if (googleError) {
        setError(googleError.message || 'Google sign-in failed.');
      }
    } catch {
      setError('Failed to initiate Google sign-in.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 sm:py-16">
      <SEOHead
        canonicalPath="/login"
        title="Sign In | Jaanch AI"
        description="Sign in to your Jaanch account to access saved offer audits and verification history."
      />
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-terracotta mb-3">
          <Lock className="w-5 h-5" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          {t.auth.signInTitle}
        </h1>
        <p className="text-xs text-body mt-1">
          Access your saved verification history and checklists.
        </p>
      </div>

      <Card padding="lg">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 mb-4 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-primary mb-1">
              {t.auth.emailLabel}
            </label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu.in"
              required
              className="text-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="login-password" className="block text-xs font-semibold text-primary">
                {t.auth.passwordLabel}
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-terracotta hover:underline"
              >
                {t.auth.forgotPasswordLink}
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="text-xs"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full justify-center text-xs mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Signing In...</span>
              </span>
            ) : (
              <span>{t.auth.signInBtn}</span>
            )}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative px-2 bg-surface text-[11px] text-muted uppercase font-mono">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleGoogleSignIn}
          className="w-full justify-center text-xs"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t.auth.googleBtn}</span>
        </Button>

        <div className="mt-6 text-center text-xs text-muted space-y-3">
          <div>
            <Link
              to="/signup"
              state={location.state}
              className="text-primary hover:text-terracotta underline focus:outline-none"
            >
              {t.auth.noAccount}
            </Link>
          </div>
          <div className="pt-2 border-t border-border/60">
            <Link
              to="/analyze"
              className="text-xs text-muted hover:text-primary font-medium inline-flex items-center gap-1 underline"
            >
              <span>{t.auth.continueAsGuest}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </Card>

      <p className="text-[11px] text-muted text-center mt-6 leading-relaxed">
        {t.auth.guestNotice}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SIGNUP PAGE                                 */
/* -------------------------------------------------------------------------- */

export function SignupPage() {
  const { user, signUp, signInWithGoogle, isLoading: authLoading } = useAuth();
  const { dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = (location.state as any)?.from?.pathname || '/';
  const from = (rawFrom === '/login' || rawFrom === '/signup' || rawFrom === '/logout') ? '/' : rawFrom;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName.trim() || undefined,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account.');
      } else if (!signUpData?.session) {
        // Confirmation email is required before a session exists
        setConfirmationPending(true);
      } else {
        // Immediate session established (auto-login)
        setSuccessNotice('Account created successfully! Signing you in...');
      }
    } catch {
      setError('An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const { error: googleError } = await signInWithGoogle(from);
      if (googleError) {
        setError(googleError.message || 'Google sign-in failed.');
      }
    } catch {
      setError('Failed to initiate Google sign-in.');
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 sm:py-16">
      <SEOHead
        canonicalPath="/signup"
        title="Create Free Account | Jaanch AI"
        description="Create a free Jaanch account to save and track your internship and job offer audits."
      />
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-terracotta mb-3">
          <Shield className="w-5 h-5" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          {t.auth.signUpTitle}
        </h1>
        <p className="text-xs text-body mt-1">
          Create an account to securely save and review past offer audits.
        </p>
      </div>

      <Card padding="lg">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 mb-4 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div
            role="status"
            className="flex items-start gap-2 p-3 mb-4 rounded-md bg-surface border border-primary text-xs text-primary font-medium"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{successNotice}</span>
          </div>
        )}

        {confirmationPending ? (
          <div className="space-y-4 text-center py-2" role="status">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2">
              <Mail className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground">
              {t.auth.verifyEmailTitle}
            </h2>
            <p className="text-xs text-muted leading-relaxed">
              We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Please check your inbox and click the link to confirm your account, then sign in.
            </p>
            <div className="pt-3 space-y-2">
              <Link
                to="/login"
                className="inline-block w-full py-2 px-4 rounded-md bg-btn text-surface text-xs font-bold hover:bg-btn-hover transition-colors"
              >
                {t.auth.signInBtn}
              </Link>
              <Link
                to="/"
                className="inline-block text-xs text-muted hover:text-foreground font-medium underline"
              >
                {t.auth.continueAsGuest} &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-xs font-semibold text-primary mb-1">
              Full Name (Optional)
            </label>
            <Input
              id="signup-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="text-xs"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold text-primary mb-1">
              {t.auth.emailLabel} <span className="text-terracotta">*</span>
            </label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu.in"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold text-primary mb-1">
              {t.auth.passwordLabel} <span className="text-terracotta">*</span>
            </label>
            <Input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-primary mb-1">
              Confirm Password <span className="text-terracotta">*</span>
            </label>
            <Input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              className="text-xs"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full justify-center text-xs mt-2"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <span>{t.auth.signUpBtn}</span>
            )}
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative px-2 bg-surface text-[11px] text-muted uppercase font-mono">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleGoogleSignIn}
          className="w-full justify-center text-xs"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t.auth.googleBtn}</span>
        </Button>

        <div className="mt-6 text-center text-xs text-muted space-y-3">
          <div>
            <Link
              to="/login"
              state={location.state}
              className="text-primary hover:text-terracotta underline focus:outline-none"
            >
              {t.auth.haveAccount}
            </Link>
          </div>
          <div className="pt-2 border-t border-border/60">
            <Link
              to="/analyze"
              className="text-xs text-muted hover:text-primary font-medium inline-flex items-center gap-1 underline"
            >
              <span>{t.auth.continueAsGuest}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
          </>
        )}
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                HISTORY PAGE                                */
/* -------------------------------------------------------------------------- */

const DOMAIN_FILTERS = [
  { value: '', label: 'All Categories' },
  { value: 'job', label: 'Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'competition', label: 'Competition' },
  { value: 'general_message', label: 'General Message' },
  { value: 'other', label: 'Other' },
];

export function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();

  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async (pageNum: number, domainFilter: string) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.getHistory({
        page: pageNum,
        limit: 10,
        domain: domainFilter || undefined,
      });

      setItems(res?.items || []);
      setTotal(res?.pagination?.total || 0);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load submission history.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory(page, selectedDomain);
    } else {
      setIsLoading(false);
    }
  }, [user, page, selectedDomain]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.history.deleteConfirm)) {
      return;
    }

    setDeletingId(id);
    try {
      await apiClient.deleteHistory(id);
      // Remove item locally or refresh
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete audit entry.');
    } finally {
      setDeletingId(null);
    }
  };

  // 1. Unauthenticated View
  if (!user && !authLoading) {
    return (
      <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <SEOHead
          noIndex={true}
          title="Verification History | Jaanch AI"
          description="Access your saved verification history and checklists."
        />
        <h1 className="font-serif text-3xl font-bold text-primary tracking-tight mb-2">
          {t.history.title}
        </h1>
        <p className="text-sm text-body mb-8 max-w-xl">
          {t.history.subtitle}
        </p>

        <Card padding="lg" className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border text-terracotta mb-4">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-xl font-bold text-primary mb-2">
            {t.history.unauthTitle}
          </h2>
          <p className="text-xs text-body max-w-md mx-auto mb-6 leading-relaxed">
            {t.history.unauthDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate('/login', { state: { from: { pathname: '/history' } } })}
            >
              {t.navigation.login || 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/signup')}
            >
              Create Account
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/analyze')}
            >
              Verify Offer as Guest
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Authenticated View
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEOHead
        noIndex={true}
        title="Saved Verification History | Jaanch AI"
        description="Review your past verified offers and audit reports."
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            {t.history.title}
          </h1>
          <p className="text-xs text-body mt-1">
            {t.history.subtitle}
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate('/analyze')}
          className="self-start sm:self-auto shrink-0"
        >
          {t.history.checkOfferBtn}
        </Button>
      </div>

      {/* Domain Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6" role="toolbar" aria-label="Domain filters">
        {DOMAIN_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setSelectedDomain(f.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedDomain === f.value
                ? 'bg-primary text-background border-primary'
                : 'bg-surface text-body border-border hover:border-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 mb-6 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <Card padding="lg" className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-terracotta animate-spin mx-auto mb-3" aria-hidden="true" />
          <p className="text-xs text-muted font-mono">LOADING AUDIT RECORDS...</p>
        </Card>
      ) : items.length === 0 ? (
        /* Empty State */
        <Card padding="lg" className="text-center py-16">
          <Calendar className="w-10 h-10 text-muted mx-auto mb-3" aria-hidden="true" />
          <h3 className="font-serif text-lg font-bold text-primary mb-1">
            {t.history.emptyTitle}
          </h3>
          <p className="text-xs text-body max-w-sm mx-auto mb-6">
            {t.history.emptyDesc}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/analyze')}
          >
            {t.history.checkOfferBtn}
          </Button>
        </Card>
      ) : (
        /* Items List */
        <div className="space-y-4">
          {items.map((item) => {
            const statusConfig = getStatusBadge(item.status);
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown date';

            return (
              <Card key={item.id} padding="md" className="hover:border-terracotta/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider uppercase ${statusConfig.className}`}>
                        {statusConfig.label}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface border border-border text-muted uppercase">
                        {item.domain || 'other'}
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-xs text-body line-clamp-2 leading-relaxed">
                      {item.redacted_text || `Audit ID: ${item.id}`}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted font-mono">
                      <span>Channel: {item.channel || 'unknown'}</span>
                      {typeof item.confidence === 'number' && (
                        <span>• Confidence: {item.confidence}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/results/${item.id}`)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                      {t.history.viewAudit}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-terracotta hover:bg-terracotta/10 border-border"
                      aria-label={`Delete audit ${item.id}`}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                {t.history.prevPage}
              </Button>

              <span className="font-mono text-muted">
                Page {page} of {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                {t.history.nextPage}
                <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'LIKELY_GENUINE':
      return {
        label: 'LIKELY GENUINE',
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      };
    case 'HIGH_CONCERN':
      return {
        label: 'HIGH CONCERN',
        className: 'bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      };
    case 'CONFIRMED_SCAM':
      return {
        label: 'CONFIRMED SCAM',
        className: 'bg-red-950 text-red-200 border border-red-700',
      };
    case 'NEEDS_REVIEW':
    default:
      return {
        label: 'NEEDS REVIEW',
        className: 'bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      };
  }
}

/* -------------------------------------------------------------------------- */
/*                               SETTINGS PAGE                                */
/* -------------------------------------------------------------------------- */

export function SettingsPage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { currentLang, setLang, dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();

  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [isErasing, setIsErasing] = useState(false);
  const [eraseSuccess, setEraseSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEraseData = async () => {
    if (confirmDeleteText !== 'DELETE') {
      setError('Please type DELETE in capital letters to confirm.');
      return;
    }

    setError(null);
    setIsErasing(true);

    try {
      await apiClient.eraseAccountData();
      setEraseSuccess(t.settings.eraseSuccess);
      setConfirmDeleteText('');
      setTimeout(async () => {
        await signOut();
        navigate('/');
      }, 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to erase account data.');
      }
    } finally {
      setIsErasing(false);
    }
  };

  if (!user && !authLoading) {
    return (
      <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
        <Card padding="lg" className="py-12 max-w-md mx-auto">
          <User className="w-10 h-10 text-muted mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-serif text-xl font-bold text-primary mb-2">
            {t.history.unauthTitle || 'Sign In to Access Settings'}
          </h2>
          <p className="text-xs text-body mb-6">
            {t.history.unauthDesc || 'Account settings, data erasure controls, and persistent preferences require signing in.'}
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => navigate('/login', { state: { from: { pathname: '/settings' } } })}
          >
            {t.navigation.login || 'Sign In'}
          </Button>
        </Card>
      </div>
    );
  }

  const role =
    user?.app_metadata?.role ||
    user?.user_metadata?.role ||
    'user';

  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="font-mono text-xs text-muted block mb-1">
          {t.settings.eyebrow}
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
          {t.settings.title}
        </h1>
        <p className="text-xs text-body mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Profile Information */}
      <Card padding="md">
        <h2 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-terracotta" aria-hidden="true" />
          <span>{t.settings.profileTitle}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-mono text-muted block mb-0.5">EMAIL ADDRESS</span>
            <span className="font-medium text-primary">{user?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="font-mono text-muted block mb-0.5">ACCOUNT ROLE</span>
            <span className="font-mono px-2 py-0.5 rounded text-[11px] bg-surface border border-border uppercase">
              {role}
            </span>
          </div>
          <div>
            <span className="font-mono text-muted block mb-0.5">USER ID</span>
            <span className="font-mono text-muted truncate block">{user?.id || 'N/A'}</span>
          </div>
          <div>
            <span className="font-mono text-muted block mb-0.5">MEMBER SINCE</span>
            <span className="text-body">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Language Preferences */}
      <Card padding="md">
        <h2 className="font-serif text-lg font-bold text-primary mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-terracotta" aria-hidden="true" />
          <span>{t.settings.preferencesTitle}</span>
        </h2>

        <div className="max-w-xs">
          <label htmlFor="settings-language" className="block text-xs font-semibold text-primary mb-1.5">
            {t.settings.langSelectLabel}
          </label>
          <select
            id="settings-language"
            value={currentLang}
            onChange={(e) => setLang(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-primary focus:outline-none focus:ring-1 focus:ring-terracotta"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>
      </Card>

      {/* Danger Zone: Data Erasure */}
      <Card padding="md" className="border-terracotta/40">
        <h2 className="font-serif text-lg font-bold text-terracotta mb-2 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-terracotta" aria-hidden="true" />
          <span>{t.settings.dangerTitle}</span>
        </h2>
        <p className="text-xs text-body leading-relaxed mb-4 max-w-xl">
          {t.settings.dangerDesc}
        </p>

        {eraseSuccess && (
          <div
            role="status"
            className="flex items-start gap-2 p-3 mb-4 rounded-md bg-surface border border-primary text-xs text-primary font-medium"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{eraseSuccess}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 mb-4 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="max-w-md space-y-3 pt-2">
          <label htmlFor="erase-confirm-input" className="block text-xs font-mono text-muted">
            {t.settings.eraseConfirm}
          </label>
          <div className="flex items-center gap-3">
            <Input
              id="erase-confirm-input"
              type="text"
              value={confirmDeleteText}
              onChange={(e) => setConfirmDeleteText(e.target.value)}
              placeholder="DELETE"
              className="text-xs font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={confirmDeleteText !== 'DELETE' || isErasing}
              onClick={handleEraseData}
              className="text-xs shrink-0 text-terracotta border-terracotta hover:bg-terracotta/10"
            >
              {isErasing ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Erasing...</span>
                </span>
              ) : (
                <span>{t.settings.eraseBtn}</span>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            FORGOT PASSWORD PAGE                            */
/* -------------------------------------------------------------------------- */

export function ForgotPasswordPage() {
  const { resetPasswordForEmail, user } = useAuth();
  const { dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error: resetError } = await resetPasswordForEmail(email);
      if (resetError) {
        setError(resetError.message || 'Failed to send password reset link.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 sm:py-20">
      <Card padding="lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-terracotta mb-3">
            <Key className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary">
            {t.auth.forgotPasswordTitle}
          </h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            {t.auth.forgotPasswordSubtitle}
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-md bg-surface border border-primary/40 text-xs text-primary space-y-2">
              <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
              <p className="font-medium">Password reset link sent!</p>
              <p className="text-muted leading-relaxed">
                If an account exists for {email}, you will receive a secure password reset link shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block text-xs text-primary hover:text-terracotta underline font-medium"
            >
              {t.auth.backToLogin}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block text-xs font-semibold text-primary mb-1">
                {t.auth.emailLabel}
              </label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu.in"
                required
                className="text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              className="w-full justify-center text-xs mt-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Sending Link...</span>
                </span>
              ) : (
                <span>{t.auth.sendResetLinkBtn}</span>
              )}
            </Button>

            <div className="pt-2 text-center text-xs">
              <Link
                to="/login"
                className="text-primary hover:text-terracotta underline focus:outline-none"
              >
                {t.auth.backToLogin}
              </Link>
            </div>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-hairline text-center">
          <Link
            to="/analyze"
            className="text-xs text-muted hover:text-primary font-medium inline-flex items-center gap-1 underline"
          >
            <span>{t.auth.continueAsGuest}</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            RESET PASSWORD PAGE                             */
/* -------------------------------------------------------------------------- */

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError.message || 'Failed to update password.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/history', { replace: true });
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 sm:py-20">
      <Card padding="lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-terracotta mb-3">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary">
            {t.auth.resetPasswordTitle}
          </h1>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            {t.auth.resetPasswordSubtitle}
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-md bg-surface border border-primary text-xs text-primary text-center space-y-2">
            <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
            <p className="font-medium">Password updated successfully!</p>
            <p className="text-muted">Redirecting you to your account...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 p-3 rounded-md bg-surface border border-terracotta text-xs text-terracotta"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-primary mb-1">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="text-xs"
              />
              <span className="block text-[10px] text-muted mt-0.5">Minimum 8 characters</span>
            </div>

            <div>
              <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-primary mb-1">
                Confirm New Password
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              className="w-full justify-center text-xs mt-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Updating Password...</span>
                </span>
              ) : (
                <span>{t.auth.updatePasswordBtn}</span>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             VERIFY EMAIL PAGE                              */
/* -------------------------------------------------------------------------- */

export function VerifyEmailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { dictionary } = useLanguage();
  const t = dictionary;
  const navigate = useNavigate();
  const location = useLocation();

  const emailParam = new URLSearchParams(location.search).get('email') || (location.state as any)?.email;

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-12 sm:py-20 text-center">
      <Card padding="lg">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border text-terracotta mb-4">
          <Mail className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-primary mb-2">
          {t.auth.verifyEmailTitle}
        </h1>
        <p className="text-xs text-muted leading-relaxed mb-6">
          {emailParam ? (
            <>
              We sent a verification link to <strong className="text-foreground">{emailParam}</strong>. Please check your inbox and click the link to confirm your account.
            </>
          ) : (
            t.auth.verifyEmailSubtitle
          )}
        </p>
        <div className="space-y-3">
          <Link
            to="/login"
            className="inline-block w-full py-2 px-4 rounded-md bg-btn text-surface text-xs font-medium hover:bg-btn-hover"
          >
            {t.auth.signInBtn}
          </Link>
          <Link
            to="/analyze"
            className="inline-block text-xs text-muted hover:text-primary font-medium underline"
          >
            {t.auth.continueAsGuest} &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                LOGOUT PAGE                                 */
/* -------------------------------------------------------------------------- */

export function LogoutPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    signOut().finally(() => {
      navigate('/login', { replace: true });
    });
  }, [signOut, navigate]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
      <span className="text-xs text-muted font-mono uppercase">Signing Out...</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PROTECTED ROUTE                               */
/* -------------------------------------------------------------------------- */

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export const DashboardPage = HistoryPage;

