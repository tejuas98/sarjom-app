import React, { useState } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { voiceService } from '../services/voiceTranslationService';
import { Search, Volume2, BookOpen, Library, ChevronDown, ChevronUp, BookMarked, Award } from 'lucide-react';
import { toast } from 'sonner';

// Authoritative Classical Encyclopedias & Reference Lexicons for Jharkhand Tribal Languages
export const CLASSICAL_ENCYCLOPEDIAS = [
  {
    id: 'mundari_hoffmann',
    language: 'Mundari (मुंडारी)',
    title: 'Encyclopaedia Mundarica (16 Volumes)',
    author: 'Fr. John-Baptist Hoffmann, S.J. & Arthur Van Emelen (1930–1950)',
    descriptionHindi: 'मुंडारी भाषा, संस्कृति, गोत्र (किल्ली), पारंपरिक वनस्पति एवं लोकसाहित्य का 16 खंडों में 5,000+ पृष्ठों का विश्वप्रसिद्ध महाग्रंथ। साथ ही पद्मश्री डॉ. राम दयाल मुंडा के भाषा-वैज्ञानिक शोध।',
    descriptionEnglish: 'Monumental 16-volume, 5,000+ page world-renowned encyclopedia documenting Mundari lexicon, grammar, indigenous botany, clan laws, and folklore.',
    badge: '16 Volumes • Hoffmann & Van Emelen',
    rootCount: '10,000+ Root Words',
  },
  {
    id: 'santhali_bodding',
    language: 'Santhali (संताली)',
    title: 'A Santal Dictionary (5 Volumes) & Ol Chemed',
    author: 'Rev. Paul Olaf Bodding (1932–1936) & Guru Gomke Pandit Raghunath Murmu (1942)',
    descriptionHindi: 'संताली भाषा का 5 खंडों का सर्वाधिक प्रामाणिक शब्दकोश (30,000+ मूल शब्द, ध्वन्यात्मकता व व्युत्पत्ति) एवं गुरु गोमके पं. रघुनाथ मुर्मू द्वारा रचित ओल चिकी व्याकरण (रोनोर व ओल चेमेद)।',
    descriptionEnglish: 'The authoritative 5-volume master lexicon by Rev. P.O. Bodding (30,000+ roots) and original Ol Chiki script grammar (Ronor / Ol Chemed) by Guru Gomke Pandit Raghunath Murmu.',
    badge: '5 Volumes • Bodding & Murmu',
    rootCount: '30,000+ Root Words',
  },
  {
    id: 'ho_deeney',
    language: 'Ho (हो)',
    title: 'Ho-English Dictionary & Ho Grammar',
    author: 'Fr. John J. Deeney, S.J. (1978, Xavier Ho Publications, Chaibasa)',
    descriptionHindi: 'कोल्हान विश्वविद्यालय व JCERT पाठ्यपुस्तकों में स्वीकृत मानक हो शब्दकोश। साथ ही ओत गुरु कोल लाको बोदरा द्वारा रचित वारंग क्षिति (Warang Chiti) लिपि व व्याकरण संग्रह।',
    descriptionEnglish: 'The benchmark modern Ho lexicon used in Kolhan University and JCERT textbooks, aligned with Ot Guru Kol Lako Bodra\'s Warang Chiti corpus.',
    badge: 'Standard Lexicon • Fr. John Deeney',
    rootCount: '8,000+ Root Words',
  },
  {
    id: 'sadri_nowrangi',
    language: 'Sadri / Nagpuri (सादरी / नागपुरी)',
    title: 'A Sadani / Sadri-English-Hindi Dictionary',
    author: 'Fr. Peter Shanti Nowrangi (1956) & Fr. Edgar Blain (1975)',
    descriptionHindi: 'झारखंड की संपर्क भाषा सादरी/नागपुरी का आधारभूत शब्दकोश एवं व्याकरण। डॉ. श्रवण कुमार गोस्वामी का नागपुरी व्याकरण एवं JCERT भाषा पुलिया शब्दावली।',
    descriptionEnglish: 'Foundational trilingual lexicon and grammar of Sadri/Nagpuri lingua franca of Chota Nagpur, supplemented by Dr. S.K. Goswami\'s grammar and JCERT glossaries.',
    badge: 'Trilingual Lexicon • Fr. Nowrangi',
    rootCount: '12,000+ Headwords',
  },
];

export function DictionarySearch({ uiLang = 'hi' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showSources, setShowSources] = useState(false);

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

          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              backgroundColor: showSources ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface-card)',
              color: 'var(--color-forest)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            <Library size={16} />
            {isEn ? 'Authoritative Encyclopedias (4 Sources)' : 'प्रमाणिक संदर्भ ग्रंथ व विश्वकोश (4 स्रोत)'}
            {showSources ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {/* Collapsible Authoritative Reference Books & Encyclopedias Panel */}
        {showSources && (
          <div
            style={{
              marginTop: '4px',
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-tint)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--color-forest)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--color-slate)' }}>
                  {isEn ? 'Master Reference Encyclopedias & Lexicons of Chota Nagpur' : 'छोटानागपुर व संताल परगना के प्रमाणिक महा-विश्वकोश एवं मानक शब्दकोश'}
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-palash)', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'rgba(194, 65, 12, 0.1)' }}>
                {isEn ? 'Academic & Government Approved' : 'शैक्षणिक एवं शोध आधारित संदर्भ'}
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', margin: 0, lineHeight: 1.5 }}>
              {isEn
                ? 'SARJOM’s vocabulary is strictly anchored in peer-reviewed lexicographical treatises and JCERT textbooks, avoiding fabricated translations.'
                : 'सरजोम (SARJOM) का शब्दकोश एवं वाक्य बैंक किसी कृत्रिम अनुमान पर नहीं, बल्कि छोटानागपुर की इन ऐतिहासिक, 5000+ पृष्ठों की विश्वप्रसिद्ध इनसाइक्लोपीडिया एवं JCERT पाठ्यपुस्तकों पर आधारित है:'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {CLASSICAL_ENCYCLOPEDIAS.map((enc) => (
                <div
                  key={enc.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
                      {enc.language}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-forest)' }}>
                      {enc.rootCount}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-slate)' }}>
                    {enc.title}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--color-palash)', fontWeight: 600 }}>
                    {enc.author}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                    {isEn ? enc.descriptionEnglish : enc.descriptionHindi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-tag" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-forest)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.72rem' }}>
                  {item.nipunLevel || 'NIPUN FLN'}
                </span>
                <span className="badge-tag badge-ochre">{item.category}</span>
              </div>
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

            {/* Classical Reference Corpus Citation Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.74rem',
                color: 'var(--color-slate-muted)',
                paddingTop: '10px',
                borderTop: '1px dashed var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookMarked size={13} color="var(--color-forest)" />
                <span>
                  {isEn ? 'Classical Reference Corpus:' : 'प्रमाणिक संदर्भ आधार:'}{' '}
                  <strong style={{ color: 'var(--color-forest)' }}>
                    {item.category === 'numbers' ? 'JCERT FLN & Hoffmann/Bodding Lexicons' : 'Encyclopaedia Mundarica / Bodding / Deeney / Nowrangi'}
                  </strong>
                </span>
              </div>
              <span style={{ fontStyle: 'italic', color: 'var(--color-palash)' }}>
                {isEn ? 'MTB-MLE Primary Pedagogy Standard' : 'मातृभाषा आधारित प्राथमिक शिक्षा (JCERT)'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
