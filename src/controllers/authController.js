const authService = require('../services/authService');
const { toSafeUser, normalizeEmail } = require('../services/authService');
const User = require('../models/User');

class AuthController {
    showLogin(req, res) {
        if (req.session?.userID) {
            return res.redirect('/');
        }
        res.json({ title: 'Sign In' });
    }

    showRegister(req, res) {
        if (req.session?.userID) {
            return res.redirect('/');
        }
        res.json({ title: 'Register' });
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email and password are required.' });
            }
            const user = await authService.login(email, password);

            // Regenerate session to prevent fixation (Phase 0A)
            await new Promise((resolve, reject) => {
                req.session.regenerate((err) => (err ? reject(err) : resolve()));
            });
            req.session.userID = user._id;
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            // Single-device login: new session invalidates any older device.
            await User.updateOne({ _id: user._id }, { $set: { activeSessionId: req.sessionID } });
            res.json({
                success: true,
                user: toSafeUser(user)
            });
        } catch (error) {
            if (error.code === 'EMAIL_NOT_VERIFIED') {
                return res.status(403).json({
                    success: false,
                    code: 'EMAIL_NOT_VERIFIED',
                    error: error.message,
                    email: normalizeEmail(req.body?.email)
                });
            }
            const msg = error.message === 'This account has been banned by the administrator.'
                ? error.message
                : 'Invalid email or password.';
            res.status(401).json({ success: false, error: msg });
        }
    }

    async register(req, res) {
        try {
            const { user, emailed, needsEmailSetup } = await authService.register(req.body);
            res.json({ success: true, user, emailed: !!emailed, needsEmailSetup: !!needsEmailSetup, needsVerification: true });
        } catch (error) {
            res.status(400).json({
                success: false,
                warning: { email: error.message }
            });
        }
    }

    async checkEmail(req, res) {
        try {
            const { email } = req.body;
            const exists = await authService.checkEmailExists(email);
            if (exists) {
                return res.json({
                    success: false,
                    warning: { email: 'This email address has already been registered.' }
                });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Unable to check email.' });
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, error: 'Current and new passwords are required.' });
            }
            await authService.changePassword(req.session.userID, currentPassword, newPassword);
            // Keep this device logged in, revoke all other devices.
            await User.updateOne({ _id: req.session.userID }, { $set: { activeSessionId: req.sessionID } });
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.requestPasswordReset(email);
            // Generic response either way (anti-enumeration)
            res.json({ success: true, emailed: !!result.emailed, needsEmailSetup: !!result.needsEmailSetup });
        } catch (error) {
            console.error('Forgot password error:', error.message);
            res.json({ success: true, emailed: false });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ success: false, error: 'Token and new password are required.' });
            }
            await authService.resetPassword(token, newPassword);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async requestVerification(req, res) {
        try {
            const result = await authService.requestVerification(req.session.userID);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async verifyEmail(req, res) {
        try {
            const token = req.body.token || req.query.token;
            if (!token) return res.status(400).json({ success: false, error: 'Token is required.' });
            await authService.verifyEmail(token);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Signup OTP verification. Success proves inbox ownership, so the user
    // is signed straight in with a fresh session (same hardening as login).
    async verifyOtp(req, res) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({ success: false, error: 'Email and code are required.' });
            }
            const { user } = await authService.verifyEmailOtp(email, code);
            await new Promise((resolve, reject) => {
                req.session.regenerate((err) => (err ? reject(err) : resolve()));
            });
            req.session.userID = user._id;
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            await User.updateOne({ _id: user._id }, { $set: { activeSessionId: req.sessionID } });
            res.json({ success: true, user: toSafeUser(user) });
        } catch (error) {
            const status = error.code === 'OTP_LOCKED' ? 429 : 400;
            res.status(status).json({ success: false, code: error.code, error: error.message });
        }
    }

    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ success: false, error: 'Email is required.' });
            }
            const result = await authService.resendEmailOtp(email);
            if (result.already) {
                return res.json({ success: true, already: true });
            }
            res.json({ success: true, emailed: !!result.emailed, needsEmailSetup: !!result.needsEmailSetup });
        } catch (error) {
            if (error.code === 'OTP_COOLDOWN') {
                return res.status(429).json({ success: false, code: 'OTP_COOLDOWN', error: error.message, retryAfter: error.retryAfter });
            }
            if (error.code === 'OTP_SEND_LIMIT') {
                return res.status(429).json({ success: false, code: 'OTP_SEND_LIMIT', error: error.message });
            }
            res.status(400).json({ success: false, error: error.message });
        }
    }

    logout(req, res) {
        if (!req.session) {
            res.clearCookie('connect.sid');
            if (req.xhr || (req.headers.accept || '').includes('json')) {
                return res.json({ success: true });
            }
            return res.redirect('/login');
        }
        const sid = req.sessionID;
        const userID = req.session.userID;
        req.session.destroy(async (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Logout failed.' });
            }
            // Only clear the marker if the logging-out device owns it.
            // If another device already took over, leave its session intact.
            try {
                if (userID) {
                    await User.updateOne(
                        { _id: userID, activeSessionId: sid },
                        { $set: { activeSessionId: null } }
                    );
                }
            } catch (e) { /* ignore */ }
            res.clearCookie('connect.sid');
            // Support both API clients and browser redirects
            if (req.xhr || (req.headers.accept || '').includes('json')) {
                return res.json({ success: true });
            }
            return res.redirect('/login');
        });
    }
}

module.exports = new AuthController();
