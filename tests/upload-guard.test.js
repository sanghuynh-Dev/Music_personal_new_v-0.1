import { describe, it, expect } from 'vitest';
import { fileFilter, IMAGE_MIMES, AUDIO_MIMES } from '../src/config/cloudinary.js';
import { upload } from '../src/config/cloudinary.js';

const callFilter = (fieldname, mimetype) =>
    new Promise((resolve) => {
        fileFilter({}, { fieldname, mimetype }, (err, ok) => resolve({ err, ok }));
    });

describe('upload guard (multer fileFilter + limits)', () => {
    it('accepts cover images and audio tracks', async () => {
        for (const m of IMAGE_MIMES) {
            const r = await callFilter('image', m);
            expect(r.err).toBeNull();
            expect(r.ok).toBe(true);
        }
        for (const m of AUDIO_MIMES) {
            const r = await callFilter('file', m);
            expect(r.err).toBeNull();
            expect(r.ok).toBe(true);
        }
    });

    it('rejects executables, svg, archives and mismatched fields', async () => {
        for (const m of ['application/x-msdownload', 'image/svg+xml', 'application/zip', 'video/mp4', 'text/html']) {
            const r = await callFilter('file', m);
            expect(r.err).toBeTruthy();
        }
        const r = await callFilter('image', 'audio/mpeg');
        expect(r.err).toBeTruthy();
    });

    it('enforces per-file size and file count limits', () => {
        expect(upload.limits.fileSize).toBe(20 * 1024 * 1024);
        expect(upload.limits.files).toBe(2);
    });
});
