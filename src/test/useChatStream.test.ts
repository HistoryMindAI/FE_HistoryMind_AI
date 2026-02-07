import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStream } from '../hooks/useChatStream';

// Mock crypto.randomUUID
if (!global.crypto) {
  global.crypto = { randomUUID: () => 'test-uuid-' + Math.random() } as Crypto;
} else if (!global.crypto.randomUUID) {
  global.crypto.randomUUID = () => 'test-uuid-' + Math.random();
}

describe('useChatStream', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should send a message and handle JSON response', async () => {
    const mockResponse = {
      "938": {
        "summary": "Thắng lợi Bạch Đằng",
        "events": []
      }
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Hỏi về năm 938');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toContain('### Năm 938');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error responses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server Error' }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('test');
    });

    expect(result.current.error).toBe('Server Error');
    expect(result.current.isLoading).toBe(false);
  });
});
