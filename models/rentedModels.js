const db = require('../config/db');

const RentedModel = {
    findAll: async function() {
        const sql = `
            SELECT p.id AS property_id, p.title, p.name AS condo_name, p.price, p.sources, p.agent,
                   COALESCE(r.check_in_date, 'Update Required') AS check_in_date, 
                   COALESCE(r.tenancy_fees, 'Update Required') AS tenancy_fees, 
                   COALESCE(r.balance, 'Update Required') AS balance, 
                   COALESCE(r.internet_needed, 'Update Required') AS internet_needed, 
                   COALESCE(r.remark, 'No remarks yet') AS remark
            FROM properties p
            LEFT JOIN rented_units r ON p.id = r.property_id
            WHERE p.rented = 1 AND p.agent IS NOT NULL
            ORDER BY p.id DESC;
        `;
        const [rows] = await db.query(sql);
        console.log(rows); // Log the query result
        return rows;
    }
};

module.exports = RentedModel;
