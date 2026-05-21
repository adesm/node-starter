import { createLogger, format, transports } from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, errors, json } = format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const base = `${timestamp} [${level}] ${message}`;
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack ? `${base} - ${stack}${metaString}` : `${base}${metaString}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new transports.Console()],
});
