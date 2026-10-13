import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, makeUser } from './setup.js';

const J = { Accept: 'application/json' };

async function loginAs(email, password = 'Secret123') {
    const agent = request.agent(getApp());
    await agent.post('/login').set(J).send({ email, password });
    return agent;
}

describe('RBAC: backend role enforcement', () => {
    it('blocks non-admins from admin APIs', async () => {
        await makeUser({ username: 'Plain User', email: 'plainuser@gmail.com', role: 'user' });
        await makeUser({ username: 'Singer', email: 'singer@gmail.com', role: 'artist' });
        const userAgent = await loginAs('plainuser@gmail.com');
        const artistAgent = await loginAs('singer@gmail.com');

        for (const agent of [userAgent, artistAgent]) {
            const dash = await agent.get('/admin/dashboard').set(J);
            expect([401, 403]).toContain(dash.status);
            const ban = await agent.patch('/admin/user/000000000000000000000001/ban').set(J).send({});
            expect([401, 403]).toContain(ban.status);
        }
        // Anonymous too
        const anon = await request(getApp()).get('/admin/dashboard').set(J);
        expect([401, 403, 302]).toContain(anon.status);
    });

    it('lets admins in, but never lets them be promoted or self-harmed', async () => {
        const app = getApp();
        await makeUser({ username: 'Root', email: 'rootadmin@gmail.com', role: 'admin' });
        const victim = await makeUser({ username: 'Victim', email: 'victim@gmail.com', role: 'user' });
        const admin = await loginAs('rootadmin@gmail.com');

        const dash = await admin.get('/admin/dashboard').set(J);
        expect(dash.status).toBe(200);
        expect(dash.body.stats).toBeTruthy();

        const promoteAdmin = await admin.patch(`/admin/user/${victim._id}/promote`).set(J).send({});
        // victim is a user so promote works; now try promoting the admin itself
        const User = (await import('mongoose')).default.model('User');
        const root = await User.findOne({ email: 'rootadmin@gmail.com' });
        const selfHarm = await admin.patch(`/admin/user/${root._id}/promote`).set(J).send({});
        expect(selfHarm.status).toBe(403);

        const selfBan = await admin.patch(`/admin/user/${root._id}/ban`).set(J).send({});
        expect(selfBan.status).toBe(403);
        expect(promoteAdmin.body.success).toBe(true);
    });

    it('kills sessions of banned users on next request', async () => {
        const app = getApp();
        await makeUser({ username: 'Banned Soon', email: 'bannedsoon@gmail.com', role: 'user' });
        await makeUser({ username: 'Root Two', email: 'roottwo@gmail.com', role: 'admin' });
        const userAgent = await loginAs('bannedsoon@gmail.com');
        const admin = await loginAs('roottwo@gmail.com');

        const User = (await import('mongoose')).default.model('User');
        const target = await User.findOne({ email: 'bannedsoon@gmail.com' });
        await admin.patch(`/admin/user/${target._id}/ban`).set(J).send({});

        const after = await userAgent.get('/favorites').set(J);
        // Session destroyed by setUserLocal -> requireAuth denies
        expect([302, 401]).toContain(after.status);
    });

    it('restricts artist routes to artists/admins', async () => {
        await makeUser({ username: 'Just Listener', email: 'listener@gmail.com', role: 'user' });
        const agent = await loginAs('listener@gmail.com');
        const r = await agent.get('/artist/dashboard').set(J);
        expect([401, 403, 302]).toContain(r.status);
    });
});
