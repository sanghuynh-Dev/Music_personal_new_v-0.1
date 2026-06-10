const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'resources/others';
        let resource_type = 'auto';

        if (file.mimetype.startsWith('image')) {
            folder = 'resources/images';
        } else if (file.mimetype.startsWith('audio')) {
            folder = 'resources/musics';
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: Date.now() + '-' + Math.round(Math.random() * 1e9),
        };
    },
});

const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload,
};
