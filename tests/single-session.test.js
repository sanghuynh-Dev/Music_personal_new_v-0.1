import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, makeUser } from './setup.js';

const J = { Accept: 'application/json' };

describe('auth: single-device login', () => {
    it('revokes the old device when the same account logs in elsewhere', async () => {
        const app = getApp();
        await makeUser({ username: 'Single Dev', email: 'singledev@gmail.com' });

        const deviceA = request.agent(app);
        await deviceA.post('/login').set(J).send({ email: 'singledev@gmail.com', password: 'Secret123' });
        const meA = await deviceA.get('/user').set(J);
        expect(meA.status).toBe(200);
        expect(meA.body.email).toBe('singledev@gmail.com');

        // Same account logs in on device B -> A must be revoked.
        const deviceB = request.agent(app);
        const loginB = await deviceB.post('/login').set(J).send({ email: 'singledev@gmail.com', password: 'Secret123' });
        expect(loginB.body.success).toBe(true);

        const staleA = await deviceA.get('/user').set(J);
        expect(staleA.status).toBe(401);
        expect(staleA.body.code).toBe('SESSION_REVOKED');

        const freshB = await deviceB.get('/user').set(J);
        expect(freshB.status).toBe(200);
        expect(freshB.body.email).toBe('singledev@gmail.com');
    });

    it('logout on the current device does not kill the newer device', async () => {
        const app = getApp();
        await makeUser({ username: 'Logout Dev', email: 'logoutdev@gmail.com' });

        const deviceA = request.agent(app);
        await deviceA.post('/login').set(J).send({ email: 'logoutdev@gmail.com', password: 'Secret123' });
        const deviceB = request.agent(app);
        await deviceB.post('/login').set(J).send({ email: 'logoutdev@gmail.com', password: 'Secret123' });

        // A is already stale; its logout must not clear B's active session.
        await deviceA.get('/logout').set(J);
        const freshB = await deviceB.get('/user').set(J);
        expect(freshB.status).toBe(200);
    });
});
