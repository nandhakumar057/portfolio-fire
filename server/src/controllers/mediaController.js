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

/**
 * Upload a buffer to Firebase Storage and return the public download URL.
 * Falls back to local disk storage when Firebase is not configured.
 */
async function uploadToStorage(buffer, filename, mimeType) {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (bucket) {
    try {
      const { getStorage } = require('../config/firebase');
      const bucketObj = getStorage().bucket();
      const filePath = `portfolio/media/${filename}`;
      const file = bucketObj.file(filePath);

      await file.save(buffer, {
        contentType: mimeType,
        metadata: { cacheControl: 'public, max-age=31536000' },
      });

      // Make the file publicly readable so the frontend can fetch it
      await file.makePublic();

      // Return the public URL
      return `https://storage.googleapis.com/${bucket}/${filePath}`;
    } catch (err) {
      console.warn('[media] Firebase Storage upload failed, falling back to local disk:', err.message);
    }
  }

  // Fallback: save to local disk
  ensureUploadsDir();
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function list(req, res) {
  try {
    const store = await getStore();
    const items = await store.findAll('media');
    res.json(items.reverse());
  } catch (err) {
    console.error('[media] list error:', err.message);
    res.status(500).json({ message: 'Failed to load media.' });
  }
}

/** Add a media record by URL (e.g. pasted Cloudinary / Firebase Storage link). */
async function create(req, res) {
  try {
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
  } catch (err) {
    console.error('[media] create error:', err.message);
    res.status(500).json({ message: 'Failed to add media.' });
  }
}

/**
 * POST /api/media/upload  { name, data (base64), type }
 * Decodes and saves to Firebase Storage (or local disk), then records it in
 * the media library.
 */
async function upload(req, res) {
  try {
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

    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${sniffed.ext}`;
    const url = await uploadToStorage(buffer, filename, sniffed.mime);

    // Make URL absolute for cross-origin access
    const fullUrl = url.startsWith('http') ? url : `${req.protocol}://${req.get('host')}${url}`;

    const store = await getStore();
    const item = await store.create('media', {
      name: String(name || filename).slice(0, 120),
      url: fullUrl,
      type: sniffed.mime,
      size: buffer.length,
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('[media] upload error:', err.message);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
}

async function remove(req, res) {
  try {
    const store = await getStore();
    const item = await store.findById('media', req.params.id).catch(() => null);
    const ok = await store.remove('media', req.params.id);
    if (!ok) return res.status(404).json({ message: 'Not found.' });

    // Best-effort cleanup of the file (ignore failures — record is already gone).
    if (item && item.url) {
      // Try Firebase Storage cleanup
      const firebaseMatch = String(item.url).match(/storage\.googleapis\.com\/[^/]+\/portfolio\/media\/(.+)/);
      if (firebaseMatch) {
        try {
          const { getStorage } = require('../config/firebase');
          const bucket = getStorage().bucket();
          await bucket.file(`portfolio/media/${firebaseMatch[1]}`).delete();
        } catch {
          /* ignore — file may not exist or Firebase may be unavailable */
        }
      }

      // Try local disk cleanup
      const localMatch = String(item.url).match(/\/uploads\/([^/?#]+)/);
      if (localMatch) {
        try {
          fs.unlinkSync(path.join(UPLOADS_DIR, path.basename(localMatch[1])));
        } catch {
          /* ignore */
        }
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[media] remove error:', err.message);
    res.status(500).json({ message: 'Failed to delete media.' });
  }
}

module.exports = { list, create, upload, remove };
