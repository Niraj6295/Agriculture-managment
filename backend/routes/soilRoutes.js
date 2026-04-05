const express = require('express');
const router = express.Router();
const { getSoilData, addSoilData, deleteSoilData } = require('../controllers/dataControllers');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getSoilData);
router.post('/', addSoilData);
router.delete('/:id', deleteSoilData);

module.exports = router;
