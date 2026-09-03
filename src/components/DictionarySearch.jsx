import React, { useState } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { voiceService } from '../services/voiceTranslationService';
import { Search, Volume2, BookOpen, Layers, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function DictionarySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const filteredItems = TRIBAL_LEXICON.filter((item) => {
    const matchesCategory = selectedCat === 'all' || item.category === selectedCat;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      item.hindi.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q) ||
      item.ho.phoneticDeva.toLowerCase().includes(q) ||
      item.mundari.phoneticDeva.toLowerCase().includes(q) ||
      item.santhali.phoneticDeva.toLowerCase().includes(q)
    );
  });

  const handlePlay = (text, langName) => {
    toast.info(`${langName} उच्चारण: "${text}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search Header */}
      <div
        className="card-brutal"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={22} color="var(--color-forest)" />
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
              त्रैभाषिक FLN शब्दकोश (Tri-Lingual Lexicon Search)
            </h2>
          </div>
          <span className="badge-tag badge-forest">हो • मुण्डारी • संताली शब्दकोश</span>
        </div>

        {/* Search Bar & Category Filter */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} color="#777" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="हिंदी, अंग्रेजी या ध्वनि से खोजें (उदा: पानी, हाथी, नमस्ते, 1, माँ)..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-thick)',
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
              border: 'var(--border-thick)',
              backgroundColor: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">सभी श्रेणियाँ (All Categories)</option>
            <option value="greetings">अभिवादन (Greetings)</option>
            <option value="numbers">संख्याएँ (Numbers)</option>
            <option value="classroom">कक्षा निर्देश (Classroom)</option>
            <option value="nature">प्रकृति (Nature)</option>
            <option value="animals">पशु-पक्षी (Animals)</option>
            <option value="family">परिवार (Family)</option>
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
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header: Hindi & English */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EBEBEB', paddingBottom: '10px' }}>
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

            {/* 3 Tribal Columns Side-by-Side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {/* 1. Ho */}
              <div
                style={{
                  backgroundColor: 'var(--color-palash-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #F8C3AC',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-palash)' }}>
                    हो (Ho - 𑢹𑣉𑣉):
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>
                    {item.ho.native}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#523702' }}>
                    उच्चारण: {item.ho.phoneticDeva}
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(item.ho.audioText || item.ho.phoneticDeva, 'Ho')}
                  className="btn-brutal btn-palash"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  <Volume2 size={12} />
                  हो ध्वनि सुनें
                </button>
              </div>

              {/* 2. Mundari */}
              <div
                style={{
                  backgroundColor: 'var(--color-forest-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-forest-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                    मुण्डारी (Mundari):
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0' }}>
                    {item.mundari.native}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#0E5B37' }}>
                    उच्चारण: {item.mundari.phoneticDeva}
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(item.mundari.audioText || item.mundari.phoneticDeva, 'Mundari')}
                  className="btn-brutal btn-primary"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  <Volume2 size={12} />
                  मुण्डारी ध्वनि सुनें
                </button>
              </div>

              {/* 3. Santhali */}
              <div
                style={{
                  backgroundColor: 'var(--color-ochre-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #F5DEAE',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8C5F08' }}>
                    संताली (Santhali - ᱥᱟᱱᱛᱟᱲᱤ):
                  </div>
                  <div className="font-olchiki" style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0' }}>
                    {item.santhali.nativeOlChiki}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#523702' }}>
                    उच्चारण: {item.santhali.phoneticDeva}
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(item.santhali.audioText || item.santhali.phoneticDeva, 'Santhali')}
                  className="btn-brutal btn-ochre"
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  <Volume2 size={12} />
                  संताली ध्वनि सुनें
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
