const express = require('express');
const { create, list, markRead, markReplied, remove } = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', create); // public — contact form
router.get('/', protect, adminOnly, list);
router.patch('/:id/read', protect, adminOnly, markRead);
router.patch('/:id/replied', protect, adminOnly, markReplied);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
