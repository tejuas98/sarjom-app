import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceTranslator } from './components/VoiceTranslator';
import { WorksheetStudio } from './components/WorksheetStudio';
import { FlashcardDeck } from './components/FlashcardDeck';
import { DictionarySearch } from './components/DictionarySearch';
import { offlineStorage } from './services/offlineStorage';
import { UI_TRANSLATIONS } from './data/uiTranslations';
import { toast } from 'sonner';

export default function App() {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialLang = (urlParams && urlParams.get('lang')) || offlineStorage.getSelectedLanguage() || 'sadri';
  const initialOffline = urlParams && urlParams.has('offline') ? urlParams.get('offline') === 'true' : true;
  const initialTab = (urlParams && urlParams.get('tab')) || 'voice';

  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [isOffline, setIsOffline] = useState(initialOffline);
  const [uiLang, setUiLang] = useState(() => {
    if (urlParams && urlParams.get('ui')) {
      return urlParams.get('ui') === 'en' ? 'en' : 'hi';
    }
    return offlineStorage.getUILanguage() || 'hi';
  });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = urlParams && urlParams.get('theme');
      if (p) return p === 'dark' ? 'dark' : 'light';
      const saved = localStorage.getItem('sarjom_theme');
      if (saved) return saved;
      return 'dark'; // Clean, authentic dark mode default
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sarjom_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    toast.info(nextTheme === 'dark' ? (uiLang === 'en' ? 'Dark Mode Active' : 'डार्क मोड सक्रिय (Dark Mode)') : (uiLang === 'en' ? 'Light Mode Active' : 'लाइट मोड सक्रिय (Light Mode)'));
  };

  const handleToggleUILang = (newLang) => {
    const lang = newLang || (uiLang === 'hi' ? 'en' : 'hi');
    setUiLang(lang);
    offlineStorage.setUILanguage(lang);
    toast.success(lang === 'en' ? 'Language switched to English' : 'भाषा बदलकर हिन्दी की गई');
  };

  const handleSelectLang = (langId) => {
    setSelectedLang(langId);
    offlineStorage.setSelectedLanguage(langId);
    toast.success(uiLang === 'en' ? `Active Language: ${langId.toUpperCase()}` : `सक्रिय भाषा बदली गई: ${langId.toUpperCase()}`);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* 1. Top Header & Navigation Bar (Dynamic SARJOM title, 4 Core Tabs, Fullscreen Toggle) */}
      <Navbar
        selectedLang={selectedLang}
        onSelectLang={handleSelectLang}
        isOffline={isOffline}
        uiLang={uiLang}
        onToggleUILang={handleToggleUILang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. Main Tablet Canvas: Strictly the 4 Core Deliverables */}
      <main className="tablet-canvas" style={{ flex: 1, width: '100%', padding: '24px' }}>
        {activeTab === 'voice' && <VoiceTranslator selectedLang={selectedLang} uiLang={uiLang} />}
        {activeTab === 'worksheets' && <WorksheetStudio selectedLang={selectedLang} uiLang={uiLang} />}
        {activeTab === 'flashcards' && <FlashcardDeck selectedLang={selectedLang} uiLang={uiLang} />}
        {activeTab === 'dictionary' && <DictionarySearch uiLang={uiLang} />}
      </main>

      {/* 3. Official Footer */}
      <footer
        className="no-print"
        style={{
          borderTop: 'var(--border-thick)',
          backgroundColor: 'var(--color-surface)',
          padding: '24px 20px',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: 'var(--color-slate-muted)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-slate)', fontSize: '0.95rem' }}>
              {(UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi).footerGovt}
            </div>
            <div>
              {(UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi).footerProject}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge-tag badge-forest">हो (Ho)</span>
            <span className="badge-tag badge-palash">मुण्डारी (Mundari)</span>
            <span className="badge-tag badge-ochre">संताली (Santhali)</span>
            <span className="badge-tag" style={{ backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#38BDF8', borderColor: 'rgba(2, 132, 199, 0.3)' }}>सादरी (Sadri)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
