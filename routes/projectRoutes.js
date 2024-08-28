const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Get all projects
router.get('/', projectController.getAllProjects);

// Get a single project by ID
router.get('/:id', projectController.getProjectById);

// Create a new project
router.post('/', projectController.createProject);

// Update an existing project
router.patch('/:id', projectController.updateProject);

// Delete a project
router.delete('/:id', projectController.deleteProject);

module.exports = router;
