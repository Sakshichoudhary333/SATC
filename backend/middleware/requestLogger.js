import { logger } from '../utils/logger.js';
import { recordRequestMetrics } from '../utils/performanceMetrics.js';

const REDACTED = '[REDACTED]';
const shouldCaptureBodies = process.env.LOG_HTTP_BODIES === 'true' && process.env.NODE_ENV !== 'production';
const slowRequestThresholdMs = Number(process.env.SLOW_REQUEST_MS || 1000);

const redact = (value) => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, currentValue]) => {
      if (/password|otp|token|secret|authorization/i.test(key)) {
        return [key, REDACTED];
      }

      return [key, redact(currentValue)];
    })
  );
};

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  let responseBody;

  if (shouldCaptureBodies) {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };

    res.send = (body) => {
      responseBody = body;
      return originalSend(body);
    };
  }

  res.on('finish', () => {
    const routePath = req.route?.path ? `${req.baseUrl || ''}${req.route.path}` : req.originalUrl;
    const durationMs = Date.now() - startedAt;

    recordRequestMetrics({
      method: req.method,
      path: routePath,
      statusCode: res.statusCode,
      durationMs,
    });

    if (durationMs >= slowRequestThresholdMs) {
      logger.warn('Slow HTTP request detected', {
        method: req.method,
        path: routePath,
        statusCode: res.statusCode,
        durationMs,
        thresholdMs: slowRequestThresholdMs,
      });
    }

    logger.http('HTTP request completed', {
      method: req.method,
      path: routePath,
      statusCode: res.statusCode,
      durationMs,
      requestBody: shouldCaptureBodies ? redact(req.body) : undefined,
      responseBody: shouldCaptureBodies ? redact(responseBody) : undefined,
    });
  });

  next();
};
