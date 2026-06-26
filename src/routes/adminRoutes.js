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

router.patch('/user/:id/promote', adminController.promoteUser);
router.patch('/user/:id/ban', adminController.toggleBanUser);
router.delete('/song/:id', adminController.deleteSong);

router.get('/', adminController.showDashboard);

module.exports = router;
