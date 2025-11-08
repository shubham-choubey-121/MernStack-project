const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { uploadImage, listImages, deleteImage } = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listImages);
router.post('/upload', protect, upload.single('image'), uploadImage);
router.delete('/:filename', protect, deleteImage);

module.exports = router;
