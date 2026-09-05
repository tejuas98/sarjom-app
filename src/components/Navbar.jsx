import React, { useState, useEffect } from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { Globe, BookOpen, Sun, Moon, Maximize, Minimize, Languages, Mic, FileText, Layers } from 'lucide-react';

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

  const brandTitle = t.brandTitle || t.appTitle || (isEn ? 'SARJOM' : 'सरजोम');
  const brandTagline = t.brandTagline || t.appSubtitle || (isEn ? 'Jharkhand Primary MTB-MLE Pedagogic Bridge' : 'झारखंड प्राथमिक मातृभाषा सेतु • MTB-MLE');

  // Strictly the 4 core deliverables defined in SIH Problem Statement 26042
  const CORE_TABS = [
    { id: 'voice', label: t.tabVoice, mobileLabel: isEn ? 'Voice' : 'संवाद', icon: Mic },
    { id: 'worksheets', label: t.tabWorksheets, mobileLabel: isEn ? 'Worksheets' : 'कार्यपत्रक', icon: FileText },
    { id: 'flashcards', label: t.tabFlashcards, mobileLabel: isEn ? 'Flashcards' : 'फ्लैशकार्ड', icon: Layers },
    { id: 'dictionary', label: t.tabDictionary, mobileLabel: isEn ? 'Dictionary' : 'शब्दकोश', icon: BookOpen },
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
    <>
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
      {/* Top Header: Balanced 3-Column Grid (Left: Brand | Center: Dialect | Right: Controls) */}
      <div
        className="nav-header-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          alignItems: 'center',
          padding: '10px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          gap: '12px',
        }}
      >
        {/* Left Column: Brand Title & Official Subtitle (Anchored to Left) */}
        <div className="nav-brand-col" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifySelf: 'start', minWidth: 0 }}>
          <div
            className="nav-brand-logo"
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, var(--color-slate) 0%, var(--color-palash) 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
              flexShrink: 0,
            }}
          >
            <BookOpen size={19} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="nav-brand-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {brandTitle}
              </span>
              <span
                className="nav-offline-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.70rem',
                  padding: '2px 7px',
                  borderRadius: '4px',
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
            <p className="nav-brand-tagline" style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)', margin: 0, whiteSpace: 'nowrap' }}>
              {brandTagline}
            </p>
          </div>
        </div>

        {/* Center: Sleek Segmented Tribal Dialect Bar (Locked Dead-Center) */}
        <div
          className="nav-dialect-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-tint)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
            justifySelf: 'center',
          }}
        >
          <div
            className="nav-dialect-label"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 8px 0 6px',
              color: 'var(--color-slate-muted)',
              fontSize: '0.76rem',
              fontWeight: 700,
              userSelect: 'none',
              letterSpacing: '0.02em',
            }}
            title={isEn ? 'Active Classroom Tribal Dialect' : 'सक्रिय कक्षा मातृभाषा'}
          >
            <Languages size={14} color="var(--color-palash)" />
            <span>{isEn ? 'Dialect' : 'मातृभाषा'}</span>
          </div>

          <div className="nav-dialect-divider" style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)', margin: '0 2px' }} />

          {Object.values(TRIBAL_LANGUAGES).map((lang) => {
            const isActive = selectedLang === lang.id;
            const displayName = isEn
              ? (lang.id === 'ho' ? 'Ho' : lang.id === 'mundari' ? 'Mundari' : lang.id === 'santhali' ? 'Santhali' : 'Sadri')
              : (lang.id === 'ho' ? 'हो' : lang.id === 'mundari' ? 'मुण्डारी' : lang.id === 'santhali' ? 'संताली' : 'सादरी');

            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLang(lang.id)}
                style={{
                  padding: '5px 12px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: isActive ? 'var(--color-palash)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 4px rgba(217, 90, 39, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
                title={`${lang.name} (${lang.enName}) — ${lang.region}`}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {/* Right: UI Language Toggle (English / Hindi) & Theme Mode (Anchored to Right) */}
        <div className="nav-controls-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'end' }}>
          {/* UI Language Switcher (English vs Hindi) */}
          <div
            className="nav-lang-switcher"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-tint)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--color-border)',
            }}
            title={isEn ? 'Switch Language (English / Hindi)' : 'भाषा बदलें (English / हिन्दी)'}
          >
            <div style={{ padding: '0 5px 0 6px', color: 'var(--color-slate-muted)', display: 'flex', alignItems: 'center' }}>
              <Globe size={13} />
            </div>
            <button
              type="button"
              onClick={() => onToggleUILang('hi')}
              style={{
                padding: '4px 9px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: uiLang === 'hi' ? 'var(--color-palash)' : 'transparent',
                color: uiLang === 'hi' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: uiLang === 'hi' ? 700 : 500,
                fontSize: '0.78rem',
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
                padding: '4px 9px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: uiLang === 'en' ? 'var(--color-palash)' : 'transparent',
                color: uiLang === 'en' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: uiLang === 'en' ? 700 : 500,
                fontSize: '0.78rem',
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
            className="nav-theme-btn"
            onClick={onToggleTheme}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-card)',
              color: 'var(--color-slate)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.15s ease',
            }}
            title={theme === 'dark' ? (isEn ? 'Switch to Light Mode' : 'लाइट मोड सक्रिय करें') : (isEn ? 'Switch to Dark Mode' : 'डार्क मोड सक्रिय करें')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={14} color="var(--color-palash)" /> : <Moon size={14} />}
          </button>

          {/* Native Fullscreen Borderless Mode Toggle */}
          <button
            type="button"
            className="nav-fullscreen-btn"
            onClick={handleToggleFullscreen}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-card)',
              color: isFullscreen ? 'var(--color-palash)' : 'var(--color-slate)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.15s ease',
            }}
            title={isFullscreen ? (isEn ? 'Exit Fullscreen' : 'फुलस्क्रीन से बाहर निकलें') : (isEn ? 'Enter Native Fullscreen (Borderless Tablet)' : 'नेटिव फुलस्क्रीन मोड (Borderless Tablet)')}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Sleek Modern Tab Bar (No chunky boxes!) */}
      <nav
        className="nav-tabs-bar"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          width: '100%',
          boxSizing: 'border-box',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        {CORE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              className={`nav-tab-item ${isActive ? 'is-active' : ''}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderBottom: isActive ? '2.5px solid var(--color-palash)' : '2.5px solid transparent',
                borderRadius: '0',
                backgroundColor: 'transparent',
                color: isActive ? 'var(--color-palash)' : 'var(--color-slate-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
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

    {/* Mobile Bottom Navigation Bar (Apple iOS Style - Hidden on Desktop & Tablet) */}
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      {CORE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`mobile-tab-btn ${isActive ? 'is-active' : ''}`}
          >
            <TabIcon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span className="mobile-tab-text">{tab.mobileLabel || tab.label}</span>
          </button>
        );
      })}
    </nav>
    </>
  );
}
