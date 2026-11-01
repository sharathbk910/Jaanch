import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { logger } from './lib/logger.js';

const env = loadEnv();
const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({
    msg: `Jaanch Server listening on port ${env.PORT}`,
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  });
});

function gracefulShutdown(signal: string) {
  logger.info({ msg: `Received ${signal}. Closing server gracefully...` });
  server.close(() => {
    logger.info({ msg: 'Server closed. Exiting process.' });
    process.exit(0);
  });

  setTimeout(() => {
    logger.error({ msg: 'Force closing server after timeout.' });
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

