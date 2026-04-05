const express = require('express');
const router = express.Router();
const {
  getIrrigationSchedules,
  createIrrigation,
  updateIrrigationStatus,
  deleteIrrigation,
} = require('../controllers/dataControllers');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getIrrigationSchedules);
router.post('/', createIrrigation);
router.put('/:id/status', updateIrrigationStatus);
router.delete('/:id', deleteIrrigation);

module.exports = router;
