// controllers/propertyController.js
const db = require('../config/db');

// Get all properties with partner details
exports.getAllProperties = async (req, res) => {
    try {
        // Fetch properties without an assigned agent
        const [propertyResults] = await db.query('SELECT * FROM properties WHERE agent IS NULL');
        
        const propertiesWithPartners = await Promise.all(propertyResults.map(async (property) => {
            const [partnerResults] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
            if (partnerResults.length > 0) {
                property.sources = partnerResults[0];
            } else {
                property.sources = { name: 'undefined', company: 'undefined' };
            }
            return property;
        }));

        res.json(propertiesWithPartners);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Get a property by ID
exports.getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const [propertyResults] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
        if (propertyResults.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = propertyResults[0];
        property.images = JSON.parse(property.images);  // Parse images as JSON array

        // Fetch the partner details using the sources ID
        const [partnerResults] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
        if (partnerResults.length > 0) {
            property.sources = partnerResults[0]; // Replace sources ID with the partner object
        } else {
            property.sources = null; // If partner not found, return null
        }

        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Create a new property
exports.createProperty = async (req, res) => {
    const { title, availableDate, rooms, bathrooms, location, name, price, tags, description } = req.body;
    let sources = req.body.sources;

    if (typeof sources === 'string') {
        sources = JSON.parse(sources); // Parse the partner object if it's a string
    }

    const images = req.files.map(file => '/uploads/' + file.filename); 
    const rented = false;

    const formattedTags = tags.split(';').map(tag => tag.trim());

    const property = { 
        title, availableDate, rooms, bathrooms, location, name, price, 
        tags: formattedTags.join(';'), description, 
        images: JSON.stringify(images), rented, 
        sources: JSON.stringify(sources)  // Store the partner object as a JSON string
    };

    try {
        await db.query('INSERT INTO properties SET ?', property);
        res.status(200).send('Property uploaded successfully');
    } catch (error) {
        console.error('Error inserting property:', error);
        res.status(500).send({ error: 'Error inserting property', details: error.message });
    }
};

// Update a property
exports.updateProperty = async (req, res) => {
    const { id } = req.params;
    const { rented, title, availableDate, rooms, bathrooms, location, name, price, tags, description, sources, agent } = req.body;

    // Handle only the rented update
    if (typeof rented !== 'undefined' && !title && !availableDate && !rooms && !bathrooms && !location && !name && !price && !tags && !description && !sources && !agent) {
        try {
            await db.query('UPDATE properties SET rented = ? WHERE id = ?', [rented, id]);
            res.status(200).send('Property status updated successfully');
        } catch (error) {
            console.error('Error updating property status:', error);
            res.status(500).send({ error: 'Error updating property status', details: error.message });
        }
        return;
    }

    // Handle full property update
    try {
        let images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];

        if (req.body.existingImages) {
            const existingImages = JSON.parse(req.body.existingImages);
            images = images.concat(existingImages); // Combine new and existing images
        }

        const updatedProperty = {
            title, availableDate, rooms, bathrooms, location, name, price,
            tags: tags ? tags.split(';').map(tag => tag.trim()).join(';') : undefined, description, rented: rented === 'true', images: JSON.stringify(images),
            sources, agent // Make sure agent is included in the update
        };

        // Remove undefined properties
        Object.keys(updatedProperty).forEach(key => {
            if (updatedProperty[key] === undefined) {
                delete updatedProperty[key];
            }
        });

        await db.query('UPDATE properties SET ? WHERE id = ?', [updatedProperty, id]);
        res.status(200).send('Property updated successfully');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send({ error: 'Error updating property', details: error.message });
    }
};

// Delete a property
exports.deleteProperty = async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
        if (results.affectedRows === 0) {
            res.status(404).send('Property not found');
        } else {
            res.status(200).send('Property deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).send({ error: 'Internal Server Error', details: error.message });
    }
};

// Fetch all agents
exports.getAllAgents = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM agents');
        res.json(results);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Fetch all partners
exports.getAllPartners = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM partners');
        res.json(results);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


