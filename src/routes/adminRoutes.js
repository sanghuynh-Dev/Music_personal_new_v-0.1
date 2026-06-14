const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Protect all admin routes with auth & admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

router.get('/dashboard', adminController.showDashboard);
router.get('/users', adminController.showUsers);
router.get('/artists', adminController.showArtists);
router.get('/songs', adminController.showSongs);

router.post('/user/:id/promote', adminController.promoteUser);
router.post('/user/:id/ban', adminController.toggleBanUser);
router.post('/song/:id/delete', adminController.deleteSong);

router.get('/', adminController.showDashboard);

module.exports = router;
