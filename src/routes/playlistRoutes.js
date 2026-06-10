const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/create', requireAuth, playlistController.createPlaylist);
router.get('/:id', playlistController.showPlaylist);
router.post('/:id/add-song', requireAuth, playlistController.addSong);
router.post('/:id/remove-song', requireAuth, playlistController.removeSong);
router.delete('/:id', requireAuth, playlistController.deletePlaylist);

// Support POST fallback for deletion if method-override is not used in forms
router.post('/:id/delete', requireAuth, playlistController.deletePlaylist);

module.exports = router;
