export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // Settings Modal
    settings: {
      title: 'Cài đặt',
      theme: 'Giao diện',
      language: 'Ngôn ngữ',
      light: 'Sáng',
      dark: 'Tối',
      lightDesc: 'Giao diện sáng mặc định',
      darkDesc: 'Giao diện tối dễ nhìn ban đêm',
      version: 'Phiên bản',
    },
    // Sidebar
    sidebar: {
      newChat: 'Cuộc trò chuyện mới',
      history: 'Lịch sử trò chuyện',
      assistant: 'Trợ lý lịch sử Việt Nam',
      today: 'Hôm nay',
      yesterday: 'Hôm qua',
      daysAgo: 'ngày trước',
    },
    // Chat
    chat: {
      placeholder: 'Hãy hỏi về lịch sử Việt Nam...',
      send: 'Gửi',
      reset: 'Làm mới',
      you: 'Bạn',
      ai: 'Sử Việt AI',
    },
    // Welcome Screen
    welcome: {
      badge: 'Trợ lý AI Lịch sử',
      title1: 'Khám Phá',
      title2: 'Lịch Sử',
      subtitle: 'Tìm hiểu',
      highlight: 'bốn nghìn năm văn hiến',
      subtitleEnd: 'qua cuộc trò chuyện thú vị',
      hint: 'Hoặc nhập câu hỏi của bạn phía dưới',
    },
    // Suggestions
    suggestions: {
      tran: {
        title: 'Triều đại Trần',
        question: 'Hãy kể cho tôi về triều đại nhà Trần và những chiến công chống quân Nguyên Mông',
      },
      trungSisters: {
        title: 'Hai Bà Trưng',
        question: 'Ai là Hai Bà Trưng và cuộc khởi nghĩa của họ có ý nghĩa như thế nào?',
      },
      vanMieu: {
        title: 'Văn Miếu',
        question: 'Văn Miếu - Quốc Tử Giám có lịch sử và ý nghĩa như thế nào trong nền giáo dục Việt Nam?',
      },
      daiViet: {
        title: 'Đại Việt',
        question: 'Đại Việt đã được thành lập như thế nào và phát triển qua các thời kỳ ra sao?',
      },
    },
    // Header
    header: {
      title: 'Sử Việt',
      subtitle: 'Trợ lý lịch sử thông minh',
    },
    // Demo sessions
    demo: {
      session1: 'Triều đại nhà Lý',
      session1Preview: 'Nhà Lý được thành lập năm...',
      session2: 'Trận Bạch Đằng',
      session2Preview: 'Trận Bạch Đằng năm 938...',
      session3: 'Vua Quang Trung',
      session3Preview: 'Quang Trung tên thật là...',
    },
  },
  en: {
    // Settings Modal
    settings: {
      title: 'Settings',
      theme: 'Appearance',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      lightDesc: 'Default light theme',
      darkDesc: 'Dark theme for night viewing',
      version: 'Version',
    },
    // Sidebar
    sidebar: {
      newChat: 'New conversation',
      history: 'Chat history',
      assistant: 'Vietnamese History Assistant',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: 'days ago',
    },
    // Chat
    chat: {
      placeholder: 'Ask about Vietnamese history...',
      send: 'Send',
      reset: 'Reset',
      you: 'You',
      ai: 'Sử Việt AI',
    },
    // Welcome Screen
    welcome: {
      badge: 'AI History Assistant',
      title1: 'Discover',
      title2: 'History',
      subtitle: 'Explore',
      highlight: 'four thousand years of heritage',
      subtitleEnd: 'through engaging conversations',
      hint: 'Or type your question below',
    },
    // Suggestions
    suggestions: {
      tran: {
        title: 'Trần Dynasty',
        question: 'Tell me about the Trần Dynasty and their victories against the Mongol invasions',
      },
      trungSisters: {
        title: 'Trưng Sisters',
        question: 'Who were the Trưng Sisters and what was the significance of their uprising?',
      },
      vanMieu: {
        title: 'Temple of Literature',
        question: 'What is the history and significance of the Temple of Literature in Vietnamese education?',
      },
      daiViet: {
        title: 'Đại Việt',
        question: 'How was Đại Việt established and how did it develop through the ages?',
      },
    },
    // Header
    header: {
      title: 'Sử Việt',
      subtitle: 'Smart history assistant',
    },
    // Demo sessions
    demo: {
      session1: 'Lý Dynasty',
      session1Preview: 'The Lý Dynasty was established...',
      session2: 'Battle of Bạch Đằng',
      session2Preview: 'The Battle of Bạch Đằng in 938...',
      session3: 'Emperor Quang Trung',
      session3Preview: 'Quang Trung\'s real name was...',
    },
  },
} as const;

export function getTranslation(language: Language) {
  return translations[language];
}

// Use a generic type that allows for both languages
export type Translations = {
  settings: {
    title: string;
    theme: string;
    language: string;
    light: string;
    dark: string;
    lightDesc: string;
    darkDesc: string;
    version: string;
  };
  sidebar: {
    newChat: string;
    history: string;
    assistant: string;
    today: string;
    yesterday: string;
    daysAgo: string;
  };
  chat: {
    placeholder: string;
    send: string;
    reset: string;
    you: string;
    ai: string;
  };
  welcome: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    highlight: string;
    subtitleEnd: string;
    hint: string;
  };
  suggestions: {
    tran: { title: string; question: string };
    trungSisters: { title: string; question: string };
    vanMieu: { title: string; question: string };
    daiViet: { title: string; question: string };
  };
  header: {
    title: string;
    subtitle: string;
  };
  demo: {
    session1: string;
    session1Preview: string;
    session2: string;
    session2Preview: string;
    session3: string;
    session3Preview: string;
  };
};
