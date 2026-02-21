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

/**
 * Removes technical prefixes and instructional phrases often found in backend responses.
 */
function cleanTechnicalText(text: string): string {
  if (!text) return '';

  return text
    // Remove "Năm [year], " at the start
    .replace(/^Năm \d+,\s*/gi, '')
    // Remove technical markers globally (B1., B2., B3.) and their common labels
    .replace(/B\d\.\s*(gắn mốc \d+ với |nêu diễn biến trọng tâm – |kết luận – )?/gi, '')
    // Remove internal reasoning/meta phrases
    .replace(/Câu hỏi nhắm tới sự kiện\s*/gi, '')
    .replace(/Bối cảnh\.\s*/gi, '')
    .replace(/Cốt lõi\.\s*/gi, '')
    .replace(/Trả lời sẽ nêu rõ mốc, diễn biến chính và\.\s*/gi, '')
    .replace(/Sẽ tóm lược rõ ràng\.\s*/gi, '')
    // Remove trailing dots that might be left over from mid-sentence cleaning
    .replace(/\.\s+\./g, '.')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes content for similarity checking to prevent duplicates of different formats.
 */
function getNormalizedKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(\d+\)/g, '') // remove years in parens
    .replace(/diễn ra năm \d+/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatHistoryResponse(data: unknown): string {
  if (!data) return '';

  let obj: Record<string, unknown> = data as Record<string, unknown>;

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

      const processedEvents: { year: string, content: string, key: string }[] = [];
      const seenKeys = new Set<string>();

      rawEvents.forEach((ev: Record<string, unknown>) => {
        if (!ev) return;
        const year = ev.year !== undefined && ev.year !== null ? String(ev.year) : 'Khác';
        const rawContent = (ev.story || ev.event || '') as string;
        if (!rawContent) return;

        const cleanedContent = cleanTechnicalText(rawContent);
        if (!cleanedContent || cleanedContent.length < 5) return; // Skip if empty after cleaning

        const normalizedKey = getNormalizedKey(cleanedContent);

        // Bug #3 Fix: Validate normalizedKey is not empty before using
        if (!normalizedKey || normalizedKey.trim().length === 0) {
          return; // Skip events with empty normalized keys
        }

        // Use a combination of year and normalized prefix for deduplication
        // This helps if the same event is reported with slightly different wording
        const dedupeKey = `${year}_${normalizedKey.slice(0, 50)}`;

        if (!seenKeys.has(dedupeKey)) {
          seenKeys.add(dedupeKey);
          processedEvents.push({ year, content: cleanedContent, key: normalizedKey });
        }
      });

      // PRIORITY: If answer has content AND events exist, use answer directly.
      // The backend's format_complete_answer() already includes event details in the answer text.
      // Rendering events array ON TOP of answer would cause duplication.
      if (typeof obj.answer === 'string' && obj.answer.trim() && processedEvents.length > 0) {
        return obj.answer.trim();
      }

      // FALLBACK: If no answer text, render from events array
      if (processedEvents.length > 0) {
        // Group by year
        const groups: Record<string, string[]> = {};
        processedEvents.forEach(ev => {
          if (!groups[ev.year]) groups[ev.year] = [];
          groups[ev.year].push(ev.content);
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

          groups[year].forEach((content) => {
            markdown += `- ${content}\n`;
          });
          markdown += '\n';
        }
        return markdown.trim();
      }

      // If no valid events but has an answer, return the cleaned answer
      if (typeof obj.answer === 'string' && obj.answer.trim()) {
        const cleanedAnswer = cleanTechnicalText(obj.answer);
        return cleanedAnswer || obj.answer.trim();
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
