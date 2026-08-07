const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getStore } = require('../config/db');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function ensureUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const EXT_BY_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
};

async function list(req, res) {
  const store = await getStore();
  const items = await store.findAll('media');
  res.json(items.reverse());
}

/** Add a media record by URL (e.g. pasted Cloudinary / Supabase storage link). */
async function create(req, res) {
  const { name, url, type } = req.body || {};
  if (!name || !url) {
    return res.status(400).json({ message: 'Name and URL are required.' });
  }
  const store = await getStore();
  const item = await store.create('media', {
    name: String(name).slice(0, 120),
    url: String(url).slice(0, 1000),
    type: String(type || 'link').slice(0, 60),
    size: 0,
  });
  res.status(201).json(item);
}

/**
 * POST /api/media/upload  { name, data (base64), type }
 * Decodes and saves to server/uploads, then records it in the media library.
 */
async function upload(req, res) {
  const { name, data, type } = req.body || {};
  if (!data) return res.status(400).json({ message: 'No file data provided.' });

  const ext = EXT_BY_MIME[type] || '.bin';
  const base64 = String(data).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length || buffer.length > 6 * 1024 * 1024) {
    return res.status(400).json({ message: 'File is empty or larger than 6 MB.' });
  }

  ensureUploadsDir();
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);

  // Absolute URL so the frontend can reach the file even when the API and
  // the site run on different origins (dev: vite proxy, prod: separate host).
  const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  const store = await getStore();
  const item = await store.create('media', {
    name: String(name || filename).slice(0, 120),
    url,
    type: type || 'application/octet-stream',
    size: buffer.length,
  });
  res.status(201).json(item);
}

async function remove(req, res) {
  const store = await getStore();
  const item = await store.findById('media', req.params.id).catch(() => null);
  const ok = await store.remove('media', req.params.id);
  if (!ok) return res.status(404).json({ message: 'Not found.' });

  // Best-effort cleanup of the local file (ignore failures — record is already gone).
  // The URL may be relative (/uploads/x) or absolute (http://host/uploads/x).
  if (item && item.url) {
    const match = String(item.url).match(/\/uploads\/([^/?#]+)/);
    if (match) {
      try {
        fs.unlinkSync(path.join(UPLOADS_DIR, path.basename(match[1])));
      } catch {
        /* ignore */
      }
    }
  }
  res.json({ success: true });
}

module.exports = { list, create, upload, remove };
