import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { db } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { healthRouter } from './routes/health';
import { customerRouter } from './routes/customers';
import { meterRouter } from './routes/meters';
import { billingRouter } from './routes/billing';
import { paymentRouter } from './routes/payments';
import { operationsRouter } from './routes/operations';
import { prepaidRouter } from './routes/prepaid';
import { hanaAdminRouter } from './routes/hana-admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/meters', meterRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/operations', operationsRouter);
app.use('/api/v1/prepaid', prepaidRouter);
app.use('/api/v1/hana-admin', hanaAdminRouter);

app.use(errorHandler);

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await db.end();
  await redis.quit();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`ZESA Billing API running on port ${PORT}`);
  logger.info(`Landscape: ${process.env.USE_HANA === 'true' ? 'SAP HANA PRODUCTION' : 'PostgreSQL Development'}`);
  logger.info(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
