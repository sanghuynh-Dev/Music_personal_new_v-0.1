const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateObjectId } = require('../middlewares/validate');

router.post('/create', requireAuth, playlistController.createPlaylist);
router.get('/:id', validateObjectId('id'), playlistController.showPlaylist);
router.patch('/:id', requireAuth, validateObjectId('id'), playlistController.updatePlaylist);
router.post('/:id/add-song', requireAuth, validateObjectId('id'), playlistController.addSong);
router.post('/:id/remove-song', requireAuth, validateObjectId('id'), playlistController.removeSong);
router.delete('/:id', requireAuth, validateObjectId('id'), playlistController.deletePlaylist);

// Support POST fallback for deletion if method-override is not used in forms
router.post('/:id/delete', requireAuth, validateObjectId('id'), playlistController.deletePlaylist);

module.exports = router;
