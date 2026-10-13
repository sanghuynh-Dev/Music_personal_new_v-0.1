// Shared vitest setup: in-memory Mongo + app import + helpers.
import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';

let mongod;
let app;
let cloudinary;

export const getApp = () => app;

export async function makeUser({ username, email, password = 'Secret123', role = 'user', status = 'active' }) {
    const User = mongoose.model('User');
    const user = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10),
        role,
        status,
    });
    await user.save();
    return user;
}

export async function makeSong(uploadedBy, overrides = {}) {
    const Song = mongoose.model('Song');
    const song = new Song({
        title: 'Test Song',
        artist: 'Test Artist',
        genre: 'Pop',
        description: 'desc',
        imageUrl: { url: 'http://example.com/i.jpg', public_id: '' },
        audioUrl: { url: 'http://example.com/a.mp3', public_id: '' },
        uploadedBy,
        likes: [],
        playCount: 0,
        ...overrides,
    });
    await song.save();
    return song;
}

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongod.getUri('soundora_test');
    process.env.SESSION_SECRET = 'test_secret_for_vitest_only';
    process.env.NODE_ENV = 'test';
    await mongoose.connect(process.env.MONGO_URI);
    // Import app AFTER env is set (app connects on import).
    app = (await import('../src/app.js')).default;
    // Never hit real Cloudinary from tests.
    cloudinary = (await import('../src/config/cloudinary.js')).cloudinary;
    cloudinary.uploader.destroy = async () => ({ result: 'ok' });
}, 120000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
});
