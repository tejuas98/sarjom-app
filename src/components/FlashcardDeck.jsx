import React, { useState } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { voiceService } from '../services/voiceTranslationService';
import { Volume2, RotateCw, Play, CheckCircle2, Award, Sparkles, Filter } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export function FlashcardDeck({ selectedLang }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flippedCards, setFlippedCards] = useState({});
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answeredQuestion, setAnsweredQuestion] = useState(false);

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  const categories = [
    { id: 'all', label: 'सभी कार्ड्स (All)' },
    { id: 'greetings', label: 'अभिवादन (Greetings)' },
    { id: 'numbers', label: 'संख्याएँ (Numbers)' },
    { id: 'nature', label: 'प्रकृति (Nature)' },
    { id: 'animals', label: 'पशु-पक्षी (Animals)' },
    { id: 'family', label: 'परिवार (Family)' },
    { id: 'classroom', label: 'कक्षा निर्देश (Classroom)' },
  ];

  const filteredCards = TRIBAL_LEXICON.filter((card) => {
    if (selectedCategory === 'all') return true;
    return card.category === selectedCategory;
  });

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePlayAudio = (e, text, label) => {
    e.stopPropagation();
    toast.info(`उच्चारण: "${label}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  // Quiz Mode Logic
  const currentQuizCard = filteredCards[currentQuizIndex] || filteredCards[0];
  const generateQuizOptions = () => {
    if (!currentQuizCard) return [];
    const correctTribal = currentQuizCard[selectedLang];
    const correctVal = correctTribal.nativeOlChiki || correctTribal.native;

    const otherCards = TRIBAL_LEXICON.filter((c) => c.id !== currentQuizCard.id);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random()).slice(0, 3);

    const options = [
      { text: correctVal, isCorrect: true, phonetic: correctTribal.phoneticDeva },
      ...shuffledOthers.map((c) => {
        const t = c[selectedLang];
        return { text: t.nativeOlChiki || t.native, isCorrect: false, phonetic: t.phoneticDeva };
      }),
    ];

    return options.sort(() => 0.5 - Math.random());
  };

  const [quizOptions, setQuizOptions] = useState(generateQuizOptions());

  const handleSelectQuizOption = (option) => {
    if (answeredQuestion) return;
    setAnsweredQuestion(true);

    if (option.isCorrect) {
      setQuizScore((prev) => prev + 1);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      voiceService.playChime('success');
      toast.success('शाबाश! सही उत्तर! 👏');
    } else {
      toast.error('पुनः प्रयास करें!');
    }
  };

  const handleNextQuiz = () => {
    setAnsweredQuestion(false);
    const nextIdx = (currentQuizIndex + 1) % filteredCards.length;
    setCurrentQuizIndex(nextIdx);
    setTimeout(() => {
      setQuizOptions(generateQuizOptions());
    }, 50);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Bar */}
      <div
        className="card-brutal"
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
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
            दृश्य फ्लैशकार्ड व क्विज स्टूडियो ({langMeta.name})
          </h2>
        </div>

        {/* Mode Switcher: Browse vs Quiz */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsQuizMode(false)}
            className={`btn-brutal ${!isQuizMode ? 'btn-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            कार्ड गैलरी (Cards View)
          </button>
          <button
            onClick={() => {
              setIsQuizMode(true);
              setQuizOptions(generateQuizOptions());
            }}
            className={`btn-brutal ${isQuizMode ? 'btn-ochre' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            🎮 कक्षा क्विज मोड (Quiz Mode)
          </button>
        </div>
      </div>

      {/* Category Pills (for Browse mode) */}
      {!isQuizMode && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn-brutal"
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                backgroundColor: selectedCategory === cat.id ? 'var(--color-forest)' : '#FFFFFF',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--color-slate)',
                border: '1.5px solid var(--color-border)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* VIEW 1: FLASHCARDS GRID */}
      {!isQuizMode && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredCards.map((card) => {
            const tribalObj = card[selectedLang] || card.santhali;
            const nativeText = tribalObj.nativeOlChiki || tribalObj.native;
            const isFlipped = !!flippedCards[card.id];

            return (
              <div
                key={card.id}
                className={`flip-card-container ${isFlipped ? 'is-flipped' : ''}`}
                style={{ height: '280px', cursor: 'pointer' }}
                onClick={() => toggleFlip(card.id)}
              >
                <div className="flip-card-inner">
                  {/* FRONT: Hindi & Visual Motif */}
                  <div
                    className="flip-card-front"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: 'var(--border-thick)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge-tag badge-ochre">{card.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-muted)' }}>टैप कर पलटें</span>
                    </div>

                    <div style={{ margin: 'auto 0' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                        {card.category === 'animals' ? '🐘' : card.category === 'nature' ? '🌿' : card.category === 'numbers' ? '🔢' : '✨'}
                      </div>
                      <h3 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--color-slate)' }}>
                        {card.hindi}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)' }}>
                        {card.english}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-palash)', fontWeight: 600 }}>
                      🔄 क्लिक करें: {langMeta.name} रूपांतरण
                    </div>
                  </div>

                  {/* BACK: Tribal Script & Audio Playback */}
                  <div
                    className="flip-card-back"
                    style={{
                      backgroundColor: 'var(--color-forest-subtle)',
                      border: 'var(--border-thick)',
                      borderColor: 'var(--color-forest)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge-tag badge-forest">{langMeta.name}</span>
                      <RotateCw size={14} color="var(--color-forest)" />
                    </div>

                    <div style={{ margin: 'auto 0' }}>
                      <div
                        className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                        style={{
                          fontSize: '2rem',
                          fontWeight: 800,
                          color: 'var(--color-slate)',
                          lineHeight: 1.2,
                        }}
                      >
                        {nativeText}
                      </div>

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#0E5B37',
                        }}
                      >
                        🗣️ {tribalObj.phoneticDeva}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', fontStyle: 'italic' }}>
                        रोमन: {tribalObj.phoneticLatin}
                      </div>
                    </div>

                    {/* Audio Play Button on Back */}
                    <button
                      onClick={(e) => handlePlayAudio(e, tribalObj.audioText || tribalObj.phoneticDeva, nativeText)}
                      className="btn-brutal btn-palash"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
                    >
                      <Volume2 size={16} />
                      उच्चारण सुनें
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CLASSROOM QUIZ MODE */}
      {isQuizMode && currentQuizCard && (
        <div
          className="card-brutal"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            padding: '32px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Quiz Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge-tag badge-forest">
              निपुण मौखिक प्रश्नोत्तरी (FLN Quiz)
            </span>
            <div style={{ fontWeight: 700, color: 'var(--color-forest)', fontSize: '1rem' }}>
              स्कोर: {quizScore} अंक 🌟
            </div>
          </div>

          {/* Question Box */}
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: 'var(--color-ochre-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--color-ochre)',
            }}
          >
            <div style={{ fontSize: '0.9rem', color: '#8C5F08', fontWeight: 600 }}>
              निम्नलिखित शब्द का {langMeta.name} भाषा में सही रूप क्या है?
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '10px 0', color: 'var(--color-slate)' }}>
              "{currentQuizCard.hindi}"
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)' }}>
              ({currentQuizCard.english})
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {quizOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectQuizOption(opt)}
                disabled={answeredQuestion}
                className="btn-brutal"
                style={{
                  padding: '16px 12px',
                  fontSize: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  backgroundColor: answeredQuestion
                    ? opt.isCorrect
                      ? 'var(--color-forest-subtle)'
                      : '#FFF'
                    : '#FFF',
                  borderColor: answeredQuestion && opt.isCorrect ? 'var(--color-forest)' : 'var(--color-border)',
                }}
              >
                <span className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}>
                  {opt.text}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', fontWeight: 500 }}>
                  ({opt.phonetic})
                </span>
              </button>
            ))}
          </div>

          {/* Next Button */}
          {answeredQuestion && (
            <button
              onClick={handleNextQuiz}
              className="btn-brutal btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem', marginTop: '10px' }}
            >
              अगला प्रश्न ➔
            </button>
          )}
        </div>
      )}
    </div>
  );
}
