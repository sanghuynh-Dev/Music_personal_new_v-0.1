const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// Upload (only Artists and Admins can upload)
router.get('/upload', requireAuth, requireRole(['artist', 'admin']), songController.showUpload);
router.post(
    '/upload',
    requireAuth,
    requireRole(['artist', 'admin']),
    (req, res, next) => {
        upload.fields([
            { name: 'image', maxCount: 1 },
            { name: 'file', maxCount: 1 }
        ])(req, res, function (err) {
            if (err) {
                console.error('Multer file upload error:', err);
                return res.status(500).send(err.message);
            }
            next();
        });
    },
    songController.uploadSong
);

// Player queue and song details
router.get('/queue', songController.getQueue);
router.get('/info/:id', songController.getSongInfo);
router.post('/:id/play', songController.playMusic);

// Social
router.post('/:id/like', requireAuth, songController.toggleLike);
router.post('/:id/comment', requireAuth, songController.addComment);
router.get('/:id/comments', songController.getComments);

// Delete song
router.delete('/:id', requireAuth, songController.deleteSong);

module.exports = router;
