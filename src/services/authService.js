const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuthToken = require('../models/AuthToken');
const EmailOtp = require('../models/EmailOtp');
const mailer = require('./mailer');
const { otpEmailHtml } = require('./otpMail');

// Email OTP (signup verification) policy
const OTP_TTL_MS = 5 * 60 * 1000;      // codes valid 5 minutes
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // min 60s between sends
const OTP_MAX_ATTEMPTS = 5;            // wrong tries before code is burned
const OTP_MAX_SENDS_PER_HOUR = 5;      // anti-spam cap per account

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
        // New accounts start unverified; emailVerified defaults to false.
        // Send the signup OTP — a mail failure must not fail registration
        // (SMTP may be unset in dev); the user can resend from /verify-email.
        let emailed = false;
        let needsEmailSetup = false;
        try {
            const r = await this.createAndSendOtp(user);
            emailed = r.emailed;
            needsEmailSetup = !!r.needsEmailSetup;
        } catch (e) {
            console.warn(`Signup OTP not sent to ${email}: ${e.message}`);
        }
        return { user: toSafeUser(user), emailed, needsEmailSetup };
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

        if (!user.emailVerified && user.role !== 'admin') {
            // Account exists with correct password but email not verified:
            // make sure a usable code is waiting, then refuse the session.
            // Admins are exempt — operator accounts must never be locked out.
            try {
                await this.ensureActiveOtp(user);
            } catch (e) {
                console.warn(`Login OTP not sent to ${norm}: ${e.message}`);
            }
            const err = new Error('Please verify your email before signing in. Use the code from your inbox, or request a new one on the verification page.');
            err.code = 'EMAIL_NOT_VERIFIED';
            throw err;
        }

        return toSafeUser(user);
    }

    async checkEmailExists(email) {
        const norm = normalizeEmail(email);
        if (!norm) return false;
        const user = await User.findOne({ email: norm }).select('_id').lean();
        return !!user;
    }

    // ---- Email OTP (6-digit signup verification) ----
    // Split for testability: tests override _generateOtp with a known code.

    _generateOtp() {
        const raw = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
        return { raw, hash: sha256(raw) };
    }

    async activeOtpFor(userId) {
        return EmailOtp.findOne({
            user: userId,
            superseded: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });
    }

    async createAndSendOtp(user) {
        // Hourly anti-spam cap (history survives via superseded docs until deleteAt).
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const sentThisHour = await EmailOtp.countDocuments({ user: user._id, createdAt: { $gt: hourAgo } });
        if (sentThisHour >= OTP_MAX_SENDS_PER_HOUR) {
            const err = new Error('Too many codes sent. Please try again later.');
            err.code = 'OTP_SEND_LIMIT';
            throw err;
        }
        const { raw, hash } = this._generateOtp();
        const now = Date.now();
        await EmailOtp.updateMany({ user: user._id, superseded: false }, { $set: { superseded: true } });
        await EmailOtp.create({
            user: user._id,
            email: user.email,
            otpHash: hash,
            expiresAt: new Date(now + OTP_TTL_MS),
            lastSentAt: new Date(now),
            deleteAt: new Date(now + 70 * 60 * 1000)
        });
        const configured = mailer.isEmailConfigured();
        if (!configured) {
            console.warn(`Signup OTP for ${user.email} not sent: SMTP is not configured.`);
            return { emailed: false, needsEmailSetup: true };
        }
        await mailer.sendMail({
            to: user.email,
            subject: 'Your Soundora verification code',
            html: otpEmailHtml(user.username, raw)
        });
        return { emailed: true };
    }

    // Reuse a live code; only mint + send when none is usable.
    async ensureActiveOtp(user) {
        const active = await this.activeOtpFor(user._id);
        if (active) return { emailed: true, reused: true };
        return this.createAndSendOtp(user);
    }

    async verifyEmailOtp(email, code) {
        const fail = (msg, code) => {
            const e = new Error(msg);
            if (code) e.code = code;
            throw e;
        };
        const norm = normalizeEmail(email);
        const digits = String(code || '').replace(/\D/g, '');
        const user = norm ? await User.findOne({ email: norm }) : null;
        // One generic message — never reveal whether email / code / expiry failed.
        if (!user || digits.length !== 6) fail('Invalid or expired code.');
        if (user.emailVerified) return { already: true, user: toSafeUser(user) };
        const otp = await this.activeOtpFor(user._id);
        if (!otp) fail('Invalid or expired code.');
        if (otp.attempts >= OTP_MAX_ATTEMPTS) {
            await EmailOtp.deleteOne({ _id: otp._id });
            fail('Too many wrong attempts. Please request a new code.', 'OTP_LOCKED');
        }
        const ok = crypto.timingSafeEqual(Buffer.from(sha256(digits)), Buffer.from(otp.otpHash));
        if (!ok) {
            otp.attempts += 1;
            if (otp.attempts >= OTP_MAX_ATTEMPTS) {
                await EmailOtp.deleteOne({ _id: otp._id });
                fail('Too many wrong attempts. Please request a new code.', 'OTP_LOCKED');
            }
            await otp.save();
            fail('Invalid or expired code.');
        }
        user.emailVerified = true;
        await user.save();
        await EmailOtp.deleteMany({ user: user._id });
        return { user: toSafeUser(user) };
    }

    async resendEmailOtp(email) {
        const norm = normalizeEmail(email);
        const user = norm ? await User.findOne({ email: norm }) : null;
        // Anti-enumeration: unknown emails get the same success shape.
        if (!user) return { emailed: true };
        if (user.emailVerified || user.role === 'admin') return { already: true };
        const active = await this.activeOtpFor(user._id);
        if (active) {
            const ageMs = Date.now() - new Date(active.lastSentAt || active.createdAt).getTime();
            if (ageMs < OTP_RESEND_COOLDOWN_MS) {
                const err = new Error('Please wait before requesting a new code.');
                err.code = 'OTP_COOLDOWN';
                err.retryAfter = Math.ceil((OTP_RESEND_COOLDOWN_MS - ageMs) / 1000);
                throw err;
            }
        }
        return this.createAndSendOtp(user);
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
        if (!mailer.isEmailConfigured()) {
            console.warn(`Password reset requested for ${norm} but SMTP is not configured.`);
            return { emailed: false, needsEmailSetup: true };
        }
        const link = `${FRONTEND_URL()}/reset-password?token=${raw}`;
        await mailer.sendMail({
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
        user.activeSessionId = null;
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
        if (!mailer.isEmailConfigured()) {
            console.warn(`Verification requested for ${user.email} but SMTP is not configured.`);
            return { emailed: false, needsEmailSetup: true };
        }
        const link = `${FRONTEND_URL()}/verify-email?token=${raw}`;
        await mailer.sendMail({
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
