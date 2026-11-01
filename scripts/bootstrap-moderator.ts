#!/usr/bin/env node
/**
 * =============================================================================
 * JAANCH – First Moderator Bootstrap Script (scripts/bootstrap-moderator.ts)
 * =============================================================================
 * Promotes an existing user account to the 'moderator' role using the Supabase
 * service role key.
 *
 * Usage:
 *   npx tsx scripts/bootstrap-moderator.ts --email <user-email>
 *   npx tsx scripts/bootstrap-moderator.ts --user-id <uuid>
 *
 * Security:
 *   - NEVER commit the SUPABASE_SERVICE_ROLE_KEY to git.
 *   - Must be executed manually by system administrators in production.
 * =============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server environment
dotenv.config({ path: path.resolve(__dirname, '..', 'server', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function printHelp(): void {
  console.log(`
JAANCH – First Moderator Bootstrap Tool
=======================================
Promotes an authenticated user to the 'moderator' role.

Options:
  --email <email>     Target user email address
  --user-id <uuid>    Target user UUID
  --help              Display this help message

Environment:
  SUPABASE_URL               Supabase instance URL
  SUPABASE_SERVICE_ROLE_KEY  Supabase service role secret (admin privileges)

Example:
  npx tsx scripts/bootstrap-moderator.ts --email moderator@jaanch.ai
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  let email: string | undefined;
  let userId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1].trim().toLowerCase();
      i++;
    } else if (args[i] === '--user-id' && args[i + 1]) {
      userId = args[i + 1].trim();
      i++;
    }
  }

  if (!email && !userId) {
    console.error('Error: Either --email or --user-id must be provided.');
    printHelp();
    process.exit(1);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured in environment.');
    console.log(`[BOOTSTRAP PREVIEW] Target: ${email || userId} -> Role: 'moderator'`);
    console.log('To execute in a live cluster, provide SUPABASE_SERVICE_ROLE_KEY in server/.env');
    process.exit(0);
  }

  console.log(`Connecting to Supabase at ${SUPABASE_URL}...`);
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    let targetId = userId;

    if (!targetId && email) {
      // Look up user in auth.users via admin API
      const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;

      const matched = users.users.find((u) => u.email?.toLowerCase() === email);
      if (!matched) {
        console.error(`Error: User with email "${email}" not found in auth.users.`);
        process.exit(1);
      }
      targetId = matched.id;
    }

    // Update profile role to 'moderator'
    const { data, error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'moderator', updated_at: new Date().toISOString() })
      .eq('id', targetId)
      .select('id, email, role')
      .single();

    if (updateError) throw updateError;

    // Log admin audit event
    await adminClient.from('audit_logs').insert({
      actor_id: targetId,
      action: 'BOOTSTRAP_MODERATOR_ROLE',
      entity: 'profiles',
      entity_id: targetId,
      meta: { targetEmail: email, promotedTo: 'moderator' },
    });

    console.log(`
✅ Success! User successfully promoted to moderator.
   User ID : ${data.id}
   Email   : ${data.email}
   Role    : ${data.role}
`);
  } catch (err: any) {
    console.error('Bootstrap failed:', err.message || err);
    process.exit(1);
  }
}

main();
