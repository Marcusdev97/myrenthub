// models/ProjectModel.js
const db = require('../config/db');

const ProjectModel = {
    findAll: async function() {
      const [rows] = await db.query('SELECT * FROM projects');
      return rows;
    },

  findById: async function(id) {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0];
  },

  create: async function(newProject) {
    const { name, completion_date, total_level, total_units, residential_type, image, description, facilities } = newProject;
    const sql = `
      INSERT INTO projects 
      (name, completion_date, total_level, total_units, residential_type, image, description, facilities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, completion_date, total_level, total_units, residential_type, image, description, facilities]);
    return result.insertId;
  },

  update: async function(id, updatedProject) {
    const { name, completion_date, total_level, total_units, residential_type, image, description, facilities } = updatedProject;
    const sql = `
      UPDATE projects SET 
      name = ?, completion_date = ?, total_level = ?, total_units = ?, residential_type = ?, 
      image = ?, description = ?, facilities = ?
      WHERE id = ?
    `;
    await db.query(sql, [name, completion_date, total_level, total_units, residential_type, image, description, facilities, id]);
    return this.findById(id);
  },

  delete: async function(id) {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = ProjectModel; 
