import { hashEntity, type EntityType } from '../server/src/lib/hashing.js';
import {
  ThreatIntelRepository,
  type ThreatEntityStatus,
  getInMemoryThreatIntel,
  seedReportedEntity,
} from '../server/src/lib/threatIntelRepository.js';
import { getServiceRoleClient } from '../server/src/lib/supabase.js';

export interface CliOptions {
  notes?: string;
  status?: ThreatEntityStatus;
  pepper?: string;
}

/**
 * Computes peppered cryptographic hash for an indicator
 */
export function computeHash(type: EntityType, value: string, pepper?: string): string {
  return hashEntity(type, value, pepper);
}

/**
 * Lists reported entities in the database or memory queue
 */
export async function listEntities(options: { status?: ThreatEntityStatus; page?: number; limit?: number } = {}) {
  const supabase = getServiceRoleClient();
  const res = await ThreatIntelRepository.listReportedEntities(supabase, options);
  return res;
}

/**
 * Moderates (confirms, dismisses, disputes, or flags) an indicator
 */
export async function moderateEntity(
  idOrHash: string,
  targetStatus: ThreatEntityStatus,
  notes: string = 'Moderator decision',
  moderatorId: string = '00000000-0000-0000-0000-000000000001'
) {
  const supabase = getServiceRoleClient();

  let entityId = idOrHash;

  // If a 64-char hex hash was provided, look up the corresponding entity ID
  if (/^[a-f0-9]{64}$/i.test(idOrHash)) {
    if (supabase) {
      const { data } = await supabase
        .from('reported_entities')
        .select('id')
        .eq('value_hash', idOrHash)
        .single();
      if (data?.id) {
        entityId = data.id;
      }
    } else {
      const mem = getInMemoryThreatIntel().entities.find((e) => e.value_hash === idOrHash);
      if (mem?.id) {
        entityId = mem.id;
      }
    }
  }

  return await ThreatIntelRepository.transitionEntityStatus(supabase, {
    entityId,
    toStatus: targetStatus,
    notes,
    moderatorId,
  });
}

// CLI argument execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help') {
    console.log(`
JAANCH MODERATOR CLI
====================
Usage:
  npx tsx scripts/moderator-cli.ts hash <type> <value>
  npx tsx scripts/moderator-cli.ts list [--status=<status>]
  npx tsx scripts/moderator-cli.ts confirm <idOrHash> [--notes="..."]
  npx tsx scripts/moderator-cli.ts dismiss <idOrHash> [--notes="..."]
  npx tsx scripts/moderator-cli.ts dispute <idOrHash> [--notes="..."]

Types: email | domain | phone | upi | bank_account
Statuses: reported | unverified | ai_flagged | suspicious | confirmed | dismissed | disputed
    `);
    return;
  }

  if (command === 'hash') {
    const type = args[1] as EntityType;
    const value = args[2];
    const VALID_TYPES = ['email', 'domain', 'phone', 'upi', 'bank_account'];
    if (!type || !value) {
      console.error('Error: type and value required. E.g.: hash phone "+919876543210"');
      process.exit(1);
    }
    if (!VALID_TYPES.includes(type)) {
      console.error(`Error: Invalid entity type "${type}". Allowed types: ${VALID_TYPES.join(', ')}`);
      process.exit(1);
    }
    const hash = computeHash(type, value);
    console.log(`Type: ${type}`);
    console.log(`Value: ${value}`);
    console.log(`Peppered Hash: ${hash}`);
    return;
  }

  if (command === 'list') {
    const statusArg = args.find((a) => a.startsWith('--status='))?.split('=')[1] as ThreatEntityStatus | undefined;
    const res = await listEntities({ status: statusArg });
    console.log(`Found ${res.total} reported entities (showing ${res.items.length}):`);
    for (const item of res.items) {
      console.log(`[${item.status.toUpperCase()}] ID: ${item.id} | Type: ${item.entity_type} | Reports: ${item.report_count} | Hash: ${item.value_hash.slice(0, 16)}...`);
      if (item.notes) console.log(`  Notes: ${item.notes}`);
    }
    return;
  }

  if (command === 'confirm' || command === 'dismiss' || command === 'dispute') {
    const idOrHash = args[1];
    if (!idOrHash) {
      console.error(`Error: entity id or value hash required for ${command}`);
      process.exit(1);
    }
    const notesArg = args.find((a) => a.startsWith('--notes='))?.split('=')[1] || `CLI ${command} action`;
    const targetStatus: ThreatEntityStatus = command === 'confirm' ? 'confirmed' : command === 'dismiss' ? 'dismissed' : 'disputed';

    try {
      const updated = await moderateEntity(idOrHash, targetStatus, notesArg);
      console.log(`Successfully transitioned entity ${updated.id} to status: ${updated.status}`);
      if (updated.confirmed_at) {
        console.log(`Confirmed at: ${updated.confirmed_at}`);
      }
    } catch (err: any) {
      console.error(`Error moderating entity: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  console.error(`Unknown command: ${command}. Run with --help for usage.`);
  process.exit(1);
}

const isMain = process.argv[1] && process.argv[1].endsWith('moderator-cli.ts');
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

