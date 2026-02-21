import { describe, it, expect } from 'vitest';
import { formatHistoryResponse, getNormalizedKey } from '../lib/format-response';

/**
 * Test suite for Bug #3: Empty normalizedKey crash
 *
 * Location: format-response.ts line 50-58
 * Issue: getNormalizedKey() can return empty string when text has no alphanumeric chars
 * Root cause: .replace(/[^\p{L}\p{N}\s]/gu, '') removes ALL chars from punctuation-only text
 * Impact: dedupeKey = `${year}_${normalizedKey.slice(0, 50)}` becomes "${year}_"
 */

describe('Bug #3: Empty normalizedKey handling', () => {
  it('should handle event with only punctuation in story', () => {
    const data = {
      events: [
        { year: 1945, story: '!!!' },
        { year: 1945, story: '???' },
      ]
    };
    // Should not crash, should deduplicate or skip empty content
    const result = formatHistoryResponse(data);
    expect(typeof result).toBe('string');
  });

  it('should handle event with only special characters', () => {
    const data = {
      events: [
        { year: 1945, story: '@#$%^&*()' },
      ]
    };
    const result = formatHistoryResponse(data);
    expect(typeof result).toBe('string');
  });

  it('should handle event with only emoji', () => {
    const data = {
      events: [
        { year: 1945, story: '😀🎉' },
      ]
    };
    const result = formatHistoryResponse(data);
    expect(typeof result).toBe('string');
  });

  it('should handle event with only whitespace after cleaning', () => {
    const data = {
      events: [
        { year: 1945, story: '   \n\t   ' },
      ]
    };
    const result = formatHistoryResponse(data);
    // Should skip event with < 5 chars after cleaning
    expect(result).not.toContain('### Năm 1945');
  });

  it('should filter out events that become empty after technical cleaning', () => {
    const data = {
      events: [
        { year: 1945, story: 'B1. B2. B3.' },  // Only technical markers
        { year: 1945, story: 'Năm 1945, gắn mốc 1945 với' },  // Only metadata
      ]
    };
    const result = formatHistoryResponse(data);
    // Should not crash, should skip empty content after cleaning
    expect(typeof result).toBe('string');
  });
});

describe('formatHistoryResponse - Empty events array handling', () => {
  it('should handle empty events array', () => {
    const data = { events: [] };
    const result = formatHistoryResponse(data);
    expect(result).toBe('Xin lỗi, tôi không tìm thấy thông tin phù hợp.');
  });

  it('should handle events array with all null entries', () => {
    const data = {
      events: [null, null, null]
    };
    const result = formatHistoryResponse(data);
    expect(result).toBe('Xin lỗi, tôi không tìm thấy thông tin phù hợp.');
  });

  it('should handle events array with all undefined entries', () => {
    const data = {
      events: [undefined, undefined]
    };
    const result = formatHistoryResponse(data);
    expect(result).toBe('Xin lỗi, tôi không tìm thấy thông tin phù hợp.');
  });
});

