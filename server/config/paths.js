import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SERVER_ROOT = path.resolve(__dirname, '..');
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(SERVER_ROOT, 'uploads');
export const CLIENT_DIST = path.resolve(SERVER_ROOT, '..', 'client', 'dist');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
