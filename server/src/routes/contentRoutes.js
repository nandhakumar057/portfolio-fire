const express = require('express');
const { createContentController } = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * Mounts CRUD routes for a content collection.
 * GET is public; write operations require an admin token.
 */
module.exports = function contentRoutes(collection) {
  const ctrl = createContentController(collection);
  const router = express.Router();

  router.get('/', ctrl.list);
  router.get('/:id', ctrl.getOne);
  router.post('/', protect, adminOnly, ctrl.create);
  router.put('/:id', protect, adminOnly, ctrl.update);
  router.delete('/:id', protect, adminOnly, ctrl.remove);

  return router;
};
