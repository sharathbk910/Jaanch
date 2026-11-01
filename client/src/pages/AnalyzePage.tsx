import React, { useState } from 'react';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Textarea } from '../components/ui/Input.js';

export function AnalyzePage() {
  const [offerText, setOfferText] = useState('');

  return (
    <div className="w-full max-w-analyze mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-6 text-center">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted block mb-1">
          ANALYSIS ENGINE
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
          Check an Opportunity
        </h1>
        <p className="text-xs text-body mt-1">
          Paste the message or offer email below. Analyzed with deterministic privacy protections.
        </p>
      </div>

      <Card padding="md">
        <label htmlFor="offer-input" className="block text-xs font-semibold text-primary mb-2">
          Offer Message or Email Text
        </label>
        <Textarea
          id="offer-input"
          rows={7}
          value={offerText}
          onChange={(e) => setOfferText(e.target.value)}
          placeholder="Paste full job description, WhatsApp recruitment message, or scholarship email here..."
          className="mb-4"
        />
        <div className="flex items-center justify-between text-xs text-muted">
          <span>{offerText.trim().length} characters (min 20)</span>
          <Button disabled={offerText.trim().length < 20}>
            Analyze Offer
          </Button>
        </div>
      </Card>
    </div>
  );
}

