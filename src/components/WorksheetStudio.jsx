import React, { useState } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { Printer, BookCheck, Smartphone, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { ParentPhoneScanModal } from './ParentPhoneScanModal';

export function WorksheetStudio({ selectedLang, uiLang = 'hi' }) {
  const [worksheetType, setWorksheetType] = useState('numeracy'); // 'numeracy' | 'matching' | 'tracing'
  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  const schoolName = isEn
    ? 'Govt. Primary School, Khunti (Jharkhand)'
    : 'राजकीय प्राथमिक विद्यालय, खूंटी (झारखंड)';

  // Filter items based on worksheet type
  const numberItems = TRIBAL_LEXICON.filter((i) => i.category === 'numbers').slice(0, 5);
  const wordItems = TRIBAL_LEXICON.filter((i) => ['animals', 'nature', 'greetings'].includes(i.category)).slice(0, 4);

  const handlePrint = () => {
    toast.info(isEn ? 'Opening print / save dialog...' : 'प्रिंट संवाद खुल रहा है (Print / Save PDF)...');
    window.print();
  };

  const [showPhoneScanModal, setShowPhoneScanModal] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Worksheet Header & Controls */}
      <div
        className="card-brutal no-print"
        style={{
          padding: '18px 24px',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookCheck size={22} color="var(--color-forest)" />
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate)' }}>
              {t.wsTitle}
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
            {isEn
              ? `FLN Competency-Based • Auto-generated in English, Hindi & ${langMeta.name}`
              : `निपुण भारत बुनियादी दक्षता • हिंदी एवं ${langMeta.name} में स्वतः निर्मित`}
          </p>
        </div>

        {/* Type Selector & Print Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setWorksheetType('numeracy')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: worksheetType === 'numeracy' ? 'var(--color-forest)' : 'transparent',
                color: worksheetType === 'numeracy' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {t.wsTypeNumeracy}
            </button>
            <button
              onClick={() => setWorksheetType('matching')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: worksheetType === 'matching' ? 'var(--color-forest)' : 'transparent',
                color: worksheetType === 'matching' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {t.wsTypeMatching}
            </button>
            <button
              onClick={() => setWorksheetType('tracing')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: worksheetType === 'tracing' ? 'var(--color-forest)' : 'transparent',
                color: worksheetType === 'tracing' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {t.wsTypeTracing}
            </button>
          </div>

          <button
            onClick={() => setShowPhoneScanModal(true)}
            className="btn-brutal btn-forest"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title={isEn ? 'Simulate rural parent phone QR audio scan' : 'ग्रामीण अभिभावक फोन स्कैन सिमुलेशन'}
          >
            <Smartphone size={16} />
            {isEn ? 'Parent Phone Scan' : 'फोन स्कैन सिमुलेशन'}
          </button>

          <button onClick={handlePrint} className="btn-brutal btn-palash" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Printer size={16} />
            {t.wsPrintBtn}
          </button>
        </div>
      </div>

      {/* Printable Sheet Frame */}
      <div
        className="card-brutal worksheet-printable"
        style={{
          padding: '36px',
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Official Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2.5px solid var(--color-border)',
            paddingBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isEn
                ? 'Jharkhand Education Project Council • SARJOM MTB-MLE Programme'
                : 'झारखंड शिक्षा परियोजना परिषद • सरजोम MTB-MLE कार्यक्रम'}
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: '4px 0', color: 'var(--color-slate)' }}>
              {isEn
                ? 'NIPUN Bharat Foundational Learning Worksheet (FLN)'
                : 'निपुण भारत बुनियादी शिक्षण अभ्यास पत्र (FLN Worksheet)'}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-palash)', fontWeight: 700 }}>
              {isEn ? `Medium: Hindi + ${langMeta.name} (${langMeta.badgeText})` : `माध्यम: हिंदी + ${langMeta.name} (${langMeta.badgeText})`}
            </div>
          </div>
        </div>

        {/* Student & School Info Fields */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--color-surface-hover)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontSize: '0.85rem',
          }}
        >
          <div><strong>{t.wsSchoolLabel}</strong> {schoolName}</div>
          <div><strong>{t.wsStudentLabel}</strong> ___________________</div>
          <div><strong>{isEn ? 'Grade:' : 'कक्षा:'}</strong> {isEn ? 'Grade 1 / 2' : 'बालवाटिका / 1 / 2'}</div>
          <div><strong>{t.wsDateLabel}</strong> {new Date().toLocaleDateString(isEn ? 'en-IN' : 'hi-IN')}</div>
        </div>

        {/* WORKSHEET CONTENT 1: NUMERACY */}
        {worksheetType === 'numeracy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-forest-subtle)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-forest)',
              }}
            >
              {isEn
                ? `Exercise 1: Count the objects and identify the corresponding ${langMeta.name} tribal number name.`
                : `अभ्यास 1: वस्तुओं को गिनें और सही जनजातीय संख्या नाम पर घेरा लगाएं / लिखें।`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {numberItems.map((item, idx) => {
                const tribalObj = (item && (item[selectedLang] || item.sadri || item.santhali || item.mundari || item.ho)) || {};
                const tribalName = tribalObj.nativeOlChiki || tribalObj.native || item.hindi;
                const objectsArray = Array.from({ length: item.numeral }, (_, i) => i + 1);

                return (
                  <div
                    key={item.id}
                    style={{
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--color-surface-tint)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)' }}>
                        {isEn ? `Item ${idx + 1}: ${item.english} (${item.hindi})` : `प्रश्न ${idx + 1}: ${item.hindi}`}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                        {objectsArray.map((_, i) => (
                          <span key={i} title="Object" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Leaf size={22} color="var(--color-forest)" />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--color-border)',
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-slate)' }}>
                        {isEn ? 'Tribal Word:' : 'मातृभाषा शब्द:'}{' '}
                        <strong style={{ color: 'var(--color-forest)', fontSize: '1.1rem' }}>{tribalName}</strong>
                      </div>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          border: '2px dashed var(--color-slate)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        {item.numeral}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WORKSHEET CONTENT 2: WORD MATCHING */}
        {worksheetType === 'matching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-ochre-subtle)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#8C5F08',
              }}
            >
              {isEn
                ? `Exercise 2: Match each Hindi/English word with its correct ${langMeta.name} tribal equivalent.`
                : `अभ्यास 2: हिंदी शब्द का उसकी ${langMeta.name} मातृभाषा शब्द से रेखा खींचकर मिलान करें।`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
              {/* Left column: Words */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-slate)' }}>
                  {isEn ? 'Column A (Hindi / English)' : 'कॉलम A (हिंदी शब्द)'}
                </div>
                {wordItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 16px',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-tint)',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--color-slate)',
                    }}
                  >
                    <span>{idx + 1}. {item.hindi} {isEn ? `(${item.english})` : ''}</span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-slate)', display: 'inline-block' }} />
                  </div>
                ))}
              </div>

              {/* Right column: Tribal words */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                  {isEn ? `Column B (${langMeta.name} Mother Tongue)` : `कॉलम B (${langMeta.name} मातृभाषा)`}
                </div>
                {wordItems.slice().reverse().map((item, idx) => {
                  const tribalData = (item && (item[selectedLang] || item.sadri || item.santhali || item.mundari || item.ho)) || {};
                  const name = tribalData.nativeOlChiki || tribalData.native || item.hindi;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 16px',
                        border: '2px solid var(--color-forest)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-forest-subtle)',
                        fontWeight: 700,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-forest)', display: 'inline-block' }} />
                      <span className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}>
                        {name} ({tribalData.phoneticDeva})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* WORKSHEET CONTENT 3: SCRIPT TRACING */}
        {worksheetType === 'tracing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                backgroundColor: 'var(--color-palash-subtle)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--color-palash)',
              }}
            >
              {isEn
                ? 'Exercise 3: Letter glyph tracing practice along the dots.'
                : 'अभ्यास 3: लिपि वर्ण अनुरेखण अभ्यास (Trace the native glyphs along the dots).'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { glyph: selectedLang === 'santhali' ? 'ᱚ' : 'अ', sound: 'La / A', desc: isEn ? 'Letter 1' : 'पहला वर्ण' },
                { glyph: selectedLang === 'santhali' ? 'ᱛ' : 'त', sound: 'At / Ta', desc: isEn ? 'Consonant' : 'व्यंजन वर्ण' },
                { glyph: selectedLang === 'santhali' ? 'ᱜ' : 'ग', sound: 'Ag / Ga', desc: isEn ? 'Guttural' : 'कंठ्य वर्ण' },
                { glyph: selectedLang === 'santhali' ? 'ᱝ' : 'ङ', sound: 'Ang / Nga', desc: isEn ? 'Nasal' : 'नासिक्य वर्ण' },
              ].map((char, i) => (
                <div
                  key={i}
                  style={{
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-surface-tint)',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)' }}>{char.desc} ({char.sound})</div>
                  <div
                    style={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      margin: '12px 0',
                      color: 'var(--color-forest)',
                      letterSpacing: '2px',
                    }}
                  >
                    {char.glyph}
                  </div>
                  <div
                    style={{
                      borderTop: '2px dashed #999',
                      borderBottom: '2px dashed #999',
                      padding: '10px 0',
                      color: '#AAA',
                      fontSize: '1.8rem',
                      letterSpacing: '8px',
                    }}
                  >
                    {char.glyph} • {char.glyph} • {char.glyph}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Signature Line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '20px',
            marginTop: '10px',
            fontSize: '0.85rem',
            color: 'var(--color-slate)',
          }}
        >
          <div>
            <strong>{isEn ? 'Evaluation Remarks:' : 'मूल्यांकन टिप्पणी:'}</strong>{' '}
            {isEn ? '☐ Excellent  ☐ Satisfactory  ☐ Needs Remedial Support' : '☐ उत्कृष्ट ☐ संतोषजनक ☐ उपचारात्मक शिक्षण आवश्यक'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '160px', borderBottom: '1px solid var(--color-slate)', marginBottom: '4px' }}></div>
            <div>{isEn ? 'Teacher Signature' : 'शिक्षक के हस्ताक्षर (Teacher Sign)'}</div>
          </div>
        </div>
      </div>

      {/* Parent Phone QR Scan Simulator Modal */}
      <ParentPhoneScanModal
        isOpen={showPhoneScanModal}
        onClose={() => setShowPhoneScanModal(false)}
        selectedLang={selectedLang}
        worksheetType={worksheetType}
      />
    </div>
  );
}
