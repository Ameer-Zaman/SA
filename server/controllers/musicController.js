import Music from '../models/Music.js';
import Video from '../models/Video.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler, ok } from '../utils/helpers.js';

const SORT = { sortOrder: -1, releaseYear: -1, createdAt: -1 };

// Public filter keys → query. Category filters map onto the verified data model.
const FILTERS = {
  singles: { releaseType: 'single', creditType: 'solo' },
  albums: { releaseType: { $in: ['album', 'ep', 'mixtape'] } },
  collaborations: { creditType: { $in: ['collaboration', 'group'] } },
};

/** GET /api/music — public sees published only; an admin can pass ?all=true. */
export const listMusic = asyncHandler(async (req, res) => {
  const { filter, featured, limit, all } = req.query;
  const query = req.admin && all === 'true' ? {} : { published: true };
  if (filter && FILTERS[filter]) Object.assign(query, FILTERS[filter]);
  if (featured === 'true') query.featured = true;

  const lim = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const items = await Music.find(query).sort(SORT).limit(lim);

  // Which filter tabs have content? The UI only shows relevant categories.
  const base = req.admin && all === 'true' ? {} : { published: true };
  const counts = {};
  await Promise.all(
    Object.entries(FILTERS).map(async ([key, q]) => { counts[key] = await Music.countDocuments({ ...base, ...q }); })
  );

  ok(res, { items, counts });
});

/** GET /api/music/:slug — includes linked videos. */
export const getMusic = asyncHandler(async (req, res) => {
  const item = await Music.findOne({ slug: req.params.slug.toLowerCase() })
    .populate('tracks.release', 'title slug published');
  if (!item || (!item.published && !req.admin)) throw ApiError.notFound('Release not found');
  const visible = req.admin ? {} : { published: true };

  // Hide links to unpublished releases from public visitors.
  if (!req.admin) {
    item.tracks.forEach((t) => { if (t.release && !t.release.published) t.release = null; });
  }

  const [videos, appearsOn] = await Promise.all([
    Video.find({ relatedMusic: item._id, ...visible }).sort({ releaseDate: -1 }),
    // EPs/albums that list this release in their tracklist
    Music.find({ 'tracks.release': item._id, ...visible }).select('title slug releaseType releaseYear verified coverImage'),
  ]);
  ok(res, { item, videos, appearsOn });
});

export const createMusic = asyncHandler(async (req, res) => {
  const item = await Music.create(req.body);
  ok(res, { item }, 201);
});

export const updateMusic = asyncHandler(async (req, res) => {
  const item = await Music.findById(req.params.id);
  if (!item) throw ApiError.notFound('Release not found');
  item.set(req.body);
  await item.save();
  ok(res, { item });
});

export const deleteMusic = asyncHandler(async (req, res) => {
  const item = await Music.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Release not found');
  await Promise.all([
    WebsiteSettings.updateMany({ featuredMusic: item._id }, { $set: { featuredMusic: null } }),
    // Unlink the deleted release from any EP/album tracklists (portable: no arrayFilters needed).
    Music.find({ 'tracks.release': item._id }).then((projects) => Promise.all(projects.map((p) => {
      p.tracks.forEach((t) => { if (t.release?.equals(item._id)) t.release = null; });
      return p.save();
    }))),
    Video.updateMany({ relatedMusic: item._id }, { $set: { relatedMusic: null } }),
  ]);
  ok(res, { deleted: item._id });
});
