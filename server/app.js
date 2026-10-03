import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import env from './config/env.js';
import { UPLOAD_DIR, CLIENT_DIST } from './config/paths.js';
import {
  authRoutes, musicRoutes, videoRoutes, aboutRoutes, contactRoutes, settingsRoutes, uploadRoutes, statsRoutes,
} from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

if (env.trustProxy) app.set('trust proxy', 1); // needed behind Render/Railway/Nginx for correct IPs in rate limiting
app.disable('x-powered-by');

// Secure HTTP headers. CSP allows YouTube embeds/thumbnails; fonts are self-hosted.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'blob:', 'https://i.ytimg.com', 'https:'],
        'frame-src': ['https://www.youtube-nocookie.com', 'https://www.youtube.com'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // YouTube embeds need the origin
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
if (!env.isProd) app.use(morgan('dev'));

// Uploaded images (already optimized WebP) with long cache — filenames are unique.
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true, index: false }));

app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', notFound);

// Optionally serve the built React app from the same origin (single deployment).
if (env.serveClient && fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));
  app.use('/assets', express.static(path.join(CLIENT_DIST, 'assets'), { maxAge: '1y', immutable: true }));
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

export default app;
