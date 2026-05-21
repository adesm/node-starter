import { env } from './core/config/env';
import app from './app';
import { logger } from './core/utils/logger';
import prisma from './core/utils/prismaClient';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info('🚀 Server successfully started', { port: PORT, env: env.NODE_ENV });
});

// Graceful shutdown helper
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during Prisma disconnection', { err });
      process.exit(1);
    }
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and promise rejections
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception detected!', { err });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection detected!', { reason });
  process.exit(1);
});
