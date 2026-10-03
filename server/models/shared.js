import mongoose from 'mongoose';

// Reusable sub-schemas shared by several models.

const urlValidator = {
  validator: (v) => !v || /^https?:\/\/[^\s]+$/i.test(v),
  message: (p) => `${p.value} is not a valid http(s) URL`,
};

// An image path is either an uploaded file (/uploads/...) or an absolute URL.
export const imageValidator = {
  validator: (v) => !v || /^\/uploads\/[\w.-]+$/.test(v) || /^https?:\/\/[^\s]+$/i.test(v),
  message: (p) => `${p.value} is not a valid image path or URL`,
};

export const linkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true, maxlength: 40 },
    label: { type: String, trim: true, maxlength: 60 },
    url: { type: String, required: true, trim: true, maxlength: 500, validate: urlValidator },
  },
  { _id: false }
);

export { urlValidator };
