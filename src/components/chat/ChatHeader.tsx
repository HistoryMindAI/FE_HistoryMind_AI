import { motion } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

export function ChatHeader({ onReset, showReset = false }: ChatHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <span className="font-display text-lg font-bold text-primary-foreground">S</span>
            </div>
          </motion.div>
          
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">
              Sử Việt
            </h1>
            <p className="text-[11px] text-muted-foreground/70 font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-secondary" />
              Trợ lý lịch sử AI
            </p>
          </div>
        </div>

        {showReset && onReset && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg px-3 h-8 gap-1.5 text-xs transition-all duration-300"
            >
              <RotateCcw className="w-3 h-3" />
              Mới
            </Button>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
