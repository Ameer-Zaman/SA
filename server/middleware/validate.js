import ApiError from '../utils/ApiError.js';
import { deepClean } from '../utils/helpers.js';

/**
 * Validates req.body against a zod schema. Strings are stripped of HTML/control chars
 * and Mongo operator keys are removed before validation.
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(deepClean(req.body ?? {}));
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  req.body = result.data;
  next();
};

/** Rejects malformed :id params before they reach Mongoose. */
export const validObjectId = (param = 'id') => (req, _res, next) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params[param])) return next(ApiError.badRequest('Invalid id'));
  next();
};
