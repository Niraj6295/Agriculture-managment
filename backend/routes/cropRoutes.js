const express = require('express');
const router = express.Router();
const crop = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.get('/dashboard', crop.getDashboardStats);
router.get('/', crop.getCrops);
router.post('/', crop.createCrop);
router.get('/:id', crop.getCrop);
router.put('/:id', crop.updateCrop);
router.delete('/:id', crop.deleteCrop);
router.post('/:id/upload-image', upload.single('cropImage'), crop.uploadCropImage);

module.exports = router;
