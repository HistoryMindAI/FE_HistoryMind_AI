import { useState, useCallback } from 'react';
import { formatHistoryResponse } from '@/lib/format-response';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// IMPORTANT: Leave VITE_API_URL empty in your .env file to use the Vite development proxy.
// The proxy is configured in vite.config.ts and will forward /api requests to http://localhost:8080.
// If you set VITE_API_URL to http://localhost:8080, you will likely encounter CORS errors
// unless you explicitly enable CORS in your Spring Boot backend.
const CHAT_URL = `${import.meta.env.VITE_API_URL || ''}/api/v1/chat/ask`;

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
    // Identity Check (Client-side optimization)
    if (input.match(/(who are you|bạn là ai|giới thiệu|what is your name|tên bạn là gì)/i)) {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: input,
      };
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Xin chào, tôi là History Mind AI. Tôi ở đây để giúp bạn tìm hiểu về lịch sử Việt Nam và thế giới. Bạn có câu hỏi nào không?",
      };
      setMessages(prev => [...prev, userMessage, assistantMessage]);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    let assistantContent = '';
    const assistantId = crypto.randomUUID();

    try {
      // Prepare payload with system instructions
      const messagesPayload = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Inject system instruction into the last message to guide the backend LLM
      if (messagesPayload.length > 0) {
        const isRangeQuery = /(?:từ|năm)\s+(\d{3,4})\s+(?:đến|tới|-)\s+(?:năm\s+)?(\d{3,4})/i.test(input) || /(?:from)\s+(\d{3,4})\s+(?:to|-)\s+(\d{3,4})/i.test(input);

        let systemInstruction = `\n\n[SYSTEM INSTRUCTION: You are History Mind AI.
If the user asks who you are, introduce yourself as History Mind AI.
If the user asks for events between two years (e.g., 1945-2000), you MUST list events for EVERY year in that range, not just the start year.
If you cannot find information for the specific question asked, return {"no_data": true}.
Do NOT repeat the previous answer if it is not relevant to the new question.`;

        if (isRangeQuery) {
          systemInstruction += " The user is asking for a range. Retrieve and list events for ALL years in this range.";
        }

        systemInstruction += "]";

        messagesPayload[messagesPayload.length - 1].content += systemInstruction;
      }

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization headers can be added here if needed
        },
        body: JSON.stringify({
          question: input,
          messages: messagesPayload,
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
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: assistantContent }]);
      } else {
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = '';

        // Add initial assistant message
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

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
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }
            } catch {
              textBuffer = line + '\n' + textBuffer;
              break;
            }
          }
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
  }, [messages]);

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
