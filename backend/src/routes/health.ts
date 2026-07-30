import { Router } from 'express';
import { db, landscapeMode } from '../config/database';
import { redis } from '../config/redis';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const dbHealth = await db.query('SELECT NOW() as time').then(() => 'healthy').catch(() => 'unhealthy');
  const redisHealth = await redis.ping().then(() => 'healthy').catch(() => 'unhealthy');

  res.json({
    status: dbHealth === 'healthy' && redisHealth === 'healthy' ? 'ok' : 'degraded',
    landscape: landscapeMode,
    services: { 
      database: dbHealth, 
      cache: redisHealth,
      mode: landscapeMode 
    },
    timestamp: new Date().toISOString(),
  });
});
