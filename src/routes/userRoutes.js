const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateObjectId } = require('../middlewares/validate');
const { upload } = require('../config/cloudinary');

const uploadSingleImage = (req, res, next) => {
    upload.fields([{ name: 'image', maxCount: 1 }])(req, res, function (err) {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

// Profiles
router.get('/profile', requireAuth, userController.showProfile);
router.get('/profile/:id', validateObjectId('id'), userController.showProfile);

// Avatar and Header updates
router.post(
    '/profile/avatar',
    requireAuth,
    uploadSingleImage,
    userController.updateAvatar
);
router.post(
    '/profile/header',
    requireAuth,
    uploadSingleImage,
    userController.updateHeader
);

// Self-service account deletion
router.delete('/user/me', requireAuth, userController.deleteMe);

// Favorites
router.get('/favorites', requireAuth, userController.showFavorites);
router.post('/favorites/:songId', requireAuth, validateObjectId('songId'), userController.toggleFavorite);
router.delete('/favorites/:songId', requireAuth, validateObjectId('songId'), userController.toggleFavorite);

// History
router.get('/history', requireAuth, userController.showHistory);

// Follows
router.post('/artists/:id/follow', requireAuth, validateObjectId('id'), userController.followArtist);
router.post('/artists/:id/unfollow', requireAuth, validateObjectId('id'), userController.unfollowArtist);

// Notifications
router.get('/notifications', requireAuth, userController.getNotifications);
router.patch('/notifications/read', requireAuth, userController.markNotificationRead);
router.patch('/notifications/:id/read', requireAuth, validateObjectId('id'), userController.markNotificationRead);


// get user
router.get('/user', userController.getUser);
router.get('/user/playlists', userController.getUserPlayList);
router.get('/followings', requireAuth, userController.getFollowings);
module.exports = router;
