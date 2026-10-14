const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Anti-spam budget for filing reports (dedupe of pending reports lives in the controller).
const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.post('/reports', requireAuth, reportLimiter, reportController.create);
router.get('/reports/mine', requireAuth, reportController.mine);

module.exports = router;
