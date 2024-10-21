// models/PropertyModel.js
const db = require('../config/db');
const ImageModel = require('./imageModels'); // Import ImageModel

const PropertyModel = {
  // Find All Properties and images from
  findAll: async function() {
    const [rows] = await db.query('SELECT * FROM properties');
    
    // Fetch associated images for each property
    const propertiesWithImages = await Promise.all(rows.map(async (property) => {
      const images = await ImageModel.findByPropertyId(property.id); // Fetch images by propertyId
      property.images = images.map(img => img.image_url); // Add images array to the property
      return property;
    }));
    
    return propertiesWithImages; // Return the properties with images included
  },

  // Updated findById function to include images
  findById: async function(id) {
    const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [id]);
    if (rows.length > 0) {
      const property = rows[0];
      const images = await ImageModel.findByPropertyId(id); // Fetch images associated with the property
      property.images = images.map(img => img.image_url); // Add images array to the property
      return property;
    }
    return null; // If no property found, return null
  },

  // Create a new property and associate it with images
  create: async function(newProperty, images) {
    // 确保 images 是数组
    const imageArray = Array.isArray(images) ? images : [];

    const valuesArray = [
      title,
      availableDate,
      sqm,
      rooms,
      bathrooms,
      location,
      name,
      price,
      tags,
      description,
      rented ? 1 : 0,  
      sources || null,
      agent || null 
    ];
  
    const sql = `
        INSERT INTO properties 
        (title, availableDate, sqm, rooms, bathrooms, location, name, price, tags, description, rented, sources, agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, valuesArray);

    const propertyId = result.insertId;

    // 插入每个与属性关联的图片
    await Promise.all(imageArray.map(async (imageUrl) => {
        // 确保 imageUrl 存在
        if (imageUrl) {
            await db.query('INSERT INTO images (property_id, image_url) VALUES (?, ?)', [propertyId, imageUrl]);
        }
    }));

    return propertyId;
},

  // Update an existing property and its associated images
  update: async function(id, updatedProperty, images) {
    const { title, availableDate, sqm, rooms, bathrooms, location, name, price, tags, description, rented, sources, agent } = updatedProperty;
    const sql = `
      UPDATE properties SET 
      title = ?, availableDate = ?, sqm = ?, rooms = ?, bathrooms = ?, location = ?, 
      name = ?, price = ?, tags = ?, description = ?, rented = ?, sources = ?, agent = ?
      WHERE id = ?
    `;
    await db.query(sql, [title, availableDate, sqm, rooms, bathrooms, location, name, price, tags, description, rented, sources, agent, id]);

    // Update images: first delete old images, then insert new ones
    await ImageModel.deleteByPropertyId(id); // Delete old images
    await Promise.all(images.map(async (imageUrl) => {
      await ImageModel.create(id, imageUrl); // Insert new images
    }));

    return this.findById(id); // Return the updated property
  },

  // Updated delete function
  delete: async function(id) {
    await ImageModel.deleteByPropertyId(id);  // Delete associated images
    const [result] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
    return result.affectedRows;
  },

};

module.exports = PropertyModel;
