// projectController.js
const db = require('../config/db');
const ProjectModel = require('../models/projectModels');  // Make sure this path is correct and matches your structure

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.findAll();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);  // Log error for debugging
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const newProject = req.body;
    const projectId = await ProjectModel.create(newProject);
    res.status(201).json({ message: 'Project created', projectId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updatedProject = req.body;
    const project = await ProjectModel.update(req.params.id, updatedProject);
    res.json({ message: 'Project updated', project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const result = await ProjectModel.delete(req.params.id);
    if (result > 0) {
      res.json({ message: 'Project deleted' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
