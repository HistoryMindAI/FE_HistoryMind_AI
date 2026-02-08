import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBaseUrl } from '../hooks/useChatStream';

describe('useChatStream URL Logic', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should handle empty URL (use proxy)', () => {
    vi.stubEnv('VITE_API_URL', '');
    expect(getBaseUrl()).toBe('');
  });

  it('should handle URL with https protocol', () => {
    const url = 'https://api.example.com';
    vi.stubEnv('VITE_API_URL', url);
    expect(getBaseUrl()).toBe(url);
  });

  it('should handle URL with http protocol', () => {
    const url = 'http://localhost:8080';
    vi.stubEnv('VITE_API_URL', url);
    expect(getBaseUrl()).toBe(url);
  });

  it('should add https to URL without protocol', () => {
    const url = 'api.example.com';
    vi.stubEnv('VITE_API_URL', url);
    expect(getBaseUrl()).toBe(`https://${url}`);
  });

  it('should add https to IP address without protocol', () => {
    const url = '192.168.1.1';
    vi.stubEnv('VITE_API_URL', url);
    expect(getBaseUrl()).toBe(`https://${url}`);
  });
});
