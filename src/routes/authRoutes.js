const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const sensitiveLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
// Signup OTP: brute-forceable 6-digit codes get a tight per-IP budget
// (per-account attempt caps + 5-min expiry live in the service).
const otpVerifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
const otpResendLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.get('/register', authController.showRegister);
router.post('/register', authController.register);
router.post('/register/check-email', authController.checkEmail);

router.get('/logout', authController.logout);

router.post('/change-password', requireAuth, authController.changePassword);
router.post('/forgot-password', sensitiveLimiter, authController.forgotPassword);
router.post('/reset-password', sensitiveLimiter, authController.resetPassword);
router.post('/verify-email/request', requireAuth, authController.requestVerification);
router.post('/verify-email', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmail);
// Signup OTP (6-digit codes, see docs/featureEmailVerification.md)
router.post('/verify-email/otp', otpVerifyLimiter, authController.verifyOtp);
router.post('/verify-email/otp/resend', otpResendLimiter, authController.resendOtp);

module.exports = router;
