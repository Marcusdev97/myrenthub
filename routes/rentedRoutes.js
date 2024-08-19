const express = require('express');
const router = express.Router();
const rentedController = require('../controllers/rentedController');

router.get('/', rentedController.getAllRentedUnits);
router.patch('/:id', rentedController.updateRentedUnit);

module.exports = router;
