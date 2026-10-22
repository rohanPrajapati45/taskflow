import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from './config.js';
import logger from './logger.js';
import { metricsMiddleware, metricsRouter } from './metrics.js';
import statsRouter from './routes/stats.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'stats-service',
    uptime: process.uptime()
  });
});

app.use('/api/stats', statsRouter);
app.use('/metrics', metricsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, _req, res, _next) => {
  logger.error({ err: error }, 'Request failed');
  res.status(error.statusCode || error.status || 500).json({
    error: error.message || 'Internal server error'
  });
});

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'stats-service started');
});
