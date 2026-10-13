import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp, makeUser, makeSong } from './setup.js';

const J = { Accept: 'application/json' };

async function loginAs(email) {
    const agent = request.agent(getApp());
    await agent.post('/login').set(J).send({ email, password: 'Secret123' });
    return agent;
}

describe('playlists: privacy + CRUD', () => {
    it('hides private playlists from strangers, shows to owner', async () => {
        const app = getApp();
        const owner = await makeUser({ username: 'Pl Owner', email: 'plowner@gmail.com' });
        const stranger = await makeUser({ username: 'Stranger', email: 'stranger@gmail.com' });
        const ownerAgent = await loginAs('plowner@gmail.com');
        const strangerAgent = await loginAs('stranger@gmail.com');

        const created = await ownerAgent.post('/playlists/create').set(J).send({ name: 'Secret Mix', isPrivate: true });
        expect(created.body.success).toBe(true);
        const id = created.body.playlist._id;

        const seen = await ownerAgent.get(`/playlists/${id}`).set(J);
        expect(seen.status).toBe(200);
        const hidden = await strangerAgent.get(`/playlists/${id}`).set(J);
        expect(hidden.status).toBe(404);

        // Owner can rename + unhide
        const upd = await ownerAgent.patch(`/playlists/${id}`).set(J).send({ name: 'Public Mix', isPrivate: false });
        expect(upd.body.success).toBe(true);
        expect(upd.body.playlist.name).toBe('Public Mix');
        const nowVisible = await strangerAgent.get(`/playlists/${id}`).set(J);
        expect(nowVisible.status).toBe(200);
    });

    it('rejects invalid ids with 400 (no CastError leak)', async () => {
        const app = getApp();
        await makeUser({ username: 'Id Tester', email: 'idtester@gmail.com' });
        const agent = await loginAs('idtester@gmail.com');
        const r = await agent.get('/playlists/not-an-id').set(J);
        expect(r.status).toBe(400);
        expect(r.body.error).not.toMatch(/Cast to ObjectId/i);
    });
});

describe('play counting + history', () => {
    it('increments playCount and records history for logged-in users', async () => {
        const app = getApp();
        const artist = await makeUser({ username: 'Play Artist', email: 'playartist@gmail.com', role: 'artist' });
        const listener = await makeUser({ username: 'Listener Two', email: 'listenertwo@gmail.com' });
        const song = await makeSong(artist._id, { title: 'Count Me' });
        const agent = await loginAs('listenertwo@gmail.com');

        await agent.post(`/songs/${song._id}/play`).set(J).send({});
        await agent.post(`/songs/${song._id}/play`).set(J).send({});
        const info = await agent.get(`/songs/info/${song._id}`).set(J);
        expect(info.body.playCount).toBe(2);

        const hist = await agent.get('/history').set(J);
        expect(hist.body.history.length).toBe(1);
        // Second play updates timestamp instead of duplicating (unique user+song)
        expect(hist.body.history.filter((h) => String(h.song._id) === String(song._id)).length).toBe(1);
    });
});

describe('comments: sanitize + limits', () => {
    it('strips scripts and caps length/content', async () => {
        const app = getApp();
        const artist = await makeUser({ username: 'Comment Artist', email: 'commentartist@gmail.com', role: 'artist' });
        const commenter = await makeUser({ username: 'Commenter', email: 'commenter@gmail.com' });
        const song = await makeSong(artist._id, { title: 'Talk About It' });
        const agent = await loginAs('commenter@gmail.com');

        const empty = await agent.post(`/songs/${song._id}/comment`).set(J).send({ content: '   ' });
        expect(empty.status).toBe(400);

        const xss = await agent.post(`/songs/${song._id}/comment`).set(J).send({ content: '<script>alert(1)</script>nice track' });
        expect(xss.body.success).toBe(true);
        expect(xss.body.comment.content).not.toContain('<script>');
        expect(xss.body.comment.content).toContain('nice track');

        const list = await agent.get(`/songs/${song._id}/comments?limit=5`).set(J);
        expect(Array.isArray(list.body)).toBe(true);
        expect(list.body.length).toBeLessThanOrEqual(5);
    });
});

describe('search: injection-proof', () => {
    it('survives regex bombs and XSS payloads', async () => {
        const app = getApp();
        const artist = await makeUser({ username: 'Search Artist', email: 'searchartist@gmail.com', role: 'artist' });
        await makeSong(artist._id, { title: 'Hello World Song' });
        const agent = await loginAs('searchartist@gmail.com');

        for (const q of ['(a+)+$', '.*', '<script>alert(1)</script>', '(((.*']) {
            const r = await agent.get(`/search?q=${encodeURIComponent(q)}`).set(J);
            expect(r.status).toBe(200);
            expect(r.body.songs).toBeDefined();
            expect(r.body.artists).toBeDefined();
            expect(r.body.playlists).toBeDefined();
        }
        const hit = await agent.get('/search?q=Hello').set(J);
        expect(hit.body.songs.length).toBeGreaterThan(0);
    });
});
