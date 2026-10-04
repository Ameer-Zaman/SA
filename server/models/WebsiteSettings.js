import mongoose from 'mongoose';
import { linkSchema, imageValidator } from './shared.js';

// Singleton document holding site-wide editable settings.
const websiteSettingsSchema = new mongoose.Schema(
  {
    tagline: { type: String, trim: true, maxlength: 120, default: 'THE SOUND OF MY OWN WORLD' },
    heroIntro: { type: String, trim: true, maxlength: 300, default: '' },
    heroImage: { type: String, trim: true, validate: imageValidator, default: '' },
    // Optional 3D model (.glb) for the homepage, replacing the default microphone.
    heroModel: {
      type: String, trim: true, default: '',
      match: [/^$|^\/uploads\/[\w.-]+\.glb$/, 'Upload the 3D model through the admin'],
    },
    socialLinks: [linkSchema], // official social profiles only
    streamingProfiles: [linkSchema], // official artist pages on streaming platforms
    contactEmail: {
      type: String, trim: true, lowercase: true, default: '',
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    showContactEmail: { type: Boolean, default: false }, // only shown publicly once approved
    featuredMusic: { type: mongoose.Schema.Types.ObjectId, ref: 'Music', default: null },
    featuredVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    seo: {
      title: { type: String, trim: true, maxlength: 70, default: 'SA — Official Website' },
      description: {
        type: String, trim: true, maxlength: 160,
        default: 'Official website of SA, rapper from Kerala. Music, videos and bookings.',
      },
    },
  },
  { timestamps: true }
);

websiteSettingsSchema.statics.getSingleton = async function getSingleton() {
  return (await this.findOne()) || this.create({});
};

export default mongoose.model('WebsiteSettings', websiteSettingsSchema);
