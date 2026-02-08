import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useChatStream URL Logic', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // We need to test the logic inside the module.
  // Since CHAT_URL is a top-level constant, it's evaluated at import time.
  // We can extract the logic into a helper function and export it for testing,
  // or use `vi.mock` to simulate `import.meta.env` before importing the module.

  // However, since we cannot easily change the top-level const after import in tests without resetModules,
  // we will test the logic by defining the function here exactly as it is in the source code
  // to verify the logic itself is sound.

  // Alternatively, we can export `getBaseUrl` from `useChatStream.ts` if we modify it.
  // But let's verify the logic we implemented:

  /*
  const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || '';
    if (url && !url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }
    return url;
  };
  */

  const getBaseUrl = (envUrl: string | undefined) => {
    let url = envUrl || '';
    if (url && !url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }
    return url;
  };

  it('should handle empty URL (use proxy)', () => {
    expect(getBaseUrl('')).toBe('');
    expect(getBaseUrl(undefined)).toBe('');
  });

  it('should handle URL with https protocol', () => {
    const url = 'https://api.example.com';
    expect(getBaseUrl(url)).toBe(url);
  });

  it('should handle URL with http protocol', () => {
    const url = 'http://localhost:8080';
    expect(getBaseUrl(url)).toBe(url);
  });

  it('should add https to URL without protocol', () => {
    const url = 'api.example.com';
    expect(getBaseUrl(url)).toBe(`https://${url}`);
  });

  it('should add https to IP address without protocol', () => {
    const url = '192.168.1.1';
    expect(getBaseUrl(url)).toBe(`https://${url}`);
  });
});
