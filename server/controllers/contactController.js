import ContactInquiry from '../models/ContactInquiry.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler, ok } from '../utils/helpers.js';

const MIN_FILL_MS = 3000; // humans take longer than 3 s to fill the form
const LINK_RE = /https?:\/\//gi;

/** POST /api/contact — public, rate limited, with honeypot + timing + link-spam checks. */
export const createInquiry = asyncHandler(async (req, res) => {
  const { website, startedAt, ...data } = req.body;

  const tooFast = startedAt && Date.now() - startedAt < MIN_FILL_MS;
  const tooManyLinks = (data.message.match(LINK_RE) || []).length > 3;
  if (website || tooFast) {
    // Pretend success so bots get no signal, but store nothing.
    return ok(res, { received: true }, 201);
  }
  if (tooManyLinks) throw ApiError.badRequest('Please include no more than 3 links in your message.');

  await ContactInquiry.create(data);
  ok(res, { received: true }, 201);
});

export const listInquiries = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 25 } = req.query;
  const query = ['new', 'read', 'archived'].includes(status) ? { status } : {};
  const lim = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const pg = Math.max(Number(page) || 1, 1);
  const [items, total, unread] = await Promise.all([
    ContactInquiry.find(query).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    ContactInquiry.countDocuments(query),
    ContactInquiry.countDocuments({ status: 'new' }),
  ]);
  ok(res, { items, total, unread, page: pg, pages: Math.max(Math.ceil(total / lim), 1) });
});

export const updateInquiry = asyncHandler(async (req, res) => {
  const item = await ContactInquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!item) throw ApiError.notFound('Inquiry not found');
  ok(res, { item });
});

export const deleteInquiry = asyncHandler(async (req, res) => {
  const item = await ContactInquiry.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Inquiry not found');
  ok(res, { deleted: item._id });
});
