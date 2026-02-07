export interface HistoricalEvent {
  year: number;
  event: string;
  persons?: string[];
  persons_all?: string[];
  places?: string[];
  nature?: string[];
  tone?: string[];
  keywords?: string[];
}

export interface YearData {
  summary: string;
  events: HistoricalEvent[];
}

export interface HistoryResponse {
  [year: string]: YearData;
}

export function formatHistoryResponse(data: unknown): string {
  if (typeof data === 'string') return data;

  try {
    const historyData = data as HistoryResponse;
    let markdown = '';

    for (const [year, details] of Object.entries(historyData)) {
      if (typeof details !== 'object' || !details.summary) continue;

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

    return markdown.trim() || JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error formatting history response:', error);
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  }
}
