const db = require('../config/db');

exports.getAllPartners = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM partners');
        res.json(results);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
