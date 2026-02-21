import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatStream } from '../hooks/useChatStream';

/**
 * Test suite for Bug #6: Concurrent message updates (race conditions)
 * Bug #7: Malformed JSON handling
 *
 * Bug #6 Location: useChatStream.ts line 142-148
 * Issue: Multiple rapid state updates can cause race conditions
 * Root cause: setMessages() using stale prev state in rapid succession
 *
 * Bug #7 Location: useChatStream.ts line 137-150
 * Issue: Malformed JSON chunks crash JSON.parse()
 * Root cause: No try-catch around JSON.parse(jsonStr)
 */

describe('Bug #6: Concurrent message updates - race conditions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should handle multiple rapid sendMessage calls without state corruption', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({
        query: 'test',
        answer: 'answer',
        events: [],
        no_data: false
      }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    // Send 3 messages rapidly
    await act(async () => {
      const p1 = result.current.sendMessage('Query 1');
      const p2 = result.current.sendMessage('Query 2');
      const p3 = result.current.sendMessage('Query 3');
      await Promise.all([p1, p2, p3]);
    });

    // Should have all 6 messages (3 user + 3 assistant)
    expect(result.current.messages.length).toBe(6);
    expect(result.current.messages.filter(m => m.role === 'user').length).toBe(3);
    expect(result.current.messages.filter(m => m.role === 'assistant').length).toBe(3);
  });

  it('should handle concurrent message updates without losing messages', async () => {
    let resolveFunc: (value: Response) => void;
    const promise = new Promise<Response>((resolve) => {
      resolveFunc = resolve;
    });

    vi.mocked(fetch).mockReturnValue(promise as Promise<Response>);

    const { result } = renderHook(() => useChatStream());

    // Start first message
    act(() => {
      result.current.sendMessage('Query 1');
    });

    // Immediately start second message before first completes
    act(() => {
      result.current.sendMessage('Query 2');
    });

    // Complete both
    await act(async () => {
      resolveFunc!({
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ answer: 'Response 1', events: [] }),
      } as Response);
      await promise;
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    // Should not lose any messages
    const userMessages = result.current.messages.filter(m => m.role === 'user');
    expect(userMessages.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle message state updates during streaming without corruption', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Rapid chunks
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"A"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"B"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"C"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"D"}}]}\n\n'));
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
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have accumulated all content
    const assistantMsg = result.current.messages.find(m => m.role === 'assistant');
    expect(assistantMsg?.content).toContain('A');
    expect(assistantMsg?.content).toContain('B');
    expect(assistantMsg?.content).toContain('C');
    expect(assistantMsg?.content).toContain('D');
  });

  it('should preserve message IDs during concurrent updates', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ answer: 'test', events: [] }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Message 1');
    });

    const firstAssistantId = result.current.messages[1].id;

    await act(async () => {
      await result.current.sendMessage('Message 2');
    });

    const secondAssistantId = result.current.messages[3].id;

    // IDs should be different and not corrupted
    expect(firstAssistantId).not.toBe(secondAssistantId);
    expect(result.current.messages[1].id).toBe(firstAssistantId); // Should not change
  });
});

describe('Bug #7: Malformed JSON handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should handle malformed JSON in stream without crashing', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Valid"}}]}\n\n'));
        controller.enqueue(encoder.encode('data: {invalid json}\n\n')); // Malformed
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"More"}}]}\n\n'));
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
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have processed valid chunks, skipped invalid
    const assistantMsg = result.current.messages.find(m => m.role === 'assistant');
    expect(assistantMsg?.content).toContain('Valid');
    expect(assistantMsg?.content).toContain('More');
  });

  it('should handle incomplete JSON chunks in stream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Incomplete JSON (cut off mid-object)
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":\n'));
        controller.enqueue(encoder.encode('data: {"content":"Split"}}]}\n\n'));
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

    // Should not crash
    await act(async () => {
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have at least created the messages array
    expect(result.current.messages.length).toBeGreaterThan(0);
  });

  it('should handle JSON with unexpected structure', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Valid JSON but unexpected structure
        controller.enqueue(encoder.encode('data: {"unexpected":"structure"}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":null}\n\n'));
        controller.enqueue(encoder.encode('data: {"choices":[]}\n\n'));
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

    // Should not crash
    await act(async () => {
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.messages.length).toBeGreaterThan(0);
  });

  it('should handle malformed JSON in non-streaming response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    // Should set error state
    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useChatStream - Stream interruption handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should handle stream that closes abruptly', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Start"}}]}\n\n'));
        // Close without [DONE]
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
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have partial content
    const assistantMsg = result.current.messages.find(m => m.role === 'assistant');
    expect(assistantMsg?.content).toContain('Start');
  });

  it('should handle stream that errors mid-way', async () => {
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Start"}}]}\n\n'));
        controller.error(new Error('Stream error'));
      }
    });

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'text/event-stream' }),
      body: stream,
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have error state or partial content
    expect(result.current.error || result.current.messages.length > 0).toBeTruthy();
  });
});

describe('useChatStream - Multiple rapid queries', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should handle 10 rapid sequential queries', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ answer: 'Response', events: [] }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      for (let i = 0; i < 10; i++) {
        await result.current.sendMessage(`Query ${i}`);
      }
    });

    // Should have 20 messages (10 user + 10 assistant)
    expect(result.current.messages.length).toBe(20);
  });

  it('should handle query sent while previous query is loading', async () => {
    let callCount = 0;
    vi.mocked(fetch).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ answer: `Response ${callCount}`, events: [] }),
      } as Response);
    });

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      result.current.sendMessage('Query 1');
      // Send second query while first is in flight
      await result.current.sendMessage('Query 2');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have both queries
    expect(result.current.messages.filter(m => m.role === 'user').length).toBeGreaterThanOrEqual(2);
  });
});

describe('useChatStream - Network timeout handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should handle fetch timeout', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network timeout'));

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle fetch network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Failed to fetch');
  });

  it('should handle 408 Request Timeout', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 408,
      json: async () => ({ error: 'Request Timeout' }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should handle 504 Gateway Timeout', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 504,
      json: async () => ({ error: 'Gateway Timeout' }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useChatStream - Empty assistant message cleanup', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  it('should remove empty assistant message on error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Test');
    });

    // Should only have user message, empty assistant should be removed
    const assistantMessages = result.current.messages.filter(m => m.role === 'assistant');
    const emptyAssistant = assistantMessages.find(m => !m.content);
    expect(emptyAssistant).toBeUndefined();
  });
});
