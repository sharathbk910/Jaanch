import { describe, it, expect } from 'vitest';
import { validateOfferInput } from '../rules/inputValidation.js';

describe('Rule-Based Input Validation (validateOfferInput)', () => {
  it('approves legitimate offer letter content as valid', () => {
    const input =
      'Subject: Infosys Springboard Internship Selection. Dear Candidate, you have been selected for the 8-week software engineering internship program. There are no registration or training fees. Stipend is ₹25,000/month.';
    const result = validateOfferInput(input);
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('approves upfront fee scam messages as valid offer content to inspect', () => {
    const input =
      'URGENT: TCS Careers Offer Letter. Congratulations! You are selected as Associate Software Engineer. Deposit ₹3,500 refundable laptop security deposit within 2 hours.';
    const result = validateOfferInput(input);
    expect(result.isValid).toBe(true);
  });

  it('approves OTP phishing messages as valid offer content to inspect', () => {
    const input =
      'Dear Student, National Merit Scholarship ₹50,000 is approved. To disburse funds directly to your bank account, kindly provide your 6-digit bank OTP immediately.';
    const result = validateOfferInput(input);
    expect(result.isValid).toBe(true);
  });

  it('rejects input under 25 characters as TOO_SHORT', () => {
    const result = validateOfferInput('Short job offer');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('TOO_SHORT');
    expect(result.message).toContain('at least 25 characters long');
  });

  it('approves offer letters containing OCR horizontal divider lines and dot leaders', () => {
    const inputWithDividers = `
========================================
APPOINTMENT LETTER - TCS CAREERS
----------------------------------------
Dear Candidate,
We are pleased to offer you the position of Systems Engineer at our Bangalore office.
Stipend: ₹30,000 per month during internship.
........................................
HR Contact: hr@tcs-careers.example.com
________________________________________
`;
    const result = validateOfferInput(inputWithDividers);
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('rejects repetitive placeholder characters as REPETITIVE_TEXT', () => {
    const result = validateOfferInput('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('REPETITIVE_TEXT');
    expect(result.message).toContain('repetitive');
  });

  it('rejects excessive repeated letter floods in offer text as REPETITIVE_TEXT', () => {
    const result = validateOfferInput(
      'Dear Candidate, your offer letter for software engineering internship is ready aaaaaaaaaaaaaaaaaaaaaaaaa please contact hr.'
    );
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('REPETITIVE_TEXT');
    expect(result.message).toContain('excessive repeated characters');
  });

  it('rejects single unbroken tokens without word breaks as UNREADABLE', () => {
    const result = validateOfferInput('asdfghjklqwertyuiopzxcvbnm1234567890');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('UNREADABLE');
    expect(result.message).toContain('separate words');
  });

  it('rejects random keyboard mashing without vowels as KEYBOARD_MASH', () => {
    const result = validateOfferInput('bcdfghjkl mnprst vwxyzbcdfghjkl');
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('KEYBOARD_MASH');
    expect(result.message).toContain('random keyboard');
  });

  it('rejects completely non-offer unrelated text as NO_OFFER_CONTEXT', () => {
    const result = validateOfferInput(
      'Yesterday afternoon we went to the market and bought five sweet apples, three yellow bananas, and baked bread.'
    );
    expect(result.isValid).toBe(false);
    expect(result.code).toBe('NO_OFFER_CONTEXT');
    expect(result.message).toContain('does not appear to be a job offer');
  });
});
