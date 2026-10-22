import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import pinoHttp from 'pino-http';
import { config } from './config.js';
import logger from './logger.js';
import { metricsMiddleware, metricsRouter } from './metrics.js';
import tasksRouter from './routes/tasks.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'task-service',
    uptime: process.uptime()
  });
});

app.use('/api/tasks', tasksRouter);
app.use('/metrics', metricsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, _req, res, _next) => {
  logger.error({ err: error }, 'Request failed');

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ error: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ error: 'A task with that value already exists' });
  }

  res.status(error.statusCode || error.status || 500).json({
    error: error.message || 'Internal server error'
  });
});

async function start() {
  await mongoose.connect(config.MONGO_URI);
  app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'task-service started');
  });
}

start().catch((error) => {
  logger.fatal({ err: error }, 'task-service failed to start');
  process.exit(1);
});
