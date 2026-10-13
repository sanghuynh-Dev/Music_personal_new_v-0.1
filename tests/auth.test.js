import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { getApp, makeUser } from './setup.js';

const J = { Accept: 'application/json' };

describe('auth: register / login / password flows', () => {
    it('rejects invalid input before touching uniqueness', async () => {
        const app = getApp();
        let r = await request(app).post('/register').set(J).send({ username: 'a', email: 'bad', password: 'Secret123' });
        expect(r.body.success).toBe(false);
        r = await request(app).post('/register').set(J).send({ username: 'Valid Name', email: 'newuser@gmail.com', password: '123' });
        expect(r.body.success).toBe(false);
        expect(r.status).toBe(400);
    });

    it('registers with hashed password (never plaintext, never leaked)', async () => {
        const app = getApp();
        const r = await request(app).post('/register').set(J).send({ username: 'Hash Check', email: 'hashcheck@gmail.com', password: 'Secret123' });
        expect(r.body.success).toBe(true);
        expect(r.body.user.password).toBeUndefined();
        const User = mongoose.model('User');
        const raw = await User.findOne({ email: 'hashcheck@gmail.com' }).select('+password').lean();
        expect(raw.password).toBeTruthy();
        expect(raw.password).not.toBe('Secret123');
    });

    it('login uses one generic message and never leaks password', async () => {
        const app = getApp();
        await makeUser({ username: 'Enum Target', email: 'enumtarget@gmail.com' });
        const badEmail = await request(app).post('/login').set(J).send({ email: 'nobody-here@gmail.com', password: 'x' });
        const badPass = await request(app).post('/login').set(J).send({ email: 'enumtarget@gmail.com', password: 'wrong' });
        expect(badEmail.status).toBe(401);
        expect(badPass.status).toBe(401);
        expect(badEmail.body.error).toBe('Invalid email or password.');
        expect(badPass.body.error).toBe('Invalid email or password.');
        const ok = await request(app).post('/login').set(J).send({ email: 'enumtarget@gmail.com', password: 'Secret123' });
        expect(ok.body.success).toBe(true);
        expect(ok.body.user.password).toBeUndefined();
    });

    it('change-password verifies current password and rotates hash', async () => {
        const app = getApp();
        const agent = request.agent(app);
        await makeUser({ username: 'Changer', email: 'changer@gmail.com' });
        await agent.post('/login').set(J).send({ email: 'changer@gmail.com', password: 'Secret123' });
        const wrong = await agent.post('/change-password').set(J).send({ currentPassword: 'nope', newPassword: 'NewSecret123' });
        expect(wrong.status).toBe(400);
        const good = await agent.post('/change-password').set(J).send({ currentPassword: 'Secret123', newPassword: 'NewSecret123' });
        expect(good.body.success).toBe(true);
        const relogin = await request(app).post('/login').set(J).send({ email: 'changer@gmail.com', password: 'NewSecret123' });
        expect(relogin.body.success).toBe(true);
    });

    it('forgot-password is generic; reset rejects bad tokens', async () => {
        const app = getApp();
        const r = await request(app).post('/forgot-password').set(J).send({ email: 'ghost-nobody@gmail.com' });
        expect(r.body.success).toBe(true);
        const bad = await request(app).post('/reset-password').set(J).send({ token: 'invalid', newPassword: 'NewSecret123' });
        expect(bad.status).toBe(400);
    });

    it('logout responds and clears the session', async () => {
        const app = getApp();
        const agent = request.agent(app);
        await makeUser({ username: 'Leaver', email: 'leaver@gmail.com' });
        await agent.post('/login').set(J).send({ email: 'leaver@gmail.com', password: 'Secret123' });
        const out = await agent.get('/logout').set(J);
        expect(out.body.success).toBe(true);
        const me = await agent.get('/user').set(J);
        expect(me.body).toBeNull();
    });
});
