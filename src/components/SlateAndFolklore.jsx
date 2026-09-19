import React, { useState, useRef, useEffect } from 'react';
import { FOLK_STORIES } from '../data/folkStories';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { voiceService } from '../services/voiceTranslationService';
import {
  Eraser,
  PenTool,
  Volume2,
  Sparkles,
  BookOpen,
  Award,
  RotateCcw,
  Palette,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export function SlateAndFolklore({ selectedLang }) {
  const [activeSubTab, setActiveSubTab] = useState('slate'); // 'slate' | 'stories'
  const [selectedStoryId, setSelectedStoryId] = useState(FOLK_STORIES[0].id);
  const [activeStoryLineIndex, setActiveStoryLineIndex] = useState(null);

  // Slate Canvas State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chalkColor, setChalkColor] = useState('#FFFFFF');
  const [chalkSize, setChalkSize] = useState(4);
  const [selectedTemplateGlyph, setSelectedTemplateGlyph] = useState('ᱚ');

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;
  const currentStory = FOLK_STORIES.find((s) => s.id === selectedStoryId) || FOLK_STORIES[0];

  // Initialize Canvas
  useEffect(() => {
    if (activeSubTab === 'slate' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeSubTab]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = chalkColor;
    ctx.lineWidth = chalkSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSlate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast.info('स्लेट साफ की गई!');
  };

  const handlePraiseStudent = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
    voiceService.playChime('success');
    toast.success('शाबाश! बहुत सुंदर लिखावट!');
  };

  const playStoryLineAudio = (line, idx) => {
    setActiveStoryLineIndex(idx);
    const tribalData = line[selectedLang] || line.santhali;
    const textToSpeak = tribalData.audio || tribalData.phoneticDeva;
    toast.info(`कहानी वाचन: लाइन ${idx + 1}`);
    voiceService.speakText(textToSpeak, 'hi-IN', () => {
      setActiveStoryLineIndex(null);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Sub-Tab Switcher */}
      <div
        className="card-brutal"
        style={{
          padding: '16px 20px',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} color="var(--color-palash)" />
          <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
            डिजिटल स्लेट व लोककथा वाचन (Interactive Slate & Folklore)
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-bg)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
          }}
        >
          <button
            onClick={() => setActiveSubTab('slate')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeSubTab === 'slate' ? 'var(--color-forest)' : 'transparent',
              color: activeSubTab === 'slate' ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <PenTool size={14} />
            डिजिटल चॉक-स्लेट (Digital Slate)
          </button>
          <button
            onClick={() => setActiveSubTab('stories')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeSubTab === 'stories' ? 'var(--color-palash)' : 'transparent',
              color: activeSubTab === 'stories' ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BookOpen size={14} />
            झारखंडी लोककथाएँ (Folk Tales)
          </button>
        </div>
      </div>

      {/* VIEW 1: DIGITAL SLATE (चॉक-स्लेट) */}
      {activeSubTab === 'slate' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Main Slate Frame */}
          <div
            className="card-brutal"
            style={{
              padding: '20px',
              backgroundColor: '#1E2522', // Authentic black slate chalkboard
              borderColor: '#38433F',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PenTool size={16} color="#E8F4ED" />
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#E8F4ED' }}>
                  प्राथमिक छात्र पट्टी (Tablet Blackboard)
                </span>
              </div>
              <span className="badge-tag badge-ochre">टच / पेंसिल से लिखें</span>
            </div>

            {/* Slate Canvas with Traceable Guide */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '340px',
                backgroundColor: '#151B18',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed #42524C',
                overflow: 'hidden',
                cursor: 'crosshair',
                touchAction: 'none',
              }}
            >
              {/* Background faint watermark letter for tracing */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11rem',
                  fontWeight: 900,
                  color: 'rgba(255, 255, 255, 0.08)',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  fontFamily: selectedLang === 'santhali' ? 'var(--font-olchiki)' : 'var(--font-deva)',
                }}
              >
                {selectedTemplateGlyph}
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={340}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
              />
            </div>

            {/* Slate Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              {/* Chalk Color Palette */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#A2B3AC' }}>चॉक रंग:</span>
                {[
                  { color: '#FFFFFF', label: 'सफेद' },
                  { color: '#FFEB3B', label: 'पीला' },
                  { color: '#FF7043', label: 'पलाश' },
                  { color: '#81C784', label: 'हरा' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setChalkColor(c.color)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c.color,
                      border: chalkColor === c.color ? '2px solid #FFF' : '1px solid #444',
                      cursor: 'pointer',
                      transform: chalkColor === c.color ? 'scale(1.2)' : 'none',
                      boxShadow: chalkColor === c.color ? '0 0 6px rgba(255,255,255,0.8)' : 'none',
                    }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={clearSlate}
                  className="btn-brutal"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.82rem',
                    backgroundColor: '#2A3430',
                    color: '#FFF',
                    borderColor: '#4A5B54',
                  }}
                >
                  <Eraser size={14} />
                  स्लेट पोंछें
                </button>

                <button
                  onClick={handlePraiseStudent}
                  className="btn-brutal btn-ochre"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  <Award size={14} />
                  शाबाशी दें (Praise)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tracing Glyph Picker */}
          <div className="card-brutal" style={{ padding: '24px', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Palette size={18} color="var(--color-forest)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>अनुरेखण वर्ण चयन (Template Glyphs)</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', margin: 0 }}>
                स्लेट पर छात्र को अभ्यास कराने हेतु पृष्ठभूमि में अक्षरों और संख्याओं का चयन करें:
              </p>
            </div>

            {/* Ol Chiki / Native Script Glyphs */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-forest)', marginBottom: '8px' }}>
                मातृभाषा वर्णमाला ({langMeta.name}):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {(selectedLang === 'santhali'
                  ? ['ᱚ', 'ᱛ', 'ᱜ', 'ᱝ', 'ᱞ', 'ᱟ', 'ᱠ', 'ᱡ']
                  : ['अ', 'आ', 'इ', 'क', 'ख', 'ग', 'म', 'न']
                ).map((glyph) => (
                  <button
                    key={glyph}
                    onClick={() => {
                      setSelectedTemplateGlyph(glyph);
                      clearSlate();
                      toast.info(`अनुरेखण अक्षर: "${glyph}"`);
                    }}
                    className="btn-brutal"
                    style={{
                      padding: '12px 6px',
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      backgroundColor: selectedTemplateGlyph === glyph ? 'var(--color-forest-subtle)' : 'var(--color-surface-card)',
                      borderColor: selectedTemplateGlyph === glyph ? 'var(--color-forest)' : 'var(--color-border)',
                      color: selectedTemplateGlyph === glyph ? 'var(--color-forest)' : 'var(--color-slate)',
                    }}
                  >
                    {glyph}
                  </button>
                ))}
              </div>
            </div>

            {/* Numerals */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-palash)', marginBottom: '8px' }}>
                संख्या अनुरेखण (1-5):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {['1', '2', '3', '4', '5'].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setSelectedTemplateGlyph(num);
                      clearSlate();
                      toast.info(`अनुरेखण अंक: "${num}"`);
                    }}
                    className="btn-brutal"
                    style={{
                      padding: '10px 4px',
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      backgroundColor: selectedTemplateGlyph === num ? 'var(--color-palash-subtle)' : 'var(--color-surface-card)',
                      borderColor: selectedTemplateGlyph === num ? 'var(--color-palash)' : 'var(--color-border)',
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <strong>शिक्षक टिप:</strong> पहले बच्चे की उंगली पकड़कर अक्षर पर घुमाएं, फिर बच्चे को स्वयं चॉक से रेखाएं खींचने दें।
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FOLK STORIES NARRATION */}
      {activeSubTab === 'stories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Left Column: Story Picker & Summary */}
          <div className="card-brutal" style={{ padding: '24px', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--color-palash)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>झारखंड जनजातीय लोककथाएँ (Tribal Folklore)</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FOLK_STORIES.map((story) => {
                const isSelected = story.id === selectedStoryId;
                return (
                  <button
                    key={story.id}
                    onClick={() => {
                      setSelectedStoryId(story.id);
                      setActiveStoryLineIndex(null);
                    }}
                    className="btn-brutal"
                    style={{
                      padding: '14px 16px',
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'var(--color-forest-subtle)' : 'var(--color-surface-card)',
                      borderColor: isSelected ? 'var(--color-forest)' : 'var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--color-forest)' : 'var(--color-slate)' }}>
                      {story.titleHindi}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)' }}>
                      विषय: {story.theme} • {story.grade}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Moral Box */}
            <div
              style={{
                backgroundColor: 'var(--color-ochre-subtle)',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--color-ochre)',
              }}
            >
              <div style={{ fontWeight: 700, color: '#8C5F08', fontSize: '0.85rem' }}>
                कथा की सीख (Moral of the Story):
              </div>
              <div style={{ fontSize: '0.9rem', color: '#523702', marginTop: '4px' }}>
                "{currentStory.moralHindi}"
              </div>
            </div>
          </div>

          {/* Right Column: Line-by-Line Bilingual Audio Reader */}
          <div
            className="card-brutal"
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <span className="badge-tag badge-forest" style={{ marginBottom: '6px' }}>
                द्विभाषी वाचन • {langMeta.name}
              </span>
              <h2 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--color-slate)' }}>
                {currentStory.titleHindi}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentStory.lines.map((line, idx) => {
                const tribalObj = line[selectedLang] || line.santhali;
                const isPlayingThisLine = activeStoryLineIndex === idx;

                return (
                  <div
                    key={line.id}
                    style={{
                      backgroundColor: isPlayingThisLine ? 'var(--color-palash-subtle)' : 'var(--color-surface-card)',
                      border: isPlayingThisLine ? '2px solid var(--color-palash)' : '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'var(--transition-smooth)',
                      boxShadow: isPlayingThisLine ? 'var(--shadow-hover)' : 'var(--shadow-card)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
                        पंक्ति {idx + 1}
                      </span>
                      <button
                        onClick={() => playStoryLineAudio(line, idx)}
                        className={`btn-brutal ${isPlayingThisLine ? 'btn-palash' : 'btn-subtle'}`}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Volume2 size={14} className={isPlayingThisLine ? 'audio-pulse' : ''} />
                        {isPlayingThisLine ? 'बज रहा है...' : 'कथा सुनें'}
                      </button>
                    </div>

                    {/* Hindi Line */}
                    <div style={{ fontSize: '0.95rem', color: 'var(--color-slate)', fontWeight: 500 }}>
                      हिंदी: {line.hindi}
                    </div>

                    {/* Tribal Script */}
                    <div
                      className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'var(--color-forest)',
                        lineHeight: 1.3,
                      }}
                    >
                      {tribalObj.nativeOlChiki || tribalObj.native}
                    </div>

                    {/* Teacher Phonetic Guide */}
                    <div style={{ fontSize: '0.82rem', color: '#8C5F08', fontStyle: 'italic' }}>
                      उच्चारण: {tribalObj.phoneticDeva}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
