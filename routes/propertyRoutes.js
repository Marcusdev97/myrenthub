const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const propertyController = require('../controllers/propertyController');
const imageController = require('../controllers/imageController'); // Import the new imageController

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate unique filename
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Preserve file extension
  }
});

const upload = multer({ storage: storage });

// Get all properties
router.get('/', propertyController.getAllProperties);

// Get a single property by ID
router.get('/:id', propertyController.getPropertyById);

// Post a new property along with images
router.post('/upload', upload.array('images', 10), propertyController.createProperty);

// Upload images for an existing property
router.post('/properties/:id/upload-images', upload.array('images', 10), imageController.uploadImages);

// Update an existing property along with images (patching)
router.patch('/:id', upload.array('images', 10), propertyController.updateProperty);

// Delete a property and its associated images
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
