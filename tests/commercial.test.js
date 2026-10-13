import { describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { getApp, makeUser, makeSong } from './setup.js';

const J = { Accept: 'application/json' };

async function loginAs(email) {
    const agent = request.agent(getApp());
    await agent.post('/login').set(J).send({ email, password: 'Secret123' });
    return agent;
}

describe('admin extended: verify, cascade delete, reports, notifications, self-delete', () => {
    it('verifies artists (and only artists)', async () => {
        await makeUser({ username: 'Root Verify', email: 'rootverify@gmail.com', role: 'admin' });
        const artist = await makeUser({ username: 'New Star', email: 'newstar@gmail.com', role: 'artist' });
        const plain = await makeUser({ username: 'Plain Joe', email: 'plainjoe@gmail.com', role: 'user' });
        const admin = await loginAs('rootverify@gmail.com');

        const bad = await admin.patch(`/admin/user/${plain._id}/verify`).set(J).send({});
        expect(bad.status).toBe(400);
        const good = await admin.patch(`/admin/user/${artist._id}/verify`).set(J).send({});
        expect(good.body.success).toBe(true);
        expect(good.body.user.artistVerified).toBe(true);
    });

    it('deletes a user with full cascade (no orphans, no password leak)', async () => {
        await makeUser({ username: 'Root Del', email: 'rootdel@gmail.com', role: 'admin' });
        const doomed = await makeUser({ username: 'Doomed', email: 'doomed@gmail.com', role: 'artist' });
        const fan = await makeUser({ username: 'Fan', email: 'fan@gmail.com', role: 'user' });
        const song = await makeSong(doomed._id, { title: 'Last Song' });
        const admin = await loginAs('rootdel@gmail.com');
        const fanAgent = await loginAs('fan@gmail.com');

        await fanAgent.post(`/songs/${song._id}/like`).set(J).send({});
        await fanAgent.post(`/songs/${song._id}/comment`).set(J).send({ content: 'goodbye' });
        const pl = await fanAgent.post('/playlists/create').set(J).send({ name: 'Fan Mix' });
        await fanAgent.post(`/playlists/${pl.body.playlist._id}/add-song`).set(J).send({ songId: String(song._id) });

        const del = await admin.delete(`/admin/user/${doomed._id}`).set(J);
        expect(del.body.success).toBe(true);

        const Song = mongoose.model('Song');
        const Comment = mongoose.model('Comment');
        const Playlist = mongoose.model('Playlist');
        expect(await Song.findById(song._id)).toBeNull();
        expect(await Comment.countDocuments({ song: song._id })).toBe(0);
        const fanPl = await Playlist.findById(pl.body.playlist._id).lean();
        expect(fanPl.songs.map(String)).not.toContain(String(song._id));

        const users = await admin.get('/admin/users').set(J);
        const leaked = JSON.stringify(users.body.users);
        expect(leaked).not.toContain('password');
    });

    it('runs the report moderation loop with reporter notification', async () => {
        await makeUser({ username: 'Root Mod', email: 'rootmod@gmail.com', role: 'admin' });
        const artist = await makeUser({ username: 'Reported Artist', email: 'reported@gmail.com', role: 'artist' });
        const reporter = await makeUser({ username: 'Reporter', email: 'reporter@gmail.com', role: 'user' });
        const song = await makeSong(artist._id, { title: 'Disputed Track' });
        const reporterAgent = await loginAs('reporter@gmail.com');
        const admin = await loginAs('rootmod@gmail.com');

        const created = await reporterAgent.post('/reports').set(J).send({
            targetType: 'song', targetId: String(song._id), type: 'copyright', reason: 'Sounds like my song'
        });
        expect(created.body.success).toBe(true);

        const list = await admin.get('/admin/reports').set(J);
        expect(list.body.reports.length).toBeGreaterThan(0);
        const id = list.body.reports[0]._id;
        const resolved = await admin.patch(`/admin/report/${id}/review`).set(J).send({ action: 'resolve' });
        expect(resolved.body.report.status).toBe('resolved');

        const notifs = await reporterAgent.get('/notifications').set(J);
        expect(notifs.body.unreadCount).toBeGreaterThan(0);
        const marked = await reporterAgent.patch('/notifications/read').set(J).send({});
        expect(marked.body.success).toBe(true);
        const after = await reporterAgent.get('/notifications').set(J);
        expect(after.body.unreadCount).toBe(0);
    });

    it('self-deletes an account with password check', async () => {
        await makeUser({ username: 'Quitter', email: 'quitter@gmail.com', role: 'user' });
        const agent = await loginAs('quitter@gmail.com');
        const wrong = await agent.delete('/user/me').set(J).send({ password: 'nope' });
        expect(wrong.status).toBe(400);
        const good = await agent.delete('/user/me').set(J).send({ password: 'Secret123' });
        expect(good.body.success).toBe(true);
        const relogin = await request(getApp()).post('/login').set(J).send({ email: 'quitter@gmail.com', password: 'Secret123' });
        expect(relogin.status).toBe(401);
    });
});
