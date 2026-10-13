const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
// NOTE: keep in sync with frontend accept="audio/..." on Upload.jsx.
// Browsers report .m4a as audio/mp4 or audio/x-m4a, .ogg as audio/ogg,
// .flac as audio/flac, and .wav as audio/wav | audio/x-wav | audio/wave.
const AUDIO_MIMES = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/x-wave',
    'audio/webm',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/flac',
    'audio/x-flac',
];

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'resources/others';
        let resource_type = 'auto';

        if (file.mimetype.startsWith('image')) {
            folder = 'resources/images';
            resource_type = 'image';
        } else if (file.mimetype.startsWith('audio')) {
            folder = 'resources/musics';
            resource_type = 'video'; // Cloudinary stores audio as video
        }

        return {
            folder: folder,
            resource_type: resource_type,
            public_id: Date.now() + '-' + Math.round(Math.random() * 1e9),
        };
    },
});

function fileFilter(req, file, cb) {
    if (file.fieldname === 'image') {
        if (!IMAGE_MIMES.includes(file.mimetype)) {
            return cb(new Error('Invalid image type. Only JPEG/PNG/WebP allowed.'));
        }
        return cb(null, true);
    }
    if (file.fieldname === 'file') {
        if (!AUDIO_MIMES.includes(file.mimetype)) {
            return cb(new Error('Invalid audio type. Only MP3/WAV/M4A/OGG/FLAC/AAC/WebM allowed.'));
        }
        return cb(null, true);
    }
    // avatar/header single image field named 'image' handled above; fallback: allow only images
    if (file.mimetype.startsWith('image') && IMAGE_MIMES.includes(file.mimetype)) {
        return cb(null, true);
    }
    return cb(new Error('Invalid file type.'));
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024, files: 2 }, // per-file cap; image size re-checked in controller (5MB)
    fileFilter,
});

module.exports = {
    cloudinary,
    upload,
    fileFilter,
    IMAGE_MIMES,
    AUDIO_MIMES,
};
