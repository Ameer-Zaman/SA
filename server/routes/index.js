import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import * as music from '../controllers/musicController.js';
import * as videos from '../controllers/videoController.js';
import { getAbout, updateAbout } from '../controllers/aboutController.js';
import * as contact from '../controllers/contactController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { uploadImage, uploadModel } from '../controllers/uploadController.js';
import { getStats } from '../controllers/statsController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, validObjectId } from '../middleware/validate.js';
import { authLimiter, contactLimiter } from '../middleware/rateLimit.js';
import { imageUpload, modelUpload } from '../middleware/upload.js';
import * as S from '../utils/schemas.js';

const admin = [protect, authorize('admin')];
const id = validObjectId('id');

// ---- Auth
export const authRoutes = Router()
  .post('/login', authLimiter, validate(S.loginSchema), login)
  .post('/logout', logout)
  .get('/me', ...admin, me);

// ---- Music
export const musicRoutes = Router()
  .get('/', optionalAuth, music.listMusic)
  .get('/:slug', optionalAuth, music.getMusic)
  .post('/', ...admin, validate(S.musicSchema), music.createMusic)
  .put('/:id', ...admin, id, validate(S.musicSchema.partial()), music.updateMusic)
  .delete('/:id', ...admin, id, music.deleteMusic);

// ---- Videos
export const videoRoutes = Router()
  .get('/', optionalAuth, videos.listVideos)
  .get('/:id', optionalAuth, id, videos.getVideo)
  .post('/', ...admin, validate(S.videoSchema), videos.createVideo)
  .put('/:id', ...admin, id, validate(S.videoSchema.partial()), videos.updateVideo)
  .delete('/:id', ...admin, id, videos.deleteVideo);

// ---- Biography
export const aboutRoutes = Router()
  .get('/', getAbout)
  .put('/', ...admin, validate(S.biographySchema), updateAbout);

// ---- Contact
export const contactRoutes = Router()
  .post('/', contactLimiter, validate(S.contactSchema), contact.createInquiry)
  .get('/', ...admin, contact.listInquiries)
  .patch('/:id', ...admin, id, validate(S.inquiryUpdateSchema), contact.updateInquiry)
  .delete('/:id', ...admin, id, contact.deleteInquiry);

// ---- Settings
export const settingsRoutes = Router()
  .get('/', optionalAuth, getSettings)
  .put('/', ...admin, validate(S.settingsSchema), updateSettings);

// ---- Uploads & stats (admin only)
export const uploadRoutes = Router()
  .post('/', ...admin, imageUpload, uploadImage)
  .post('/model', ...admin, modelUpload, uploadModel);
export const statsRoutes = Router().get('/', ...admin, getStats);
