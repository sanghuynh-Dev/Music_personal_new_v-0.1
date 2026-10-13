import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, makeUser, makeSong } from './setup.js';

const J = { Accept: 'application/json' };

async function loginAs(email) {
    const agent = request.agent(getApp());
    await agent.post('/login').set(J).send({ email, password: 'Secret123' });
    return agent;
}

describe('admin lists: server search + pagination', () => {
    it('searches users/songs server-side and paginates', async () => {
        await makeUser({ username: 'Root Pages', email: 'rootpages@gmail.com', role: 'admin' });
        const artist = await makeUser({ username: 'Zebra Singer', email: 'zebra@gmail.com', role: 'artist' });
        await makeUser({ username: 'Apple Listener', email: 'apple@gmail.com', role: 'user' });
        await makeSong(artist._id, { title: 'Zebra Anthem' });
        const admin = await loginAs('rootpages@gmail.com');

        const users = await admin.get('/admin/users?q=zebra').set(J);
        expect(users.body.total).toBe(1);
        expect(users.body.users[0].username).toBe('Zebra Singer');
        expect(users.body.totalPages).toBe(1);

        const paged = await admin.get('/admin/users?limit=1&page=2').set(J);
        expect(paged.body.page).toBe(2);
        expect(paged.body.users.length).toBe(1);

        const songs = await admin.get('/admin/songs?q=zebra').set(J);
        expect(songs.body.total).toBe(1);
        expect(songs.body.songs[0].title).toBe('Zebra Anthem');

        const artists = await admin.get('/admin/artists?q=apple').set(J);
        expect(artists.body.total).toBe(0);
    });

    it('demotes artists and guards self-demote', async () => {
        await makeUser({ username: 'Root Demote', email: 'rootdemote@gmail.com', role: 'admin' });
        const artist = await makeUser({ username: 'Fading Star', email: 'fading@gmail.com', role: 'artist' });
        const plain = await makeUser({ username: 'Never Artist', email: 'never@gmail.com', role: 'user' });
        const admin = await loginAs('rootdemote@gmail.com');

        const bad = await admin.patch(`/admin/user/${plain._id}/demote`).set(J).send({});
        expect(bad.status).toBe(400);

        const good = await admin.patch(`/admin/user/${artist._id}/demote`).set(J).send({});
        expect(good.body.success).toBe(true);
        expect(good.body.user.role).toBe('user');
        expect(good.body.user.artistVerified).toBe(false);
    });

    it('dashboard returns aggregate stats', async () => {
        await makeUser({ username: 'Root Stats', email: 'rootstats@gmail.com', role: 'admin' });
        const admin = await loginAs('rootstats@gmail.com');
        const dash = await admin.get('/admin/dashboard').set(J);
        expect(dash.body.stats.totalComments).toBeDefined();
        expect(dash.body.stats.pendingReports).toBeDefined();
        expect(dash.body.stats.bannedUsers).toBeDefined();
        expect(typeof dash.body.stats.totalPlays).toBe('number');
    });
});
