import { createClient } from 'redis';
import { logger } from '../utils/logger';

export const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('error', (err) => logger.error('Redis Client Error', err));
redis.on('connect', () => logger.info('Redis connected'));

redis.connect();
