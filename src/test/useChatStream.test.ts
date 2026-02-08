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
      json: async () => ({ error: 'Server Error' }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('test');
    });

    expect(result.current.error).toBe('Server Error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle identity questions locally without calling backend', async () => {
    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Who are you?');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Who are you?');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toContain('History Mind AI');
    // Ensure fetch was NOT called
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should inject system instruction for date range queries', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: async () => ({ answer: "Response" }),
    } as Response);

    const { result } = renderHook(() => useChatStream());

    await act(async () => {
      await result.current.sendMessage('Events from 1945 to 2000');
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);

    // Check that the last message contains the system instruction
    const lastMessage = body.messages[body.messages.length - 1];
    expect(lastMessage.content).toContain('[SYSTEM INSTRUCTION: You are History Mind AI.');
    expect(lastMessage.content).toContain('list events for EVERY year in that range');
  });

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
