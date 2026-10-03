import rateLimit from 'express-rate-limit';

const handler = (_req, res) =>
  res.status(429).json({ success: false, error: { message: 'Too many requests. Please try again later.' } });

export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false, handler });

// Brute-force protection for login: 10 failed attempts per 15 min per IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true,
  standardHeaders: 'draft-7', legacyHeaders: false, handler,
});

// Contact form: 5 submissions per hour per IP.
export const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false, handler });
