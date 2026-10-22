import CircuitBreaker from 'opossum';
import { config } from '../config.js';
import logger from '../logger.js';

export function createCircuitBreaker(service, action) {
  const breaker = new CircuitBreaker(action, {
    timeout: config.CIRCUIT_BREAKER_TIMEOUT_MS,
    errorThresholdPercentage: config.CIRCUIT_BREAKER_ERROR_THRESHOLD_PERCENT,
    resetTimeout: config.CIRCUIT_BREAKER_RESET_TIMEOUT_MS,
    volumeThreshold: config.CIRCUIT_BREAKER_VOLUME_THRESHOLD
  });

  breaker.on('open', () => logger.warn({ service }, 'Circuit breaker opened'));
  breaker.on('halfOpen', () => logger.info({ service }, 'Circuit breaker half-open'));
  breaker.on('close', () => logger.info({ service }, 'Circuit breaker closed'));
  breaker.on('timeout', () => logger.warn({ service }, 'Circuit breaker request timed out'));

  return breaker;
}
