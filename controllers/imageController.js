const path = require('path');
const fs = require('fs');
const ImageModel = require('../models/imageModels');

// 上传图片并关联到属性
exports.uploadImages = async (req, res) => {
    const propertyId = req.params.propertyId;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
    }

    try {
        // 保存图片路径到数据库
        await Promise.all(files.map(async (file) => {
            const imageUrl = `/uploads/${file.filename}`; // 根据实际存储路径调整
            await ImageModel.create(propertyId, imageUrl);
        }));

        res.status(200).json({ message: 'Images uploaded successfully' });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
};

// 删除属性的所有关联图片
exports.deleteImagesByPropertyId = async (req, res) => {
    const propertyId = req.params.propertyId;

    try {
        // 获取图片路径并从文件系统删除
        const [images] = await ImageModel.findByPropertyId(propertyId);
        if (images.length === 0) {
            return res.status(404).send('No images found for this property');
        }

        images.forEach(image => {
            const imagePath = path.join(__dirname, '..', image.image_url);
            fs.unlink(imagePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error(`Error deleting image: ${imagePath}`, err);
                }
            });
        });

        // 从数据库删除图片记录
        await ImageModel.deleteByPropertyId(propertyId);
        res.status(200).send('Images deleted successfully');
    } catch (error) {
        console.error('Error deleting images:', error);
        res.status(500).json({ error: 'Failed to delete images' });
    }
};

exports.getImagesByPropertyId = async (req, res) => {
    const { propertyId } = req.params;
    try {
        // 获取与属性关联的图片
        const [images] = await db.query('SELECT image_url FROM images WHERE property_id = ?', [propertyId]);

        // 如果没有图片，返回空数组
        if (images.length === 0) {
            return res.status(404).json({ message: 'No images found for this property' });
        }

        res.json(images.map(image => image.image_url)); // 返回图片 URL 数组
    } catch (error) {
        console.error('Error fetching images for property:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
