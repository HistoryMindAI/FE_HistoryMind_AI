import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Feather } from 'lucide-react';
import type { Message } from '@/hooks/useChatStream';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 15,
          delay: 0.1 
        }}
        className={`
          flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg
          ${isUser 
            ? 'bg-gradient-to-br from-primary via-primary to-accent glow-primary' 
            : 'bg-gradient-to-br from-secondary/90 to-gold/80 glow-gold'
          }
        `}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground drop-shadow-sm" />
        ) : (
          <Feather className="w-4 h-4 text-secondary-foreground drop-shadow-sm" />
        )}
      </motion.div>

      {/* Message Bubble */}
      <motion.div
        initial={{ opacity: 0, x: isUser ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className={`
          max-w-[85%] px-5 py-4
          ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
        `}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose-vietnamese text-sm">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground py-1">
                <motion.span 
                  className="w-2 h-2 rounded-full bg-primary/60"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.span 
                  className="w-2 h-2 rounded-full bg-secondary/60"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span 
                  className="w-2 h-2 rounded-full bg-gold/60"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
