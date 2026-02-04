import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Hỏi về lịch sử Việt Nam...' }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div 
        className={`
          relative flex items-end gap-3 p-4
          glass border rounded-2xl
          transition-all duration-300
          ${isFocused 
            ? 'border-primary/40 shadow-lg shadow-primary/10' 
            : 'border-border/40 shadow-md shadow-black/5'
          }
        `}
        animate={{
          borderColor: isFocused ? 'hsl(15 45% 35% / 0.4)' : 'hsl(30 15% 85% / 0.4)',
        }}
      >
        {/* Glow effect when focused */}
        <motion.div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            className="
              min-h-[44px] max-h-[160px] resize-none 
              border-0 bg-transparent 
              focus-visible:ring-0 focus-visible:ring-offset-0
              placeholder:text-muted-foreground/50 
              text-sm font-body leading-relaxed
              py-2.5
            "
            rows={1}
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="
              relative flex-shrink-0 h-10 w-10 rounded-xl
              bg-gradient-to-br from-primary via-primary to-accent
              hover:opacity-90 
              disabled:opacity-40
              transition-all duration-200
              shadow-lg shadow-primary/25
              overflow-hidden
            "
          >
            {/* Button glow */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            />
            
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
            ) : (
              <Send className="w-4 h-4 relative z-10" />
            )}
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="flex items-center justify-center gap-2 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Sparkles className="w-3 h-3 text-secondary/60" />
        <p className="text-xs text-muted-foreground/60">
          Nhấn <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono">Enter</kbd> để gửi 
          • <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-mono">Shift + Enter</kbd> xuống dòng
        </p>
      </motion.div>
    </motion.div>
  );
}
