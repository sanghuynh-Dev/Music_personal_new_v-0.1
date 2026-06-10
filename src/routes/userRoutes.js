const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// Profiles
router.get('/profile', requireAuth, userController.showProfile);
router.get('/profile/:id', userController.showProfile);

// Avatar and Header updates
router.post(
    '/profile/avatar',
    requireAuth,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    userController.updateAvatar
);
router.post(
    '/profile/header',
    requireAuth,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    userController.updateHeader
);

// Favorites
router.get('/favorites', requireAuth, userController.showFavorites);
router.post('/favorites/:songId', requireAuth, userController.toggleFavorite);
router.delete('/favorites/:songId', requireAuth, userController.toggleFavorite);

// History
router.get('/history', requireAuth, userController.showHistory);

// Follows
router.post('/artists/:id/follow', requireAuth, userController.followArtist);
router.post('/artists/:id/unfollow', requireAuth, userController.unfollowArtist);

module.exports = router;
