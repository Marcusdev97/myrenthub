// models/imageModels.js
const db = require('../config/db');

const ImageModel = {
    create: async function(propertyId, imageUrl) {
        const sql = `INSERT INTO images (property_id, image_url) VALUES (?, ?)`;
        const [result] = await db.query(sql, [propertyId, imageUrl]);
        return result.insertId;
    },
};

module.exports = ImageModel;
