const express = require('express');
const { list, create, upload, remove } = require('../controllers/mediaController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, adminOnly, list);
router.post('/', protect, adminOnly, create);
router.post('/upload', protect, adminOnly, upload);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
