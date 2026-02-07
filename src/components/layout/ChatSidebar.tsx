import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, ChevronLeft, ChevronRight, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useThemeContext } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  date: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectSession?: (id: string) => void;
  currentSessionId?: string;
}

export function ChatSidebar({ 
  isOpen, 
  onToggle, 
  onNewChat,
  onSelectSession,
  currentSessionId 
}: ChatSidebarProps) {
  const { t } = useThemeContext();

  // Demo data - sau này sẽ lấy từ database
  const demoSessions: ChatSession[] = [
    { id: '1', title: t.demo.session1, preview: t.demo.session1Preview, date: t.sidebar.today },
    { id: '2', title: t.demo.session2, preview: t.demo.session2Preview, date: t.sidebar.yesterday },
    { id: '3', title: t.demo.session3, preview: t.demo.session3Preview, date: `3 ${t.sidebar.daysAgo}` },
  ];

  return (
    <>
      {/* Toggle button - always visible */}
      <motion.button
        onClick={onToggle}
        className={cn(
          "fixed top-4 z-50 p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 shadow-md",
          "hover:bg-card transition-colors duration-200",
          isOpen ? "left-[268px]" : "left-4"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-foreground" />
        )}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[260px] bg-card/95 backdrop-blur-md border-r border-border/50 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="font-display text-sm font-bold text-primary-foreground">S</span>
                </div>
                <span className="font-display font-semibold text-foreground">{t.header.title}</span>
              </div>
              
              <Button 
                onClick={onNewChat}
                className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                {t.sidebar.newChat}
              </Button>
            </div>

            {/* Chat history */}
            <ScrollArea className="flex-1 px-2 py-3">
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t.sidebar.history}
                </p>
                
                {demoSessions.map((session) => (
                  <motion.button
                    key={session.id}
                    onClick={() => onSelectSession?.(session.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors duration-200",
                      "hover:bg-primary/10 group",
                      currentSessionId === session.id && "bg-primary/15 border border-primary/20"
                    )}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {session.preview}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/70">
                          <Clock className="w-3 h-3" />
                          {session.date}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground/60">
                  {t.sidebar.assistant}
                </p>
                <SettingsModal 
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
