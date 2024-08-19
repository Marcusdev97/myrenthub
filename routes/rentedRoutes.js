const express = require('express');
const router = express.Router();
const rentedController = require('../controllers/rentedController');

router.get('/', rentedController.getRentedProperties);
router.get('/:id', rentedController.getRentedPropertyById);

module.exports = router;
