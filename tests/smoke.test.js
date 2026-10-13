import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { getApp } from './setup.js';

describe('smoke: app boots on memory mongo', () => {
    it('GET /health reports db up', async () => {
        const res = await request(getApp()).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.db).toBe('up');
    });
});
