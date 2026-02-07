import { motion } from 'framer-motion';
import { BookOpen, Crown, Swords, Landmark, Sparkles } from 'lucide-react';
import { useThemeContext } from '@/contexts/ThemeContext';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const { t } = useThemeContext();
  
  const suggestions = [
    {
      icon: Crown,
      title: t.suggestions.tran.title,
      question: t.suggestions.tran.question,
    },
    {
      icon: Swords,
      title: t.suggestions.trungSisters.title,
      question: t.suggestions.trungSisters.question,
    },
    {
      icon: BookOpen,
      title: t.suggestions.vanMieu.title,
      question: t.suggestions.vanMieu.question,
    },
    {
      icon: Landmark,
      title: t.suggestions.daiViet.title,
      question: t.suggestions.daiViet.question,
    },
  ];

  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[65vh] px-6 py-8 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section - more compact */}
      <motion.div 
        className="text-center mb-8 relative z-10"
        variants={itemVariants}
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
          whileHover={{ scale: 1.02 }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">{t.welcome.badge}</span>
        </motion.div>

        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          <span className="text-gradient-gold">{t.welcome.title1}</span>
          {' '}
          <span className="text-foreground">{t.welcome.title2}</span>
        </h2>
        
        <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
          {t.welcome.subtitle} <span className="font-display font-semibold text-gradient-gold drop-shadow-sm">{t.welcome.highlight}</span> {t.welcome.subtitleEnd}
        </p>
      </motion.div>

      {/* Decorative divider */}
      <motion.div 
        className="decorative-line w-32 mb-8"
        variants={itemVariants}
      />

      {/* Suggestion Cards - refined design */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full relative z-10"
        variants={containerVariants}
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.01, 
              y: -2,
              transition: { type: 'spring', stiffness: 400 }
            }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSuggestionClick(suggestion.question)}
            className="group relative p-4 rounded-xl bg-card/60 border border-border/40 text-left transition-all duration-300 hover:border-primary/40 hover:bg-card/90 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-secondary/20 to-[hsl(45_55%_60%)/15] border border-secondary/30 flex items-center justify-center group-hover:from-secondary/30 group-hover:to-[hsl(45_55%_60%)/25] group-hover:border-secondary/50 transition-all duration-300">
                <suggestion.icon className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm text-foreground mb-0.5 group-hover:text-secondary transition-colors duration-300">
                  {suggestion.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {suggestion.question}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom hint */}
      <motion.p 
        className="text-center text-xs text-secondary/50 mt-8 relative z-10"
        variants={itemVariants}
      >
        {t.welcome.hint}
      </motion.p>
    </motion.div>
  );
}
