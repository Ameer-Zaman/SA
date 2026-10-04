import { z } from 'zod';
import { RELEASE_TYPES, CREDIT_TYPES } from '../models/Music.js';
import { VIDEO_CATEGORIES } from '../models/Video.js';
import { INQUIRY_TYPES, INQUIRY_STATUSES } from '../models/ContactInquiry.js';
import { youtubeId } from './helpers.js';

// Request-body schemas (zod). Models enforce the same rules again at the DB layer.

const httpUrl = z.string().max(500).regex(/^https?:\/\/\S+$/i, 'Must be an http(s) URL');
const optionalUrl = z.union([httpUrl, z.literal('')]).optional();
const image = z.union([z.string().regex(/^\/uploads\/[\w.-]+$/), httpUrl, z.literal('')]).optional();
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');
const ytUrl = httpUrl.refine((v) => !!youtubeId(v), 'Must be a valid YouTube video URL');

const link = z.object({
  platform: z.string().min(1).max(40),
  label: z.string().max(60).optional().default(''),
  url: httpUrl,
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

const track = z.object({
  _id: objectId.optional(),
  title: z.string().min(1, 'Track title is required').max(160),
  duration: z.union([z.string().regex(/^\d{1,2}:[0-5]\d$/, 'Duration must look like 3:45'), z.literal('')]).optional(),
  featuring: z.array(z.string().min(1).max(80)).max(10).optional(),
  release: z.union([objectId, z.null(), z.literal('')]).optional().transform((v) => (v === '' ? null : v)),
});

export const musicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(160),
  slug: z.string().max(80).optional(),
  description: z.string().max(3000).optional(),
  coverImage: image,
  releaseYear: z.union([z.coerce.number().int().min(1990).max(new Date().getFullYear() + 2), z.null()]).optional(),
  releaseType: z.enum(RELEASE_TYPES).optional(),
  creditType: z.enum(CREDIT_TYPES).optional(),
  artists: z.array(z.string().min(1).max(80)).max(20).optional(),
  collaborators: z.array(z.string().min(1).max(80)).max(30).optional(),
  streamingLinks: z.array(link).max(15).optional(),
  youtubeUrl: z.union([ytUrl, z.literal('')]).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  verified: z.boolean().optional(),
  verificationNote: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().optional(),
  tracks: z.array(track).max(60).optional(),
});

export const videoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(160),
  description: z.string().max(2000).optional(),
  youtubeUrl: ytUrl,
  thumbnail: image,
  releaseDate: z.union([z.coerce.date(), z.null(), z.literal('')]).optional().transform((v) => (v === '' ? null : v)),
  category: z.enum(VIDEO_CATEGORIES).optional(),
  relatedMusic: z.union([objectId, z.null(), z.literal('')]).optional().transform((v) => (v === '' ? null : v)),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  verified: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const timelineEntry = z.object({
  _id: objectId.optional(),
  date: z.string().max(40).optional(),
  title: z.string().min(1, 'Timeline title is required').max(160),
  description: z.string().max(1500).optional(),
  verified: z.boolean().optional(),
});

const collaboration = z.object({
  _id: objectId.optional(),
  name: z.string().min(1, 'Name is required').max(120),
  kind: z.enum(['collective', 'artist', 'producer', 'project']).optional(),
  description: z.string().max(1000).optional(),
  members: z.array(z.string().min(1).max(80)).max(30).optional(),
  image,
  link: optionalUrl,
  verified: z.boolean().optional(),
});

export const biographySchema = z.object({
  introduction: z.string().max(1500).optional(),
  biography: z.string().max(10000).optional(),
  portraitImage: image,
  secondaryImage: image,
  timeline: z.array(timelineEntry).max(100).optional(),
  musicalIdentity: z.object({
    approach: z.string().max(2000).optional(),
    influences: z.string().max(2000).optional(),
    languages: z.string().max(2000).optional(),
    style: z.string().max(2000).optional(),
  }).optional(),
  collaborations: z.array(collaboration).max(50).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name').max(100),
  email: z.string().email('Please enter a valid email').max(200),
  inquiryType: z.enum(INQUIRY_TYPES, { errorMap: () => ({ message: 'Choose an inquiry type' }) }),
  message: z.string().min(10, 'Message should be at least 10 characters').max(5000),
  // anti-spam fields (never stored)
  website: z.string().max(200).optional(), // honeypot: must stay empty
  startedAt: z.coerce.number().optional(), // ms timestamp when the form was rendered
});

export const inquiryUpdateSchema = z.object({ status: z.enum(INQUIRY_STATUSES) });

export const settingsSchema = z.object({
  tagline: z.string().max(120).optional(),
  heroIntro: z.string().max(300).optional(),
  heroImage: image,
  heroModel: z.union([z.string().regex(/^\/uploads\/[\w.-]+\.glb$/, 'Upload the 3D model through the admin'), z.literal('')]).optional(),
  socialLinks: z.array(link).max(15).optional(),
  streamingProfiles: z.array(link).max(15).optional(),
  contactEmail: z.union([z.string().email().max(200), z.literal('')]).optional(),
  showContactEmail: z.boolean().optional(),
  featuredMusic: z.union([objectId, z.null(), z.literal('')]).optional().transform((v) => (v === '' ? null : v)),
  featuredVideos: z.array(objectId).max(12).optional(),
  seo: z.object({ title: z.string().max(70).optional(), description: z.string().max(160).optional() }).optional(),
});
