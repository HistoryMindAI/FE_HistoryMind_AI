import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Globe, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useThemeContext } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark';
type Language = 'vi' | 'en';

interface SettingsModalProps {
  trigger?: React.ReactNode;
}

export function SettingsModal({ trigger }: SettingsModalProps) {
  const { theme, language, setTheme, setLanguage, t } = useThemeContext();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (value: Theme) => {
    setTheme(value);
  };

  const themeOptions = [
    { value: 'light', label: t.settings.light, icon: Sun, description: t.settings.lightDesc },
    { value: 'dark', label: t.settings.dark, icon: Moon, description: t.settings.darkDesc },
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Settings className="w-5 h-5 text-primary" />
            {t.settings.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-secondary" />
              <Label className="text-sm font-medium">{t.settings.theme}</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value as Theme)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                    theme === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {theme === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                  <option.icon className={cn(
                    "w-6 h-6 mb-2",
                    theme === option.value ? "text-primary" : "text-muted-foreground"
                  )} />
                  <p className="font-medium text-sm text-foreground">{option.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{option.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <Separator className="bg-border/30" />

          {/* Language Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-secondary" />
              <Label className="text-sm font-medium">{t.settings.language}</Label>
            </div>
            
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
              className="space-y-2"
            >
              {languageOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                    language === option.value
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/30 hover:border-primary/30"
                  )}
                  onClick={() => setLanguage(option.value as Language)}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="border-primary" />
                  <span className="text-xl">{option.flag}</span>
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer font-medium text-sm"
                  >
                    {option.label}
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>
          </div>

          <Separator className="bg-border/30" />

          {/* Info */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
            <p className="text-xs text-muted-foreground text-center">
              {t.settings.version} 1.0.0 • Sử Việt AI
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
