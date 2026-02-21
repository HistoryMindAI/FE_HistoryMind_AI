import { useState, useCallback } from 'react';
import { formatHistoryResponse } from '@/lib/format-response';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Helper function to ensure URL has a protocol
const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || '';
  // If URL is present and doesn't start with http/https, prepend https://
  if (url && !url.match(/^https?:\/\//)) {
    url = `https://${url}`;
  }
  return url;
};

// IMPORTANT: Set VITE_API_URL in your .env file for production deployment (e.g., https://your-backend.com).
// For local development, you can leave it empty to use the Vite proxy (configured in vite.config.ts),
// which forwards /api requests to http://localhost:8080.
const CHAT_URL = `${getBaseUrl()}/api/v1/chat/ask`;

/**
 * SPRING BOOT CORS CONFIGURATION REFERENCE:
 *
 * If you prefer to connect directly to 8080 (bypassing the proxy),
 * add this annotation to your Controller in Spring Boot:
 *
 * @CrossOrigin(origins = "http://localhost:3000")
 * @RestController
 * @RequestMapping("/api/v1/chat")
 * public class ChatController { ... }
 *
 * Or configure it globally:
 *
 * @Configuration
 * public class WebConfig implements WebMvcConfigurer {
 *     @Override
 *     public void addCorsMappings(CorsRegistry registry) {
 *         registry.addMapping("/api/**")
 *                .allowedOrigins("http://localhost:3000")
 *                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
 *                .allowedHeaders("*")
 *                .allowCredentials(true);
 *     }
 * }
 */

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const sendMessage = useCallback(async (input: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    let assistantContent = '';
    const assistantId = crypto.randomUUID();
    const thinkingMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '', // Empty content triggers thinking dots animation in ChatMessage
    };

    // Add both user message and thinking indicator in a single state update
    // to avoid React batching race conditions
    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send query to backend - all AI logic is handled server-side
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type');

      if (contentType?.includes('application/json')) {
        const data = await response.json();
        assistantContent = formatHistoryResponse(data);
        // Update existing empty message with actual content
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: assistantContent }
              : m
          )
        );
      } else {
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = '';

        // Assistant message already added (with empty content showing thinking dots)

        // Bug #6 Fix: Batch content updates to reduce race conditions
        let updateIntervalId: NodeJS.Timeout | null = null;
        let pendingContent = '';

        const updateMessage = () => {
          if (pendingContent !== assistantContent) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: pendingContent }
                  : m
              )
            );
          }
        };

        // Update UI every 100ms instead of every chunk
        updateIntervalId = setInterval(updateMessage, 100);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
                pendingContent = assistantContent;  // Bug #6 Fix: Update pending content instead of immediate state
              }
            } catch (parseError) {
              // Bug #7 Fix: Log error but continue processing instead of breaking
              console.warn('Failed to parse JSON chunk, skipping:', jsonStr, parseError);
              continue;  // Skip this line and continue with next
            }
          }
        }

        // Bug #6 Fix: Clear interval and do final update
        if (updateIntervalId) {
          clearInterval(updateIntervalId);
        }

        // Final flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split('\n')) {
            if (!raw) continue;
            if (raw.endsWith('\r')) raw = raw.slice(0, -1);
            if (raw.startsWith(':') || raw.trim() === '') continue;
            if (!raw.startsWith('data: ')) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantContent += content;
              }
            } catch { /* ignore */ }
          }
        }

        // Format the final accumulated content if needed
        const finalContent = formatHistoryResponse(assistantContent);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: finalContent }
              : m
          )
        );
      }
    } catch (e) {
      console.error('Chat error:', e);
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
      // Remove empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId || m.content));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
