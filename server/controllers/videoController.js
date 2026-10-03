import Video, { VIDEO_CATEGORIES } from '../models/Video.js';
import WebsiteSettings from '../models/WebsiteSettings.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler, ok } from '../utils/helpers.js';

const SORT = { sortOrder: -1, releaseDate: -1, createdAt: -1 };

export const listVideos = asyncHandler(async (req, res) => {
  const { category, featured, limit, all } = req.query;
  const base = req.admin && all === 'true' ? {} : { published: true };
  const query = { ...base };
  if (category && VIDEO_CATEGORIES.includes(category)) query.category = category;
  if (featured === 'true') query.featured = true;

  const lim = Math.min(Math.max(Number(limit) || 100, 1), 200);
  const [items, categories] = await Promise.all([
    Video.find(query).sort(SORT).limit(lim).populate('relatedMusic', 'title slug'),
    Video.distinct('category', base),
  ]);
  ok(res, { items, categories });
});

export const getVideo = asyncHandler(async (req, res) => {
  const item = await Video.findById(req.params.id).populate('relatedMusic', 'title slug');
  if (!item || (!item.published && !req.admin)) throw ApiError.notFound('Video not found');
  ok(res, { item });
});

export const createVideo = asyncHandler(async (req, res) => {
  const item = await Video.create(req.body);
  ok(res, { item }, 201);
});

export const updateVideo = asyncHandler(async (req, res) => {
  const item = await Video.findById(req.params.id);
  if (!item) throw ApiError.notFound('Video not found');
  item.set(req.body);
  await item.save();
  ok(res, { item });
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const item = await Video.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Video not found');
  await WebsiteSettings.updateMany({}, { $pull: { featuredVideos: item._id } });
  ok(res, { deleted: item._id });
});
