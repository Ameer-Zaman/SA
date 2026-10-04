import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

// Files are held in memory, then re-encoded by sharp (see uploadController),
// which also strips any non-image payload and EXIF metadata.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(ApiError.badRequest('Only JPEG, PNG, WebP or AVIF images are allowed'));
  },
}).single('image');

// 3D models: binary glTF (.glb) only, up to 25 MB. Content is checked in the controller.
export const modelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/\.glb$/i.test(file.originalname)) cb(null, true);
    else cb(ApiError.badRequest('Only .glb 3D model files are allowed'));
  },
}).single('model');
