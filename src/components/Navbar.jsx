import React from 'react';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { BookOpenCheck, Globe, WifiOff, HelpCircle, Layers, Sparkles, Award, Volume2 } from 'lucide-react';

export function Navbar({
  selectedLang,
  onSelectLang,
  isOffline,
  onToggleOffline,
  onOpenDrawer,
  onOpenWizard,
  onOpenJuryTour,
  onOpenAudioPlayer,
  activeTab,
  onSelectTab,
}) {
  const currentLangMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'all 0.2s ease',
      }}
    >
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
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #E26E3F 0%, #D95A27 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 14px rgba(217, 90, 39, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '1.35rem',
            }}
          >
            🌳
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.65rem', margin: 0, color: 'var(--color-forest)', fontWeight: 800 }}>
                सरजोम <span style={{ fontSize: '1.05rem', color: 'var(--color-palash)', fontWeight: 700 }}>(SARJOM)</span>
              </h1>
              <span className="badge-tag badge-forest">झारखंड MTB-MLE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', margin: 0, fontWeight: 500 }}>
              मातृभाषा आधारित प्राथमिक शिक्षण एवं वास्तविक समय अनुवाद सेतु
            </p>
          </div>
        </div>

        {/* Right Controls: Language Picker & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Language Selector */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              padding: '3px',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)',
            }}
          >
            {Object.values(TRIBAL_LANGUAGES).map((lang) => {
              const isActive = selectedLang === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => onSelectLang(lang.id)}
                  style={{
                    padding: '6px 13px',
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(14, 91, 55, 0.22)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  title={lang.region}
                >
                  {lang.name} <span style={{ fontSize: '0.74rem', opacity: 0.88 }}>({lang.id === 'ho' ? '𑢹𑣉𑣉' : lang.id === 'santhali' ? 'ᱥᱟᱱᱛᱟᱲᱤ' : 'मुण्डारी'})</span>
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

          {/* 3-Minute SIH Jury Pitch Tour */}
          <button
            onClick={onOpenJuryTour}
            className="btn-brutal btn-palash"
            style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            title="3-मिनट स्मार्ट इंडिया हैकाथॉन ज्यूरी मूल्यांकन टूर"
          >
            <Award size={16} />
            ज्यूरी टूर
          </button>

          {/* 🔊 Live Audio Player Deck Modal */}
          <button
            onClick={onOpenAudioPlayer}
            className="btn-brutal btn-forest"
            style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            title="इंटरएक्टिव ऑडियो डेक (Live Vernacular Speech Samples)"
          >
            <Volume2 size={16} />
            ऑडियो डेक
          </button>
        </div>
      </div>

      {/* Main Feature Tabs */}
      <nav
        style={{
          display: 'flex',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px 8px 24px',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
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
                padding: '7px 15px',
                border: isActive ? '1px solid rgba(14, 91, 55, 0.20)' : '1px solid transparent',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-forest)' : 'var(--color-slate-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--color-forest-subtle)' : 'rgba(0, 0, 0, 0.04)',
                  color: isActive ? 'var(--color-forest)' : 'var(--color-slate-muted)',
                  fontWeight: 600,
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
