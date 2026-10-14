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

describe('favorites: listing survives deleted songs', () => {
    it('lists liked songs with liked:true', async () => {
        const artist = await makeUser({ username: 'F Artist', email: 'fartist@gmail.com', role: 'artist' });
        await makeUser({ username: 'F Fan', email: 'ffan@gmail.com' });
        const song = await makeSong(artist._id);
        const agent = await loginAs('ffan@gmail.com');

        const like = await agent.post(`/songs/${song._id}/like`).set(J);
        expect(like.body.liked).toBe(true);

        const fav = await agent.get('/favorites').set(J);
        expect(fav.status).toBe(200);
        expect(fav.body.songs.length).toBe(1);
        expect(fav.body.songs[0].liked).toBe(true);
    });

    it('skips dangling refs instead of crashing (500)', async () => {
        await makeUser({ username: 'D Fan', email: 'dfan@gmail.com' });
        const User = mongoose.model('User');
        const ghost = new mongoose.Types.ObjectId();
        await User.updateOne(
            { email: 'dfan@gmail.com' },
            { $push: { favoriteSongs: ghost } }
        );
        const agent = await loginAs('dfan@gmail.com');

        const fav = await agent.get('/favorites').set(J);
        expect(fav.status).toBe(200);
        expect(fav.body.songs).toEqual([]);

        // Self-healed: the dead ref is gone from the stored list.
        const user = await User.findOne({ email: 'dfan@gmail.com' }).select('favoriteSongs').lean();
        expect(user.favoriteSongs.map(String)).not.toContain(String(ghost));
    });

    it('stays 200 after an admin deletes a favorited song', async () => {
        const artist = await makeUser({ username: 'A Artist', email: 'aartist@gmail.com', role: 'artist' });
        await makeUser({ username: 'A Fan', email: 'afan@gmail.com' });
        await makeUser({ username: 'A Root', email: 'aroot@gmail.com', role: 'admin' });
        const song = await makeSong(artist._id);
        const fan = await loginAs('afan@gmail.com');
        await fan.post(`/songs/${song._id}/like`).set(J);

        const admin = await loginAs('aroot@gmail.com');
        const del = await admin.delete(`/admin/song/${song._id}`).set(J);
        expect(del.body.success).toBe(true);

        const fav = await fan.get('/favorites').set(J);
        expect(fav.status).toBe(200);
        expect(fav.body.songs).toEqual([]);
    });
});
