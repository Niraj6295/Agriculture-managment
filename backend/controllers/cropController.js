const Crop = require('../models/Crop');
const { Alert } = require('../models/misc');

// Get all crops for the logged-in farmer (admin sees all)
exports.getCrops = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { farmer: req.user._id };
    const crops = await Crop.find(filter).populate('farmer', 'name email').sort('-createdAt');
    res.json({ success: true, count: crops.length, crops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single crop
exports.getCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmer', 'name email');
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create crop
exports.createCrop = async (req, res) => {
  try {
    const cropData = { ...req.body, farmer: req.user._id };
    const crop = await Crop.create(cropData);
    res.status(201).json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update crop
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found or unauthorized' });
    res.json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete crop
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found or unauthorized' });
    res.json({ success: true, message: 'Crop deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Upload crop image
exports.uploadCropImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const imageUrl = `/uploads/crops/${req.file.filename}`;
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { $push: { images: imageUrl } },
      { new: true }
    );
    res.json({ success: true, imageUrl, crop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const [totalCrops, healthyCrops, warningCrops, criticalCrops] = await Promise.all([
      Crop.countDocuments({ farmer: farmerId }),
      Crop.countDocuments({ farmer: farmerId, healthStatus: 'healthy' }),
      Crop.countDocuments({ farmer: farmerId, healthStatus: 'warning' }),
      Crop.countDocuments({ farmer: farmerId, healthStatus: 'critical' }),
    ]);
    const recentCrops = await Crop.find({ farmer: farmerId }).sort('-createdAt').limit(5);
    const unreadAlerts = await Alert.countDocuments({ user: farmerId, isRead: false });

    res.json({
      success: true,
      stats: { totalCrops, healthyCrops, warningCrops, criticalCrops, unreadAlerts },
      recentCrops,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
