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
exports.getAgentPropertyDetails = async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT agents.name AS agent_name, properties.title AS property_title, 
               properties.availableDate AS move_in_date, agents.commission
        FROM agents
        INNER JOIN properties ON properties.agent_id = agents.agent_id
        WHERE properties.rented = 1
      `);
      res.json(results);
    } catch (error) {
      console.error('Error fetching agent property details:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  };
