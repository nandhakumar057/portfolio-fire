const express = require('express');
const {
  listPublic,
  listAll,
  getPublic,
  create,
  update,
  remove,
  addView,
  listComments,
  addComment,
  approveComment,
  removeComment,
  publicComments,
} = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', listPublic);
router.post('/:id/view', addView);

// Admin — static paths BEFORE /:id so they are not captured as an id
router.get('/all', protect, adminOnly, listAll);
router.get('/comments', protect, adminOnly, listComments);
router.patch('/comments/:id', protect, adminOnly, approveComment);
router.delete('/comments/:id', protect, adminOnly, removeComment);
router.post('/', protect, adminOnly, create);
router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

// Public detail + comments (parametric — registered last)
router.get('/:id', getPublic);
router.get('/:id/comments', publicComments);
router.post('/:id/comments', addComment);

module.exports = router;
