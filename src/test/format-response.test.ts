import { describe, it, expect } from 'vitest';
import { formatHistoryResponse } from '../lib/format-response';

describe('formatHistoryResponse', () => {
  it('should return string as is', () => {
    const input = 'Hello world';
    expect(formatHistoryResponse(input)).toBe(input);
  });

  it('should format historical data JSON correctly', () => {
    const input = {
      "938": {
        "summary": "Một năm ghi dấu thắng lợi quân sự quan trọng của dân tộc.",
        "events": [
          {
            "year": 938,
            "event": "Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng, chấm dứt hơn 1000 năm Bắc thuộc.",
            "persons": ["Ngô Quyền"],
            "places": ["Bạch Đằng"],
            "keywords": ["đánh tan", "chiến thắng"]
          }
        ]
      }
    };

    const result = formatHistoryResponse(input);
    expect(result).toContain('### Năm 938');
    expect(result).toContain('**Tóm tắt:** Một năm ghi dấu thắng lợi quân sự quan trọng của dân tộc.');
    expect(result).toContain('- **938:** Ngô Quyền đánh tan quân Nam Hán trên sông Bạch Đằng, chấm dứt hơn 1000 năm Bắc thuộc.');
    expect(result).toContain('*Nhân vật:* Ngô Quyền');
    expect(result).toContain('*Địa danh:* Bạch Đằng');
    expect(result).toContain('*Từ khóa:* đánh tan, chiến thắng');
  });

  it('should handle multiple years', () => {
    const input = {
      "938": { "summary": "Sum 938", "events": [] },
      "939": { "summary": "Sum 939", "events": [] }
    };
    const result = formatHistoryResponse(input);
    expect(result).toContain('### Năm 938');
    expect(result).toContain('### Năm 939');
  });

  it('should fallback to JSON stringify for unknown objects', () => {
    const input = { unknown: 'data' };
    const result = formatHistoryResponse(input);
    expect(result).toBe(JSON.stringify(input, null, 2));
  });
});
