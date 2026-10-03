import mongoose from 'mongoose';

export const INQUIRY_TYPES = ['booking', 'business', 'collaboration', 'press', 'other'];
export const INQUIRY_STATUSES = ['new', 'read', 'archived'];

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String, required: true, trim: true, lowercase: true, maxlength: 200,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    inquiryType: { type: String, enum: INQUIRY_TYPES, required: true },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new', index: true },
  },
  { timestamps: true }
);

contactInquirySchema.index({ createdAt: -1 });

export default mongoose.model('ContactInquiry', contactInquirySchema);
