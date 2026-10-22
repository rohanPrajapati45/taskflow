import express from 'express';
import client from 'prom-client';

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

export function metricsMiddleware(req, res, next) {
  res.on('finish', () => {
    const route = req.route?.path || req.originalUrl;
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode)
    });
  });

  next();
}

export const metricsRouter = express.Router();

metricsRouter.get('/', async (_req, res, next) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    next(error);
  }
});
