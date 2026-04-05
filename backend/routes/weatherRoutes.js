const express = require('express');
const router = express.Router();
const { getWeatherData, saveWeatherData } = require('../controllers/dataControllers');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getWeatherData);
router.post('/', saveWeatherData);

module.exports = router;
