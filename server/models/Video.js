import mongoose from 'mongoose';
import { imageValidator, urlValidator } from './shared.js';
import { youtubeId } from '../utils/helpers.js';

export const VIDEO_CATEGORIES = ['music-video', 'live', 'visualizer', 'lyric-video', 'behind-the-scenes', 'interview', 'other'];

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    youtubeUrl: { type: String, required: true, trim: true, validate: urlValidator },
    youtubeId: { type: String, index: true },
    thumbnail: { type: String, trim: true, validate: imageValidator, default: '' },
    releaseDate: { type: Date, default: null },
    category: { type: String, enum: VIDEO_CATEGORIES, default: 'music-video' },
    relatedMusic: { type: mongoose.Schema.Types.ObjectId, ref: 'Music', default: null },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.index({ published: 1, releaseDate: -1, createdAt: -1 });

videoSchema.pre('validate', function setYoutubeId() {
  const id = youtubeId(this.youtubeUrl);
  if (!id) this.invalidate('youtubeUrl', 'Must be a valid YouTube video URL');
  else this.youtubeId = id;
});

export default mongoose.model('Video', videoSchema);
