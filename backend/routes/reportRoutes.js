const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Crop = require('../models/Crop');
const SoilData = require('../models/SoilData');
const { Irrigation, Alert, AILog } = require('../models/misc');

router.use(protect);

// Generate farm summary report
router.get('/summary', async (req, res) => {
  try {
    const farmerId = req.user._id;
    const [crops, soilRecords, irrigations, alerts, aiLogs] = await Promise.all([
      Crop.find({ farmer: farmerId }),
      SoilData.find({ farmer: farmerId }).sort('-recordedAt').limit(10),
      Irrigation.find({ farmer: farmerId }).populate('crop', 'name').sort('-scheduledDate').limit(10),
      Alert.find({ user: farmerId }).sort('-createdAt').limit(10),
      AILog.find({ user: farmerId }).sort('-createdAt').limit(10),
    ]);

    const report = {
      generatedAt: new Date(),
      farmer: req.user.name,
      overview: {
        totalCrops: crops.length,
        healthyCrops: crops.filter(c => c.healthStatus === 'healthy').length,
        warningCrops: crops.filter(c => c.healthStatus === 'warning').length,
        criticalCrops: crops.filter(c => c.healthStatus === 'critical').length,
      },
      recentSoilReadings: soilRecords,
      irrigationSchedules: irrigations,
      recentAlerts: alerts,
      aiInteractions: aiLogs.length,
      crops,
    };

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
