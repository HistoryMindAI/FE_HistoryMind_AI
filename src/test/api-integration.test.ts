import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStream } from '../hooks/useChatStream';

/**
 * API Integration Tests
 * 
 * These tests verify the correct contract between FE and BE:
 * - FE sends { query: string, messages: array } to BE
 * - BE returns { query, intent, answer, events, noData }
 */
describe('API Integration - Request/Response Contract', () => {
    let capturedRequest: { url: string; options: RequestInit } | null = null;

    beforeEach(() => {
        capturedRequest = null;
        vi.stubGlobal('fetch', vi.fn((url: string, options: RequestInit) => {
            capturedRequest = { url, options };
            return Promise.resolve({
                ok: true,
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: async () => ({
                    query: 'test query',
                    intent: 'semantic',
                    answer: 'Test answer about history',
                    events: [{ year: 1945, event: 'Independence Day', tone: 'positive', story: 'Vietnam declared independence' }],
                    noData: false,
                }),
            } as Response);
        }));
    });

    it('should send "query" field (not "question") in request body', async () => {
        const { result } = renderHook(() => useChatStream());

        await act(async () => {
            await result.current.sendMessage('Năm 1945 có sự kiện gì?');
        });

        expect(capturedRequest).not.toBeNull();

        const body = JSON.parse(capturedRequest!.options.body as string);

        // CRITICAL: Verify correct field name
        expect(body).toHaveProperty('query');
        expect(body).not.toHaveProperty('question');
        expect(body.query).toContain('Năm 1945');
    });

    // NOTE: messages array removed - FE now only sends { query }
    // Backend handles all AI logic including conversation context

    it('should call correct API endpoint', async () => {
        const { result } = renderHook(() => useChatStream());

        await act(async () => {
            await result.current.sendMessage('test');
        });

        expect(capturedRequest).not.toBeNull();
        expect(capturedRequest!.url).toContain('/api/v1/chat/ask');
    });

    it('should handle BE response with events correctly', async () => {
        const { result } = renderHook(() => useChatStream());

        await act(async () => {
            await result.current.sendMessage('Năm 1945');
        });

        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[1].role).toBe('assistant');
        // Should have formatted content (not raw JSON)
        expect(result.current.error).toBeNull();
    });

    it('should handle 500 error from BE', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal Server Error' }),
        } as Response);

        const { result } = renderHook(() => useChatStream());

        await act(async () => {
            await result.current.sendMessage('test');
        });

        expect(result.current.error).toBe('Internal Server Error');
    });

    it('should handle network failure', async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network request failed'));

        const { result } = renderHook(() => useChatStream());

        await act(async () => {
            await result.current.sendMessage('test');
        });

        expect(result.current.error).toBe('Network request failed');
    });

    it('should handle noData response from BE', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            headers: new Headers({ 'Content-Type': 'application/json' }),
            json: async () => ({
                query: 'unknown query',
                intent: 'semantic',
                answer: null,
                events: [],
                noData: true,
            }),
        } as Response);

        const { result } = renderHook(() => useChatStream());

        await act(async () => {
            await result.current.sendMessage('something unknown');
        });

        expect(result.current.messages).toHaveLength(2);
        expect(result.current.error).toBeNull();
    });
});
