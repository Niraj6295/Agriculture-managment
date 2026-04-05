const User = require('../models/User');
const Crop = require('../models/Crop');
const { Alert, AILog } = require('../models/misc');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Update user (admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, isActive, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { name, role, isActive, phone }, { new: true }
    );
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Deactivate/Activate user
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// System stats for admin dashboard
exports.getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalFarmers, totalExperts, totalCrops, aiLogs] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'expert' }),
      Crop.countDocuments(),
      AILog.countDocuments(),
    ]);

    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email role createdAt');
    const healthBreakdown = await Crop.aggregate([
      { $group: { _id: '$healthStatus', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalFarmers, totalExperts, totalCrops, aiLogs },
      recentUsers,
      healthBreakdown,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Send system alert to all or specific users
exports.sendBroadcastAlert = async (req, res) => {
  try {
    const { title, message, severity, targetRole } = req.body;
    const filter = targetRole ? { role: targetRole } : {};
    const users = await User.find(filter).select('_id');

    const alerts = users.map((u) => ({
      user: u._id,
      type: 'system',
      severity: severity || 'low',
      title,
      message,
    }));
    await Alert.insertMany(alerts);
    res.json({ success: true, sent: alerts.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const users = await User.find().select('name email role activityLogs lastLogin').sort('-lastLogin');
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
