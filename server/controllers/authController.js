import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler, ok } from '../utils/helpers.js';
import { COOKIE_NAME, cookieOptions, signToken } from '../middleware/auth.js';

// Used to keep response time similar whether or not the email exists (avoids user enumeration).
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO8Wkh6ZQpuG0sYUQvmeO7.0x3hXz1Mny';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  let valid = false;
  if (admin) valid = await admin.verifyPassword(password);
  else await bcrypt.compare(password, DUMMY_HASH);
  if (!admin || !valid) throw ApiError.unauthorized('Invalid email or password');

  admin.lastLoginAt = new Date();
  await admin.save();

  res.cookie(COOKIE_NAME, signToken(admin), cookieOptions());
  ok(res, { admin: admin.toJSON() });
});

export const logout = (_req, res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
  ok(res, { loggedOut: true });
};

export const me = (req, res) => ok(res, { admin: req.admin.toJSON() });
