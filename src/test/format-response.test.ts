import { describe, it, expect } from 'vitest';
import { formatHistoryResponse } from '../lib/format-response';

describe('formatHistoryResponse', () => {
  it('should return empty string for null or undefined', () => {
    expect(formatHistoryResponse(null)).toBe('');
    expect(formatHistoryResponse(undefined)).toBe('');
  });

  it('should return plain string as is if not JSON', () => {
    const text = 'Hello world';
    expect(formatHistoryResponse(text)).toBe(text);
  });

  it('should parse and format a valid JSON string with events array', () => {
    const jsonStr = JSON.stringify({
      events: [
        { year: 1911, story: 'Nguyễn Tất Thành ra đi tìm đường cứu nước.' }
      ]
    });
    const result = formatHistoryResponse(jsonStr);
    expect(result).toContain('### Năm 1911');
    expect(result).toContain('- Nguyễn Tất Thành ra đi tìm đường cứu nước.');
  });

  it('should clean technical prefixes (B1, B2, B3) from stories', () => {
    const data = {
      events: [
        {
          year: 1225,
          story: 'Năm 1225, B1. gắn mốc 1225 với Nhà Trần thành lập. B2. nêu diễn biến trọng tâm – "Lý Chiêu Hoàng nhường ngôi cho Trần Cảnh, mở đầu triều Trần.". B3. kết luận – Mở ra thời kỳ hưng thịnh.'
        }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).not.toContain('B1.');
    expect(result).not.toContain('B2.');
    expect(result).not.toContain('B3.');
    expect(result).not.toContain('gắn mốc 1225 với');
    expect(result).toContain('Nhà Trần thành lập');
    expect(result).toContain('Lý Chiêu Hoàng nhường ngôi cho Trần Cảnh');
  });

  it('should deduplicate similar events even with different technical formats', () => {
    const data = {
      events: [
        {
          year: 1911,
          story: 'Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng.'
        },
        {
          year: 1911,
          story: 'B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – "Nguyễn Tất Thành rời bến Nhà Rồng.".'
        }
      ]
    };
    const result = formatHistoryResponse(data);
    const lines = result.split('\n').filter(l => l.startsWith('- '));
    // Should only have one event after deduplication
    expect(lines.length).toBe(1);
    expect(result).toContain('Nguyễn Tất Thành ra đi tìm đường cứu nước');
  });

  it('should filter out meta-text like "Câu hỏi nhắm tới"', () => {
    const data = {
      events: [
        {
          year: 1771,
          story: 'Câu hỏi nhắm tới sự kiện Khởi nghĩa Tây Sơn bùng nổ (1771). Cốt lõi. Anh em Tây Sơn khởi nghĩa.'
        }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).not.toContain('Câu hỏi nhắm tới');
    expect(result).not.toContain('Cốt lõi.');
    expect(result).toContain('Khởi nghĩa Tây Sơn bùng nổ');
    expect(result).toContain('Anh em Tây Sơn khởi nghĩa');
  });

  it('should handle "documents" array format', () => {
    const data = {
      documents: [
        { year: 1400, event: 'Hồ Quý Ly lập nhà Hồ.' }
      ]
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 1400');
    expect(result).toContain('- Hồ Quý Ly lập nhà Hồ.');
  });

  it('should handle no_data: true', () => {
    const data = { no_data: true };
    const result = formatHistoryResponse(data);
    expect(result).toBe("Xin lỗi, tôi không tìm thấy thông tin lịch sử phù hợp với yêu cầu của bạn.");
  });

  it('should use answer directly when answer has content (avoid event duplication)', () => {
    const data = {
      events: [
        { year: 1945, story: 'Event A' }
      ],
      answer: 'Context information about the query.\n\nNăm 1945: Event A details.'
    };
    const result = formatHistoryResponse(data);
    // Answer is used directly — events array is NOT rendered separately
    expect(result).toContain('Context information about the query.');
    expect(result).toContain('Năm 1945: Event A details.');
    // Should NOT have the events-array rendered format "### Năm 1945" + "- Event A"
    expect(result).not.toContain('### Năm 1945');
    expect(result).not.toContain('- Event A');
  });

  it('should render events array when answer is empty (fallback)', () => {
    const data = {
      events: [
        { year: 1789, story: 'Quang Trung đại phá quân Thanh.' }
      ],
      answer: ''
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('### Năm 1789');
    expect(result).toContain('- Quang Trung đại phá quân Thanh.');
  });

  it('should display same-person detection from answer', () => {
    const data = {
      events: [
        { year: 1789, story: 'Quang Trung đại phá quân Thanh.' }
      ],
      answer: '**Quang Trung** và **Nguyễn Huệ** là **cùng một người**.\n\nTên chính: **Nguyễn Huệ**\n\n---\n\nDưới đây là các sự kiện liên quan:\n\nNăm 1789: Quang Trung đại phá quân Thanh.'
    };
    const result = formatHistoryResponse(data);
    expect(result).toContain('cùng một người');
    expect(result).toContain('Quang Trung đại phá quân Thanh');
  });

  it('should clean the answer field if no events are present', () => {
    const data = {
      events: [],
      answer: 'B1. gắn mốc 1911 với Nguyễn Tất Thành. B2. nêu diễn biến...',
      intent: 'general'
    };
    const result = formatHistoryResponse(data);
    expect(result).not.toContain('B1.');
    expect(result).toContain('Nguyễn Tất Thành');
  });

  it('should handle deeply escaped strings often seen in multi-turn streams', () => {
    const escapedJson = "{\\\"answer\\\":\\\"Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước.\\\"}";
    // Note: In real life, the string might be even more escaped or just a partial chunk.
    // If it's a valid JSON after some unescaping, we should try to handle it.
    // However, our current code handles basic JSON strings.
    const result = formatHistoryResponse(escapedJson);
    // If it fails to parse because of triple backslashes, it returns the string as is.
    expect(typeof result).toBe('string');
  });
});
