# SA — Official Website

Full-stack MERN site for SA, rapper from Kerala: a cinematic public site (Home, Music, About, Videos, Contact) plus a password-protected admin dashboard that manages every piece of content without touching code.

```
sa-website/
├── client/                React 19 + Vite + Tailwind + Framer Motion
│   └── src/
│       ├── components/    ui/ (Media, Cover, ReleaseCard, Video…), home/, admin/ (form fields), Navbar, Footer
│       ├── pages/         Home, Music, ReleaseDetail, About, Videos, Contact, NotFound, admin/*
│       ├── layouts/       PublicLayout (nav + page transitions), AdminLayout (sidebar + auth guard)
│       ├── context/       SettingsContext, AuthContext, ToastContext
│       ├── hooks/         useFetch, useUi (scroll, body lock, escape)
│       ├── services/      api.js (fetch wrapper), format.js (labels & helpers)
│       └── styles/        index.css (design tokens & components)
└── server/                Express + Mongoose (MVC)
    ├── config/            env, db connection, paths
    ├── models/            Admin, Music, Video, Biography, ContactInquiry, WebsiteSettings
    ├── controllers/       auth, music, video, about, contact, settings, upload, stats
    ├── routes/            REST routes + auth/validation/rate-limit wiring
    ├── middleware/        auth (JWT cookie), validate (zod + sanitising), rateLimit, upload, error
    ├── utils/             helpers, request schemas, seed.js, createAdmin.js
    ├── app.js             Express app (helmet, CORS, compression, static uploads)
    └── server.js          boots DB + HTTP server, graceful shutdown
```

## 1. Requirements

- Node.js 20 or newer
- MongoDB 6+ — either local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 2. Installation

```bash
npm run install:all            # installs root, server and client dependencies
cp server/.env.example server/.env
```

Edit `server/.env`:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | `mongodb://127.0.0.1:27017/sa-website` locally, or your Atlas `mongodb+srv://…` string |
| `JWT_SECRET` | yes | 32+ random characters. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NODE_ENV` | no | `development` or `production` (production turns on secure cookies) |
| `PORT` | no | API port, default `5000` |
| `JWT_EXPIRES_IN` | no | Session length, default `7d` |
| `CLIENT_ORIGIN` | no | Allowed browser origin(s), comma separated. Default `http://localhost:5173` |
| `SERVE_CLIENT` | no | `true` to serve the built React app from Express (single deployment) |
| `TRUST_PROXY` | no | `true` behind Render/Railway/Nginx so rate limits see real IPs |
| `UPLOAD_DIR` | no | Where uploaded images are stored (default `server/uploads`) |

The client needs no env file. Only set `client/.env` → `VITE_API_URL=https://api.example.com` if the API is on a **different origin**; it must stay on the same *site* (e.g. `example.com` + `api.example.com`) because the session cookie is `SameSite=Strict`.

## 3. Database setup

**Local:** install MongoDB Community Edition and start `mongod`. The database is created on first write.

**Atlas:** create a free cluster → *Database Access*: add a user → *Network Access*: allow your server's IP → *Connect → Drivers*: copy the connection string into `MONGODB_URI` (add `/sa-website` before the `?`).

Then create starter content and your admin account:

```bash
npm run seed
npm run create-admin -- --email you@example.com --username admin --password "a-long-unique-password"
```

`create-admin` can be re-run to reset a password. Passwords must be 12+ characters and are stored as bcrypt hashes.

### What the seed creates (and why it is so sparse)

The seed only uses facts from the project brief, and marks all of them **unverified**:

- **Settings:** the suggested tagline “THE SOUND OF MY OWN WORLD” (editable) and a one-line intro.
- **Biography:** a short introduction (Kerala, Manushyar, English + Malayalam rap) and a *Manushyar* collective entry listing SA, Dabzee, M.H.R and Joker390P, flagged “pending verification”.
- **Releases:** *Economy, Manushyar, Eulogy, Alif, Ijj, Maarijan* as **unpublished drafts** with no year, no artwork, no links and the default “Single / Solo” type. Nothing about them is visible publicly until you confirm the real type (solo, collaboration or group release), year and official links, then publish.

No photos, social accounts, streaming links, dates, quotes or videos are invented. Add them in the admin from official sources.

## 4. Development

```bash
npm run dev          # API on :5000 and Vite on :5173 (proxying /api and /uploads)
```

Open http://localhost:5173 for the site and http://localhost:5173/admin for the dashboard.

## 5. Using the admin

