import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatSidebar } from './ChatSidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  onNewChat?: () => void;
}

export function MainLayout({ children, onNewChat }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewChat = () => {
    onNewChat?.();
    // On mobile, close sidebar after action
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />
      
      <motion.div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-[260px]" : "ml-0"
        )}
        layout
      >
        {children}
      </motion.div>
    </div>
  );
}
