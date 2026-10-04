// Offline preview data, used only when the client is built with VITE_DEMO=true.
// Titles come from the project brief; nothing here is presented as verified fact.

const NOTE = 'Sample layout for the preview. Real details are added in the admin.';

const rel = (title, extra = {}) => ({
  _id: `demo-${title.toLowerCase().replace(/\W+/g, '-')}`,
  slug: title.toLowerCase().replace(/\W+/g, '-'),
  title,
  description: '',
  coverImage: '',
  releaseYear: null,
  releaseType: 'single',
  creditType: 'solo',
  artists: ['SA'],
  collaborators: [],
  streamingLinks: [],
  youtubeUrl: '',
  verified: false,
  published: true,
  tracks: [],
  ...extra,
});

const MUSIC = [
  rel('Economy', { featured: true }),
  rel('Manushyar', { creditType: 'group', collaborators: ['Dabzee', 'M.H.R', 'Joker390P'] }),
  rel('Eulogy'),
  rel('Alif'),
  rel('Ijj'),
  rel('Maarijan'),
  rel('Example EP', {
    releaseType: 'ep',
    description: NOTE,
    tracks: [{ title: 'Track one' }, { title: 'Track two' }, { title: 'Track three' }],
  }),
];

const BIO = {
  introduction:
    'SA is a rapper from Kerala, India, associated with the Kerala hip-hop scene and the rap collective Manushyar. His music moves between English rap and Malayalam hip-hop.',
  biography: '',
  portraitImage: '',
  secondaryImage: '',
  timeline: [],
  musicalIdentity: { approach: '', influences: '', languages: 'SA raps in both English and Malayalam.', style: '' },
  collaborations: [
    {
      _id: 'demo-manushyar',
      name: 'Manushyar',
      kind: 'collective',
      description: 'Kerala rap collective.',
      members: ['SA', 'Dabzee', 'M.H.R', 'Joker390P'],
      image: '',
      link: '',
      verified: false,
    },
  ],
};

const SETTINGS = {
  tagline: 'THE SOUND OF MY OWN WORLD',
  heroIntro: 'Rapper from Kerala. English rap and Malayalam hip-hop.',
  heroImage: '',
  socialLinks: [],
  streamingProfiles: [],
  contactEmail: '',
  seo: { title: 'SA — Official Website', description: '' },
  featuredMusic: MUSIC[0],
  featuredVideos: [],
};

const FILTERS = {
  singles: (m) => m.releaseType === 'single' && m.creditType === 'solo',
  albums: (m) => ['album', 'ep', 'mixtape'].includes(m.releaseType),
  collaborations: (m) => ['collaboration', 'group'].includes(m.creditType),
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function demoRequest(path, { method = 'GET' } = {}) {
  await wait(120);
  const [route, qs = ''] = path.split('?');
  const q = Object.fromEntries(new URLSearchParams(qs));

  if (route === '/settings') return { settings: SETTINGS };
  if (route === '/about') return { biography: BIO };
  if (route === '/videos') return { items: [], categories: [] };
  if (route === '/contact' && method === 'POST') { await wait(500); return { received: true }; }
  if (route === '/music') {
    let items = MUSIC;
    if (q.filter && FILTERS[q.filter]) items = items.filter(FILTERS[q.filter]);
    if (q.limit) items = items.slice(0, Number(q.limit));
    const counts = Object.fromEntries(Object.entries(FILTERS).map(([k, f]) => [k, MUSIC.filter(f).length]));
    return { items, counts };
  }
  if (route.startsWith('/music/')) {
    const item = MUSIC.find((m) => m.slug === decodeURIComponent(route.slice(7)));
    if (!item) { const e = new Error('Release not found'); e.status = 404; throw e; }
    return { item, videos: [], appearsOn: [] };
  }
  const e = new Error('The admin is not available in this preview.');
  e.status = 401;
  throw e;
}

export const DEMO = true;
