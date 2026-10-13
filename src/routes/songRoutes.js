const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { validateObjectId } = require('../middlewares/validate');
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
                return res.status(400).json({ success: false, error: err.message });
            }
            next();
        });
    },
    songController.uploadSong
);

// Player queue and song details
router.get('/queue', songController.getQueue);
// NOTE: /edit/:id must come before /:id or Express will treat "edit" as an id
router.get('/edit/:id', requireAuth, requireRole(['artist', 'admin']), validateObjectId('id'), songController.showEditSong);
router.post('/edit/:id', requireAuth, requireRole(['artist', 'admin']), validateObjectId('id'), songController.editSong);
router.get('/info/:id', validateObjectId('id'), songController.getSongInfo);
router.get('/:id', validateObjectId('id'), songController.showSongDetail);
router.post('/:id/play', validateObjectId('id'), songController.playMusic);

// Social
router.post('/:id/like', requireAuth, validateObjectId('id'), songController.toggleLike);
router.post('/:id/comment', requireAuth, validateObjectId('id'), songController.addComment);
router.get('/:id/comments', validateObjectId('id'), songController.getComments);

// Delete song (owner or admin checked in controller)
router.delete('/:id', requireAuth, validateObjectId('id'), songController.deleteSong);

module.exports = router;
