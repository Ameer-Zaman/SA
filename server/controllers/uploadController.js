import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import ApiError from '../utils/ApiError.js';
import { asyncHandler, ok } from '../utils/helpers.js';
import { UPLOAD_DIR } from '../config/paths.js';

const MAX_WIDTH = { cover: 1600, photo: 2400, thumb: 1280 };

/**
 * POST /api/uploads  (multipart, field "image", optional ?kind=cover|photo|thumb)
 * Re-encodes every upload to WebP: resized, EXIF stripped, auto-rotated.
 */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded (field name must be "image")');
  const kind = MAX_WIDTH[req.query.kind] ? req.query.kind : 'photo';

  let output;
  try {
    output = await sharp(req.file.buffer, { failOn: 'error' })
      .rotate()
      .resize({ width: MAX_WIDTH[kind], withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw ApiError.badRequest('The file could not be read as an image');
  }

  const name = `${kind}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), output.data);
  ok(res, { url: `/uploads/${name}`, width: output.info.width, height: output.info.height }, 201);
});
