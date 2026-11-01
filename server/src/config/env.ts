import dotenv from 'dotenv';
import { z } from 'zod';

// Load local environment variables if available
dotenv.config();

const DEFAULT_PLACEHOLDER_PEPPER = 'change-this-to-a-secure-random-pepper-at-least-24-chars-long';

const RawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),

  // Salt pepper for SHA-256 entity hashing (required, >= 24 characters)
  REPORT_HASH_PEPPER: z.string().optional(),

  // Optional Gemini AI assistance
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Feature flags
  ENABLE_THIRD_PARTY_CHECKS: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .default(false),
  DEMO_MODE: z
    .string()
    .transform((val) => val === 'true')
    .or(z.boolean())
    .default(false),

  // Third party check endpoints
  RDAP_BASE_URL: z.string().url().default('https://rdap.org'),
  RDAP_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  // Rate limits
  RATE_LIMIT_GLOBAL_PER_15MIN: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_ANALYZE_GUEST_PER_HOUR: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_ANALYZE_USER_PER_HOUR: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_LINK_PER_HOUR: z.coerce.number().int().positive().default(60),

  // WhatsApp integration
  WHATSAPP_VERIFY_TOKEN: z.string().default('jaanch_webhook_verify_token_default'),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export interface ServerEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CLIENT_ORIGINS: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_JWT_SECRET?: string;
  REPORT_HASH_PEPPER: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  ENABLE_THIRD_PARTY_CHECKS: boolean;
  DEMO_MODE: boolean;
  RDAP_BASE_URL: string;
  RDAP_TIMEOUT_MS: number;
  RATE_LIMIT_GLOBAL_PER_15MIN: number;
  RATE_LIMIT_ANALYZE_GUEST_PER_HOUR: number;
  RATE_LIMIT_ANALYZE_USER_PER_HOUR: number;
  RATE_LIMIT_LINK_PER_HOUR: number;
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_APP_SECRET?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  LOG_LEVEL: string;
}

let cachedEnv: ServerEnv | null = null;

export function resetCachedEnv(): void {
  cachedEnv = null;
}

export function loadEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const raw = RawEnvSchema.parse(process.env);
  const isTest = raw.NODE_ENV === 'test';
  const isProd = raw.NODE_ENV === 'production';

  // Apply test defaults when in test environment
  const supabaseUrl = raw.SUPABASE_URL || (isTest ? 'https://test-placeholder.supabase.co' : 'https://your-project.supabase.co');
  const supabaseAnonKey = raw.SUPABASE_ANON_KEY || (isTest ? 'test-anon-key-placeholder' : 'your-anon-key-placeholder');
  const pepper = raw.REPORT_HASH_PEPPER || (isTest ? 'test-secure-pepper-with-at-least-24-chars' : DEFAULT_PLACEHOLDER_PEPPER);

  // In production, missing or default pepper = refuse to start
  if (isProd) {
    if (!raw.REPORT_HASH_PEPPER || raw.REPORT_HASH_PEPPER.trim().length < 24) {
      throw new Error(
        '[Env] Production startup refused: REPORT_HASH_PEPPER must be configured and at least 24 characters long.'
      );
    }
    if (raw.REPORT_HASH_PEPPER === DEFAULT_PLACEHOLDER_PEPPER) {
      throw new Error(
        '[Env] Production startup refused: REPORT_HASH_PEPPER cannot use the default placeholder pepper.'
      );
    }
    if (!raw.SUPABASE_URL || raw.SUPABASE_URL.includes('your-project.supabase.co')) {
      throw new Error('[Env] Production startup refused: Real SUPABASE_URL is required in production.');
    }
    if (!raw.SUPABASE_ANON_KEY || raw.SUPABASE_ANON_KEY === 'your-anon-key-placeholder') {
      throw new Error('[Env] Production startup refused: Real SUPABASE_ANON_KEY is required in production.');
    }
    if (!raw.SUPABASE_SERVICE_ROLE_KEY || raw.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
      throw new Error('[Env] Production startup refused: Real SUPABASE_SERVICE_ROLE_KEY is required in production.');
    }
    if (!raw.SUPABASE_JWT_SECRET || raw.SUPABASE_JWT_SECRET.length < 32) {
      throw new Error('[Env] Production startup refused: SUPABASE_JWT_SECRET (>=32 chars) is required in production.');
    }
  }

  cachedEnv = {
    NODE_ENV: raw.NODE_ENV,
    PORT: raw.PORT,
    CLIENT_ORIGINS: raw.CLIENT_ORIGINS,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: raw.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: raw.SUPABASE_JWT_SECRET,
    REPORT_HASH_PEPPER: pepper,
    GEMINI_API_KEY: raw.GEMINI_API_KEY,
    GEMINI_MODEL: raw.GEMINI_MODEL,
    ENABLE_THIRD_PARTY_CHECKS: raw.ENABLE_THIRD_PARTY_CHECKS,
    DEMO_MODE: raw.DEMO_MODE,
    RDAP_BASE_URL: raw.RDAP_BASE_URL,
    RDAP_TIMEOUT_MS: raw.RDAP_TIMEOUT_MS,
    RATE_LIMIT_GLOBAL_PER_15MIN: raw.RATE_LIMIT_GLOBAL_PER_15MIN,
    RATE_LIMIT_ANALYZE_GUEST_PER_HOUR: raw.RATE_LIMIT_ANALYZE_GUEST_PER_HOUR,
    RATE_LIMIT_ANALYZE_USER_PER_HOUR: raw.RATE_LIMIT_ANALYZE_USER_PER_HOUR,
    RATE_LIMIT_LINK_PER_HOUR: raw.RATE_LIMIT_LINK_PER_HOUR,
    WHATSAPP_VERIFY_TOKEN: raw.WHATSAPP_VERIFY_TOKEN,
    WHATSAPP_APP_SECRET: raw.WHATSAPP_APP_SECRET,
    WHATSAPP_PHONE_NUMBER_ID: raw.WHATSAPP_PHONE_NUMBER_ID,
    LOG_LEVEL: raw.LOG_LEVEL,
  };

  return cachedEnv;
}

export function getClientOrigins(env: ServerEnv = loadEnv()): string[] {
  return env.CLIENT_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
