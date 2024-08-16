// models/PropertyModel.js
const db = require('../config/db');

const PropertyModel = {
  findAll: async function() {
    const [rows] = await db.query('SELECT * FROM properties');
    return rows;
  },

  findById: async function(id) {
    const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
    return rows[0];
  },

  create: async function(newProperty) {
    const { title, availableDate, rooms, bathrooms, location, name, price, tags, description, images, rented, sources, agent_id } = newProperty;
    const sql = `
      INSERT INTO properties 
      (title, availableDate, rooms, bathrooms, location, name, price, tags, description, images, rented, sources, agent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [title, availableDate, rooms, bathrooms, location, name, price, tags, description, images, rented, sources, agent_id]);
    return result.insertId;
  },

  update: async function(id, updatedProperty) {
    const { title, availableDate, rooms, bathrooms, location, name, price, tags, description, images, rented, sources, agent_id } = updatedProperty;
    const sql = `
      UPDATE properties SET 
      title = ?, availableDate = ?, rooms = ?, bathrooms = ?, location = ?, 
      name = ?, price = ?, tags = ?, description = ?, images = ?, rented = ?,
      sources = ?, agent_id = ?
      WHERE id = ?
    `;
    await db.query(sql, [title, availableDate, rooms, bathrooms, location, name, price, tags, description, images, rented, sources, agent_id, id]);
    return this.findById(id);
  },

  delete: async function(id) {
    const [result] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = PropertyModel;
