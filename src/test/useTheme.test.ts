/**
 * useTheme Hook Tests
 * 
 * Tests for theme management functionality
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

import { useTheme } from '../hooks/useTheme';

describe('useTheme Hook', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
        document.documentElement.classList.remove('dark', 'light');
    });

    it('should initialize with system theme', () => {
        const { result } = renderHook(() => useTheme());

        expect(result.current.theme).toBeDefined();
        expect(['light', 'dark', 'system']).toContain(result.current.theme);
    });

    it('should toggle theme', () => {
        const { result } = renderHook(() => useTheme());
        const initialTheme = result.current.theme;

        act(() => {
            result.current.toggleTheme();
        });

        // Theme should have changed
        expect(result.current.theme).not.toBe(initialTheme);
    });

    it('should set theme to dark', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('dark');
        });

        expect(result.current.theme).toBe('dark');
    });

    it('should set theme to light', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('light');
        });

        expect(result.current.theme).toBe('light');
    });

    it('should persist theme to localStorage', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('dark');
        });

        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should apply dark class to document', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('dark');
        });

        // The hook should add 'dark' class to documentElement
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});
