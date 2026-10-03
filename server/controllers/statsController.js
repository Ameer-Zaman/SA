import Music from '../models/Music.js';
import Video from '../models/Video.js';
import ContactInquiry from '../models/ContactInquiry.js';
import { asyncHandler, ok } from '../utils/helpers.js';

/** GET /api/stats — admin overview numbers and recent activity. */
export const getStats = asyncHandler(async (_req, res) => {
  const [releases, publishedReleases, unverifiedReleases, videos, publishedVideos, inquiries, unread, recentMusic, recentVideos, recentInquiries] =
    await Promise.all([
      Music.countDocuments(),
      Music.countDocuments({ published: true }),
      Music.countDocuments({ verified: false }),
      Video.countDocuments(),
      Video.countDocuments({ published: true }),
      ContactInquiry.countDocuments(),
      ContactInquiry.countDocuments({ status: 'new' }),
      Music.find().sort({ createdAt: -1 }).limit(5).select('title slug published verified createdAt coverImage'),
      Video.find().sort({ createdAt: -1 }).limit(5).select('title published createdAt youtubeId'),
      ContactInquiry.find().sort({ createdAt: -1 }).limit(5).select('name inquiryType status createdAt'),
    ]);

  ok(res, {
    counts: { releases, publishedReleases, unverifiedReleases, videos, publishedVideos, inquiries, unread },
    recent: { music: recentMusic, videos: recentVideos, inquiries: recentInquiries },
  });
});
