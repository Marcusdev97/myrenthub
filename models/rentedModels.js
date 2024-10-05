const db = require('../config/db');

const RentedModel = {
  findAll: async function() {
    const sql = `
    SELECT
      p.id AS property_id,
      p.title,
      p.name AS condo_name,
      p.price,
      p.sources,
      p.agent,
      r.unit_number AS unit_number,
      r.check_in_date AS check_in_date,
      r.security_deposit AS security_deposit,
      r.security_utilities_deposit AS security_utilities_deposit,
      r.access_card_deposit AS access_card_deposit,
      r.other_deposit AS other_deposit,
      r.special_condition AS special_condition,
      r.tenancy_fees AS tenancy_fees,
      r.internet_needed AS internet_needed,
      r.remark AS remark
    FROM properties p
    LEFT JOIN rented_units r ON p.id = r.property_id
    WHERE p.rented = 1 AND p.agent IS NOT NULL;
    `;
    const [rows] = await db.query(sql);
    return rows;
  }
};

module.exports = RentedModel;
