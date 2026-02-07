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

  describe('New Format Support', () => {
    it('should handle the new response format with events and deduplicate them', () => {
      const input = {
        "answer": "Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục. Sự kiện này có là Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.\nNăm 1911, Câu hỏi nhắm tới sự kiện Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Cốt lõi. Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.. . Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.. Trả lời sẽ nêu rõ mốc, diễn biến chính và.\nNăm 1911, B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – \"Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.\". B3. kết luận – Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.",
        "events": [
          {
            "event": "Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục. Sự kiện này có là Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh",
            "id": null,
            "story": "Năm 1911, Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục. Sự kiện này có là Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.",
            "tone": "neutral",
            "year": 1911
          },
          {
            "event": "Câu hỏi nhắm tới sự kiện Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Cốt lõi. Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.. . Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.. Trả lời sẽ nêu rõ mốc, diễn biến chính và",
            "id": null,
            "story": "Năm 1911, Câu hỏi nhắm tới sự kiện Nguyễn Tất Thành ra đi tìm đường cứu nước (1911). Cốt lõi. Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.. . Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.. Trả lời sẽ nêu rõ mốc, diễn biến chính và.",
            "tone": "neutral",
            "year": 1911
          },
          {
            "event": "B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – \"Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.\". B3. kết luận – Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh",
            "id": null,
            "story": "Năm 1911, B1. gắn mốc 1911 với Nguyễn Tất Thành ra đi tìm đường cứu nước. B2. nêu diễn biến trọng tâm – \"Nguyễn Tất Thành rời bến Nhà Rồng, bắt đầu hành trình qua nhiều châu lục.\". B3. kết luận – Đặt nền móng cho con đường cách mạng sau này của Hồ Chí Minh.",
            "tone": "neutral",
            "year": 1911
          }
        ],
        "intent": "year",
        "no_data": false,
        "query": "{\"question\":\"năm 1911 có sự kiện gì\",\"messages\":[]}"
      };

      const result = formatHistoryResponse(input);

      expect(result).toContain('### Năm 1911');
      expect(result).toContain('Nguyễn Tất Thành ra đi tìm đường cứu nước');

      const lines = result.split('\n');
      const bulletPoints = lines.filter(l => l.startsWith('- '));
      expect(bulletPoints.length).toBe(1);

      expect(result).not.toContain('B1. gắn mốc');
      expect(result).not.toContain('Câu hỏi nhắm tới');
    });

    it('should parse JSON strings correctly', () => {
      const input = JSON.stringify({
        "events": [
          { "year": 1911, "story": "Nguyễn Tất Thành ra đi tìm đường cứu nước." }
        ]
      });
      const result = formatHistoryResponse(input);
      expect(result).toContain('### Năm 1911');
      expect(result).toContain('Nguyễn Tất Thành');
    });

    it('should handle edge cases like null fields and missing years', () => {
      const input = {
        "events": [
          { "year": 1225, "event": null, "story": undefined },
          { "year": 1226, "event": "Clean event" },
          { "event": "No year event" }
        ]
      };
      const result = formatHistoryResponse(input);
      expect(result).toContain('### Năm 1226');
      expect(result).toContain('- Clean event');
      expect(result).toContain('### Sự kiện khác');
      expect(result).toContain('- No year event');
    });

    it('should handle no_data correctly', () => {
      const input = { no_data: true };
      const result = formatHistoryResponse(input);
      expect(result).toBe("Xin lỗi, tôi không tìm thấy thông tin lịch sử phù hợp với yêu cầu của bạn.");
    });

    it('should deduplicate very similar events in the same year', () => {
      const input = {
        "events": [
          { "story": "Năm 1400, Hồ Quý Ly lập nhà Hồ diễn ra năm 1400. . Hồ Quý Ly cải cách mạnh, đổi quốc hiệu Đại Ngu.", "year": 1400 },
          { "story": "Năm 1400, Hồ Quý Ly lập nhà Hồ (1400). Hồ Quý Ly cải cách mạnh, đổi quốc hiệu Đại Ngu.", "year": 1400 }
        ]
      };
      const result = formatHistoryResponse(input);
      const lines = result.split('\n');
      const bulletPoints = lines.filter(l => l.startsWith('- '));
      expect(bulletPoints.length).toBe(1);
    });

    it('should handle the documents format', () => {
      const data = {
        "documents": [
          { "year": 1225, "event": "Nhà Trần thành lập (1225).", "story": "Nhà Trần thành lập (1225)." },
          { "year": 1225, "event": "B1. gắn mốc 1225...", "story": "B1. gắn mốc 1225..." }
        ]
      };
      const result = formatHistoryResponse(data);
      expect(result).toContain('### Năm 1225');
      expect(result).toContain('Nhà Trần thành lập');
      expect(result).not.toContain('B1.');
    });
  });
});
