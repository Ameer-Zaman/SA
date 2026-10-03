import WebsiteSettings from '../models/WebsiteSettings.js';
import Music from '../models/Music.js';
import Video from '../models/Video.js';
import { asyncHandler, ok } from '../utils/helpers.js';

/**
 * GET /api/settings
 * Public: resolves featured content (published only, falling back to items flagged `featured`)
 * and hides the contact email unless the admin has approved showing it.
 * Admin (?raw=true): returns the stored document for editing.
 */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await WebsiteSettings.getSingleton();

  if (req.admin && req.query.raw === 'true') return ok(res, { settings });

  const s = settings.toObject();
  let featuredMusic = s.featuredMusic ? await Music.findOne({ _id: s.featuredMusic, published: true }) : null;
  if (!featuredMusic) featuredMusic = await Music.findOne({ published: true, featured: true }).sort({ updatedAt: -1 });

  let featuredVideos = s.featuredVideos?.length
    ? await Video.find({ _id: { $in: s.featuredVideos }, published: true })
    : [];
  // keep admin-chosen order
  featuredVideos.sort((a, b) => s.featuredVideos.findIndex((id) => id.equals(a._id)) - s.featuredVideos.findIndex((id) => id.equals(b._id)));
  if (!featuredVideos.length) featuredVideos = await Video.find({ published: true, featured: true }).sort({ releaseDate: -1 }).limit(6);

  ok(res, {
    settings: {
      tagline: s.tagline,
      heroIntro: s.heroIntro,
      heroImage: s.heroImage,
      socialLinks: s.socialLinks,
      streamingProfiles: s.streamingProfiles,
      contactEmail: s.showContactEmail ? s.contactEmail : '',
      seo: s.seo,
      featuredMusic,
      featuredVideos,
    },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await WebsiteSettings.getSingleton();
  const { seo, ...rest } = req.body;
  settings.set(rest);
  if (seo) settings.set('seo', { ...settings.seo.toObject(), ...seo });
  await settings.save();
  ok(res, { settings });
});
