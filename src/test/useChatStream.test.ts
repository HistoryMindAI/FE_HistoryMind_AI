import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatStream } from '../hooks/useChatStream';

describe('useChatStream', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
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
    // Expect formatted content
    expect(result.current.messages[1].content).toContain('### Năm 938');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error responses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: 'Server Error' }),
      json: async () => ({ error: 'Server Error' }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('test');
    });

    expect(result.current.error).toBe('Server Error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should send identity questions to backend (not handled locally)', async () => {
    // Mock backend response for identity query
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({
        query: "Who are you?",
        intent: "identity",
        answer: "Xin chào, tôi là History Mind AI.",
        events: [],
        no_data: false
      }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Who are you?');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Who are you?');
    // Fetch SHOULD be called now (identity handled by backend)
    expect(fetch).toHaveBeenCalled();
  });

  // NOTE: System instruction injection moved to backend (engine.py)
  // FE no longer injects system instructions into messages

  it('should handle streaming responses', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
      body: stream,
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      // Need to await the sendMessage promise, but the state updates happen asynchronously inside loop
      const promise = result.current.sendMessage('Hello');
      await promise;
    });

    // Wait for the final state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1].content).toBe('Hello world');
  });
});
