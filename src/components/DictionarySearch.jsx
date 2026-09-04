import React, { useState } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { voiceService } from '../services/voiceTranslationService';
import { Search, Volume2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export function DictionarySearch({ uiLang = 'hi' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;

  const filteredItems = TRIBAL_LEXICON.filter((item) => {
    const matchesCategory = selectedCat === 'all' || item.category === selectedCat;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      (item.hindi && item.hindi.toLowerCase().includes(q)) ||
      (item.english && item.english.toLowerCase().includes(q)) ||
      (item.ho && item.ho.phoneticDeva && item.ho.phoneticDeva.toLowerCase().includes(q)) ||
      (item.mundari && item.mundari.phoneticDeva && item.mundari.phoneticDeva.toLowerCase().includes(q)) ||
      (item.santhali && item.santhali.phoneticDeva && item.santhali.phoneticDeva.toLowerCase().includes(q)) ||
      (item.sadri && item.sadri.phoneticDeva && item.sadri.phoneticDeva.toLowerCase().includes(q))
    );
  });

  const handlePlay = (text, langName) => {
    toast.info(isEn ? `${langName} pronunciation: "${text}"` : `${langName} उच्चारण: "${text}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search Header */}
      <div
        className="card-brutal"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="var(--color-forest)" />
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate)' }}>
              {t.dictTitle}
            </h2>
          </div>
          <span className="badge-tag badge-forest">{t.dictBadgeAllLangs}</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)', margin: 0 }}>
          {t.dictSubtitle}
        </p>

        {/* Search Bar & Category Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="var(--color-slate-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.dictSearchPlaceholder}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-card)',
                color: 'var(--color-slate)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-card)',
              color: 'var(--color-slate)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">{isEn ? 'All Categories' : 'सभी श्रेणियाँ'}</option>
            <option value="greetings">{isEn ? 'Greetings' : 'अभिवादन'}</option>
            <option value="numbers">{isEn ? 'Numbers' : 'संख्याएँ'}</option>
            <option value="classroom">{isEn ? 'Classroom' : 'कक्षा निर्देश'}</option>
            <option value="nature">{isEn ? 'Nature' : 'प्रकृति'}</option>
            <option value="animals">{isEn ? 'Animals' : 'पशु-पक्षी'}</option>
            <option value="family">{isEn ? 'Family' : 'परिवार'}</option>
          </select>
        </div>
      </div>

      {/* Comparative Dictionary Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="card-brutal"
            style={{
              padding: '18px 20px',
              backgroundColor: 'var(--color-surface-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header: Hindi & English */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-slate)' }}>
                  {item.hindi}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-muted)', marginLeft: '10px' }}>
                  ({item.english})
                </span>
              </div>
              <span className="badge-tag badge-ochre">{item.category}</span>
            </div>

            {/* 4 Tribal Columns Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* 1. Ho */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-tint)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-palash)' }}>
                    {t.dictColHo}:
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', color: 'var(--color-slate)' }}>
                    {item.ho.native}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                    {isEn ? 'Sound:' : 'उच्चारण:'} {item.ho.phoneticDeva}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlay(item.ho.audioText || item.ho.phoneticDeva, 'Ho')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-card)',
                    color: 'var(--color-slate)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Volume2 size={12} color="var(--color-palash)" />
                  {t.dictAudioBtn} (Ho)
                </button>
              </div>

              {/* 2. Mundari */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-tint)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                    {t.dictColMundari}:
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', color: 'var(--color-slate)' }}>
                    {item.mundari.native}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                    {isEn ? 'Sound:' : 'उच्चारण:'} {item.mundari.phoneticDeva}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlay(item.mundari.audioText || item.mundari.phoneticDeva, 'Mundari')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-card)',
                    color: 'var(--color-slate)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Volume2 size={12} color="var(--color-forest)" />
                  {t.dictAudioBtn} (Mundari)
                </button>
              </div>

              {/* 3. Santhali */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-tint)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706' }}>
                    {t.dictColSanthali} (Ol Chiki - ᱥᱟᱱᱛᱟᱲᱤ):
                  </div>
                  <div className="font-olchiki" style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0', color: 'var(--color-slate)' }}>
                    {item.santhali.nativeOlChiki}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                    {isEn ? 'Sound:' : 'उच्चारण:'} {item.santhali.phoneticDeva}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlay(item.santhali.audioText || item.santhali.phoneticDeva, 'Santhali')}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-card)',
                    color: 'var(--color-slate)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Volume2 size={12} color="#D97706" />
                  {t.dictAudioBtn} (Santhali)
                </button>
              </div>

              {/* 4. Sadri (Nagpuri) */}
              {item.sadri && (
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-tint)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284C7' }}>
                      {t.dictColSadri}:
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0', color: 'var(--color-slate)' }}>
                      {item.sadri.native}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                      {isEn ? 'Sound:' : 'उच्चारण:'} {item.sadri.phoneticDeva}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlay(item.sadri.audioText || item.sadri.phoneticDeva, 'Sadri')}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-card)',
                      color: 'var(--color-slate)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Volume2 size={12} color="#0284C7" />
                    {t.dictAudioBtn} (Sadri)
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
