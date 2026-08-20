const { getStore } = require('../config/db');

const PUBLIC_KEYS = ['siteName', 'siteTagline', 'metaDescription'];

/** Read settings rows into a plain object. */
async function readSettingsMap() {
  const store = await getStore();
  const rows = await store.findAll('settings').catch(() => []);
  const map = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

/** Upsert a settings row (update value if the key exists, else create). */
async function upsertKey(store, key, value) {
  const existing = await store.findOne('settings', { key });
  if (existing) return store.update('settings', existing.id, { value });
  return store.create('settings', { key, value });
}

/** GET /api/settings — public site info (no secrets). */
async function getPublic(req, res) {
  try {
    const map = await readSettingsMap();
    const out = {};
    for (const key of PUBLIC_KEYS) if (map[key] !== undefined) out[key] = map[key];
    res.json(out);
  } catch (err) {
    console.error('[settings] getPublic error:', err.message);
    res.status(500).json({ message: 'Failed to load settings.' });
  }
}

/** PUT /api/settings — admin updates site info. */
async function update(req, res) {
  try {
    const store = await getStore();
    const body = req.body || {};
    const updated = {};
    for (const key of PUBLIC_KEYS) {
      if (body[key] !== undefined) {
        await upsertKey(store, key, String(body[key]).slice(0, 500));
        updated[key] = String(body[key]).slice(0, 500);
      }
    }
    res.json(updated);
  } catch (err) {
    console.error('[settings] update error:', err.message);
    res.status(500).json({ message: 'Failed to update settings.' });
  }
}

module.exports = { getPublic, update, readSettingsMap, upsertKey };
