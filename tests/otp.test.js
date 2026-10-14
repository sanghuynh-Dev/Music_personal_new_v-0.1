import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { getApp, makeUser } from './setup.js';

const J = { Accept: 'application/json' };
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

// Deterministic OTP for the register -> verify flow (service hook).
function stubOtp(code) {
    const svc = require('../src/services/authService.js');
    const orig = svc._generateOtp;
    svc._generateOtp = () => ({ raw: code, hash: sha256(code) });
    return () => { svc._generateOtp = orig; };
}

afterEach(() => {});

describe('email OTP verification', () => {
    it('registers unverified and stores only the OTP hash (never plaintext)', async () => {
        const app = getApp();
        const restore = stubOtp('123456');
        const r = await request(app).post('/register').set(J)
            .send({ username: 'Otp User', email: 'otpuser@gmail.com', password: 'Secret123' });
        restore();
        expect(r.body.success).toBe(true);
        expect(r.body.needsVerification).toBe(true);
        expect(JSON.stringify(r.body)).not.toContain('123456');

        const User = mongoose.model('User');
        const EmailOtp = mongoose.model('EmailOtp');
        const user = await User.findOne({ email: 'otpuser@gmail.com' }).lean();
        expect(user.emailVerified).toBe(false);
        const otp = await EmailOtp.findOne({ user: user._id, superseded: false }).lean();
        expect(otp).toBeTruthy();
        expect(otp.otpHash).toBe(sha256('123456'));
        expect(otp.otpHash).not.toBe('123456');
        expect(new Date(otp.expiresAt).getTime() - Date.now()).toBeLessThanOrEqual(5 * 60 * 1000);
    });

    it('sends the OTP to the signup email (to/subject/HTML contain the code)', async () => {
        const app = getApp();
        const mailer = require('../src/services/mailer.js');
        const origSend = mailer.sendMail;
        const origConfigured = mailer.isEmailConfigured;
        const sent = [];
        mailer.isEmailConfigured = () => true;
        mailer.sendMail = async (msg) => { sent.push(msg); };
        const restore = stubOtp('987654');
        const r = await request(app).post('/register').set(J)
            .send({ username: 'Mailer', email: 'mailer@gmail.com', password: 'Secret123' });
        restore();
        mailer.sendMail = origSend;
        mailer.isEmailConfigured = origConfigured;
        expect(r.body.success).toBe(true);
        expect(r.body.emailed).toBe(true);
        expect(sent).toHaveLength(1);
        expect(sent[0].to).toBe('mailer@gmail.com');
        expect(sent[0].subject).toMatch(/verif/i);
        expect(sent[0].html).toContain('987654');
        expect(sent[0].html).toContain('Soundora');
    });

    it('lets unverified admins straight in (no OTP gate)', async () => {
        const app = getApp();
        const User = mongoose.model('User');
        await makeUser({ username: 'Unverified Root', email: 'unverifiedroot@gmail.com', role: 'admin' });
        await User.updateOne({ email: 'unverifiedroot@gmail.com' }, { $set: { emailVerified: false } });
        const r = await request(app).post('/login').set(J)
            .send({ email: 'unverifiedroot@gmail.com', password: 'Secret123' });
        expect(r.body.success).toBe(true);
        expect(r.body.user.role).toBe('admin');
    });

    it('blocks login until the email is verified', async () => {
        const app = getApp();
        const restore = stubOtp('222222');
        await request(app).post('/register').set(J)
            .send({ username: 'Blocked', email: 'blocked@gmail.com', password: 'Secret123' });
        restore();
        const r = await request(app).post('/login').set(J)
            .send({ email: 'blocked@gmail.com', password: 'Secret123' });
        expect(r.status).toBe(403);
        expect(r.body.code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('verifies a correct code and signs the user in', async () => {
        const app = getApp();
        const agent = request.agent(app);
        const restore = stubOtp('333333');
        await agent.post('/register').set(J)
            .send({ username: 'Correct', email: 'correct@gmail.com', password: 'Secret123' });
        restore();
        const v = await agent.post('/verify-email/otp').set(J)
            .send({ email: 'correct@gmail.com', code: '333333' });
        expect(v.body.success).toBe(true);
        expect(v.body.user.email).toBe('correct@gmail.com');

        const User = mongoose.model('User');
        const EmailOtp = mongoose.model('EmailOtp');
        const correctUser = await User.findOne({ email: 'correct@gmail.com' }).lean();
        expect(correctUser.emailVerified).toBe(true);
        expect(await EmailOtp.countDocuments({ user: correctUser._id })).toBe(0);

        // Session was created: the agent is authenticated now.
        const me = await agent.get('/user').set(J);
        expect(me.body?.email).toBe('correct@gmail.com');

        // And plain login works from here on.
        const relogin = await request(app).post('/login').set(J)
            .send({ email: 'correct@gmail.com', password: 'Secret123' });
        expect(relogin.body.success).toBe(true);
    });

    it('rejects wrong codes and burns the code after 5 attempts', async () => {
        const app = getApp();
        const restore = stubOtp('444444');
        await request(app).post('/register').set(J)
            .send({ username: 'Wrong', email: 'wrong@gmail.com', password: 'Secret123' });
        restore();
        for (let i = 0; i < 4; i++) {
            const r = await request(app).post('/verify-email/otp').set(J)
                .send({ email: 'wrong@gmail.com', code: '000000' });
            expect(r.status).toBe(400);
            expect(r.body.error).toBe('Invalid or expired code.');
        }
        const locked = await request(app).post('/verify-email/otp').set(J)
            .send({ email: 'wrong@gmail.com', code: '000000' });
        expect(locked.status).toBe(429);
        expect(locked.body.code).toBe('OTP_LOCKED');

        // Burned code: even the right one no longer works until resend.
        const stale = await request(app).post('/verify-email/otp').set(J)
            .send({ email: 'wrong@gmail.com', code: '444444' });
        expect(stale.status).toBe(400);
    });

    it('rejects expired codes', async () => {
        const app = getApp();
        await makeUser({ username: 'Expired', email: 'expired@gmail.com' });
        const User = mongoose.model('User');
        const EmailOtp = mongoose.model('EmailOtp');
        const user = await User.findOne({ email: 'expired@gmail.com' });
        await User.updateOne({ _id: user._id }, { $set: { emailVerified: false } });
        const now = Date.now();
        await EmailOtp.create({
            user: user._id, email: 'expired@gmail.com',
            otpHash: sha256('555555'),
            expiresAt: new Date(now - 1000),
            deleteAt: new Date(now + 70 * 60 * 1000)
        });
        const r = await request(app).post('/verify-email/otp').set(J)
            .send({ email: 'expired@gmail.com', code: '555555' });
        expect(r.status).toBe(400);
        expect(r.body.error).toBe('Invalid or expired code.');
    });

    it('enforces the 60s resend cooldown and invalidates the old code', async () => {
        const app = getApp();
        const restore = stubOtp('666666');
        await request(app).post('/register').set(J)
            .send({ username: 'Cooldown', email: 'cooldown@gmail.com', password: 'Secret123' });
        const tooSoon = await request(app).post('/verify-email/otp/resend').set(J)
            .send({ email: 'cooldown@gmail.com' });
        expect(tooSoon.status).toBe(429);
        expect(tooSoon.body.code).toBe('OTP_COOLDOWN');
        expect(tooSoon.body.retryAfter).toBeGreaterThan(0);

        // Fast-forward past the cooldown.
        const EmailOtp = mongoose.model('EmailOtp');
        const User = mongoose.model('User');
        const user = await User.findOne({ email: 'cooldown@gmail.com' });
        await EmailOtp.updateMany({ user: user._id }, { $set: { lastSentAt: new Date(Date.now() - 61 * 1000) } });
        const svc = require('../src/services/authService.js');
        const orig = svc._generateOtp;
        svc._generateOtp = () => ({ raw: '777777', hash: sha256('777777') });
        const resent = await request(app).post('/verify-email/otp/resend').set(J)
            .send({ email: 'cooldown@gmail.com' });
        svc._generateOtp = orig;
        expect(resent.body.success).toBe(true);

        // Old code is dead, new code works.
        const old = await request(app).post('/verify-email/otp').set(J)
            .send({ email: 'cooldown@gmail.com', code: '666666' });
        expect(old.status).toBe(400);
        const fresh = await request(app).post('/verify-email/otp').set(J)
            .send({ email: 'cooldown@gmail.com', code: '777777' });
        expect(fresh.body.success).toBe(true);
        restore();
    });

    it('registration survives a mail failure (emailed:false, resend later)', async () => {
        const app = getApp();
        const svc = require('../src/services/authService.js');
        const origCreate = svc.createAndSendOtp;
        svc.createAndSendOtp = async () => { throw new Error('SMTP down'); };
        const r = await request(app).post('/register').set(J)
            .send({ username: 'Nomail', email: 'nomail@gmail.com', password: 'Secret123' });
        svc.createAndSendOtp = origCreate;
        expect(r.body.success).toBe(true);
        expect(r.body.emailed).toBe(false);
        const User = mongoose.model('User');
        expect((await User.findOne({ email: 'nomail@gmail.com' }).lean()).emailVerified).toBe(false);
    });
});
