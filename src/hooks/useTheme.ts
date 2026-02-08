import { useState, useEffect } from 'react';
import { Translation, getTranslation, Language } from '@/lib/i18n';
import trongDongLight from '@/assets/trong-dong.png';
import trongDongDark from '@/assets/trong_dong_2.png';

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

/* =========================
   FAVICON HANDLER
========================= */
function setFavicon(theme: Theme) {
  const link = document.getElementById('favicon') as HTMLLinkElement | null;
  if (!link) return;

  const faviconUrl = theme === 'dark' ? trongDongDark : trongDongLight;
  link.href = `${faviconUrl}?v=${Date.now()}`;
}

/* =========================
   HOOK
========================= */
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

  /* =========================
     APPLY THEME + FAVICON
  ========================= */
  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 🔥 đổi favicon đồng bộ theme
    setFavicon(settings.theme);
  }, [settings.theme]);

  /* =========================
     PERSIST SETTINGS
  ========================= */
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  /* =========================
     ACTIONS
  ========================= */
  /* =========================
     ACTIONS
  ========================= */
  const setTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const setLanguage = (language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  };

  return {
    theme: settings.theme,
    language: settings.language,
    setTheme,
    setLanguage,
    toggleTheme,
  };
}

/* =========================
   INIT THEME (NO FLASH)
========================= */
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      const settings: Settings = JSON.parse(saved);

      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }

      // 🔥 set favicon ngay từ đầu
      setFavicon(settings.theme);
    } catch {
      // ignore
    }
  }
}
