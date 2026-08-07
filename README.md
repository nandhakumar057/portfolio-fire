# Nandhakumar T — Professional Portfolio

A premium, full-stack portfolio website built for **Nandhakumar T** — Computer Science Engineering
student, Full Stack Developer and AI enthusiast.

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion (premium **black enterprise** theme,
  dark only, page transitions, scroll animations, SEO meta/OG/Twitter/JSON-LD, sitemap, robots.txt)
- **Backend:** Node.js + Express + JWT auth (access-code admin login)
- **Database:** Supabase (Postgres) with an automatic **local JSON-file fallback** — the app runs
  out of the box with zero configuration and upgrades to Supabase when you add credentials.
- **Admin dashboard:** analytics, full CRUD for projects / certifications / skills / achievements /
  blog posts, comment moderation, media library, contact-message inbox (search + reply status),
  profile & resume editor, site settings & admin-code change.

---

## Quick start

```bash
# 1. Install everything (root + server + client)
npm run install-all

# 2. Configure the server (optional)
cp server/.env.example server/.env
#    → change JWT_SECRET, ADMIN_CODE

# 3. Run both servers in dev mode
npm run dev
#    Frontend : http://localhost:5173
#    API      : http://localhost:5001  (5000 is reserved by macOS AirPlay)
```

> macOS reserves port 5000 for AirPlay Receiver, so the API defaults to **5001**.

### Admin access — code `2006`

Open **`/admin/login`** and enter the access code. Default code:

| Field | Value |
| ----- | ----- |
| Access code | `2006` |

Change it anytime from **Settings** in the dashboard (survives restarts), or via `ADMIN_CODE` in
`server/.env`. (An optional username/password fallback also works via `ADMIN_USERNAME` /
`ADMIN_PASSWORD` if the `users` table is reachable.)

---

## Project structure

```
├── client/                  # React + Vite + Tailwind frontend
│   ├── public/              # robots.txt, sitemap.xml, favicon
│   └── src/
│       ├── api/             # Axios client + endpoint functions (public fallback included)
│       ├── components/      # Navbar, cards, admin CRUD UI, Particles, etc.
│       ├── context/         # Theme (dark-only) + Auth (JWT) providers
│       ├── data/            # Fallback content shown if the API is offline
│       ├── hooks/           # useTypewriter, useCountUp, usePageMeta (SEO), usePageView (analytics)
│       ├── lib/             # icon + gradient maps
│       └── pages/           # Home … Contact, Blog, admin/ (login + dashboard)
├── server/                  # Express + JWT API
│   ├── supabase/schema.sql  # Supabase tables v2 (run in the SQL editor)
│   └── src/
│       ├── config/          # db store selection + seed data
│       ├── controllers/     # auth, content, blog, analytics, media, settings, profile, messages, stats
│       ├── middleware/      # protect, adminOnly, rate limit
│       ├── models/          # collection field schemas
│       ├── routes/
│       └── stores/          # supabaseStore + jsonStore (drop-in interface)
└── vercel.json              # SPA rewrites for the frontend
```

---

## API overview

| Method | Endpoint                      | Access    | Description                            |
| ------ | ----------------------------- | --------- | -------------------------------------- |
| GET    | `/api/health`                 | public    | Health + active store (`json`/`supabase`) |
| POST   | `/api/auth/login`             | public    | Access-code login → JWT (7 days)       |
| POST   | `/api/auth/change-password`   | admin     | Change the admin access code           |
| GET    | `/api/{projects\|certifications\|skills\|achievements}` | public | List items                |
| POST/PUT/DELETE | `/api/{collection}`    | admin     | Create / update / delete item          |
| GET/PUT| `/api/profile`                | public/admin | Read / update profile (incl. photo, resume, whyHireMe, careerObjective) |
| GET    | `/api/blog`                   | public    | Published posts                        |
| GET    | `/api/blog/all`               | admin     | All posts (incl. drafts)               |
| GET    | `/api/blog/:id`               | public    | Post by id or slug (published only)    |
| POST   | `/api/blog/:id/view`          | public    | Increment post views                   |
| POST   | `/api/blog/:id/comments`      | public    | Submit comment (pending moderation)    |
| GET    | `/api/blog/:id/comments`      | public    | Approved comments                      |
| GET/PATCH/DELETE | `/api/blog/comments`   | admin     | Moderate comments                      |
| POST   | `/api/analytics/track`        | public    | Record a page view / visitor           |
| GET    | `/api/analytics/summary`      | admin     | Totals, top pages, daily series        |
| GET/POST/DELETE | `/api/media`           | admin     | Media library (add by URL)             |
| POST   | `/api/media/upload`           | admin     | Base64 upload (served from `/uploads`) |
| GET/PUT| `/api/settings`               | public/admin | Site name / tagline / meta description |
| POST   | `/api/messages`               | public    | Contact form                           |
| GET/PATCH/DELETE | `/api/messages`       | admin     | Inbox, mark read/replied, delete       |
| GET    | `/api/stats`                  | public    | Hero counters                          |

