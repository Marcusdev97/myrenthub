const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.get('/', agentController.getAllAgents);
router.get('/', agentController.getAgentPropertyDetails);


module.exports = router;
