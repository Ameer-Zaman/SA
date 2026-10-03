import mongoose from 'mongoose';
import { imageValidator, urlValidator } from './shared.js';

const timelineEntrySchema = new mongoose.Schema({
  date: { type: String, trim: true, maxlength: 40, default: '' }, // free text: "2021", "Mar 2023"
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1500, default: '' },
  verified: { type: Boolean, default: false },
});

const collaborationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  kind: { type: String, enum: ['collective', 'artist', 'producer', 'project'], default: 'artist' },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  members: [{ type: String, trim: true, maxlength: 80 }],
  image: { type: String, trim: true, validate: imageValidator, default: '' },
  link: { type: String, trim: true, validate: urlValidator, default: '' },
  verified: { type: Boolean, default: false },
});

// Singleton document: there is only ever one biography.
const biographySchema = new mongoose.Schema(
  {
    introduction: { type: String, trim: true, maxlength: 1500, default: '' },
    biography: { type: String, trim: true, maxlength: 10000, default: '' },
    portraitImage: { type: String, trim: true, validate: imageValidator, default: '' },
    secondaryImage: { type: String, trim: true, validate: imageValidator, default: '' },
    timeline: [timelineEntrySchema],
    musicalIdentity: {
      approach: { type: String, trim: true, maxlength: 2000, default: '' },
      influences: { type: String, trim: true, maxlength: 2000, default: '' },
      languages: { type: String, trim: true, maxlength: 2000, default: '' },
      style: { type: String, trim: true, maxlength: 2000, default: '' },
    },
    collaborations: [collaborationSchema],
  },
  { timestamps: true }
);

biographySchema.statics.getSingleton = async function getSingleton() {
  return (await this.findOne()) || this.create({});
};

export default mongoose.model('Biography', biographySchema);
