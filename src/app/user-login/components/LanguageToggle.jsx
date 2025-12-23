'use client';

import { useState, useEffect } from 'react';


export default function LanguageToggle() {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('blinno_language');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' }
  ];

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    try {
      localStorage.setItem('blinno_language', langCode);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const currentLang = languages?.find(lang => lang?.code === currentLanguage) || languages?.[0];

  return (
    <div className="flex items-center space-x-2 bg-muted/50 rounded-lg p-1">
      {languages?.map((lang) => (
        <button
          key={lang?.code}
          onClick={() => handleLanguageChange(lang?.code)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            currentLanguage === lang?.code
              ? 'bg-primary text-primary-foreground shadow-card'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <span className="text-lg">{lang?.flag}</span>
          <span className="hidden sm:inline">{lang?.name}</span>
          <span className="sm:hidden">{lang?.code?.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}