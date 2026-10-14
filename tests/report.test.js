import { describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { getApp, makeUser, makeSong } from './setup.js';

const J = { Accept: 'application/json' };

async function loginAs(email, password = 'Secret123') {
    const agent = request.agent(getApp());
    await agent.post('/login').set(J).send({ email, password });
    return agent;
}

describe('reports: filing + duplicate guard', () => {
    it('files a song report and lists it under mine', async () => {
        const app = getApp();
        const artist = await makeUser({ username: 'R Artist', email: 'rartist@gmail.com', role: 'artist' });
        await makeUser({ username: 'R Reporter', email: 'rreporter@gmail.com' });
        const song = await makeSong(artist._id);
        const agent = await loginAs('rreporter@gmail.com');

        const r = await agent.post('/reports').set(J).send({
            targetType: 'song', targetId: String(song._id), type: 'spam', reason: 'test spam'
        });
        expect(r.body.success).toBe(true);
        expect(r.body.report.targetType).toBe('song');
        expect(r.body.report.status).toBe('pending');

        const mine = await agent.get('/reports/mine').set(J);
        expect(mine.body.success).toBe(true);
        expect(mine.body.reports.length).toBe(1);
    });

    it('returns the pending report instead of duplicating', async () => {
        const artist = await makeUser({ username: 'D Artist', email: 'dartist@gmail.com', role: 'artist' });
        await makeUser({ username: 'D Reporter', email: 'dreporter@gmail.com' });
        const song = await makeSong(artist._id);
        const agent = await loginAs('dreporter@gmail.com');
        const payload = { targetType: 'song', targetId: String(song._id), type: 'other', reason: 'x' };

        const first = await agent.post('/reports').set(J).send(payload);
        expect(first.body.success).toBe(true);
        expect(first.body.duplicate).toBeUndefined();

        const second = await agent.post('/reports').set(J).send(payload);
        expect(second.body.success).toBe(true);
        expect(second.body.duplicate).toBe(true);
        expect(second.body.report._id).toBe(first.body.report._id);

        const Report = mongoose.model('Report');
        expect(await Report.countDocuments({ reporter: first.body.report.reporter, targetId: song._id })).toBe(1);
    });

    it('validates target and requires auth', async () => {
        const app = getApp();
        await makeUser({ username: 'V Reporter', email: 'vreporter@gmail.com' });
        const agent = await loginAs('vreporter@gmail.com');

        const badType = await agent.post('/reports').set(J).send({ targetType: 'album', targetId: 'x' });
        expect(badType.status).toBe(400);
        const badId = await agent.post('/reports').set(J).send({ targetType: 'song', targetId: 'nope' });
        expect(badId.status).toBe(400);
        const missing = await agent.post('/reports').set(J).send({
            targetType: 'song', targetId: '000000000000000000000001'
        });
        expect(missing.status).toBe(404);

        const anon = await request(app).post('/reports').set(J).send({
            targetType: 'song', targetId: '000000000000000000000001'
        });
        expect(anon.status).toBe(401);
    });

    it('files a comment report', async () => {
        await makeUser({ username: 'C Artist', email: 'cartist@gmail.com', role: 'artist' });
        const reporter = await makeUser({ username: 'C Reporter', email: 'creporter@gmail.com' });
        const artist = await mongoose.model('User').findOne({ email: 'cartist@gmail.com' });
        const song = await makeSong(artist._id);
        const Comment = mongoose.model('Comment');
        const comment = await Comment.create({ user: reporter._id, song: song._id, content: 'rude words' });
        const agent = await loginAs('creporter@gmail.com');

        const r = await agent.post('/reports').set(J).send({
            targetType: 'comment', targetId: String(comment._id), type: 'inappropriate', reason: 'rude'
        });
        expect(r.body.success).toBe(true);
        expect(r.body.report.targetType).toBe('comment');
    });
});
