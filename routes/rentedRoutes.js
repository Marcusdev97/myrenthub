const express = require('express');
const router = express.Router();
const rentedController = require('../controllers/rentedController');

router.get('/', rentedController.getRentedProperties);
router.get('/:id', rentedController.getRentedPropertyById);

// Update Rented Properties;
router.patch('/:id', rentedController.updateRentedUnit); // Ensure this line is present

module.exports = router;
