import React from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { BookOpenCheck, Globe, WifiOff, HelpCircle, Layers } from 'lucide-react';

export function Navbar({
  selectedLang,
  onSelectLang,
  isOffline,
  onToggleOffline,
  onOpenDrawer,
  onOpenWizard,
  activeTab,
  onSelectTab,
}) {
  const currentLangMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  return (
    <header style={{ borderBottom: 'var(--border-thick)', backgroundColor: '#FFFFFF', position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top Banner */}
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
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'var(--color-palash)',
              borderRadius: 'var(--radius-md)',
              border: 'var(--border-thick)',
              boxShadow: '2px 2px 0px var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.4rem',
            }}
          >
            🌺
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--color-forest)' }}>
                पलाश सेतु <span style={{ fontSize: '1.1rem', color: 'var(--color-palash)' }}>(PALASH Setu)</span>
              </h1>
              <span className="badge-tag badge-forest">झारखंड MTB-MLE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              मातृभाषा आधारित प्राथमिक शिक्षण एवं वास्तविक समय अनुवाद सेतु
            </p>
          </div>
        </div>

        {/* Right Controls: Language Picker & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-md)',
              padding: '3px',
              boxShadow: 'var(--shadow-flat)',
            }}
          >
            {Object.values(TRIBAL_LANGUAGES).map((lang) => {
              const isActive = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => onSelectLang(lang.id)}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-bounce)',
                  }}
                  title={lang.region}
                >
                  {lang.name} <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>({lang.id === 'ho' ? '𑢹𑣉𑣉' : lang.id === 'santhali' ? 'ᱥᱟᱱᱛᱟᱲᱤ' : 'मुण्डारी'})</span>
                </button>
              );
            })}
          </div>

          {/* Offline Toggle */}
          <button
            onClick={onToggleOffline}
            className={`btn-brutal ${isOffline ? 'btn-palash' : 'btn-subtle'}`}
            style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            title="ग्रामीण झारखंडी विद्यालयों हेतु 100% ऑफलाइन कार्य प्रणाली"
          >
            <WifiOff size={16} />
            {isOffline ? 'ऑफलाइन सक्रिय' : 'ऑनलाइन'}
          </button>

          {/* 60-Second Teacher Onboarding Tour */}
          <button
            onClick={onOpenWizard}
            className="btn-brutal btn-forest"
            style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            title="60 सेकंड त्वरित शिक्षक ऑनबोर्डिंग विज़ार्ड"
          >
            <Sparkles size={16} />
            ऑनबोर्डिंग
          </button>

          {/* Teacher Phonetic Guide Drawer Trigger */}
          <button
            onClick={onOpenDrawer}
            className="btn-brutal btn-ochre"
            style={{ padding: '7px 14px', fontSize: '0.85rem' }}
          >
            <HelpCircle size={16} />
            शिक्षक निर्देश
          </button>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <nav
        style={{
          display: 'flex',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          gap: '8px',
          overflowX: 'auto',
        }}
        className="tab-navigation"
      >
        {[
          { id: 'voice', label: '🎙️ संवाद', sub: '<3s अनुवाद' },
          { id: 'curriculum', label: '📚 निपुण पाठ', sub: 'FLN योजना' },
          { id: 'worksheets', label: '📝 अभ्यास पत्र', sub: 'प्रिंट व क्यूआर' },
          { id: 'flashcards', label: '🎴 फ्लैशकार्ड', sub: 'सचित्र' },
          { id: 'slate', label: '🎨 स्लेट व लोककथा', sub: 'सांस्कृतिक' },
          { id: 'dictionary', label: '📖 शब्दकोश', sub: '1,240+ शब्द' },
          { id: 'neural', label: '⚡ न्यूरल LLM', sub: '14.2M कस्टम' },
          { id: 'orf', label: '🎯 वाचन शुद्धता', sub: 'AI Coach' },
          { id: 'benchmark', label: '🏆 ज्यूरी तुलना', sub: '500 टीम बेंचमार्क' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              style={{
                padding: '10px 18px',
                border: 'var(--border-thick)',
                borderBottom: isActive ? 'none' : 'var(--border-thick)',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                backgroundColor: isActive ? 'var(--color-bg)' : '#FFFFFF',
                color: isActive ? 'var(--color-forest)' : 'var(--color-slate-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                marginBottom: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? 'none' : '2px -2px 0px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--color-forest-subtle)' : '#EBEBEB',
                  color: isActive ? 'var(--color-forest)' : '#555',
                }}
              >
                {tab.sub}
              </span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
