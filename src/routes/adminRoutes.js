const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { validateObjectId } = require('../middlewares/validate');

// Protect all admin routes with auth & admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/dashboard', adminController.showDashboard);
router.get('/users', adminController.showUsers);
router.get('/artists', adminController.showArtists);
router.get('/songs', adminController.showSongs);
router.get('/playlists', adminController.showPlaylists);
router.get('/comments', adminController.showComments);
router.get('/reports', adminController.showReports);
router.get('/analytics', adminController.getAnalytics);
router.get('/user/:id', validateObjectId('id'), adminController.showUserDetail);

router.patch('/user/:id/promote', validateObjectId('id'), adminController.promoteUser);
router.patch('/user/:id/demote', validateObjectId('id'), adminController.demoteArtist);
router.patch('/user/:id/ban', validateObjectId('id'), adminController.toggleBanUser);
router.patch('/user/:id/verify', validateObjectId('id'), adminController.toggleVerifyArtist);
router.patch('/report/:id/review', validateObjectId('id'), adminController.reviewReport);
router.delete('/user/:id', validateObjectId('id'), adminController.deleteUser);
router.delete('/song/:id', validateObjectId('id'), adminController.deleteSong);
router.delete('/playlist/:id', validateObjectId('id'), adminController.deletePlaylistAsAdmin);
router.delete('/comment/:id', validateObjectId('id'), adminController.deleteComment);

router.get('/', adminController.showDashboard);

module.exports = router;
