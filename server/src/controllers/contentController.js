const { getStore } = require('../config/db');
const { sanitize, validateRequired } = require('../models/collections');

/**
 * Factory that produces a full CRUD controller for a content collection
 * (projects, certifications, skills, achievements).
 */
function createContentController(collection) {
  return {
    async list(req, res) {
      const store = await getStore();
      const items = await store.findAll(collection);
      res.json(items);
    },

    async getOne(req, res) {
      const store = await getStore();
      const item = await store.findById(collection, req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found.' });
      res.json(item);
    },

    async create(req, res) {
      const data = sanitize(collection, req.body || {});
      const missing = validateRequired(collection, data);
      if (missing.length) {
        return res
          .status(400)
          .json({ message: `Missing required fields: ${missing.join(', ')}` });
      }
      const store = await getStore();
      const item = await store.create(collection, data);
      res.status(201).json(item);
    },

    async update(req, res) {
      const data = sanitize(collection, req.body || {});
      const store = await getStore();
      const item = await store.update(collection, req.params.id, data);
      if (!item) return res.status(404).json({ message: 'Not found.' });
      res.json(item);
    },

    async remove(req, res) {
      const store = await getStore();
      const ok = await store.remove(collection, req.params.id);
      if (!ok) return res.status(404).json({ message: 'Not found.' });
      res.json({ success: true });
    },
  };
}

module.exports = { createContentController };
