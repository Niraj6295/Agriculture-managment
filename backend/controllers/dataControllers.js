const SoilData = require('../models/SoilData');
const { WeatherData, Irrigation, Alert } = require('../models/misc');

// ==================== SOIL ====================
exports.getSoilData = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { farmer: req.user._id };
    if (req.query.cropId) filter.crop = req.query.cropId;
    const records = await SoilData.find(filter).populate('crop', 'name').sort('-recordedAt').limit(50);
    res.json({ success: true, records });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addSoilData = async (req, res) => {
  try {
    const soil = await SoilData.create({ ...req.body, farmer: req.user._id });
    res.status(201).json({ success: true, soil });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteSoilData = async (req, res) => {
  try {
    await SoilData.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    res.json({ success: true, message: 'Soil record deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ==================== WEATHER ====================
exports.getWeatherData = async (req, res) => {
  try {
    const latest = await WeatherData.findOne({ farmer: req.user._id }).sort('-recordedAt');
    const history = await WeatherData.find({ farmer: req.user._id }).sort('-recordedAt').limit(7);
    res.json({ success: true, latest, history });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.saveWeatherData = async (req, res) => {
  try {
    const weather = await WeatherData.create({ ...req.body, farmer: req.user._id });
    res.status(201).json({ success: true, weather });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ==================== IRRIGATION ====================
exports.getIrrigationSchedules = async (req, res) => {
  try {
    const schedules = await Irrigation.find({ farmer: req.user._id })
      .populate('crop', 'name').sort('scheduledDate');
    res.json({ success: true, schedules });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createIrrigation = async (req, res) => {
  try {
    const schedule = await Irrigation.create({ ...req.body, farmer: req.user._id });
    res.status(201).json({ success: true, schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateIrrigationStatus = async (req, res) => {
  try {
    const schedule = await Irrigation.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteIrrigation = async (req, res) => {
  try {
    await Irrigation.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ==================== ALERTS ====================
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).sort('-createdAt').limit(30);
    const unreadCount = await Alert.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, alerts, unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, alert });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markAlertRead = async (req, res) => {
  try {
    await Alert.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markAllAlertsRead = async (req, res) => {
  try {
    await Alert.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteAlert = async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
