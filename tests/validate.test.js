import { describe, it, expect } from 'vitest';
import { isValidObjectId, escapeRegExp, cleanText, sanitizeUser } from '../src/middlewares/validate.js';

describe('validate middleware (pure)', () => {
    it('rejects non-ObjectId strings', () => {
        expect(isValidObjectId('edit')).toBe(false);
        expect(isValidObjectId('')).toBe(false);
        expect(isValidObjectId(undefined)).toBe(false);
        expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('escapes regex metacharacters (ReDoS guard)', () => {
        const evil = '(a+)+$.*';
        const safe = escapeRegExp(evil);
        expect(() => new RegExp(safe, 'i')).not.toThrow();
        expect(new RegExp(safe, 'i').test('(a+)+$.*')).toBe(true);
        expect(escapeRegExp('x'.repeat(500)).length).toBeLessThanOrEqual(100);
    });

    it('strips HTML from text fields (XSS guard)', () => {
        expect(cleanText('<script>alert(1)</script>hello')).toBe('hello');
        expect(cleanText('<img src=x onerror=alert(1)>hi', 10)).toBe('hi');
        expect(cleanText('a'.repeat(2000), 1000).length).toBe(1000);
    });

    it('sanitizeUser removes password', () => {
        expect(sanitizeUser({ username: 'a', password: 'secret' })).toEqual({ username: 'a' });
        expect(sanitizeUser(null)).toBeNull();
    });
});
