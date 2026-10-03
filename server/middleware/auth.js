import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/helpers.js';

export const COOKIE_NAME = 'sa_admin_token';

export const cookieOptions = () => ({
  httpOnly: true, // not readable from JS → protects the token from XSS theft
  secure: env.isProd, // HTTPS only in production
  sameSite: 'strict', // not sent on cross-site requests → CSRF protection
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const signToken = (admin) =>
  jwt.sign({ sub: admin._id.toString(), role: admin.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

async function resolveAdmin(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return await Admin.findById(payload.sub);
  } catch {
    return null;
  }
}

/** Requires a valid admin session. */
export const protect = asyncHandler(async (req, _res, next) => {
  const admin = await resolveAdmin(req);
  if (!admin) throw ApiError.unauthorized();
  req.admin = admin;
  next();
});

/** Authorization: restrict to one or more roles. */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) return next(ApiError.forbidden());
  next();
};

/** Attaches req.admin when logged in, but never blocks (used for public GETs that admins can widen). */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.admin = await resolveAdmin(req);
  next();
});
