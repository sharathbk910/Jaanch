#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read pepper from environment or server/.env
export function getPepper() {
  if (process.env.REPORT_HASH_PEPPER && process.env.REPORT_HASH_PEPPER.length >= 24) {
    return process.env.REPORT_HASH_PEPPER;
  }

  const serverEnvPath = path.resolve(__dirname, '..', 'server', '.env');
  if (fs.existsSync(serverEnvPath)) {
    const content = fs.readFileSync(serverEnvPath, 'utf-8');
    const match = content.match(/^REPORT_HASH_PEPPER=(.+)$/m);
    if (match && match[1].trim().length >= 24) {
      return match[1].trim();
    }
  }

  // Fallback for development/testing
  return 'change-this-to-a-secure-random-pepper-at-least-24-chars-long';
}

/**
 * Normalizes entity value across entity types for consistent hashing
 */
export function normalizeEntityValue(type, value) {
  if (!value) return '';
  const trimmed = String(value).trim();

  switch (type.toLowerCase()) {
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
export function hashEntity(type, value, customPepper) {
  const pepper = customPepper || getPepper();
  const normalized = normalizeEntityValue(type, value);

  return crypto
    .createHash('sha256')
    .update(`${type.toLowerCase()}:${normalized}:${pepper}`, 'utf-8')
    .digest('hex');
}

// CLI runner
if (process.argv[1] && process.argv[1].endsWith('hashEntity.mjs')) {
  const args = process.argv.slice(2);
  const type = args[0];
  const value = args[1];

  if (!type || !value) {
    console.log('Usage: node scripts/hashEntity.mjs <email|domain|phone|upi|bank_account> <value>');
    console.log('Example: node scripts/hashEntity.mjs domain tcs-careers-portal.net');
    process.exit(1);
  }

  const hash = hashEntity(type, value);
  console.log('\n--- JAANCH ENTITY HASHING UTILITY ---');
  console.log(`Type:       ${type}`);
  console.log(`Normalized: ${normalizeEntityValue(type, value)}`);
  console.log(`Hash:       ${hash}`);
  console.log('\nModerator Confirmation SQL snippet for Supabase SQL Editor:');
  console.log('------------------------------------------------------------');
  console.log('UPDATE reported_entities');
  console.log("SET status = 'confirmed', notes = 'Confirmed fraudulent by moderator review', confirmed_at = now()");
  console.log(`WHERE value_hash = '${hash}';\n`);
}
