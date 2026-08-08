const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getStore } = require('../config/db');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

function ensureUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// File identification by magic bytes — the client-declared MIME type is never
// trusted. The real type is derived from the file's leading bytes, and a
// declared type that contradicts the content is rejected outright.
const SIGNATURES = [
  {
    mime: 'image/png',
    ext: '.png',
    match: (b) =>
      b.length > 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: 'image/jpeg',
    ext: '.jpg',
    match: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/webp',
    ext: '.webp',
    match: (b) =>
      b.length > 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  },
  {
    mime: 'image/gif',
    ext: '.gif',
    match: (b) => b.length > 6 && b.toString('ascii', 0, 4) === 'GIF8',
  },
  {
    mime: 'application/pdf',
    ext: '.pdf',
    match: (b) => b.length > 4 && b.toString('ascii', 0, 4) === '%PDF',
  },
  {
    // SVG is XML text: allow an optional BOM, XML declaration and comments
    // before the root <svg> tag (checked on the first 1 KB).
    mime: 'image/svg+xml',
    ext: '.svg',
    match: (b) =>
      /^\s*(?:<\?xml[\s\S]*?\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(
        b.toString('utf8', 0, 1024)
      ),
  },
];

function sniffType(buffer) {
  return SIGNATURES.find((sig) => sig.match(buffer)) || null;
}

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

  const base64 = String(data).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length || buffer.length > 6 * 1024 * 1024) {
    return res.status(400).json({ message: 'File is empty or larger than 6 MB.' });
  }

  // Identify the file by its content, not by the client-supplied MIME type.
  const sniffed = sniffType(buffer);
  if (!sniffed) {
    return res.status(400).json({
      message: 'Unsupported file type. Allowed: PNG, JPEG, WebP, GIF, SVG, PDF.',
    });
  }

  // If a type was declared, it must agree with the actual content.
  const declared = String(type || '').toLowerCase().split(';')[0].trim();
  if (declared && declared !== sniffed.mime) {
    return res.status(400).json({
      message: `Declared type (${declared}) does not match the file content (${sniffed.mime}).`,
    });
  }

  ensureUploadsDir();
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${sniffed.ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);

  // Absolute URL so the frontend can reach the file even when the API and
  // the site run on different origins (dev: vite proxy, prod: separate host).
  const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  const store = await getStore();
  const item = await store.create('media', {
    name: String(name || filename).slice(0, 120),
    url,
    type: sniffed.mime,
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
