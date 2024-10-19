const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');

// Multer setup for file handling
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG and PNG images are allowed'), false);
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});


// Route to upload images for an existing property
router.post('/properties/:propertyId/upload-images', upload.array('images', 10), imageController.uploadImages);
router.get('/properties/:propertyId/images', imageController.getImagesByPropertyId);
router.delete('/properties/:propertyId/images', imageController.deleteImagesByPropertyId);


module.exports = router;