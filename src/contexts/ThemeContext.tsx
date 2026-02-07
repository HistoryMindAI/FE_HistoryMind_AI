import { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { getTranslation, Translations } from '@/lib/i18n';

type Theme = 'light' | 'dark';
type Language = 'vi' | 'en';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeState = useTheme();
  const t = getTranslation(themeState.language);

  return (
    <ThemeContext.Provider value={{ ...themeState, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
