import React, { useEffect } from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import {
  Globe,
  BookOpen,
  Sun,
  Moon,
  Mic,
  FileText,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

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

  // 4 Core Deliverables defined in Problem Statement SIH26042 with dedicated icons & shortcuts
  const CORE_TABS = [
    { id: 'voice', label: t.tabVoice, icon: Mic, shortcut: '1' },
    { id: 'worksheets', label: t.tabWorksheets, icon: FileText, shortcut: '2' },
    { id: 'flashcards', label: t.tabFlashcards, icon: Layers, shortcut: '3' },
    { id: 'dictionary', label: t.tabDictionary, icon: BookOpen, shortcut: '4' },
  ];

  // Hotkey navigation: Press 1, 2, 3, 4 to switch tabs instantly (when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }
      if (e.key === '1') onSelectTab('voice');
      else if (e.key === '2') onSelectTab('worksheets');
      else if (e.key === '3') onSelectTab('flashcards');
      else if (e.key === '4') onSelectTab('dictionary');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab]);

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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* 1. Institutional State Top Ribbon (Government of Jharkhand & NIPUN Bharat FLN) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-tint)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '4px 24px',
          fontSize: '0.70rem',
          color: 'var(--color-slate-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontWeight: 700,
              color: 'var(--color-slate)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={12} color="var(--color-forest)" />
            {isEn
              ? 'Govt. of Jharkhand • School Education & Literacy Dept'
              : 'झारखंड सरकार • स्कूली शिक्षा एवं साक्षरता विभाग'}
          </span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ color: 'var(--color-slate-muted)' }}>
            {isEn
              ? 'NIPUN Bharat FLN • Mother Tongue-Based Multilingual Education (MTB-MLE)'
              : 'NIPUN भारत FLN • बुनियादी साक्षरता एवं संख्याज्ञान सेतु (कक्षा 1-3)'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: isOffline ? '#16A34A' : '#2563EB',
              fontWeight: 600,
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
              className={isOffline ? 'audio-pulse' : ''}
            />
            {isOffline
              ? (isEn ? '100% On-Device Offline AI (WebAssembly • Zero Cloud)' : '100% ऑन-डिवाइस ऑफ़लाइन (शून्य इंटरनेट निर्भरता)')
              : (isEn ? 'Cloud Sync Online' : 'क्लाउड सिंक चालू')}
          </span>
        </div>
      </div>

      {/* 2. Main Navigation Bar: Brand + Tribal Language Selector + UI Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Brand Title with Dual Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #C2410C 0%, #2D5A43 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(194, 65, 12, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <BookOpen size={20} strokeWidth={2.3} />
            <Sparkles
              size={11}
              color="#FDE047"
              style={{ position: 'absolute', top: '-2px', right: '-2px' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '1.38rem',
                  fontWeight: 900,
                  color: 'var(--color-slate)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {isEn ? 'PALASH-Setu' : 'सरजोम-सेतु'}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-palash-subtle)',
                  color: 'var(--color-palash)',
                  border: '1px solid var(--color-palash-border)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {isEn ? 'SARJOM AI' : 'पलाश सेतु'}
              </span>
            </div>
            <p
              style={{
                fontSize: '0.76rem',
                color: 'var(--color-slate-muted)',
                margin: '2px 0 0 0',
                fontWeight: 500,
              }}
            >
              {isEn
                ? 'Jharkhand Tribal Primary Pedagogy Bridge • 4 Indigenous Mother Tongues'
                : 'झारखंड जनजातीय प्राथमिक मातृभाषा शिक्षण सेतु (संताली • हो • मुंडारी • सादरी)'}
            </p>
          </div>
        </div>

        {/* Center: The 4 Tribal Language Buttons with Native Script Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-tint)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '4px 6px',
            gap: '3px',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
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
              fontWeight: 700,
              userSelect: 'none',
            }}
          >
            <Globe size={13} color="var(--color-palash)" />
            <span>{isEn ? 'Class Language:' : 'कक्षा भाषा:'}</span>
          </div>

          {Object.values(TRIBAL_LANGUAGES).map((lang) => {
            const isActive = selectedLang === lang.id;
            const displayName = isEn
              ? (lang.id === 'ho' ? 'Ho' : lang.id === 'mundari' ? 'Mundari' : lang.id === 'santhali' ? 'Santali' : 'Sadri')
              : (lang.id === 'ho' ? 'हो' : lang.id === 'mundari' ? 'मुंडारी' : lang.id === 'santhali' ? 'संताली' : 'सादरी');

            // Indigenous Script Micro-Badges
            const scriptBadge = lang.id === 'santhali'
              ? 'ᱚᱞ ᱪᱤᱠᱤ'
              : lang.id === 'ho'
              ? '𑢹𑣉'
              : lang.id === 'mundari'
              ? 'Bani'
              : 'सेतु';

            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => onSelectLang(lang.id)}
                style={{
                  padding: '6px 14px',
                  border: isActive ? '1px solid rgba(45, 90, 67, 0.3)' : '1px solid transparent',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 3px 10px rgba(14, 91, 55, 0.28)' : 'none',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title={`${lang.name} • ${lang.region}`}
              >
                <span>{displayName}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'var(--color-surface-card)',
                    color: isActive ? '#FFFFFF' : 'var(--color-slate-muted)',
                    fontWeight: 700,
                    border: isActive ? 'none' : '1px solid var(--color-border-subtle)',
                  }}
                >
                  {scriptBadge}
                </span>
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
              backgroundColor: 'var(--color-surface-tint)',
              borderRadius: 'var(--radius-pill)',
              padding: '3px',
              border: '1px solid var(--color-border)',
            }}
            title={isEn ? 'Switch App Language (English / Hindi)' : 'एप्लिकेशन भाषा बदलें (English / हिन्दी)'}
          >
            <button
              type="button"
              onClick={() => onToggleUILang('hi')}
              style={{
                padding: '4px 11px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: uiLang === 'hi' ? 'var(--color-palash)' : 'transparent',
                color: uiLang === 'hi' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: uiLang === 'hi' ? 800 : 600,
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
                padding: '4px 11px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: uiLang === 'en' ? 'var(--color-palash)' : 'transparent',
                color: uiLang === 'en' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: uiLang === 'en' ? 800 : 600,
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
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.18s ease',
            }}
            title={
              theme === 'dark'
                ? (isEn ? 'Switch to Light Mode' : 'लाइट मोड सक्रिय करें')
                : (isEn ? 'Switch to Dark Mode' : 'डार्क मोड सक्रिय करें')
            }
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} color="#FBBF24" /> : <Moon size={16} color="var(--color-palash)" />}
          </button>
        </div>
      </div>

      {/* 3. Core Deliverable Tabs: Strictly the 4 Pillars of SIH 26042 with Icons & Shortcuts */}
      <nav
        style={{
          display: 'flex',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px 10px 24px',
          gap: '8px',
          alignItems: 'center',
          overflowX: 'auto',
        }}
      >
        {CORE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                padding: '8px 18px',
                border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive ? 'var(--color-surface-card)' : 'transparent',
                color: isActive ? 'var(--color-slate)' : 'var(--color-slate-muted)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 3px 10px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
              title={isEn ? `Press ${tab.shortcut} to switch` : `कुंजी ${tab.shortcut} दबाएं`}
            >
              <TabIcon
                size={16}
                color={isActive ? 'var(--color-palash)' : 'currentColor'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  backgroundColor: isActive ? 'var(--color-surface-tint)' : 'rgba(0,0,0,0.04)',
                  color: isActive ? 'var(--color-palash)' : 'var(--color-slate-muted)',
                  fontWeight: 700,
                }}
              >
                {tab.shortcut}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
