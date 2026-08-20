require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./src/routes/authRoutes');
const contentRoutes = require('./src/routes/contentRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const mediaRoutes = require('./src/routes/mediaRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const seed = require('./src/config/seed');
const { getMode } = require('./src/config/db');

// Express 4 doesn't catch async handler rejections, and modern Node would
// crash the process on an unhandled rejection. Log instead of dying — the
// affected request still errors out, but the API keeps serving.
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason?.message || reason);
});

const app = express();

// Respect X-Forwarded-* headers when deployed behind HTTPS-terminating proxies
// (keeps req.protocol correct for absolute upload URLs).
app.set('trust proxy', 1);

// ── Security headers (helmet v7) ────────────────────────────────────
// CSP is tuned for the SPA served from client/dist: it has one inline
// theme-bootstrap script and loads Google Fonts. Uploaded media may be fetched
// cross-origin by the deployed frontend, so CORP must allow that.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        // helmet merges its defaults with these directives; this explicit null
        // removes the default `upgrade-insecure-requests`, which would rewrite
        // http:// API calls to https:// and break the SPA served over plain
        // HTTP (localhost / single-instance deploys).
        upgradeInsecureRequests: null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── CORS allowlist ──────────────────────────────────────────────────
// The SPA dev server and the deployed site are always allowed.
// Add more origins (e.g. a custom domain) via CORS_ORIGINS (comma-separated).
const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // When the SPA is deployed on a custom domain (VITE_SITE_URL), it is
    // allowed automatically; add any other origins via CORS_ORIGINS.
    ...(process.env.VITE_SITE_URL ? [process.env.VITE_SITE_URL] : []),
    ...(process.env.CORS_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  ]
);

app.use(
  cors({
    // Allow non-browser requests (curl, server-to-server) and same-origin
    // calls. A disallowed origin gets a response with NO CORS headers, so
    // the browser blocks it from reading the response.
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      cb(null, allowedOrigins.has(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// 10mb so base64 media/resume uploads (up to ~6MB files) fit inside JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: getMode(), time: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', contentRoutes('projects'));
app.use('/api/certifications', contentRoutes('certifications'));
app.use('/api/skills', contentRoutes('skills'));
app.use('/api/achievements', contentRoutes('achievements'));
app.use('/api/blog', blogRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stats', statsRoutes);

// Serve uploaded media (used by the Media Library + Resume upload)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use(
  '/uploads',
  // Uploaded files are user-provided bytes served as documents — sandbox them
  // so an uploaded SVG/HTML can never execute scripts in the API's origin.
  (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    next();
  },
  express.static(uploadsDir)
);

// Serve the built client (optional — handy for single-instance deploys)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Error handler — don't leak internals in production
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[error]', err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    message: 'Something went wrong.',
    ...(isProd ? {} : { error: err.message }),
  });
});

// Note: macOS reserves 5000 for AirPlay Receiver — default to 5001.
const PORT = process.env.PORT || 5001;

async function start() {
  try {
    await seed();
  } catch (err) {
    console.warn('[boot] Seeding skipped:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`[server] Portfolio API running on http://localhost:${PORT}`);
  });
}

start();
