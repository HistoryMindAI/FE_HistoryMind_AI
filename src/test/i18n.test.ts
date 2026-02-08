/**
 * i18n Tests
 * 
 * Tests for internationalization functions
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
    getLanguage,
    setLanguage,
    t,
    getAvailableLanguages
} from '../lib/i18n';

describe('i18n - Internationalization', () => {
    beforeEach(() => {
        // Reset to default language before each test
        setLanguage('vi');
    });

    describe('getLanguage', () => {
        it('should return current language', () => {
            const lang = getLanguage();
            expect(['vi', 'en']).toContain(lang);
        });
    });

    describe('setLanguage', () => {
        it('should change language to English', () => {
            setLanguage('en');
            expect(getLanguage()).toBe('en');
        });

        it('should change language to Vietnamese', () => {
            setLanguage('vi');
            expect(getLanguage()).toBe('vi');
        });
    });

    describe('getAvailableLanguages', () => {
        it('should return array of available languages', () => {
            const languages = getAvailableLanguages();
            expect(Array.isArray(languages)).toBe(true);
            expect(languages.length).toBeGreaterThan(0);
        });

        it('should include vi and en', () => {
            const languages = getAvailableLanguages();
            expect(languages).toContain('vi');
            expect(languages).toContain('en');
        });
    });

    describe('t - translation function', () => {
        it('should return translated string for Vietnamese', () => {
            setLanguage('vi');
            const result = t('welcome');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('should return translated string for English', () => {
            setLanguage('en');
            const result = t('welcome');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('should return key if translation not found', () => {
            const result = t('nonexistent_key_12345');
            expect(result).toBe('nonexistent_key_12345');
        });

        it('should handle nested keys', () => {
            const result = t('chat.placeholder');
            expect(typeof result).toBe('string');
        });
    });
});
