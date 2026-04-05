const express = require('express');
const router = express.Router();
const {
  getAlerts, createAlert, markAlertRead, markAllAlertsRead, deleteAlert,
} = require('../controllers/dataControllers');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/mark-all-read', markAllAlertsRead);
router.put('/:id/read', markAlertRead);
router.delete('/:id', deleteAlert);

module.exports = router;
