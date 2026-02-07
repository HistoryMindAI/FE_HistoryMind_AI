import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'vi' | 'en';

interface Settings {
  theme: Theme;
  language: Language;
}

const SETTINGS_KEY = 'suviet-settings';

const defaultSettings: Settings = {
  theme: 'light',
  language: 'vi',
};

export function useTheme() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const setTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const setLanguage = (language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  };

  return {
    theme: settings.theme,
    language: settings.language,
    setTheme,
    setLanguage,
  };
}

// Initialize theme immediately to prevent flash
export function initializeTheme() {
  if (typeof window === 'undefined') return;
  
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Ignore parse errors
    }
  }
}