---

## Using Supabase

The server automatically uses the local JSON store (`server/data/db.json`) until Supabase
credentials are provided.

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor** and run everything in [`server/supabase/schema.sql`](server/supabase/schema.sql)
   (schema **v2** — idempotent, safe to run again). It creates the blog, comments, media,
   settings and analytics tables, plus the new project/profile columns.
3. Copy `Project URL` and a key into `server/.env`:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=sb_publishable_...            # publishable/anon key
   # or
   SUPABASE_SERVICE_ROLE_KEY=eyJ...           # service role (bypasses RLS) — for production
   ```

4. Restart the server. It seeds the tables on boot (idempotently — nothing gets duplicated).

> ⚠️ **Recommended for production:** with a **publishable key**, anyone who extracts it could write
> to your content tables directly — and the `settings` table holds the (bcrypt-hashed) admin code,
> so it should never be writable by outsiders. Use the **service_role key** server-side (never in
> the browser) for strict security. No code changes needed.

---

## Deployment

### Frontend → Vercel

```bash
cd client
# Project root for the Vercel build should be "client", build command "npm run build",
# output directory "dist". Set env var: VITE_API_URL=https://your-api.onrender.com/api
# Optional: VITE_SITE_URL=https://your-domain.com  (used for canonical/OG URLs)
```

The included `vercel.json` (project root) handles SPA rewrites if you deploy from the repo root
with the client as the output.

### Backend → Render

1. Create a new **Web Service** pointing at this repo, root directory `server`.
2. Build command: `npm install` · Start command: `npm start`.
3. Add env vars: `JWT_SECRET`, `ADMIN_CODE`, and (if using Supabase) `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`.
4. After deploying, set `VITE_API_URL` on the Vercel frontend to `https://<your-service>.onrender.com/api`
   and rebuild.

> Note: files uploaded through the Media Library are stored on the server's disk (`server/uploads`)
> and are wiped when a platform like Render restarts. For persistent images, add the image URL
> (e.g. from Cloudinary or Supabase Storage) via "Add by URL" instead.

### Updating SEO URLs

`sitemap.xml`, `robots.txt` and the `index.html` canonical/OG URLs reference a placeholder domain —
replace `https://nandhakumar-portfolio.vercel.app` with your real domain (or set `VITE_SITE_URL`).

---

## Features checklist

- ✅ Premium **black enterprise** theme — dark only, monochrome, glassmorphism, no emojis
- ✅ Full-screen hero: animated name, typing roles, particles + grid + aurora background, photo,
  Download Resume / Contact / Hire Me, social links
- ✅ Recruiter sections: **Professional Summary**, **Why Hire Me**, **Career Objective** (editable)
- ✅ Projects with image, category, status, duration, features, screenshots, GitHub/demo/docs +
  category filters
- ✅ Blog: search, categories, tags, featured, related posts, reading time, author, moderated comments
- ✅ ATS-friendly resume: preview, Download PDF (uploaded file or auto-generated), Print
- ✅ Admin dashboard: analytics (visitors/views/contact requests/blog views/most viewed/monthly),
  full content managers, blog manager (draft/publish), media library, comment moderation,
  message inbox (search + replied), resume manager, profile editor, site settings, change admin code
- ✅ JWT auth, protected routes, bcrypt hashing, input validation, rate limiting, session management
- ✅ SEO: dynamic meta, Open Graph, Twitter cards, canonical, JSON-LD, sitemap, robots.txt
- ✅ Code splitting (lazy routes) + vendor chunking for fast loading
- ✅ Graceful offline fallback content if the API is unreachable
