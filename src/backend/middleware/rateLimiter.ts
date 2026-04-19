import { RateLimiterMemory } from 'rate-limiter-flexible';

// Max 5 failed attempts per IP
export const loginRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 15, // Store for 15 minutes
});
