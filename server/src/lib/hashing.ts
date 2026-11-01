import crypto from 'node:crypto';
import { loadEnv } from '../config/env.js';

export type EntityType = 'email' | 'domain' | 'phone' | 'upi' | 'bank_account';

/**
 * Normalizes entity value across entity types for consistent hashing
 */
export function normalizeEntityValue(type: EntityType, value: string): string {
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
