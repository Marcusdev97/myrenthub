const db = require('../config/db');

exports.getRentedProperties = async (req, res) => {
    try {
        // Query to get rented properties and related data
        const query = `
                        SELECT 
                        p.id AS property_id,
                        p.title,
                        p.name AS condo_name,
                        p.price,
                        p.sources,
                        p.agent,
                        COALESCE(r.unit_number, 'Update Required') AS unit_number,
                        COALESCE(r.check_in_date, 'Update Required') AS check_in_date,
                        COALESCE(r.tenancy_fees, 'Update Required') AS tenancy_fees,
                        COALESCE(r.balance, 'Update Required') AS balance,
                        COALESCE(r.internet_needed, 'Update Required') AS internet_needed,
                        COALESCE(r.remark, 'No remarks yet') AS remark
                    FROM
                        properties p
                    LEFT JOIN 
                        rented_units r ON p.id = r.property_id
                    WHERE 
                        p.rented = 1 AND p.agent IS NOT NULL;
        `;

        const [properties] = await db.query(query);

        // Fetching additional data for sources and agents
        const propertiesWithDetails = await Promise.all(properties.map(async (property) => {
            // Fetch source details
            const [sourceResults] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
            if (sourceResults.length > 0) {
                property.sources = sourceResults[0];
            } else {
                property.sources = { name: 'undefined', company: 'undefined' };
            }

            // Fetch agent details
            const [agentResults] = await db.query('SELECT * FROM agents WHERE agent_id = ?', [property.agent]);
            if (agentResults.length > 0) {
                property.agent = agentResults[0];
            } else {
                property.agent = 'undefined';
            }

            return property;
        }));

        res.json(propertiesWithDetails);
    } catch (error) {
        console.error('Error fetching rented properties:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.getRentedPropertyById = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const query = `
            SELECT 
                p.id AS property_id,
                p.title,
                p.name AS condo_name,
                p.price,
                p.sources,
                p.agent,
                r.unit_number,
                r.check_in_date,
                r.tenancy_fees,
                r.balance,
                r.internet_needed,
                r.remark
            FROM 
                properties p
            LEFT JOIN 
                rented_units r ON p.id = r.property_id
            WHERE 
                p.id = ?;
        `;
        const [property] = await db.query(query, [propertyId]);

        if (property.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const [sourceResults] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [property[0].sources]);
        property[0].sources = sourceResults.length > 0 ? sourceResults[0] : { name: 'undefined', company: 'undefined' };

        const [agentResults] = await db.query('SELECT * FROM agents WHERE agent_id = ?', [property[0].agent]);
        property[0].agent = agentResults.length > 0 ? agentResults[0].name : 'undefined';

        res.json(property[0]);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.updateRentedUnit = async (req, res) => {
    const { id } = req.params;
    const { unit_number, check_in_date, tenancy_fees, balance, internet_needed, remark } = req.body;

    try {
        // Log incoming data
        console.log('Updating rented unit with data:', { id, unit_number, check_in_date, tenancy_fees, balance, internet_needed, remark });

        // Check the current state of the property in the database
        const [currentData] = await db.query('SELECT * FROM rented_units WHERE property_id = ?', [id]);
        console.log('Current data in DB:', currentData);

        if (currentData.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const query = `
            UPDATE rented_units 
            SET 
                unit_number = ?,
                check_in_date = ?, 
                tenancy_fees = ?, 
                balance = ?, 
                internet_needed = ?, 
                remark = ? 
            WHERE 
                property_id = ?;
        `;
        const [result] = await db.query(query, [unit_number, check_in_date, tenancy_fees, balance, internet_needed, remark, id]);
        console.log('Database update result:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found or no changes made' });
        }

        res.json({ success: true, message: 'Rented unit updated successfully' });
    } catch (error) {
        console.error('Error updating rented unit:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};