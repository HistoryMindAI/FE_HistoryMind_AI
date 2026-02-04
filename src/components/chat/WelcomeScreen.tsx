import { motion } from 'framer-motion';
import { BookOpen, Crown, Swords, Landmark, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Crown,
    title: 'Triều đại Trần',
    question: 'Hãy kể cho tôi về triều đại nhà Trần và những chiến công chống quân Nguyên Mông',
  },
  {
    icon: Swords,
    title: 'Hai Bà Trưng',
    question: 'Ai là Hai Bà Trưng và cuộc khởi nghĩa của họ có ý nghĩa như thế nào?',
  },
  {
    icon: BookOpen,
    title: 'Văn Miếu',
    question: 'Văn Miếu - Quốc Tử Giám có lịch sử và ý nghĩa như thế nào trong nền giáo dục Việt Nam?',
  },
  {
    icon: Landmark,
    title: 'Đại Việt',
    question: 'Đại Việt đã được thành lập như thế nào và phát triển qua các thời kỳ ra sao?',
  },
];

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
          <span className="text-xs font-medium text-primary">Trợ lý AI Lịch sử</span>
        </motion.div>

        <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          <span className="text-gradient-gold">Khám Phá</span>
          {' '}
          <span className="text-foreground">Lịch Sử</span>
        </h2>
        
        <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
          Tìm hiểu <span className="text-primary font-medium">bốn nghìn năm văn hiến</span> qua 
          cuộc trò chuyện thú vị
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
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center group-hover:from-primary/25 group-hover:to-secondary/15 transition-all duration-300">
                <suggestion.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm text-foreground mb-0.5 group-hover:text-primary transition-colors duration-300">
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
        className="text-center text-xs text-muted-foreground/50 mt-8 relative z-10"
        variants={itemVariants}
      >
        Hoặc nhập câu hỏi của bạn phía dưới
      </motion.p>
    </motion.div>
  );
}
