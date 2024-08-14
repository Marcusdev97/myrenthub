// controllers/propertyController.js
const db = require('../config/db');

// Get all properties
exports.getAllProperties = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM properties');
        res.json(results);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Get a property by ID
exports.getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
        if (results.length === 0) {
            res.status(404).json({ error: 'Property not found' });
        } else {
            const property = results[0];
            property.images = JSON.parse(property.images);  // Parse images as JSON array
            res.json(property);
        }
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


// Create a new property
exports.createProperty = async (req, res) => {
    const { title, availableDate, rooms, bathrooms, location, name, price, tags, description, sources } = req.body;
    const images = req.files.map(file => '/uploads/' + file.filename); // Array of file paths with '/uploads/' prefix
    const rented = false;

    // Split tags by ';' and store them as a list
    const formattedTags = tags.split(';').map(tag => tag.trim());

    const property = { title, availableDate, rooms, bathrooms, location, name, price, tags: formattedTags.join(';'), description, images: JSON.stringify(images), rented, sources };

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
    const { rented, title, availableDate, rooms, bathrooms, location, name, price, tags, description, sources } = req.body;
    
    // Handle only the rented update
    if (typeof rented !== 'undefined' && !title && !availableDate && !rooms && !bathrooms && !location && !name && !price && !tags && !description && !sources) {
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
            sources
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