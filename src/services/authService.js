const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuthToken = require('../models/AuthToken');
const { sendMail, isEmailConfigured } = require('./mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const FRONTEND_URL = () => (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

function toSafeUser(user) {
    if (!user) return null;
    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
}

function assertPassword(pw) {
    const s = String(pw || '');
    if (s.length < 6 || s.length > 128) throw new Error('Password must be 6-128 characters.');
    return s;
}

class AuthService {
    async register(userData) {
        const username = String(userData.username || '').trim();
        const email = normalizeEmail(userData.email);
        const password = String(userData.password || '');

        if (username.length < 2 || username.length > 50) {
            throw new Error('Username must be 2-50 characters.');
        }
        if (!EMAIL_RE.test(email)) {
            throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6 || password.length > 128) {
            throw new Error('Password must be 6-128 characters.');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('This email address has already been registered.');
        }

        const hashed = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            email,
            password: hashed,
            role: 'user' // default role is user, never trust client role
        });

        await user.save();
        return toSafeUser(user);
    }

    async login(email, password) {
        const norm = normalizeEmail(email);
        const user = await User.findOne({ email: norm }).select('+password');
        // Generic message to prevent user enumeration (Phase 0A)
        if (!user) {
            throw new Error('Invalid email or password.');
        }

        const ok = await bcrypt.compare(String(password || ''), user.password);
        if (!ok) {
            throw new Error('Invalid email or password.');
        }

        if (user.status === 'banned') {
            throw new Error('This account has been banned by the administrator.');
        }

        return toSafeUser(user);
    }

    async checkEmailExists(email) {
        const norm = normalizeEmail(email);
        if (!norm) return false;
        const user = await User.findOne({ email: norm }).select('_id').lean();
        return !!user;
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');
        if (!user) throw new Error('User not found.');
        const ok = await bcrypt.compare(String(currentPassword || ''), user.password);
        if (!ok) throw new Error('Current password is incorrect.');
        const pw = assertPassword(newPassword);
        if (pw === String(currentPassword || '')) throw new Error('New password must be different.');
        user.password = await bcrypt.hash(pw, 12);
        await user.save();
        await AuthToken.deleteMany({ user: userId, type: 'reset' });
        return true;
    }

    // Always respond success (anti-enumeration); email only sent if account exists AND SMTP configured.
    async requestPasswordReset(email) {
        const norm = normalizeEmail(email);
        const user = norm ? await User.findOne({ email: norm }).select('_id email username') : null;
        if (!user) return { emailed: false };
        const raw = crypto.randomBytes(32).toString('hex');
        await AuthToken.deleteMany({ user: user._id, type: 'reset' });
        await AuthToken.create({
            user: user._id,
            type: 'reset',
            tokenHash: sha256(raw),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });
        if (!isEmailConfigured()) {
            console.warn(`Password reset requested for ${norm} but SMTP is not configured.`);
            return { emailed: false, needsEmailSetup: true };
        }
        const link = `${FRONTEND_URL()}/reset-password?token=${raw}`;
        await sendMail({
            to: user.email,
            subject: 'Reset your Soundora password',
            html: `<p>Hi ${user.username},</p><p>Click the link below to reset your password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`
        });
        return { emailed: true };
    }

    async resetPassword(token, newPassword) {
        const found = await AuthToken.findOne({ type: 'reset', tokenHash: sha256(token || '') });
        if (!found || found.expiresAt < new Date()) throw new Error('Reset link is invalid or expired.');
        const pw = assertPassword(newPassword);
        const user = await User.findById(found.user).select('+password');
        if (!user) throw new Error('User not found.');
        user.password = await bcrypt.hash(pw, 12);
        await user.save();
        await AuthToken.deleteMany({ user: user._id, type: 'reset' });
        return true;
    }

    async requestVerification(userId) {
        const user = await User.findById(userId).select('email username emailVerified');
        if (!user) throw new Error('User not found.');
        if (user.emailVerified) return { already: true };
        const raw = crypto.randomBytes(32).toString('hex');
        await AuthToken.deleteMany({ user: user._id, type: 'verify' });
        await AuthToken.create({
            user: user._id,
            type: 'verify',
            tokenHash: sha256(raw),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        if (!isEmailConfigured()) {
            console.warn(`Verification requested for ${user.email} but SMTP is not configured.`);
            return { emailed: false, needsEmailSetup: true };
        }
        const link = `${FRONTEND_URL()}/verify-email?token=${raw}`;
        await sendMail({
            to: user.email,
            subject: 'Verify your Soundora email',
            html: `<p>Hi ${user.username},</p><p>Click the link below to verify your email (valid 24 hours):</p><p><a href="${link}">${link}</a></p>`
        });
        return { emailed: true };
    }

    async verifyEmail(token) {
        const found = await AuthToken.findOne({ type: 'verify', tokenHash: sha256(token || '') });
        if (!found || found.expiresAt < new Date()) throw new Error('Verification link is invalid or expired.');
        await User.updateOne({ _id: found.user }, { $set: { emailVerified: true } });
        await AuthToken.deleteMany({ user: found.user, type: 'verify' });
        return true;
    }
}

module.exports = new AuthService();
module.exports.toSafeUser = toSafeUser;
module.exports.normalizeEmail = normalizeEmail;
