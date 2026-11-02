/** @vitest-environment jsdom */
import './setup.js';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  LoginPage,
  SignupPage,
  HistoryPage,
  SettingsPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  ProtectedRoute,
} from '../pages/AuthPages.js';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import { apiClient } from '../lib/apiClient.js';
import * as authContext from '../lib/AuthContext.js';

vi.mock('../lib/apiClient.js', () => ({
  apiClient: {
    getHistory: vi.fn(),
    deleteHistory: vi.fn(),
    eraseAccountData: vi.fn(),
  },
}));

function renderWithProviders(element: React.ReactElement, initialEntries = ['/']) {
  return render(
    <LanguageProvider defaultLang="en">
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={element} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/results/:id" element={<div data-testid="results-view">Results View</div>} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
}

function createMockAuth(overrides?: Partial<authContext.AuthContextType>): authContext.AuthContextType {
  return {
    user: null,
    session: null,
    isLoading: false,
    isModerator: false,
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updatePassword: vi.fn(),
    ...overrides,
  };
}

describe('Phase 6D – Auth UI & History (AuthPages.tsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginPage', () => {
    it('renders login form with email, password inputs, submit and Google buttons', () => {
      vi.spyOn(authContext, 'useAuth').mockReturnValue(createMockAuth());

      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('heading', { level: 1, name: /Sign In to Jaanch/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account\? Sign up/i)).toBeInTheDocument();
    });

    it('submits credentials and calls signInWithPassword', async () => {
      const user = userEvent.setup();
      const signInMock = vi.fn().mockResolvedValue({ error: null });

      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({ signInWithPassword: signInMock })
      );

      renderWithProviders(<LoginPage />);

      await user.type(screen.getByLabelText(/Email address/i), 'student@test.com');
      await user.type(screen.getByLabelText(/Password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

      expect(signInMock).toHaveBeenCalledWith({
        email: 'student@test.com',
        password: 'password123',
      });
    });

    it('displays error message when signInWithPassword fails', async () => {
      const user = userEvent.setup();
      const signInMock = vi.fn().mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      });

      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({ signInWithPassword: signInMock })
      );

      renderWithProviders(<LoginPage />);

      await user.type(screen.getByLabelText(/Email address/i), 'student@test.com');
      await user.type(screen.getByLabelText(/Password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/Invalid login credentials/i);
      });
    });
  });

  describe('SignupPage', () => {
    it('validates password mismatch and enforces minimum password length', async () => {
      const user = userEvent.setup();
      vi.spyOn(authContext, 'useAuth').mockReturnValue(createMockAuth());

      renderWithProviders(<SignupPage />);

      await user.type(screen.getByLabelText(/Email address/i), 'newstudent@test.com');
      await user.type(screen.getByLabelText(/^Password/i), '123'); // < 6 chars
      await user.type(screen.getByLabelText(/Confirm Password/i), '123');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/at least 6 characters long/i);

      // Password mismatch
      await user.clear(screen.getByLabelText(/^Password/i));
      await user.type(screen.getByLabelText(/^Password/i), 'password123');
      await user.clear(screen.getByLabelText(/Confirm Password/i));
      await user.type(screen.getByLabelText(/Confirm Password/i), 'mismatch456');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(screen.getByRole('alert')).toHaveTextContent(/Passwords do not match/i);
    });

    it('displays email verification pending notice and does not prematurely redirect when confirmation is required', async () => {
      const user = userEvent.setup();
      const signUpMock = vi.fn().mockResolvedValue({
        data: { user: { id: 'u_123', email: 'student@test.com' }, session: null },
        error: null,
      });

      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({ signUp: signUpMock })
      );

      renderWithProviders(<SignupPage />);

      await user.type(screen.getByLabelText(/Email address/i), 'student@test.com');
      await user.type(screen.getByLabelText(/^Password/i), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(signUpMock).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Verify Your Email/i })).toBeInTheDocument();
        expect(screen.getByText(/We sent a confirmation link to/i)).toBeInTheDocument();
        expect(screen.getByText('student@test.com')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /^Sign In$/i })).toBeInTheDocument();
      });
    });

    it('displays auto-login notice when session is immediately established', async () => {
      const user = userEvent.setup();
      const signUpMock = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'u_123', email: 'auto@test.com' },
          session: { access_token: 'fake_tok' },
        },
        error: null,
      });

      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({ signUp: signUpMock })
      );

      renderWithProviders(<SignupPage />);

      await user.type(screen.getByLabelText(/Email address/i), 'auto@test.com');
      await user.type(screen.getByLabelText(/^Password/i), 'password123');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /Create Account/i }));

      expect(signUpMock).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText(/Account created successfully! Signing you in.../i)).toBeInTheDocument();
      });
    });
  });

  describe('HistoryPage', () => {
    it('renders unauthenticated prompt when user is not signed in', () => {
      vi.spyOn(authContext, 'useAuth').mockReturnValue(createMockAuth());

      renderWithProviders(<HistoryPage />);

      expect(screen.getByText(/Sign in to access your saved audit history/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verify Offer as Guest/i })).toBeInTheDocument();
    });

    it('loads and displays saved audits with domain filters for authenticated user', async () => {
      const user = userEvent.setup();
      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({
          user: { id: 'user_123', email: 'student@example.com' } as any,
          session: {} as any,
        })
      );

      const mockHistory = {
        items: [
          {
            id: 'sub_1',
            domain: 'internship',
            channel: 'email',
            status: 'LIKELY_GENUINE',
            confidence: 85,
            redacted_text: 'TCS Internship Selection Offer 2026',
            created_at: new Date().toISOString(),
          },
          {
            id: 'sub_2',
            domain: 'job',
            channel: 'whatsapp',
            status: 'HIGH_CONCERN',
            confidence: 92,
            redacted_text: 'Laptop deposit fee demand via UPI',
            created_at: new Date().toISOString(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      vi.mocked(apiClient.getHistory).mockResolvedValue(mockHistory);

      renderWithProviders(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByText(/TCS Internship Selection Offer 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/Laptop deposit fee demand via UPI/i)).toBeInTheDocument();
        expect(screen.getByText(/LIKELY GENUINE/i)).toBeInTheDocument();
        expect(screen.getByText(/HIGH CONCERN/i)).toBeInTheDocument();
      });

      // Filter by domain
      await user.click(screen.getByRole('button', { name: /^Job$/i }));
      expect(apiClient.getHistory).toHaveBeenCalledWith(
        expect.objectContaining({ domain: 'job' })
      );
    });

    it('deletes a history entry upon confirmation', async () => {
      const user = userEvent.setup();
      window.confirm = vi.fn().mockReturnValue(true);

      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({
          user: { id: 'user_123', email: 'student@example.com' } as any,
          session: {} as any,
        })
      );

      vi.mocked(apiClient.getHistory).mockResolvedValue({
        items: [
          {
            id: 'sub_delete_target',
            domain: 'job',
            channel: 'sms',
            status: 'NEEDS_REVIEW',
            confidence: 60,
            redacted_text: 'Temporary audit item to delete',
            created_at: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      vi.mocked(apiClient.deleteHistory).mockResolvedValue({
        success: true,
        deletedId: 'sub_delete_target',
      });

      renderWithProviders(<HistoryPage />);

      await waitFor(() => {
        expect(screen.getByText(/Temporary audit item to delete/i)).toBeInTheDocument();
      });

      const deleteBtn = screen.getByLabelText(/Delete audit sub_delete_target/i);
      await user.click(deleteBtn);

      expect(window.confirm).toHaveBeenCalled();
      expect(apiClient.deleteHistory).toHaveBeenCalledWith('sub_delete_target');

      await waitFor(() => {
        expect(screen.queryByText(/Temporary audit item to delete/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('SettingsPage', () => {
    it('displays user profile, language select, and requires typing DELETE for account data erasure', async () => {
      const user = userEvent.setup();
      const signOutMock = vi.fn().mockResolvedValue(undefined);

      vi.spyOn(authContext, 'useAuth').mockReturnValue(
        createMockAuth({
          user: {
            id: 'usr_secure_999',
            email: 'verified_student@college.in',
            created_at: '2026-01-15T10:00:00Z',
            app_metadata: { role: 'user' },
          } as any,
          session: {} as any,
          signOut: signOutMock,
        })
      );

      vi.mocked(apiClient.eraseAccountData).mockResolvedValue({
        success: true,
        message: 'All user data and history successfully erased.',
      });

      renderWithProviders(<SettingsPage />);

      expect(screen.getByText('verified_student@college.in')).toBeInTheDocument();
      expect(screen.getByText('usr_secure_999')).toBeInTheDocument();

      const eraseInput = screen.getByPlaceholderText('DELETE');
      const eraseBtn = screen.getByRole('button', { name: /Delete All My Data/i });

      // Initially disabled
      expect(eraseBtn).toBeDisabled();

      // Wrong text
      await user.type(eraseInput, 'delete'); // lowercase
      expect(eraseBtn).toBeDisabled();

      // Correct uppercase DELETE
      await user.clear(eraseInput);
      await user.type(eraseInput, 'DELETE');
      expect(eraseBtn).toBeEnabled();

      await user.click(eraseBtn);

      await waitFor(() => {
        expect(apiClient.eraseAccountData).toHaveBeenCalled();
        expect(screen.getByText(/All your account submissions and history have been permanently erased/i)).toBeInTheDocument();
      });
    });
  });

  describe('ForgotPasswordPage', () => {
    it('renders password reset request form and submits email successfully', async () => {
      const user = userEvent.setup();
      const mockReset = vi.fn().mockResolvedValue({ error: null });

      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isModerator: false,
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: mockReset,
        updatePassword: vi.fn(),
      });

      renderWithProviders(<ForgotPasswordPage />);

      expect(screen.getByRole('heading', { level: 1, name: /Reset Your Password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Continue as Guest/i })).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/Email address/i);
      await user.type(emailInput, 'student@campus.edu.in');

      const submitBtn = screen.getByRole('button', { name: /Send Reset Link/i });
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockReset).toHaveBeenCalledWith('student@campus.edu.in');
        expect(screen.getByText(/Password reset link sent!/i)).toBeInTheDocument();
      });
    });
  });

  describe('ResetPasswordPage', () => {
    it('validates minimum 8 characters and password confirmation before calling updatePassword', async () => {
      const user = userEvent.setup();
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });

      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        user: { id: 'u1' } as any,
        session: null,
        isLoading: false,
        isModerator: false,
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updatePassword: mockUpdate,
      });

      renderWithProviders(<ResetPasswordPage />);

      expect(screen.getByRole('heading', { level: 1, name: /Set New Password/i })).toBeInTheDocument();

      const passInput = screen.getByLabelText(/^New Password/i);
      const confirmInput = screen.getByLabelText(/Confirm New Password/i);
      const submitBtn = screen.getByRole('button', { name: /Update Password/i });

      // Short password
      await user.type(passInput, 'short');
      await user.type(confirmInput, 'short');
      await user.click(submitBtn);
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();

      // Mismatched password
      await user.clear(passInput);
      await user.clear(confirmInput);
      await user.type(passInput, 'strongPassword123');
      await user.type(confirmInput, 'differentPassword123');
      await user.click(submitBtn);
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();

      // Matching valid password
      await user.clear(confirmInput);
      await user.type(confirmInput, 'strongPassword123');
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('strongPassword123');
        expect(screen.getByText(/Password updated successfully!/i)).toBeInTheDocument();
      });
    });
  });

  describe('VerifyEmailPage', () => {
    it('renders email verification instructions with continue as guest link', () => {
      renderWithProviders(<VerifyEmailPage />);
      expect(screen.getByRole('heading', { level: 1, name: /Verify Your Email/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Continue as Guest/i })).toBeInTheDocument();
    });
  });

  describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to /login and renders children when authenticated', () => {
      // 1. Unauthenticated -> redirects to /login
      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isModerator: false,
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updatePassword: vi.fn(),
      });

      const { unmount } = renderWithProviders(
        <ProtectedRoute>
          <div data-testid="secret-dashboard">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('secret-dashboard')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Sign In to Jaanch/i })).toBeInTheDocument();
      unmount();

      // 2. Authenticated -> renders protected content
      vi.spyOn(authContext, 'useAuth').mockReturnValue({
        user: { id: 'u123', email: 'student@campus.edu.in' } as any,
        session: null,
        isLoading: false,
        isModerator: false,
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updatePassword: vi.fn(),
      });

      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="secret-dashboard">Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('secret-dashboard')).toBeInTheDocument();
    });
  });
});
