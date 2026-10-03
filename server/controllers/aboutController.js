import Biography from '../models/Biography.js';
import { asyncHandler, ok } from '../utils/helpers.js';

export const getAbout = asyncHandler(async (_req, res) => {
  const bio = await Biography.getSingleton();
  ok(res, { biography: bio });
});

/** PUT /api/about — timeline order is the array order sent by the admin UI. */
export const updateAbout = asyncHandler(async (req, res) => {
  const bio = await Biography.getSingleton();
  const { musicalIdentity, ...rest } = req.body;
  bio.set(rest);
  if (musicalIdentity) bio.set('musicalIdentity', { ...bio.musicalIdentity.toObject(), ...musicalIdentity });
  await bio.save();
  ok(res, { biography: bio });
});
