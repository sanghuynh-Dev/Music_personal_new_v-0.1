const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Protect all artist routes with auth & artist role
router.use(requireAuth);
router.use(requireRole(['artist', 'admin']));

router.get('/dashboard', artistController.showDashboard);
router.get('/statistics', artistController.getStatistics);

module.exports = router;
