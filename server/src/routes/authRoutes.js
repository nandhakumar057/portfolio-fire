const express = require('express');
const { login, me, changePassword } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const { loginRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginRateLimit(), login);
router.get('/me', protect, me);
router.post('/change-password', protect, adminOnly, loginRateLimit(), changePassword);

module.exports = router;
