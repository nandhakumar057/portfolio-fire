require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

app.use(cors());
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
app.use('/uploads', express.static(uploadsDir));

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
