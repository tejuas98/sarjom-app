import React, { useState } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { Printer, Download, RefreshCw, CheckCircle2, QrCode, Sparkles, BookCheck, Smartphone, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { ParentPhoneScanModal } from './ParentPhoneScanModal';

export function WorksheetStudio({ selectedLang }) {
  const [worksheetType, setWorksheetType] = useState('numeracy'); // 'numeracy' | 'matching' | 'tracing'
  const [schoolName, setSchoolName] = useState('राजकीय प्राथमिक विद्यालय, खूंटी (झारखंड)');
  const [studentAnswers, setStudentAnswers] = useState({});
  const [isScoreChecked, setIsScoreChecked] = useState(false);
  const [showPhoneScanModal, setShowPhoneScanModal] = useState(false);

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  // Filter items based on worksheet type
  const numberItems = TRIBAL_LEXICON.filter((i) => i.category === 'numbers').slice(0, 5);
  const wordItems = TRIBAL_LEXICON.filter((i) => ['animals', 'nature', 'greetings'].includes(i.category)).slice(0, 4);

  const handlePrint = () => {
    toast.info('प्रिंट संवाद खुल रहा है (Print / Save PDF)...');
    window.print();
  };

  const handleSelectAnswer = (qId, option) => {
    setStudentAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const checkInteractiveAnswers = () => {
    setIsScoreChecked(true);
    toast.success('अभ्यास पत्र जाँचा गया! बहुत बढ़िया!');
  };

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
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
              द्विभाषी अभ्यास पत्र जनरेटर (NIPUN Bilingual Worksheets)
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
            निपुण भारत दक्षता आधारित • हिंदी एवं {langMeta.name} भाषा में स्वतः निर्मित वर्कशीट
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
              onClick={() => {
                setWorksheetType('numeracy');
                setIsScoreChecked(false);
              }}
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
              संख्या ज्ञान (1-5)
            </button>
            <button
              onClick={() => {
                setWorksheetType('matching');
                setIsScoreChecked(false);
              }}
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
              शब्द मिलान (Matching)
            </button>
            <button
              onClick={() => {
                setWorksheetType('tracing');
                setIsScoreChecked(false);
              }}
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
              लिपि अनुरेखण (Tracing)
            </button>
          </div>

          <button onClick={() => setShowPhoneScanModal(true)} className="btn-brutal btn-forest" style={{ padding: '8px 14px', fontSize: '0.85rem' }} title="सिमुलेट करें: ग्रामीण निरक्षर माता-पिता का फोन स्कैन">
            <Smartphone size={16} />
            फोन स्कैन सिमुलेशन
          </button>

          <button onClick={handlePrint} className="btn-brutal btn-palash" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Printer size={16} />
            प्रिंट / PDF निर्यात
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
            borderBottom: '2.5px solid #1A2421',
            paddingBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              झारखंड शिक्षा परियोजना परिषद • सरजोम MTB-MLE कार्यक्रम
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: '4px 0', color: 'var(--color-slate)' }}>
              निपुण भारत बुनियादी शिक्षण अभ्यास पत्र (FLN Worksheet)
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-palash)', fontWeight: 700 }}>
              माध्यम: हिंदी + {langMeta.name} ({langMeta.badgeText})
            </div>
          </div>

          {/* QR Audio Companion Simulation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              border: '1.5px dashed var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            <QrCode size={36} color="var(--color-forest)" />
            <div style={{ fontSize: '0.72rem', lineHeight: 1.2 }}>
              <strong>ध्वनि साथी क्यूआर</strong>
              <br />
              स्कैन कर उच्चारण सुनें
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
          <div><strong>विद्यालय:</strong> {schoolName}</div>
          <div><strong>विद्यार्थी का नाम:</strong> ___________________</div>
          <div><strong>कक्षा:</strong> बालवाटिका / 1 / 2</div>
          <div><strong>दिनांक:</strong> {new Date().toLocaleDateString('hi-IN')}</div>
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
              अभ्यास 1: वस्तुओं को गिनें और सही जनजातीय संख्या नाम पर घेरा लगाएं / लिखें।
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
                        प्रश्न {idx + 1}: {item.hindi}
                      </div>
                      {/* Object Icons for Counting */}
                      <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                        {objectsArray.map((_, i) => (
                          <span key={i} title="वस्तु" style={{ display: 'inline-flex', alignItems: 'center' }}>
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
                        borderTop: '1px dashed #CCC',
                      }}
                    >
                      <div style={{ fontSize: '0.9rem' }}>
                        मातृभाषा शब्द: <strong style={{ color: 'var(--color-forest)', fontSize: '1.1rem' }}>{tribalName}</strong>
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
              अभ्यास 2: हिंदी शब्द का उसकी {langMeta.name} मातृभाषा शब्द से रेखा खींचकर मिलान करें।
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
              {/* Left column: Hindi words */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-slate)' }}>कॉलम A (हिंदी शब्द)</div>
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
                    }}
                  >
                    <span>{idx + 1}. {item.hindi}</span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--color-slate)', display: 'inline-block' }} />
                  </div>
                ))}
              </div>

              {/* Right column: Tribal words */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-forest)' }}>
                  कॉलम B ({langMeta.name} मातृभाषा)
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
              अभ्यास 3: लिपि वर्ण अनुरेखण अभ्यास (Trace the native glyphs along the dots).
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { glyph: selectedLang === 'santhali' ? 'ᱚ' : 'अ', sound: 'La / A', desc: 'पहला वर्ण' },
                { glyph: selectedLang === 'santhali' ? 'ᱛ' : 'त', sound: 'At / Ta', desc: 'व्यंजन वर्ण' },
                { glyph: selectedLang === 'santhali' ? 'ᱜ' : 'ग', sound: 'Ag / Ga', desc: 'कंठ्य वर्ण' },
                { glyph: selectedLang === 'santhali' ? 'ᱝ' : 'ङ', sound: 'Ang / Nga', desc: 'नासिक्य वर्ण' },
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
            borderTop: '1px solid #CCCCCC',
            paddingTop: '20px',
            marginTop: '10px',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <strong>मूल्यांकन टिप्पणी:</strong> ☐ उत्कृष्ट ☐ संतोषजनक ☐ उपचारात्मक शिक्षण आवश्यक
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '160px', borderBottom: '1px solid #000', marginBottom: '4px' }}></div>
            <div>शिक्षक के हस्ताक्षर (Teacher Sign)</div>
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
