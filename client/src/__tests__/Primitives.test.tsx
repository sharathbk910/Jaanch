/** @vitest-environment jsdom */
import './setup.js';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { VerdictBadge, OutcomeChip } from '../components/ui/Badge.js';
import { Input, Textarea } from '../components/ui/Input.js';

describe('Editorial UI Primitives (Primitives.test.tsx)', () => {
  it('renders Button with primary and outline variants', () => {
    const { rerender } = render(<Button variant="primary">Verify Now</Button>);
    const btn = screen.getByRole('button', { name: 'Verify Now' });
    expect(btn.className).toContain('bg-btn');

    rerender(<Button variant="outline">Learn More</Button>);
    expect(screen.getByRole('button', { name: 'Learn More' }).className).toContain('border-hairline');
  });

  it('renders Card with border-hairline and rounded-card radius', () => {
    render(<Card data-testid="test-card">Card Content</Card>);
    const card = screen.getByTestId('test-card');
    expect(card.className).toContain('border-hairline');
    expect(card.className).toContain('rounded-card');
  });

  it('renders VerdictBadge with icon and label for all 4 statuses (never color alone)', () => {
    const statuses = ['LIKELY_GENUINE', 'NEEDS_REVIEW', 'HIGH_CONCERN', 'CONFIRMED_SCAM'] as const;

    for (const st of statuses) {
      const { unmount } = render(<VerdictBadge status={st} />);
      const badge = screen.getByText(new RegExp(st.replace('_', ' '), 'i'));
      expect(badge).toBeInTheDocument();
      // Icon is rendered within the badge container
      const icon = badge.parentElement?.querySelector('svg');
      expect(icon).not.toBeNull();
      unmount();
    }
  });

  it('renders OutcomeChip with icon and label', () => {
    render(<OutcomeChip outcome="pass" label="Verified Official Domain" />);
    expect(screen.getByText('Verified Official Domain')).toBeInTheDocument();
  });

  it('renders Input and Textarea with border-control', () => {
    render(
      <div>
        <Input placeholder="Enter URL" />
        <Textarea placeholder="Enter offer text" />
      </div>
    );

    expect(screen.getByPlaceholderText('Enter URL').className).toContain('border-control');
    expect(screen.getByPlaceholderText('Enter offer text').className).toContain('border-control');
  });
});
