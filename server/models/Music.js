import mongoose from 'mongoose';
import { linkSchema, imageValidator, urlValidator } from './shared.js';
import { slugify, youtubeId } from '../utils/helpers.js';

export const RELEASE_TYPES = ['single', 'ep', 'album', 'mixtape', 'other'];
// How SA is credited: his own release, a feature/collab, or a collective (e.g. Manushyar) release.
export const CREDIT_TYPES = ['solo', 'collaboration', 'group'];
// Release types that are multi-track projects and get a tracklist.
export const PROJECT_TYPES = ['ep', 'album', 'mixtape'];

const trackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  duration: { type: String, trim: true, match: [/^$|^\d{1,2}:[0-5]\d$/, 'Duration must look like 3:45'], default: '' },
  featuring: [{ type: String, trim: true, maxlength: 80 }],
  // Optional link to a release on this site (e.g. a single that is also on the EP)
  release: { type: mongoose.Schema.Types.ObjectId, ref: 'Music', default: null },
});

const musicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 3000, default: '' },
    coverImage: { type: String, trim: true, validate: imageValidator, default: '' },
    releaseYear: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 2,
      default: null,
    },
    releaseType: { type: String, enum: RELEASE_TYPES, default: 'single' },
    creditType: { type: String, enum: CREDIT_TYPES, default: 'solo' },
    artists: [{ type: String, trim: true, maxlength: 80 }],
    collaborators: [{ type: String, trim: true, maxlength: 80 }],
    streamingLinks: [linkSchema],
    youtubeUrl: { type: String, trim: true, validate: urlValidator, default: '' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    // Editorial honesty flags: unverified facts are hidden/marked on the public site.
    verified: { type: Boolean, default: false },
    verificationNote: { type: String, trim: true, maxlength: 500, default: '' },
    sortOrder: { type: Number, default: 0 },
    tracks: [trackSchema], // used for EPs, albums and mixtapes
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

musicSchema.index({ published: 1, releaseYear: -1, createdAt: -1 });
musicSchema.index({ featured: 1 });

musicSchema.virtual('isProject').get(function isProject() {
  return PROJECT_TYPES.includes(this.releaseType);
});

musicSchema.virtual('youtubeId').get(function getId() {
  return youtubeId(this.youtubeUrl);
});

musicSchema.pre('validate', async function ensureSlug() {
  // A custom slug is kept (normalised); a blank slug is derived from the title.
  if (this.isNew || this.isModified('slug') || !this.slug) {
    const base = slugify(this.slug || this.title);
    let candidate = base;
    let i = 2;
    // eslint-disable-next-line no-await-in-loop
    while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${i++}`;
    }
    this.slug = candidate;
  }
  if (this.youtubeUrl && !youtubeId(this.youtubeUrl)) {
    this.invalidate('youtubeUrl', 'Must be a valid YouTube video URL');
  }
});

export default mongoose.model('Music', musicSchema);
