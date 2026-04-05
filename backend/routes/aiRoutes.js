const express = require('express');
const router = express.Router();
const { chat, diseaseDetect, soilAnalysis, getAILogs } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/chat', chat);
router.post('/disease-detect', diseaseDetect);
router.post('/soil-analysis', soilAnalysis);
router.get('/logs', getAILogs);

module.exports = router;
