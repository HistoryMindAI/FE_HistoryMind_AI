import { describe, it, expect } from 'vitest';
import { getTranslation } from '../lib/i18n';

describe('i18n - Internationalization', () => {
    describe('getTranslation', () => {
        it('should return Vietnamese translations', () => {
            const t = getTranslation('vi');
            expect(t).toBeDefined();
            expect(t.chat.send).toBe('Gửi');
            expect(t.settings.title).toBe('Cài đặt');
        });

        it('should return English translations', () => {
            const t = getTranslation('en');
            expect(t).toBeDefined();
            expect(t.chat.send).toBe('Send');
            expect(t.settings.title).toBe('Settings');
        });

        it('should have matching keys for both languages', () => {
            const vi = getTranslation('vi');
            const en = getTranslation('en');

            // Deep check structure
            expect(Object.keys(vi)).toEqual(Object.keys(en));
            expect(Object.keys(vi.chat)).toEqual(Object.keys(en.chat));
            expect(Object.keys(vi.settings)).toEqual(Object.keys(en.settings));
        });
    });
});
