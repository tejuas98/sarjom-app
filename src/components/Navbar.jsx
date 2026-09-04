import React, { useState } from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { Menu, ChevronDown, Sparkles, Volume2, Award, Globe } from 'lucide-react';

export function Navbar({
  selectedLang,
  onSelectLang,
  isOffline,
  uiLang = 'hi',
  onToggleUILang,
  onOpenDrawer,
  onOpenWizard,
  onOpenJuryTour,
  onOpenAudioPlayer,
  activeTab,
  onSelectTab,
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const currentLangMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  // Primary 4 tabs that teachers use in everyday teaching
  const PRIMARY_TABS = [
    { id: 'voice', label: t.tabVoice, title: t.tabVoice },
    { id: 'worksheets', label: t.tabWorksheets, title: t.tabWorksheets },
    { id: 'flashcards', label: t.tabFlashcards, title: t.tabFlashcards },
    { id: 'dictionary', label: t.tabDictionary, title: t.tabDictionary },
  ];

  // Secondary tools (accessible via dropdown without cluttering the screen)
  const MORE_TABS = [
    { id: 'curriculum', label: t.tabCurriculum },
    { id: 'slate', label: t.tabSlate },
    { id: 'orf', label: t.tabOrf },
    { id: 'neural', label: t.tabNeural },
    { id: 'benchmark', label: t.tabBenchmark },
  ];

  const handleSelectMoreTab = (tabId) => {
    onSelectTab(tabId);
    setShowMoreMenu(false);
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* 1. Main Header: Brand + 4 Tribal Languages + UI Language Toggle (English & Hindi) + Unified Menu */}
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
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #0E5B37 0%, #157347 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '1.25rem',
              boxShadow: '0 2px 8px rgba(14, 91, 55, 0.2)',
            }}
          >
            🌿
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-forest)', letterSpacing: '-0.01em' }}>
                {t.brandTitle} <span style={{ fontSize: '0.95rem', color: 'var(--color-palash)', fontWeight: 700 }}>{t.brandSub}</span>
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '1px 7px',
                  borderRadius: '999px',
                  backgroundColor: isOffline ? '#DCFCE7' : '#EFF6FF',
                  color: isOffline ? '#166534' : '#1E40AF',
                  fontWeight: 600,
                }}
              >
                {isOffline ? t.offlineStatus : t.onlineStatus}
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {t.brandTagline}
            </p>
          </div>
        </div>

        {/* Center: The 4 Clean Tribal Language Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
          }}
        >
          {Object.values(TRIBAL_LANGUAGES).map((lang) => {
            const isActive = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLang(lang.id)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 8px rgba(14, 91, 55, 0.25)' : 'none',
                  transition: 'all 0.18s ease',
                }}
                title={lang.region}
              >
                {lang.name}
              </button>
            );
          })}
        </div>

        {/* Right: Interface Language Switcher (English & Hindi) + Teacher Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Change Option (English and Hindi) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px',
              border: '1px solid var(--color-border)',
            }}
            title="भाषा बदलें / Change Language (English & Hindi)"
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

          {/* Unified Teacher Help Button */}
          <button
            type="button"
            onClick={onOpenDrawer}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              color: 'var(--color-slate)',
              fontSize: '0.84rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            title={t.teacherHelpBtn}
          >
            <Menu size={16} color="var(--color-forest)" />
            <span>{t.teacherHelpBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Simplified Clean Navigation Bar */}
      <nav
        style={{
          display: 'flex',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 8px 24px',
          gap: '8px',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {PRIMARY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                padding: '7px 16px',
                border: isActive ? '1px solid rgba(14, 91, 55, 0.3)' : '1px solid transparent',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-forest)' : 'var(--color-slate-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 0.18s ease',
              }}
              title={tab.title}
            >
              {tab.label}
            </button>
          );
        })}

        {/* More Tools Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowMoreMenu((prev) => !prev)}
            style={{
              padding: '7px 14px',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: showMoreMenu || MORE_TABS.some((t) => t.id === activeTab) ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
              color: MORE_TABS.some((t) => t.id === activeTab) ? 'var(--color-forest)' : 'var(--color-slate-muted)',
              fontWeight: MORE_TABS.some((t) => t.id === activeTab) ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{t.tabMoreTools}</span>
            <ChevronDown size={14} />
          </button>

          {showMoreMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.12)',
                padding: '6px',
                minWidth: '220px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              {MORE_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectMoreTab(tab.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-forest-subtle)' : 'transparent',
                      color: isActive ? 'var(--color-forest)' : 'var(--color-slate)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenWizard();
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-slate)',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={14} color="var(--color-palash)" />
                <span>{t.btnOnboarding}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenAudioPlayer();
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-slate)',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Volume2 size={14} color="var(--color-forest)" />
                <span>{t.btnAudioDeck}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenJuryTour();
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-slate-muted)',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Award size={14} color="#D97706" />
                <span>{t.btnJuryTour}</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
