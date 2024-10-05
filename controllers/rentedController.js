const db = require('../config/db');

const formatDateForDatabase = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    // Format as 'YYYY-MM-DD HH:MM:SS'
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    const seconds = '00';  // Since we don't have seconds from the input
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


exports.getRentedProperties = async (req, res) => {
    try {
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
                r.internet_needed,
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
                r.security_deposit,
                r.security_utilities_deposit,
                r.access_card_deposit,
                r.other_deposit,
                r.special_condition,
                r.tenancy_fees,
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

        // Fetch source details
        const [sourceResults] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [property[0].sources]);
        property[0].sources = sourceResults.length > 0 ? sourceResults[0] : { name: 'undefined', company: 'undefined' };

        // Fetch agent details
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
    const {
        unit_number,
        check_in_date,
        security_deposit,
        security_utilities_deposit,
        access_card_deposit,
        other_deposit,
        special_condition,
        tenancy_fees,
        internet_needed,
        remark
    } = req.body;

    const formattedCheckInDate = formatDateForDatabase(check_in_date);

    try {
        const query = `
            UPDATE rented_units 
            SET 
                unit_number = ?,
                check_in_date = ?, 
                security_deposit = ?,
                security_utilities_deposit = ?, 
                access_card_deposit = ?, 
                other_deposit = ?, 
                special_condition = ?,
                tenancy_fees = ?, 
                internet_needed = ?, 
                remark = ? 
            WHERE 
                property_id = ?;
        `;
        const [result] = await db.query(query, [
            unit_number,
            formattedCheckInDate,  // Use the formatted date here
            security_deposit,
            security_utilities_deposit,
            access_card_deposit,
            other_deposit,
            special_condition,
            tenancy_fees,
            internet_needed,
            remark,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found or no changes made' });
        }

        res.json({ success: true, message: 'Rented unit updated successfully' });
    } catch (error) {
        console.error('Error updating rented unit:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


