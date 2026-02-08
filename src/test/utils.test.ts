/**
 * Utils Tests
 * 
 * Tests for utility functions like cn (className merger)
 */
import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn - className utility', () => {
    it('should merge multiple class names', () => {
        const result = cn('class1', 'class2');
        expect(result).toContain('class1');
        expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('base', isActive && 'active');
        expect(result).toContain('base');
        expect(result).toContain('active');
    });

    it('should filter out falsy values', () => {
        const isVisible = false;
        const result = cn('base', isVisible && 'hidden', undefined, null);
        expect(result).toBe('base');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should merge tailwind classes correctly', () => {
        // When same property is passed twice, last one wins
        const result = cn('p-4', 'p-6');
        expect(result).toContain('p-6');
    });
});