| Section | What you can do |
|---|---|
| **Overview** | Counts of releases, videos, inquiries, unverified releases; recent activity |
| **Music** | Add/edit/delete releases, upload cover art, streaming links, artists & collaborators, solo/collab/group credit, publish, feature, mark verified. EPs, albums and mixtapes get a **tracklist editor** (order, durations, featured artists, optional link to a track's own release page) |
| **Videos** | Add official YouTube URLs (thumbnail pulled automatically, or upload one), categories, link to a release, publish, feature |
| **Biography** | Intro, long biography, portrait photos, timeline (add/edit/reorder/delete), musical identity, collaborations & collectives |
| **Settings** | Hero tagline, intro & photo, featured release, featured videos (ordered), social links, streaming profiles, contact email (+ “show publicly” switch), SEO title/description |
| **Inquiries** | Read contact submissions, reply by email, mark read/unread, archive, delete |

**EPs & albums.** Add each EP, album or mixtape as its own release with type *EP*, *Album* or *Mixtape*. On the Music page they get their own large “Albums & EPs” section above singles, and each one has its own page with the full tracklist. If a track is also a separate single on the site, link it in the tracklist. The single's page then shows “Also on” with the project's cover.

**Verification flags.** Releases, videos, timeline entries and collaborations each have a *verified* switch. Unverified items that are published show a small “being verified” label, and release years/video dates are only shown once verified.

**Images.** Uploads are re-encoded server-side to WebP (resized, EXIF stripped). Until real photos are uploaded, the site shows deliberate placeholders (and typographic covers for releases) — never stock images.

## 6. API

All responses: `{ success: true, data }` or `{ success: false, error: { message, details? } }`. 🔒 = admin cookie required.

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/login` | rate limited (10 failed / 15 min) |
| POST | `/api/auth/logout` | |
| GET | `/api/auth/me` | 🔒 |
| GET | `/api/music` | `?filter=singles\|albums\|collaborations&limit=`; admins can add `?all=true` |
| GET | `/api/music/:slug` | includes linked videos |
| POST / PUT / DELETE | `/api/music`, `/api/music/:id` | 🔒 |
| GET | `/api/videos`, `/api/videos/:id` | `?category=`; admins `?all=true` |
| POST / PUT / DELETE | `/api/videos`, `/api/videos/:id` | 🔒 |
| GET / PUT | `/api/about` | PUT 🔒 |
| POST | `/api/contact` | rate limited (5/hour), honeypot + timing + link-spam checks |
| GET / PATCH / DELETE | `/api/contact`, `/api/contact/:id` | 🔒 |
| GET / PUT | `/api/settings` | PUT 🔒; admins `?raw=true` for the editable document |
| POST | `/api/uploads?kind=cover\|photo\|thumb` | 🔒 multipart field `image` |
| GET | `/api/stats` | 🔒 dashboard numbers |
| GET | `/api/health` | health check |

## 7. Security

- bcrypt (cost 12) password hashes; timing-safe login that doesn't reveal whether an email exists
- JWT in an `httpOnly`, `SameSite=Strict` cookie (`Secure` in production) — no tokens in JavaScript
- Every write validated with zod and again by Mongoose; HTML/control characters stripped; `$`/`.` keys dropped (NoSQL-injection guard)
- Helmet security headers with a CSP that only allows YouTube embeds/thumbnails as third parties (fonts are self-hosted)
- Rate limits on login, contact and the API overall; 200 KB JSON body limit; 8 MB image limit with server-side re-encoding
- Admin pages are `noindex` and disallowed in `robots.txt`

## 8. Production build & deployment

**Single server (simplest):**

```bash
npm run install:all
npm run build                      # → client/dist
# server/.env: NODE_ENV=production, SERVE_CLIENT=true, TRUST_PROXY=true (if behind a proxy), real JWT_SECRET, MONGODB_URI
npm start                          # serves the API and the site on PORT
```

Works on Render, Railway, Fly.io, a VPS with PM2, etc. **Use a persistent disk** for `UPLOAD_DIR` — many hosts wipe the filesystem on redeploy. Serve over HTTPS (required for secure cookies).

**Split hosting:** deploy `client/dist` to a static host (with SPA fallback to `index.html`) and the server separately on a subdomain; set `CLIENT_ORIGIN` on the server and `VITE_API_URL` before building the client.

## 9. Customising the design

- Colours, fonts and easing live in `client/tailwind.config.js`; shared component classes (`.btn-solid`, `.label`, `.display`, `.input`, grain texture) in `client/src/styles/index.css`.
- Fonts: Anton (display), Inter Tight (body), JetBrains Mono (labels), self-hosted via `@fontsource`.
- Motion respects the visitor's *reduce motion* setting (`MotionConfig reducedMotion="user"` + CSS).
