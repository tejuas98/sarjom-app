import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TabletSimulatorBar } from './components/TabletSimulatorBar';
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
  const initialDevice = (urlParams && urlParams.get('device')) || 'full';

  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [isOffline, setIsOffline] = useState(initialOffline);
  const [uiLang, setUiLang] = useState(() => {
    if (urlParams && urlParams.get('ui')) {
      return urlParams.get('ui') === 'en' ? 'en' : 'hi';
    }
    return offlineStorage.getUILanguage() || 'hi';
  });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [deviceMode, setDeviceMode] = useState(initialDevice); // 'full' | 'ios' | 'android'
  const [showDevBar, setShowDevBar] = useState(urlParams && urlParams.get('dev') === 'true');
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

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    offlineStorage.setOfflineMode(nextState);
    if (nextState) {
      toast.warning(uiLang === 'en' ? 'Offline Mode Active: Seamless operation without internet' : 'ऑफलाइन मोड सक्रिय: विद्यालय में बिना इंटरनेट सुचारु संचालन');
    } else {
      toast.info(uiLang === 'en' ? 'Online Mode Active: Cloud synchronization enabled' : 'ऑनलाइन मोड सक्रिय: केंद्रीय सर्वर से नया पाठ्यक्रम सिंक हो सकता है');
    }
  };

  const isIOS = deviceMode === 'ios';
  const isAndroid = deviceMode === 'android';
  const isFramed = isIOS || isAndroid;

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: isFramed
          ? isIOS
            ? 'radial-gradient(ellipse at 50% 12%, #1F2430 0%, #11141C 55%, #080A0E 100%)'
            : 'radial-gradient(ellipse at 50% 15%, #1A2230 0%, #0F141C 60%, #080B10 100%)'
          : 'var(--color-bg)',
        padding: isFramed ? '20px 12px 40px 12px' : '0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Tablet Device Bezel Container (Apple iPad Pro 11" vs Android Go 10.1") */}
      <div
        style={{
          width: '100%',
          maxWidth: isFramed ? (isIOS ? '1180px' : '1220px') : '100%',
          backgroundColor: 'var(--color-bg)',
          borderRadius: isFramed ? (isIOS ? '38px' : '26px') : '0',
          border: isFramed
            ? isIOS
              ? '13px solid #1C1E23'
              : '10px solid #1E293B'
            : 'none',
          boxShadow: isFramed
            ? isIOS
              ? '0 32px 90px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.12)'
              : '0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 60px rgba(14, 91, 55, 0.12), 0 0 90px rgba(217, 90, 39, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            : 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: isFramed ? '880px' : '100dvh',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Apple iPad Top Bezel FaceTime Camera Dot & Sensor */}
        {isFramed && (
          <div
            style={{
              position: 'absolute',
              top: isIOS ? '4px' : '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: isIOS ? '8px' : '8px',
                height: isIOS ? '8px' : '8px',
                borderRadius: '50%',
                backgroundColor: '#090B0F',
                border: '1px solid #333D4F',
                boxShadow: 'inset 0 0 2px rgba(0,255,200,0.2)',
              }}
            />
            {isIOS && (
              <div
                style={{
                  width: '3.5px',
                  height: '3.5px',
                  borderRadius: '50%',
                  backgroundColor: '#161F2E',
                }}
              />
            )}
          </div>
        )}

        {/* Apple iOS Status Bar (Visible in iOS mode) */}
        {isIOS && (
          <div
            style={{
              height: '24px',
              backgroundColor: '#111815',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 20px',
              fontSize: '0.72rem',
              color: '#F1F5F9',
              fontWeight: 600,
              letterSpacing: '0.01em',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>9:41 AM</span>
              <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>iPad • Gumla DIET</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.68rem', color: '#70C28A' }}>5G Govt Edu</span>
              {/* iOS Battery Capsule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '11px',
                    borderRadius: '3px',
                    border: '1px solid #F1F5F9',
                    padding: '1px',
                    display: 'flex',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#22C55E',
                      borderRadius: '1.5px',
                    }}
                  />
                </div>
                <div
                  style={{
                    width: '1.5px',
                    height: '4px',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '0 1px 1px 0',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Diagnostic Simulator Bar (Toggleable from footer) */}
        {showDevBar && (
          <TabletSimulatorBar
            isOffline={isOffline}
            toggleOffline={handleToggleOffline}
            selectedLang={selectedLang}
            onSelectLang={handleSelectLang}
            isTabletFrame={isFramed}
            deviceMode={deviceMode}
            onChangeDeviceMode={setDeviceMode}
          />
        )}

        {/* 2. Top Header & Navigation Bar (Dynamic SARJOM title, 4 Core Tabs) */}
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

        {/* 3. Main Tablet Canvas: Strictly the 4 Core Deliverables */}
        <main className="tablet-canvas" style={{ flex: 1, width: '100%', padding: '24px' }}>
          {activeTab === 'voice' && <VoiceTranslator selectedLang={selectedLang} uiLang={uiLang} />}
          {activeTab === 'worksheets' && <WorksheetStudio selectedLang={selectedLang} uiLang={uiLang} />}
          {activeTab === 'flashcards' && <FlashcardDeck selectedLang={selectedLang} uiLang={uiLang} />}
          {activeTab === 'dictionary' && <DictionarySearch uiLang={uiLang} />}
        </main>

        {/* 4. Official Footer */}
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
              <button
                onClick={() => setShowDevBar((prev) => !prev)}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.74rem',
                  color: 'var(--color-slate-muted)',
                  cursor: 'pointer',
                }}
                title={uiLang === 'en' ? 'Toggle Simulator Diagnostics Bar' : 'हार्डवेयर और UDISE सिमुलेटर बार खोलें'}
              >
                {showDevBar
                  ? (UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi).footerDevBarHide
                  : (UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi).footerDevBarToggle}
              </button>
            </div>
          </div>
        </footer>

        {/* Apple iPad Home Indicator Bar */}
        {isIOS && (
          <div
            style={{
              padding: '8px 0 10px 0',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'var(--color-bg)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: '136px',
                height: '5px',
                borderRadius: '100px',
                backgroundColor: '#94A3B8',
                opacity: 0.75,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
