import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './core/config/env';
import { logger } from './core/utils/logger';
import { errorHandler } from './core/middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';

const app: Application = express();

// Middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cors());
app.use(helmet());

if (env.NODE_ENV === 'production') {
  const jsonLogger = (tokens: any, req: any, res: any) =>
    JSON.stringify({
      timestamp: new Date().toISOString(),
      remoteAddr: tokens['remote-addr'](req, res),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: Number(tokens.res(req, res, 'content-length') || 0),
      responseTime: Number(tokens['response-time'](req, res)),
      referrer: tokens.referrer(req, res),
      userAgent: tokens['user-agent'](req, res),
    });

  app.use(
    morgan(jsonLogger as any, {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
} else {
  app.use(
    morgan('dev', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Register routes
app.use('/api/v1/auth', authRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

export default app;
