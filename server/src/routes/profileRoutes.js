const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProfile);
router.put('/', protect, adminOnly, updateProfile);

module.exports = router;
