const express = require('express');
const { getPublic, update } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPublic);
router.put('/', protect, adminOnly, update);

module.exports = router;
