const express = require('express');
const { track, summary } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/track', track); // public — fired by the client on route changes
router.get('/summary', protect, adminOnly, summary);

module.exports = router;