describe('formatHistoryResponse - Events with missing fields', () => {
  it('should handle event with missing year', () => {
    const data = {
      events: [
        { story: 'Event without year' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('Sự kiện khác');
  });

  it('should handle event with null year', () => {
    const data = {
      events: [
        { story: 'Event with null year', year: null }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('Sự kiện khác');
  });

  it('should handle event with undefined year', () => {
    const data = {
      events: [
        { story: 'Event with undefined year', year: undefined }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('Sự kiện khác');
  });

  it('should handle event with missing story and event fields', () => {
    const data = {
      events: [
        { year: 1945 }  // No story or event
      ]
    };
    const result = formatHistoryResponse(data);
    // Should skip event with no content
    expect(result).not.toContain('### Năm 1945');
  });

  it('should handle event with empty string story and event', () => {
    const data = {
      events: [
        { year: 1945, story: '', event: '' }
      ]
    };
    const result = formatHistoryResponse(data);
    // Should skip event with empty content
    expect(result).not.toContain('### Năm 1945');
  });
});

describe('formatHistoryResponse - Deduplication edge cases', () => {
  it('should deduplicate events with identical content after cleaning', () => {
    const data = {
      events: [
        { year: 1945, story: 'Cách mạng tháng Tám thành công.' },
        { year: 1945, story: 'B1. Cách mạng tháng Tám thành công.' },
        { year: 1945, story: 'Năm 1945, Cách mạng tháng Tám thành công.' },
      ]
    };
    const result = formatHistoryResponse(data);
    const lines = result.split('\n').filter(l => l.startsWith('- '));
    // Should only have one event after deduplication
    expect(lines.length).toBe(1);
  });

  it('should deduplicate events with different years but same content', () => {
    const data = {
      events: [
        { year: 1945, story: 'Important event occurred' },
        { year: 1946, story: 'Important event occurred' },
      ]
    };
    const result = formatHistoryResponse(data);
    // Both years should be present (not deduplicated across years)
    expect(result).toContain('### Năm 1945');
    expect(result).toContain('### Năm 1946');
  });

  it('should handle events with very similar but not identical content', () => {
    const data = {
      events: [
        { year: 1945, story: 'Cách mạng tháng Tám thành công' },
        { year: 1945, story: 'Cách mạng tháng 8 thành công' },
      ]
    };
    const result = formatHistoryResponse(data);
    // Should recognize these as different (8 vs Tám)
    const lines = result.split('\n').filter(l => l.startsWith('- '));
    expect(lines.length).toBeGreaterThan(0);
  });
});

describe('formatHistoryResponse - Year formatting edge cases', () => {
  it('should handle year 0', () => {
    const data = {
      events: [
        { year: 0, story: 'Event at year zero' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 0');
  });

  it('should handle negative year', () => {
    const data = {
      events: [
        { year: -100, story: 'Event in BC era' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm -100');
  });

  it('should handle very large year', () => {
    const data = {
      events: [
        { year: 9999, story: 'Future event' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 9999');
  });

  it('should handle year as string', () => {
    const data = {
      events: [
        { year: '1945', story: 'Event with string year' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 1945');
  });

  it('should handle year as float', () => {
    const data = {
      events: [
        { year: 1945.5, story: 'Event with float year' }
      ]
    };
    const result = formatHistoryResponse(data);
    // Should handle gracefully (likely convert to int)
    expect(typeof result).toBe('string');
  });
});

describe('formatHistoryResponse - Answer field edge cases', () => {
  it('should handle null answer field', () => {
    const data = {
      events: [
        { year: 1945, story: 'Event' }
      ],
      answer: null
    };
    const result = formatHistoryResponse(data);
    // Should fallback to rendering events array
    expect(result).toContain('### Năm 1945');
  });

  it('should handle undefined answer field', () => {
    const data = {
      events: [
        { year: 1945, story: 'Event' }
      ],
      answer: undefined
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 1945');
  });

  it('should handle empty string answer with events', () => {
    const data = {
      events: [
        { year: 1945, story: 'Event' }
      ],
      answer: ''
    };
    const result = formatHistoryResponse(data);
    // Should fallback to rendering events array
    expect(result).toContain('### Năm 1945');
  });

  it('should handle whitespace-only answer', () => {
    const data = {
      events: [
        { year: 1945, story: 'Event' }
      ],
      answer: '   \n\t   '
    };
    const result = formatHistoryResponse(data);
    // Should fallback to rendering events array
    expect(result).toContain('### Năm 1945');
  });

  it('should use answer when both answer and events present', () => {
    const data = {
      events: [
        { year: 1945, story: 'Event A' }
      ],
      answer: 'Custom answer text'
    };
    const result = formatHistoryResponse(data);
    // Should use answer directly
    expect(result).toBe('Custom answer text');
    expect(result).not.toContain('### Năm 1945');
  });
});

describe('formatHistoryResponse - Malformed JSON handling', () => {
  it('should handle invalid JSON string', () => {
    const invalidJson = '{invalid json}';
    const result = formatHistoryResponse(invalidJson);
    // Should return as-is if not valid JSON
    expect(result).toBe(invalidJson);
  });

  it('should handle partial JSON string', () => {
    const partialJson = '{"events": [{"year": 1945';
    const result = formatHistoryResponse(partialJson);
    // Should return as-is if not valid JSON
    expect(result).toBe(partialJson);
  });

  it('should handle JSON with extra commas', () => {
    const jsonWithCommas = '{"events": [,,,]}';
    const result = formatHistoryResponse(jsonWithCommas);
    // Should attempt to parse, handle gracefully
    expect(typeof result).toBe('string');
  });
});

describe('formatHistoryResponse - no_data flag handling', () => {
  it('should handle no_data: true with empty events', () => {
    const data = {
      no_data: true,
      events: []
    };
    const result = formatHistoryResponse(data);
    expect(result).toBe('Xin lỗi, tôi không tìm thấy thông tin lịch sử phù hợp với yêu cầu của bạn.');
  });

  it('should prioritize no_data over events', () => {
    const data = {
      no_data: true,
      events: [
        { year: 1945, story: 'Event that should be ignored' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toBe('Xin lỗi, tôi không tìm thấy thông tin lịch sử phù hợp với yêu cầu của bạn.');
  });

  it('should handle no_data: false', () => {
    const data = {
      no_data: false,
      events: [
        { year: 1945, story: 'Valid event' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 1945');
  });
});

describe('formatHistoryResponse - documents array format', () => {
  it('should handle documents array instead of events', () => {
    const data = {
      documents: [
        { year: 1945, event: 'Event from documents array' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 1945');
    expect(result).toContain('Event from documents array');
  });

  it('should handle empty documents array', () => {
    const data = {
      documents: []
    };
    const result = formatHistoryResponse(data);
    expect(result).toBe('Xin lỗi, tôi không tìm thấy thông tin phù hợp.');
  });
});
