import crypto from 'node:crypto';
import { normalizeText } from '@jaanch/shared';
import { loadEnv } from '../config/env.js';

export type EntityType = 'email' | 'domain' | 'phone' | 'upi' | 'bank_account';
export type IndicatorType = 'url' | 'domain' | 'phone' | 'upi';

/**
 * Normalizes entity value across entity types for consistent hashing
 */
export function normalizeEntityValue(type: EntityType | IndicatorType, value: string): string {
  if (!value) return '';
  const trimmed = value.trim();

  switch (type) {
    case 'email':
      return trimmed.toLowerCase();

    case 'domain':
      return trimmed
        .toLowerCase()
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/.*$/, '')
        .trim();

    case 'url':
      return trimmed.toLowerCase().trim();

    case 'phone':
      return trimmed.replace(/[\s\-().]/g, '');

    case 'upi':
      return trimmed.toLowerCase();

    case 'bank_account':
      return trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '');

    default:
      return trimmed.toLowerCase();
  }
}

/**
 * Computes salted SHA-256 hash using the server pepper
 */
export function hashEntity(type: EntityType, value: string, customPepper?: string): string {
  const env = loadEnv();
  const pepper = customPepper || env.REPORT_HASH_PEPPER;
  const normalized = normalizeEntityValue(type, value);

  return crypto
    .createHash('sha256')
    .update(`${type}:${normalized}:${pepper}`, 'utf-8')
    .digest('hex');
}

/**
 * Computes HMAC-SHA256 of normalized text using REPORT_HASH_PEPPER
 */
export function hashNormalizedText(text: string, customPepper?: string): string {
  const env = loadEnv();
  const pepper = customPepper || env.REPORT_HASH_PEPPER;
  const normalized = normalizeText(text).trim().toLowerCase().replace(/\s+/g, ' ');
  return crypto.createHmac('sha256', pepper).update(normalized, 'utf-8').digest('hex');
}

/**
 * Computes HMAC-SHA256 of indicator using REPORT_HASH_PEPPER
 */
export function hashIndicatorPeppered(type: IndicatorType, value: string, customPepper?: string): string {
  const env = loadEnv();
  const pepper = customPepper || env.REPORT_HASH_PEPPER;
  const normalized = normalizeEntityValue(type, value);
  return crypto.createHmac('sha256', pepper).update(`${type}:${normalized}`, 'utf-8').digest('hex');
}

/**
 * Masks indicator values for safe display without leaking PII
 */
export function maskIndicator(type: IndicatorType | EntityType | string, value: string): string {
  if (!value) return '***';
  const trimmed = value.trim();

  switch (type) {
    case 'email': {
      const parts = trimmed.split('@');
      if (parts.length < 2) return `${trimmed.slice(0, 2)}***`;
      const [local, dom] = parts;
      const maskedLocal = local.length > 2 ? `${local.slice(0, 2)}***` : `${local[0] || '*'}***`;
      return `${maskedLocal}@${dom}`;
    }
    case 'phone': {
      const clean = trimmed.replace(/\s+/g, '');
      if (clean.length < 5) return '***';
      return `${clean.slice(0, 3)}****${clean.slice(-2)}`;
    }
    case 'upi': {
      const parts = trimmed.split('@');
      if (parts.length < 2) return `${trimmed.slice(0, 2)}***`;
      return `${parts[0].slice(0, 2)}***@${parts[1] || '***'}`;
    }
    case 'domain':
    case 'url': {
      try {
        const urlStr = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const u = new URL(urlStr);
        const hostParts = u.hostname.split('.');
        if (hostParts.length >= 2) {
          const dom = hostParts[hostParts.length - 2];
          const tld = hostParts[hostParts.length - 1];
          return `${dom.slice(0, 2)}***.${tld}`;
        }
        return `${u.hostname.slice(0, 3)}***`;
      } catch {
        return `${trimmed.slice(0, 3)}***`;
      }
    }
    default:
      return `${trimmed.slice(0, 2)}***`;
  }
}

/**
 * Generates an 8-character public ID: JNC-INTEL-XXXXXXXX
 */
export function generateIntelPublicId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    rand += chars[bytes[i] % chars.length];
  }
  return `JNC-INTEL-${rand}`;
}


