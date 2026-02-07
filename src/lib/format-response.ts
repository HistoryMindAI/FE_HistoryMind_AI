export interface HistoricalEvent {
  year: number;
  event: string;
  persons?: string[];
  persons_all?: string[];
  places?: string[];
  nature?: string[];
  tone?: string | string[];
  keywords?: string[];
  story?: string;
  id?: number | null;
}

export interface YearData {
  summary: string;
  events: HistoricalEvent[];
}

export interface HistoryResponse {
  [year: string]: YearData;
}

export function formatHistoryResponse(data: unknown): string {
  if (!data) return '';

  let obj: any = data;

  // If data is a string, try to parse it as JSON first
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        obj = JSON.parse(trimmed);
      } catch (e) {
        // Not valid JSON, keep it as a string
        return data;
      }
    } else {
      return data;
    }
  }

  try {
    // Handle new backend format: { answer: string, events: Array, intent: string, ... }
    // or Search result format: { documents: Array, ... }
    const isNewFormat = obj && typeof obj === 'object' && (Array.isArray(obj.events) || typeof obj.answer === 'string' || obj.no_data === true);
    const isSearchFormat = obj && typeof obj === 'object' && Array.isArray(obj.documents);

    if (isNewFormat || isSearchFormat) {
      if (obj.no_data === true) {
        return "Xin lỗi, tôi không tìm thấy thông tin lịch sử phù hợp với yêu cầu của bạn.";
      }

      const rawEvents = Array.isArray(obj.events) ? obj.events : (Array.isArray(obj.documents) ? obj.documents : []);

      // Filter out redundant/meta events
      const filteredEvents = rawEvents.filter((ev: any) => {
        if (!ev) return false;
        let content = (ev.story || ev.event || '').trim();
        if (!content) return false;

        // Normalize by removing common prefixes before checking
        const normalized = content.replace(/^Năm \d+,\s*/i, '').trim();

        return !normalized.startsWith('B1.') &&
               !normalized.startsWith('B2.') &&
               !normalized.startsWith('B3.') &&
               !normalized.startsWith('Câu hỏi nhắm tới') &&
               !normalized.startsWith('Bối cảnh.') &&
               !normalized.startsWith('Cốt lõi.');
      });

      if (filteredEvents.length > 0) {
        // Group by year and deduplicate by content similarity
        const groups: Record<string, any[]> = {};
        const seenContent = new Set<string>();

        filteredEvents.forEach((ev: any) => {
          const year = ev.year !== undefined && ev.year !== null ? String(ev.year) : 'Khác';
          const rawContent = (ev.story || ev.event || '').trim();

          // Normalized content for similarity check: remove years, punctuation and common prefixes
          const normalized = rawContent
            .replace(/^Năm \d+,\s*/i, '')
            .replace(/\(\d+\)/g, '')
            .replace(/diễn ra năm \d+/g, '')
            .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove all punctuation (Unicode aware)
            .replace(/\s+/g, ' ')
            .trim();

          // Use first 30 characters for similarity grouping within the same year
          const similarityKey = `${year}_${normalized.slice(0, 30)}`;

          if (!seenContent.has(similarityKey)) {
            seenContent.add(similarityKey);
            if (!groups[year]) groups[year] = [];
            groups[year].push(ev);
          }
        });

        let markdown = '';
        const sortedYears = Object.keys(groups).sort((a, b) => {
          if (a === 'Khác') return 1;
          if (b === 'Khác') return -1;
          return Number(a) - Number(b);
        });

        for (const year of sortedYears) {
          if (year !== 'Khác') {
            markdown += `### Năm ${year}\n\n`;
          } else {
            markdown += `### Sự kiện khác\n\n`;
          }

          groups[year].forEach((ev: any) => {
            let content = (ev.story || ev.event || '').trim();
            if (!content) return;

            // Remove "Năm [year], " prefix if it exists to avoid redundancy with the header
            if (year !== 'Khác') {
              content = content.replace(new RegExp(`^Năm ${year},\\s*`, 'i'), '');
            }

            markdown += `- ${content}\n`;
          });
          markdown += '\n';
        }
        return markdown.trim();
      }

      // If no events but has an answer, return the answer
      if (typeof obj.answer === 'string' && obj.answer.trim()) {
        return obj.answer.trim();
      }

      // Fallback for new format with no data
      return "Xin lỗi, tôi không tìm thấy thông tin phù hợp.";
    }

    // Existing logic for old format: { "year": { summary: "...", events: [...] } }
    const historyData = obj as HistoryResponse;
    let markdown = '';
    let hasYearData = false;

    for (const [year, details] of Object.entries(historyData)) {
      if (typeof details !== 'object' || !details || !details.summary) continue;

      hasYearData = true;
      markdown += `### Năm ${year}\n\n`;
      markdown += `**Tóm tắt:** ${details.summary}\n\n`;

      if (details.events && Array.isArray(details.events)) {
        markdown += `**Sự kiện tiêu biểu:**\n\n`;
        details.events.forEach((ev) => {
          markdown += `- **${ev.year}:** ${ev.event}\n`;
          if (ev.persons && ev.persons.length > 0) {
            markdown += `  - *Nhân vật:* ${ev.persons.join(', ')}\n`;
          }
          if (ev.places && ev.places.length > 0) {
            markdown += `  - *Địa danh:* ${ev.places.join(', ')}\n`;
          }
          if (ev.keywords && ev.keywords.length > 0) {
            markdown += `  - *Từ khóa:* ${ev.keywords.join(', ')}\n`;
          }
          markdown += '\n';
        });
      }
      markdown += '---\n\n';
    }

    if (hasYearData) {
      return markdown.trim();
    }

    // Fallback for other object types
    return typeof obj === 'object' ? JSON.stringify(obj, null, 2) : String(obj);
  } catch (error) {
    console.error('Error formatting history response:', error);
    return typeof obj === 'object' ? JSON.stringify(obj, null, 2) : String(obj);
  }
}
