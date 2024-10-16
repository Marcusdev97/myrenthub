const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const propertyController = require('../controllers/propertyController');

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append extension
  }
});

const upload = multer({ storage: storage });

// Get the properties
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Get the agents and partners
router.get('/agents', propertyController.getAllAgents);
router.get('/partners', propertyController.getAllPartners);

// Post the image & properties
router.post('/upload', upload.array('images', 10), propertyController.createProperty);
router.patch('/:id', upload.array('images', 10), propertyController.updateProperty);
router.patch('/:id', propertyController.updateProperty);

// Delete the property
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;