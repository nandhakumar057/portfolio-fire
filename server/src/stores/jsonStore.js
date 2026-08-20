const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function read() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('[jsonStore] Failed to read db.json:', err.message);
    }
    return {};
  }
}

// Write atomically (temp file + rename) so a crash mid-write can't corrupt db.json
function write(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

/**
 * Local JSON-file data store. Used automatically when Firestore is not
 * configured (or unreachable) so the app works out of the box.
 */
const jsonStore = {
  async findAll(collection) {
    return read()[collection] || [];
  },

  async findById(collection, id) {
    return (read()[collection] || []).find((x) => x.id === id) || null;
  },

  async findOne(collection, query) {
    return (
      (read()[collection] || []).find((x) =>
        Object.entries(query).every(([k, v]) => x[k] === v)
      ) || null
    );
  },

  async create(collection, data) {
    const db = read();
    const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data };
    db[collection] = db[collection] || [];
    db[collection].push(item);
    write(db);
    return item;
  },

  async update(collection, id, data) {
    const db = read();
    const list = db[collection] || [];
    const idx = list.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, id };
    write(db);
    return list[idx];
  },

  async remove(collection, id) {
    const db = read();
    if (!db[collection]) return false;
    const before = db[collection].length;
    db[collection] = db[collection].filter((x) => x.id !== id);
    write(db);
    return db[collection].length < before;
  },

  /**
   * Upsert keyed on one or more columns (comma-separated). Used by analytics
   * so concurrent first hits on the same (date, path) don't double-create.
   */
  async upsert(collection, data, onConflict) {
    const db = read();
    const list = db[collection] || [];
    const keys = String(onConflict).split(',').map((k) => k.trim());
    const existing = list.find((x) => keys.every((k) => x[k] === data[k]));
    if (existing) {
      const updated = { ...existing, ...data, id: existing.id };
      list[list.indexOf(existing)] = updated;
      write(db);
      return updated;
    }
    const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data };
    list.push(item);
    db[collection] = list;
    write(db);
    return item;
  },

  async count(collection) {
    return (read()[collection] || []).length;
  },
};

module.exports = { default: jsonStore };
