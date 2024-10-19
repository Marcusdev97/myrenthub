const db = require('../config/db');
const PropertyModel = require('../models/propertyModels');

// 获取所有没有 agent 的属性及其合作伙伴详情
exports.getAllProperties = async (req, res) => {
    try {
        const [properties] = await db.query('SELECT * FROM properties WHERE agent IS NULL');
        const propertiesWithPartners = await Promise.all(properties.map(async (property) => {
            const [partners] = await db.query('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
            property.sources = partners.length > 0 ? partners[0] : { name: 'undefined', company: 'undefined' };
            return property;
        }));
        res.json(propertiesWithPartners);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// 获取指定 ID 的属性
exports.getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const [properties] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }
        const property = properties[0];
        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// 创建一个新属性
exports.createProperty = async (req, res) => {
    const { title, availableDate, sqm, rooms, bathrooms, location, name, price, tags, description, sources } = req.body;
    const rented = false;

    // 确保 tags 和 sources 有值
    const formattedTags = tags ? tags.split(';').map(tag => tag.trim()).join(';') : '';
    const formattedSources = sources ? JSON.stringify(sources) : '';

    const newProperty = { 
        title, availableDate, sqm, rooms, bathrooms, location, name, price, 
        tags: formattedTags, 
        description, rented, sources: formattedSources
    };

    try {
        const propertyId = await PropertyModel.create(newProperty);
        res.status(200).json({ id: propertyId, message: `Property uploaded successfully with ID: ${propertyId}` });
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ error: 'Failed to create property', details: error.message });
    }
};

// 更新现有属性
exports.updateProperty = async (req, res) => {
    const { id } = req.params;
    const { rented, title, availableDate, sqm, rooms, bathrooms, location, name, price, tags, description, sources, agent } = req.body;

    // 如果仅更新 'rented' 状态
    if (typeof rented !== 'undefined' && !title && !availableDate && !sqm && !rooms && !bathrooms && !location && !name && !price && !tags && !description && !sources && !agent) {
        try {
            await db.query('UPDATE properties SET rented = ? WHERE id = ?', [rented, id]);
            res.status(200).send('Property status updated successfully');
        } catch (error) {
            console.error('Error updating property status:', error);
            res.status(500).send({ error: 'Error updating property status', details: error.message });
        }
        return;
    }

    // 完整更新属性
    try {
        const updatedProperty = {
            title,
            availableDate,
            sqm,
            rooms,
            bathrooms,
            location,
            name,
            price,
            tags: tags ? tags.split(';').map(tag => tag.trim()).join(';') : undefined,
            description,
            rented: rented === 'true',
            sources,
            agent
        };

        // 移除未定义的属性，避免更新它们
        Object.keys(updatedProperty).forEach(key => {
            if (updatedProperty[key] === undefined) delete updatedProperty[key];
        });

        await db.query('UPDATE properties SET ? WHERE id = ?', [updatedProperty, id]);
        res.status(200).send('Property updated successfully');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send({ error: 'Error updating property', details: error.message });
    }
};

// 删除一个属性
exports.deleteProperty = async (req, res) => {
    const { id } = req.params;

    try {
        // 删除数据库中的属性
        const [deleteResults] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
        if (deleteResults.affectedRows === 0) {
            return res.status(404).send('Property not found');
        }

        res.status(200).send('Property deleted successfully!');
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).send({ error: 'Internal Server Error', details: error.message });
    }
};
