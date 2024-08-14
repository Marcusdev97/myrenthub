// models/PartnerModel.js
const db = require('../config/db');

const PartnerModel = {
  findAll: async function() {
    const [rows] = await db.query('SELECT * FROM partners');
    return rows;
  },

  findById: async function(partner_id) {
    const [rows] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [partner_id]);
    return rows[0];
  },

  create: async function(newPartner) {
    const { name, contact_info, company } = newPartner;
    const sql = `
      INSERT INTO partners (name, contact_info, company)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, contact_info, company]);
    return result.insertId;
  },

  update: async function(partner_id, updatedPartner) {
    const { name, contact_info, company } = updatedPartner;
    const sql = `
      UPDATE partners SET 
      name = ?, contact_info = ?, company = ? 
      WHERE partner_id = ?
    `;
    await db.query(sql, [name, contact_info, company, partner_id]);
    return this.findById(partner_id);
  },

  delete: async function(partner_id) {
    const [result] = await db.query('DELETE FROM partners WHERE partner_id = ?', [partner_id]);
    return result.affectedRows;
  }
};

module.exports = PartnerModel;
