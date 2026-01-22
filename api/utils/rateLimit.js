import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

let redisClient = null;
let redisReady = false;

const getRedisClient = () => {
  if (redisClient) return redisClient;
  if (!process.env.REDIS_URL) return null;
  redisClient = new Redis(process.env.REDIS_URL, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 2,
  });
  redisClient.on('ready', () => { redisReady = true; });
  redisClient.on('error', () => { redisReady = false; });
  return redisClient;
};

const limiterCache = new Map();

const getLimiter = ({ windowMs, max, keyPrefix }) => {
  const cacheKey = `${keyPrefix}:${windowMs}:${max}`;
  if (limiterCache.has(cacheKey)) return limiterCache.get(cacheKey);

  const redis = getRedisClient();
  const points = Math.max(max, 1);
  const duration = Math.max(Math.ceil(windowMs / 1000), 1);

  const limiter = redis
    ? new RateLimiterRedis({
        storeClient: redis,
        keyPrefix,
        points,
        duration,
      })
    : new RateLimiterMemory({
        keyPrefix,
        points,
        duration,
      });

  limiterCache.set(cacheKey, limiter);
  return limiter;
};

export const createRateLimiter = ({ windowMs = 60_000, max = 20, keyPrefix = 'global' } = {}) => {
  const limiter = getLimiter({ windowMs, max, keyPrefix });
  return async (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const userKey = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;
    try {
      await limiter.consume(userKey);
      next();
    } catch {
      return res.status(429).json({
        success: false,
        message: redisReady
          ? 'Too many requests. Please wait and try again.'
          : 'Rate limit reached. Please try again shortly.',
      });
    }
  };
};
