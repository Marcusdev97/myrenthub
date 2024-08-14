// models/AgentModel.js
const db = require('../config/db');

const AgentModel = {
  findAll: async function() {
    const [rows] = await db.query('SELECT * FROM agents');
    return rows;
  },

  findById: async function(agent_id) {
    const [rows] = await db.query('SELECT * FROM agents WHERE agent_id = ?', [agent_id]);
    return rows[0];
  },

  create: async function(newAgent) {
    const { name, contact_info } = newAgent;
    const sql = `
      INSERT INTO agents (name, contact_info)
      VALUES (?, ?)
    `;
    const [result] = await db.query(sql, [name, contact_info]);
    return result.insertId;
  },

  update: async function(agent_id, updatedAgent) {
    const { name, contact_info } = updatedAgent;
    const sql = `
      UPDATE agents SET 
      name = ?, contact_info = ? 
      WHERE agent_id = ?
    `;
    await db.query(sql, [name, contact_info, agent_id]);
    return this.findById(agent_id);
  },

  delete: async function(agent_id) {
    const [result] = await db.query('DELETE FROM agents WHERE agent_id = ?', [agent_id]);
    return result.affectedRows;
  }
};

module.exports = AgentModel;
