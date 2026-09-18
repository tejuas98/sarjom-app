import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceTranslator } from './components/VoiceTranslator';
import { WorksheetStudio } from './components/WorksheetStudio';
import { FlashcardDeck } from './components/FlashcardDeck';
import { DictionarySearch } from './components/DictionarySearch';
import { LessonCurriculum } from './components/LessonCurriculum';
import { SlateAndFolklore } from './components/SlateAndFolklore';
import { NeuralModelInspector } from './components/NeuralModelInspector';
import { AcousticPronunciationCoach } from './components/AcousticPronunciationCoach';
import { JuryBenchmarkingMatrix } from './components/JuryBenchmarkingMatrix';
import { TeacherOnboardingWizard } from './components/TeacherOnboardingWizard';
import { TeacherDrawer } from './components/TeacherDrawer';
import { offlineStorage } from './services/offlineStorage';
import { UI_TRANSLATIONS } from './data/uiTranslations';
import { Tablet, Maximize, Minimize } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

export default function App() {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialLang = (urlParams && urlParams.get('lang')) || 'ho'; // Default to Ho (हो - 𑢹𑣉𑣉)
  const initialOffline = urlParams && urlParams.has('offline') ? urlParams.get('offline') === 'true' : true;
  const initialTab = (urlParams && urlParams.get('tab')) || 'voice';

  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [isOffline, setIsOffline] = useState(initialOffline);
  const [uiLang, setUiLang] = useState(() => {
    if (urlParams && urlParams.get('ui')) {
      return urlParams.get('ui') === 'hi' ? 'hi' : 'en';
    }
    return offlineStorage.getUILanguage() || 'hi';
  });
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isWizardOpen, setIsWizardOpen] = useState(() => Boolean(urlParams && urlParams.get('wizard') === 'true'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(() => Boolean(urlParams && urlParams.get('drawer') === 'true'));
  const [isIpadFrame, setIsIpadFrame] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        if (Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) return false;
        if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return false;
      } catch (e) {}
      if (urlParams && (urlParams.get('frame') === 'ipad' || urlParams.get('device') === 'ipad-horizontal' || urlParams.get('device') === 'ipad')) return true;
      if (urlParams && urlParams.get('frame') === 'full') return false;
      if (window.innerWidth < 768) return false;
      const saved = localStorage.getItem('sarjom_ipad_frame');
      if (saved !== null) return saved === 'true';
    }
    return false; // Default to clean native full application window
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = urlParams && urlParams.get('theme');
      if (p) return p === 'dark' ? 'dark' : 'light';
      const saved = localStorage.getItem('sarjom_theme');
      if (saved) return saved;
      return 'light'; // Clean, authentic Parchment Sand light mode default
    }
    return 'light';
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

  const handleToggleIpadFrame = () => {
    const next = !isIpadFrame;
    setIsIpadFrame(next);
    localStorage.setItem('sarjom_ipad_frame', String(next));
    toast.info(next ? 'Apple iPad Landscape Frame Enabled' : 'Native Borderless Screen Enabled');
  };

  const renderAppContent = () => (
    <>
      {/* 1. Top Header & Navigation Bar */}
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
        isIpadFrame={isIpadFrame}
        onToggleIpadFrame={handleToggleIpadFrame}
      />

      {/* 2. Main Tablet Canvas: 4 Core Deliverables + Extended Modules */}
      <main className="tablet-canvas" style={{ flex: 1, width: '100%', padding: isIpadFrame ? '20px' : '24px', boxSizing: 'border-box' }}>
        {activeTab === 'voice' && <VoiceTranslator selectedLang={selectedLang} uiLang={uiLang} />}
        {activeTab === 'worksheets' && <WorksheetStudio selectedLang={selectedLang} uiLang={uiLang} />}
        {activeTab === 'flashcards' && <FlashcardDeck selectedLang={selectedLang} uiLang={uiLang} />}
        {activeTab === 'dictionary' && <DictionarySearch uiLang={uiLang} />}
        {activeTab === 'curriculum' && <LessonCurriculum selectedLang={selectedLang} />}
        {activeTab === 'slate' && <SlateAndFolklore selectedLang={selectedLang} />}
        {activeTab === 'neural' && <NeuralModelInspector selectedLang={selectedLang} />}
        {activeTab === 'orf' && <AcousticPronunciationCoach selectedLang={selectedLang} />}
        {activeTab === 'benchmark' && <JuryBenchmarkingMatrix />}
      </main>

      {/* Teacher Onboarding Wizard Modal */}
      <TeacherOnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        selectedLang={selectedLang}
        onSelectLang={handleSelectLang}
      />

      {/* Teacher Vaul Drawer */}
      <TeacherDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        selectedLang={selectedLang}
        onOpenWizard={() => { setIsDrawerOpen(false); setIsWizardOpen(true); }}
        onOpenAudio={() => {}}
        onOpenTour={() => {}}
        onSelectTab={(tab) => { setActiveTab(tab); setIsDrawerOpen(false); }}
      />

      {/* 3. Official Footer */}
      <footer
        className="no-print"
        style={{
          borderTop: 'var(--border-thick)',
          backgroundColor: 'var(--color-surface)',
          padding: isIpadFrame ? '16px 20px' : '24px 20px',
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
            <div style={{ fontWeight: 700, color: 'var(--color-slate)', fontSize: '0.92rem' }}>
              {(UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi).footerGovt}
            </div>
            <div style={{ fontSize: '0.80rem' }}>
              {(UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi).footerProject}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.80rem', color: 'var(--color-slate-muted)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: selectedLang === 'ho' ? 'var(--color-palash)' : 'inherit', fontWeight: selectedLang === 'ho' ? 700 : 400 }}>हो (Ho)</span>
            <span>•</span>
            <span style={{ color: selectedLang === 'mundari' ? 'var(--color-palash)' : 'inherit', fontWeight: selectedLang === 'mundari' ? 700 : 400 }}>मुण्डारी (Mundari)</span>
            <span>•</span>
            <span style={{ color: selectedLang === 'santhali' ? 'var(--color-palash)' : 'inherit', fontWeight: selectedLang === 'santhali' ? 700 : 400 }}>संताली (Santhali)</span>
            <span>•</span>
            <span style={{ color: selectedLang === 'sadri' ? 'var(--color-palash)' : 'inherit', fontWeight: selectedLang === 'sadri' ? 700 : 400 }}>सादरी (Sadri)</span>
          </div>
        </div>
      </footer>
    </>
  );

  // ── 1. IPAD HORIZONTAL PROTOTYPE MODE ──────────────────────────────────
  if (isIpadFrame) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          width: '100%',
          background: 'radial-gradient(ellipse at 50% 20%, #1E293B 0%, #0F172A 70%, #020617 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px 40px 16px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Top Floating Device HUD */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '1194px',
            marginBottom: '14px',
            padding: '0 4px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#F8FAFC',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Tablet size={14} color="#38BDF8" />
            <span>Apple iPad Pro 11" (Landscape • 1194 × 834)</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            <span style={{ color: '#22C55E', fontSize: '0.72rem' }}>Demo Ready</span>
          </div>

          <button
            type="button"
            onClick={handleToggleIpadFrame}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              color: '#CBD5E1',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            title="Switch to borderless full screen"
          >
            <Maximize size={12} />
            <span>Full Window</span>
          </button>
        </div>

        {/* Apple iPad Pro 11" Landscape Chassis */}
        <div
          className="ipad-horizontal-chassis"
          style={{
            width: '100%',
            maxWidth: '1194px',
            minHeight: '834px',
            borderRadius: '38px',
            border: '14px solid #1C2028',
            boxShadow: '0 32px 90px -20px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          {/* Apple Landscape FaceTime Camera Dot & Ambient Sensor */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 100,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#090D14',
                border: '1px solid #334155',
                boxShadow: 'inset 0 0 2px rgba(56, 189, 248, 0.3)',
              }}
            />
            <div
              style={{
                width: '3.5px',
                height: '3.5px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
              }}
            />
          </div>

          {/* iPadOS Landscape Status Bar */}
          <div
            style={{
              height: '26px',
              backgroundColor: '#0F172A',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 24px',
              fontSize: '0.72rem',
              color: '#F1F5F9',
              fontWeight: 600,
              letterSpacing: '0.01em',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              zIndex: 50,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>9:41 AM</span>
              <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>iPad • West Singhbhum (Jharkhand)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.68rem', color: '#22C55E' }}>5G Govt Edu • 100% Offline</span>
              {/* iOS Battery Capsule */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: '22px', height: '11px', borderRadius: '3px', border: '1px solid #F1F5F9', padding: '1px', display: 'flex' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: '#22C55E', borderRadius: '1.5px' }} />
                </div>
                <div style={{ width: '1.5px', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '0 1px 1px 0' }} />
              </div>
            </div>
          </div>

          {/* Render Full Application inside iPad Chassis */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {renderAppContent()}
          </div>

          {/* Apple iPad Landscape Home Indicator Pill Bar */}
          <div
            style={{
              padding: '8px 0 10px 0',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                width: '140px',
                height: '5px',
                borderRadius: '100px',
                backgroundColor: '#94A3B8',
                opacity: 0.75,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── 2. NATIVE BORDERLESS FULL-WINDOW MODE ──────────────────────────────
  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {renderAppContent()}
    </div>
  );
}
