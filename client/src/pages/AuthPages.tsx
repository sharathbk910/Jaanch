import React from 'react';
import { Card } from '../components/ui/Card.js';

export function LoginPage() {
  return (
    <div className="w-full max-w-sm mx-auto px-4 py-16">
      <Card padding="lg">
        <h1 className="font-serif text-2xl font-bold text-primary mb-2">Sign In</h1>
        <p className="text-xs text-body mb-6">
          Access your saved verification history and customized preferences.
        </p>
      </Card>
    </div>
  );
}

export function SignupPage() {
  return (
    <div className="w-full max-w-sm mx-auto px-4 py-16">
      <Card padding="lg">
        <h1 className="font-serif text-2xl font-bold text-primary mb-2">Sign Up</h1>
        <p className="text-xs text-body mb-6">
          Create an account to securely save and review past offer audits.
        </p>
      </Card>
    </div>
  );
}

export function HistoryPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="font-mono text-xs text-muted block mb-1">AUDIT LOG</span>
      <h1 className="font-serif text-2xl font-bold text-primary mb-4">Saved Offer Analyses</h1>
      <Card padding="md">
        <p className="text-xs text-body leading-relaxed">
          Your private history of analyzed offers and checklists.
        </p>
      </Card>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="w-full max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <span className="font-mono text-xs text-muted block mb-1">ACCOUNT PREFERENCES</span>
      <h1 className="font-serif text-2xl font-bold text-primary mb-4">Settings & Privacy</h1>
      <Card padding="md">
        <p className="text-xs text-body leading-relaxed">
          Manage language defaults, consent options, and account data erasure.
        </p>
      </Card>
    </div>
  );
}

