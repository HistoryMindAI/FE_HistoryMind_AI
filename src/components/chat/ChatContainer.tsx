import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChatStream } from '@/hooks/useChatStream';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { HeritageBackground } from '../decorative/HeritageBackground';
import { toast } from 'sonner';

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChatStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-100 flex flex-col">
      {/* Main content area - centered */}
      <main className="flex-1 flex items-start justify-center px-4 py-5 md:px-6 md:py-6">
        {/* Central chat container with elegant card design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-3xl relative"
        >
          {/* Outer glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 rounded-2xl blur-lg opacity-70" />
          
          {/* Main card */}
          <div 
            className="relative bg-background/98 rounded-2xl shadow-xl shadow-stone-900/5 border border-border/40 overflow-hidden flex flex-col"
            style={{ minHeight: 'calc(100vh - 80px)', maxHeight: 'calc(100vh - 80px)' }}
          >
            {/* Header inside the card */}
            <div className="border-b border-border/30 bg-background/80">
              <ChatHeader 
                onReset={clearMessages} 
                showReset={messages.length > 0} 
              />
            </div>

            {/* Heritage decorative background */}
            <HeritageBackground />

            {/* Subtle corner accents */}
            <div className="absolute top-16 left-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none z-[1]" />
            <div className="absolute top-16 right-0 w-20 h-20 bg-gradient-to-bl from-secondary/5 to-transparent pointer-events-none z-[1]" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/3 to-transparent pointer-events-none z-[1]" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-secondary/3 to-transparent pointer-events-none z-[1]" />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
              {messages.length === 0 ? (
                <WelcomeScreen onSuggestionClick={handleSend} />
              ) : (
                <motion.div 
                  className="max-w-3xl mx-auto px-6 py-6 space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </div>

            {/* Input Area with refined styling */}
            <div className="relative z-10 border-t border-border/20 bg-gradient-to-t from-card via-background/95 to-transparent backdrop-blur-sm">
              <div className="max-w-3xl mx-auto px-6 py-4">
                <ChatInput onSend={handleSend} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
