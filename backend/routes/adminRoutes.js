const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', admin.getSystemStats);
router.get('/users', admin.getAllUsers);
router.get('/users/:id', admin.getUser);
router.put('/users/:id', admin.updateUser);
router.patch('/users/:id/toggle-status', admin.toggleUserStatus);
router.post('/broadcast-alert', admin.sendBroadcastAlert);
router.get('/activity-logs', admin.getActivityLogs);

module.exports = router;
