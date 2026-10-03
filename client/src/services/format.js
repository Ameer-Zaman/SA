// Display helpers shared by public pages and admin.

// Multi-track releases that get their own section and a tracklist.
export const PROJECT_TYPES = ['ep', 'album', 'mixtape'];
export const isProject = (m) => PROJECT_TYPES.includes(m?.releaseType);
export const trackCount = (m) => (m?.tracks?.length ? `${m.tracks.length} track${m.tracks.length === 1 ? '' : 's'}` : '');

export const RELEASE_TYPE_LABEL = { single: 'Single', ep: 'EP', album: 'Album', mixtape: 'Mixtape', other: 'Release' };
export const CREDIT_LABEL = { solo: 'Solo', collaboration: 'Collaboration', group: 'Group release' };
export const VIDEO_CATEGORY_LABEL = {
  'music-video': 'Music videos', live: 'Live', visualizer: 'Visualizers', 'lyric-video': 'Lyric videos',
  'behind-the-scenes': 'Behind the scenes', interview: 'Interviews', other: 'Other',
};
export const INQUIRY_LABEL = { booking: 'Booking', business: 'Business', collaboration: 'Collaboration', press: 'Press', other: 'Other' };

export const PLATFORM_LABEL = {
  spotify: 'Spotify', 'apple-music': 'Apple Music', 'youtube-music': 'YouTube Music', youtube: 'YouTube',
  jiosaavn: 'JioSaavn', 'amazon-music': 'Amazon Music', soundcloud: 'SoundCloud', bandcamp: 'Bandcamp',
  instagram: 'Instagram', x: 'X', facebook: 'Facebook', threads: 'Threads', tiktok: 'TikTok', other: 'Link',
};
export const STREAMING_PLATFORMS = ['spotify', 'apple-music', 'youtube-music', 'youtube', 'jiosaavn', 'amazon-music', 'soundcloud', 'bandcamp', 'other'];
export const SOCIAL_PLATFORMS = ['instagram', 'youtube', 'x', 'facebook', 'threads', 'tiktok', 'other'];

export const linkLabel = (l) => l.label || PLATFORM_LABEL[l.platform] || l.platform;

export const ytThumb = (id, q = 'hqdefault') => (id ? `https://i.ytimg.com/vi/${id}/${q}.jpg` : '');

export function ytId(url = '') {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/** Year only shown publicly when the release is marked verified. */
export const publicYear = (m) => (m.verified && m.releaseYear ? String(m.releaseYear) : '');

export const formatDate = (d, opts = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  d ? new Date(d).toLocaleDateString('en-IN', opts) : '';

export const paragraphs = (text = '') => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const primaryListen = (m) => m.streamingLinks?.[0]?.url || (m.youtubeUrl || '');
