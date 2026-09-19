import type { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from '../config.js';

const WINDOW_MS = 60_000;

// Every limiter here counts only failed requests (status >= 400). A whole
// classroom often shares one school IP, so counting successful logins would
// lock students out at the start of a lesson.
function failureLimiter(limit: number, keyGenerator: (req: Request) => string) {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit,
    keyGenerator,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many failed attempts. Please wait a minute and try again.' },
  });
}

function clientIp(req: Request): string {
  return ipKeyGenerator(req.ip ?? '');
}

function submittedEmail(req: Request): string {
  const email = req.body?.email;
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

// Per (IP, email) stops guessing one account's password; the looser per-IP
// ceiling stops one address cycling through many accounts.
export const authLimiters = [
  failureLimiter(config.authRateLimit, (req) => `${clientIp(req)}|${submittedEmail(req)}`),
  failureLimiter(config.authRateLimit * 10, clientIp),
];

export const enrollLimiter = failureLimiter(config.authRateLimit, (req) => req.studentId ?? clientIp(req));
