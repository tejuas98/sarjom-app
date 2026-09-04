import React from 'react';
import { Drawer } from 'vaul';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { BookOpen, X, Sparkles, AlertCircle, HeartPulse, CheckCircle, Volume2, Award } from 'lucide-react';

export function TeacherDrawer({
  isOpen,
  onOpenChange,
  selectedLang,
  onOpenWizard,
  onOpenAudio,
  onOpenTour,
  onSelectTab,
}) {
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 999,
          }}
        />
        <Drawer.Content
          style={{
            backgroundColor: 'var(--color-surface-card)',
            color: 'var(--color-slate)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            border: '1px solid var(--color-border)',
            borderBottom: 'none',
            maxHeight: '88vh',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: '20px 24px 36px 24px',
            boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.35)',
            maxWidth: '920px',
            margin: '0 auto',
            outline: 'none',
          }}
        >
          {/* Grab Handle */}
          <div
            style={{
              width: '48px',
              height: '5px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '9999px',
              margin: '0 auto 16px auto',
            }}
          />

          {/* Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-palash-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BookOpen size={20} color="var(--color-palash)" />
              </div>
              <div>
                <Drawer.Title style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                  शिक्षक सहायता एवं MTB-MLE टूल्स
                </Drawer.Title>
                <Drawer.Description style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', margin: 0 }}>
                  झारखंड प्राथमिक विद्यालय शिक्षण मार्गदर्शन व अतिरिक्त साधन
                </Drawer.Description>
              </div>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              className="btn-brutal"
              style={{ padding: '6px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Action Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '16px' }}>
            {onOpenWizard && (
              <button
                type="button"
                onClick={onOpenWizard}
                className="btn-brutal"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-surface-tint)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <Sparkles size={16} color="var(--color-palash)" />
                <span>60s शिक्षक ऑनबोर्डिंग</span>
              </button>
            )}

            {onOpenAudio && (
              <button
                type="button"
                onClick={onOpenAudio}
                className="btn-brutal"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-surface-tint)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <Volume2 size={16} color="var(--color-forest)" />
                <span>कक्षा ऑडियो प्लेयर</span>
              </button>
            )}

            {onOpenTour && (
              <button
                type="button"
                onClick={onOpenTour}
                className="btn-brutal"
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-surface-tint)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <Award size={16} color="#D97706" />
                <span>SIH ज्यूरी टूर</span>
              </button>
            )}
          </div>

          {/* Scrollable Content */}
          <div
            style={{
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              paddingRight: '6px',
            }}
          >
            {/* 1. PALASH MTB-MLE Golden Pedagogical Rules */}
            <div
              style={{
                backgroundColor: 'var(--color-forest-subtle)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-forest-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--color-forest)', fontWeight: 700 }}>
                <Sparkles size={16} />
                <span>झारखंड पलाश शिक्षा के 3 स्वर्णिम नियम (Pedagogical Axioms):</span>
              </div>
              <ul style={{ fontSize: '0.85rem', paddingLeft: '20px', lineHeight: 1.6, color: '#1B382B' }}>
                <li>
                  <strong>80:20 मातृभाषा अनुपात:</strong> बालवाटिका और कक्षा 1 के आरंभ में 80% समय बच्चे की मातृभाषा ({langMeta.name}) में संवाद करें, और केवल 20% हिंदी।
                </li>
                <li>
                  <strong>भयमुक्त वातावरण:</strong> बच्चे को हिंदी में बोलने के लिए बाध्य न करें। जोहार और मातृभाषा के सहज उपयोग से अपनत्व विकसित होता है।
                </li>
                <li>
                  <strong>द्विभाषी सेतु:</strong> प्रत्येक गतिविधि में पहले स्थानीय मातृभाषा शब्द बोलें, फिर उसका हिंदी पर्याय समझाएं।
                </li>
              </ul>
            </div>

            {/* 2. Phonetics & Glottal Shifts Guide for Non-Native Teachers */}
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', color: 'var(--color-slate)' }}>
                {langMeta.name} भाषा ध्वनिविज्ञान (Phonetic Guide for Hindi Teachers):
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-tint)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-palash)' }}>
                    कंठ्य अल्पप्राण व आकुंचन (Glottal Stops)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
                    शब्दों के अंत में आने वाले "ः" या "ग्/द्" का उच्चारण गले से रुककर (Checked sound) किया जाता है। उदा: 'दाः' (जल) या 'मित्' (एक)।
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-tint)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-forest)' }}>
                    स्वर अनुनासिकता (Nasalization)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
                    मुण्डारी व संताली में 'ङ' और 'ञ' का प्रयोग अधिक होता है। शिक्षक इसे नाक से सहज ध्वनि निकालकर बोलें (उदा: इञाग / आइङ)।
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Emergency Classroom Health Dialogue */}
            <div
              style={{
                backgroundColor: 'var(--color-ochre-subtle)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-ochre-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-ochre)', fontWeight: 700 }}>
                <HeartPulse size={18} />
                <span>प्राथमिक स्वास्थ्य व आपातकालीन संवाद (Health Emergency Phrases):</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--color-surface-card)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  <span>"क्या पेट में दर्द है?"</span>
                  <strong style={{ color: 'var(--color-palash)' }}>लाज हासूताना? (Laj hasutana?)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--color-surface-card)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  <span>"बुखार लग रहा है क्या?"</span>
                  <strong style={{ color: 'var(--color-palash)' }}>रुअ मेनामा? (Rua menama?)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--color-surface-card)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  <span>"पानी पीना चाहते हो?"</span>
                  <strong style={{ color: 'var(--color-palash)' }}>दाः ञु सानाम काना? (Daah nyu sanam kana?)</strong>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
