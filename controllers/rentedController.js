const db = require('../config/db');

exports.getAllRentedUnits = async (req, res) => {
    try {
        // Fetch all properties that are rented and have an assigned agent
        const [propertyResults] = await db.query(`
            SELECT p.id AS property_id, p.title, p.name AS condo_name, p.price, p.sources, p.agent
            FROM properties p
            WHERE p.rented = 1 AND p.agent IS NOT NULL
        `);

        const propertiesWithRentedDetails = await Promise.all(
            propertyResults.map(async (property) => {
                const [rentedResults] = await db.query(`
                    SELECT COALESCE(r.check_in_date, 'Update Required') AS check_in_date,
                           COALESCE(r.tenancy_fees, 'Update Required') AS tenancy_fees,
                           COALESCE(r.balance, 'Update Required') AS balance,
                           COALESCE(r.internet_needed, 'Update Required') AS internet_needed,
                           COALESCE(r.remark, 'No remarks yet') AS remark
                    FROM rented_units r
                    WHERE r.property_id = ?
                `, [property.property_id]);

                if (rentedResults.length > 0) {
                    return { ...property, ...rentedResults[0] };
                } else {
                    // If no rented unit details are found, return property with default "Update Required" values
                    return {
                        ...property,
                        check_in_date: 'Update Required',
                        tenancy_fees: 'Update Required',
                        balance: 'Update Required',
                        internet_needed: 'Update Required',
                        remark: 'No remarks yet'
                    };
                }
            })
        );

        res.json(propertiesWithRentedDetails);
    } catch (error) {
        console.error('Error fetching rented units:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

exports.updateRentedUnit = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedRentedUnit = await RentedModel.update(id, updates);
        res.json(updatedRentedUnit);
    } catch (error) {
        console.error('Error updating rented unit:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
