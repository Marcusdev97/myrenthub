const db = require('../config/db');

exports.getAllAgents = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM agents');
        res.json(results);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
