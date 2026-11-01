/** @vitest-environment jsdom */
import './setup.js';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext.js';
import { ReportEntityDialog } from '../components/results/ReportEntityDialog.js';
import { apiClient } from '../lib/apiClient.js';
import * as authContext from '../lib/AuthContext.js';

vi.mock('../lib/apiClient.js', () => ({
  apiClient: {
    reportEntity: vi.fn(),
  },
}));

function renderDialog(props: Partial<React.ComponentProps<typeof ReportEntityDialog>> = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    initialEntityType: 'upi' as const,
    initialValue: 'scam@okaxis',
    channel: 'whatsapp',
  };

  return render(
    <LanguageProvider defaultLang="en">
      <MemoryRouter>
        <ReportEntityDialog {...defaultProps} {...props} />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('Phase 7: ReportEntityDialog UI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = renderDialog({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('renders accessible dialog with title and inputs when isOpen is true', async () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u123', email: 'student@campus.edu.in' } as any,
      session: null,
      isLoading: false,
      isModerator: false,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    } as any);

    const { container } = renderDialog({
      isOpen: true,
      initialEntityType: 'upi',
      initialValue: 'test.scam@okaxis',
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'report-dialog-title');

    expect(screen.getByText('Report Scam Indicator')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test.scam@okaxis')).toBeInTheDocument();

    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false }, // JSDOM does not render layout CSS
      },
    });
    expect(results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
  });

  it('shows sign-in notice and disables submit when unauthenticated', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      isModerator: false,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    } as any);

    renderDialog({ isOpen: true });

    expect(
      screen.getByText(/Sign in to report fraudulent indicators/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Sign In to Report')).toBeInTheDocument();

    // Input fields should be disabled
    expect(screen.getByLabelText(/Suspicious Contact/i)).toBeDisabled();
  });

  it('submits entity report successfully when authenticated', async () => {
    const user = userEvent.setup();
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u123', email: 'student@campus.edu.in' } as any,
      session: null,
      isLoading: false,
      isModerator: false,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    } as any);

    (apiClient.reportEntity as any).mockResolvedValue({
      reportId: 'rep_123',
      status: 'unverified',
      reportCount: 1,
      message: 'Report submitted successfully',
    });

    renderDialog({
      isOpen: true,
      initialEntityType: 'upi',
      initialValue: 'fake.payment@okicici',
    });

    const notesInput = screen.getByPlaceholderText(/Describe the scam request/i);
    await user.type(notesInput, 'Demanded payment for offer letter');

    const submitBtn = screen.getByRole('button', { name: /Submit Report/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.reportEntity).toHaveBeenCalledWith({
        entityType: 'upi',
        value: 'fake.payment@okicici',
        channel: 'whatsapp',
        description: 'Demanded payment for offer letter',
      });
    });

    // Check success view
    await waitFor(() => {
      expect(screen.getByText('Threat Report Submitted')).toBeInTheDocument();
      expect(screen.getByText(/Thank you for protecting fellow students/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when Escape key is pressed or close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 'u123' } as any,
      session: null,
      isLoading: false,
      isModerator: false,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    } as any);

    renderDialog({ isOpen: true, onClose: handleClose });

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click close button in header (aria-label="Close")
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    await user.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
