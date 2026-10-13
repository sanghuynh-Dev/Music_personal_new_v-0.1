const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/reports', requireAuth, reportController.create);
router.get('/reports/mine', requireAuth, reportController.mine);

module.exports = router;
