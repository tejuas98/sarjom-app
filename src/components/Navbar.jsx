import React, { useState, useEffect } from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { Globe, BookOpen, Sun, Moon, Maximize, Minimize } from 'lucide-react';

export function Navbar({
  selectedLang,
  onSelectLang,
  isOffline,
  uiLang = 'hi',
  onToggleUILang,
  theme = 'light',
  onToggleTheme,
  activeTab,
  onSelectTab,
}) {
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const isEn = uiLang === 'en';

  const brandTitle = t.brandTitle || t.appTitle || (isEn ? 'SARJOM (सरजोम)' : 'सरजोम (SARJOM)');
  const brandTagline = t.brandTagline || t.appSubtitle || (isEn ? 'Jharkhand Primary MTB-MLE Pedagogic Bridge' : 'झारखंड प्राथमिक मातृभाषा सेतु • MTB-MLE');

  // Strictly the 4 core deliverables defined in SIH Problem Statement 26042
  const CORE_TABS = [
    { id: 'voice', label: t.tabVoice },
    { id: 'worksheets', label: t.tabWorksheets },
    { id: 'flashcards', label: t.tabFlashcards },
    { id: 'dictionary', label: t.tabDictionary },
  ];

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen request:', e);
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Top Header: Brand + 4 Tribal Languages + UI Lang Toggle + Dark Mode */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand Title (Dynamic for English vs Hindi) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 'fit-content' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, var(--color-slate) 0%, var(--color-palash) 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              flexShrink: 0,
            }}
          >
            <BookOpen size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.30rem', fontWeight: 800, color: 'var(--color-slate)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {brandTitle}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: isOffline ? '#DCFCE7' : '#EFF6FF',
                  color: isOffline ? '#166534' : '#1E40AF',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isOffline ? '#16A34A' : '#2563EB',
                    display: 'inline-block',
                  }}
                />
                {isOffline ? (t.offlineStatus || 'Offline') : (t.onlineStatus || 'Online')}
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--color-slate-muted)', margin: 0, whiteSpace: 'nowrap' }}>
              {brandTagline}
            </p>
          </div>
        </div>

        {/* Center: The 4 Tribal Language Buttons with Context Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-tint)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px 4px',
            gap: '2px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 8px 0 6px',
              color: 'var(--color-slate-muted)',
              fontSize: '0.74rem',
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            <Globe size={13} color="var(--color-palash)" />
            <span>{isEn ? 'Classroom Language:' : 'कक्षा भाषा:'}</span>
          </div>

          {Object.values(TRIBAL_LANGUAGES).map((lang) => {
            const isActive = selectedLang === lang.id;
            const displayName = isEn
              ? (lang.id === 'ho' ? 'Ho' : lang.id === 'mundari' ? 'Mundari' : lang.id === 'santhali' ? 'Santali' : 'Sadri')
              : (lang.id === 'ho' ? 'हो' : lang.id === 'mundari' ? 'मुंडारी' : lang.id === 'santhali' ? 'संताली' : 'सादरी');

            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLang(lang.id)}
                style={{
                  padding: '5px 13px',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 8px rgba(14, 91, 55, 0.25)' : 'none',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
                title={lang.region}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {/* Right: UI Language Toggle (English / Hindi) & Theme Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* UI Language Switcher (English vs Hindi) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px',
              border: '1px solid var(--color-border)',
            }}
            title={isEn ? 'Switch Language (English / Hindi)' : 'भाषा बदलें (English / हिन्दी)'}
          >
            <div style={{ padding: '0 6px 0 8px', color: 'var(--color-slate-muted)', display: 'flex', alignItems: 'center' }}>
              <Globe size={13} />
            </div>
            <button
              type="button"
              onClick={() => onToggleUILang('hi')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: uiLang === 'hi' ? 'var(--color-palash)' : 'transparent',
                color: uiLang === 'hi' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: uiLang === 'hi' ? 700 : 500,
                fontSize: '0.80rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => onToggleUILang('en')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: uiLang === 'en' ? 'var(--color-palash)' : 'transparent',
                color: uiLang === 'en' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: uiLang === 'en' ? 700 : 500,
                fontSize: '0.80rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              English
            </button>
          </div>

          {/* Theme Mode Toggle (Dark / Light) */}
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-card)',
              color: 'var(--color-slate)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
            }}
            title={theme === 'dark' ? (isEn ? 'Switch to Light Mode' : 'लाइट मोड सक्रिय करें') : (isEn ? 'Switch to Dark Mode' : 'डार्क मोड सक्रिय करें')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} color="var(--color-palash)" /> : <Moon size={16} />}
          </button>

          {/* Native Fullscreen Borderless Mode Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-card)',
              color: isFullscreen ? 'var(--color-palash)' : 'var(--color-slate)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
            }}
            title={isFullscreen ? (isEn ? 'Exit Fullscreen' : 'फुलस्क्रीन से बाहर निकलें') : (isEn ? 'Enter Native Fullscreen (Borderless Tablet)' : 'नेटिव फुलस्क्रीन मोड (Borderless Tablet)')}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Strictly the 4 Core Tabs spanning the FULL ROW */}
      <nav
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 10px 24px',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {CORE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: isActive ? '1.5px solid var(--color-palash)' : '1px solid var(--color-border)',
                borderRadius: '12px',
                backgroundColor: isActive ? 'var(--color-surface-card)' : 'transparent',
                color: isActive ? 'var(--color-palash)' : 'var(--color-slate)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.90rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 10px rgba(217, 90, 39, 0.15)' : 'none',
                transition: 'all 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
