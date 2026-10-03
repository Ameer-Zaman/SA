// Small shared helpers: async wrapper, response shape, slugs, YouTube parsing, text sanitizing.

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export function slugify(str) {
  return String(str)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'release';
}

const YT_PATTERNS = [
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
  /youtube\.com\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/,
  /youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{11})/,
];

export function youtubeId(url) {
  if (!url) return null;
  for (const re of YT_PATTERNS) {
    const m = String(url).match(re);
    if (m) return m[1];
  }
  return null;
}

/** Strip HTML tags and control characters from plain-text user input. */
export function cleanText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<[^>]*>?/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

/** Recursively clean strings and drop keys that could be Mongo operators. */
export function deepClean(input) {
  if (Array.isArray(input)) return input.map(deepClean);
  if (input && typeof input === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(input)) {
      if (k.startsWith('$') || k.includes('.')) continue;
      out[k] = deepClean(v);
    }
    return out;
  }
  return cleanText(input);
}
