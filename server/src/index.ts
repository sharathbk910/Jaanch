import { JAANCH_VERSION } from '@jaanch/shared';

export { createApp, type AppOptions } from './app.js';
export { safeFetch, resolveAndValidateDestination, isPrivateOrBlockedIP } from './lib/safeFetch.js';
export { loadEnv, getClientOrigins } from './config/env.js';
export { logger } from './lib/logger.js';

export const serverInfo = {
  name: 'Jaanch Server',
  version: JAANCH_VERSION,
};
