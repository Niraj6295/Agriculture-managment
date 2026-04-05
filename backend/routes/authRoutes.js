// authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate, sanitize } = require('../middleware/validateMiddleware');

router.use(sanitize);

router.post('/register', validate(['name', 'email', 'password']), auth.register);
router.post('/login',    validate(['email', 'password']), auth.login);
router.post('/verify-otp', validate(['userId', 'otp']), auth.verifyOtp);
router.get('/me', protect, auth.getMe);
router.put('/profile', protect, upload.single('profileImage'), auth.updateProfile);
router.put('/toggle-2fa', protect, auth.toggle2FA);
router.put('/change-password', protect, validate(['currentPassword', 'newPassword']), auth.changePassword);

module.exports = router;
