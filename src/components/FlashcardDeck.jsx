import React, { useState, useMemo } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { voiceService } from '../services/voiceTranslationService';
import { Volume2, RotateCw, Sparkles, Leaf, Hash, RotateCcw, CheckCircle2, XCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export function FlashcardDeck({ selectedLang, uiLang = 'hi' }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [flippedCards, setFlippedCards] = useState({});
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // { id, text, isCorrect }
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  const categories = [
    { id: 'all', label: t.fcCatAll },
    { id: 'greetings', label: t.fcCatGreetings },
    { id: 'numbers', label: t.fcCatNumbers },
    { id: 'nature', label: t.fcCatNature },
    { id: 'animals', label: t.fcCatAnimals },
    { id: 'family', label: t.fcCatFamily },
    { id: 'classroom', label: t.fcCatClassroom },
  ];

  const filteredCards = useMemo(() => {
    return TRIBAL_LEXICON.filter((card) => {
      if (selectedCategory === 'all') return true;
      return card.category === selectedCategory;
    });
  }, [selectedCategory]);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePlayAudio = (e, text, label) => {
    e.stopPropagation();
    toast.info(isEn ? `Pronunciation: "${label}"` : `उच्चारण: "${label}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  // Helper to extract tribal word data cleanly for selected language
  const getCardTribalData = (card) => {
    if (!card) return { native: '', phonetic: '', audio: '' };
    const langObj = card[selectedLang] || card.santhali || {};
    const native = selectedLang === 'santhali'
      ? (langObj.nativeOlChiki || langObj.native || card.hindi)
      : (langObj.native || card.hindi);
    const phonetic = langObj.phoneticDeva || langObj.phoneticLatin || '';
    const audio = langObj.audioText || phonetic || native;
    return { native, phonetic, audio };
  };

  // Safe current quiz card
  const safeIndex = currentQuizIndex < filteredCards.length ? currentQuizIndex : 0;
  const currentQuizCard = filteredCards[safeIndex] || filteredCards[0];

  // Deterministic PRNG based on card ID & question index
  const getCardSeed = (cardId, index) => {
    let hash = (index + 1) * 31337;
    for (let i = 0; i < (cardId || '').length; i++) {
      hash = (hash * 31 + cardId.charCodeAt(i)) & 0x7fffffff;
    }
    return hash;
  };

  // Fisher-Yates shuffle with deterministic seeded PRNG
  const seededShuffle = (arr, seed) => {
    const copy = [...arr];
    let s = seed;
    const nextRand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // 100% SYNCHRONOUS, DETERMINISTIC QUIZ OPTIONS VIA USEMEMO
  // Eliminates race conditions, desync, and stale previous-question options completely!
  const quizOptions = useMemo(() => {
    if (!currentQuizCard) return [];
    const correct = getCardTribalData(currentQuizCard);
    const seed = getCardSeed(currentQuizCard.id, safeIndex);

    // Pick 3 strictly unique distractors from the rest of the lexicon
    const otherCards = TRIBAL_LEXICON.filter((c) => c.id !== currentQuizCard.id);
    const shuffledOthers = seededShuffle(otherCards, seed)
      .filter((c) => {
        const d = getCardTribalData(c);
        return d.native && d.native !== correct.native;
      })
      .slice(0, 3);

    const rawOptions = [
      {
        id: currentQuizCard.id,
        text: correct.native,
        phonetic: correct.phonetic,
        audio: correct.audio,
        isCorrect: true,
      },
      ...shuffledOthers.map((c) => {
        const d = getCardTribalData(c);
        return {
          id: c.id,
          text: d.native,
          phonetic: d.phonetic,
          audio: d.audio,
          isCorrect: false,
        };
      }),
    ];

    // Shuffle options across all 4 positions evenly using Fisher-Yates
    return seededShuffle(rawOptions, seed + 999);
  }, [currentQuizCard?.id, selectedLang, safeIndex]);

  const handleSelectQuizOption = (option) => {
    if (selectedOption) return; // already answered
    setSelectedOption(option);

    if (option.audio) {
      voiceService.speakText(option.audio, 'hi-IN');
    }

    if (option.isCorrect) {
      setQuizScore((prev) => prev + 1);
      voiceService.playChime('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(isEn ? `Excellent! "${option.text}" is correct!` : `शाबाश! सही उत्तर: "${option.text}"`);
    } else {
      voiceService.playChime('error');
      const correctOpt = quizOptions.find((o) => o.isCorrect);
      toast.error(
        isEn
          ? `Incorrect! Correct answer is "${correctOpt?.text}"`
          : `गलत उत्तर! सही उत्तर "${correctOpt?.text}" है।`
      );
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    if (currentQuizIndex + 1 >= filteredCards.length) {
      setIsQuizFinished(true);
    } else {
      setCurrentQuizIndex((prev) => prev + 1);
    }
  };

  const handleResetQuiz = () => {
    setSelectedOption(null);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setIsQuizFinished(false);
    toast.info(isEn ? 'Quiz restarted!' : 'प्रश्नोत्तरी पुनः प्रारंभ की गई!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Bar */}
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
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate)' }}>
              {t.fcTitle} ({langMeta.name})
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {t.fcSubtitle}
            </p>
          </div>
        </div>

        {/* Mode Switcher: Browse vs Quiz */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              setIsQuizMode(false);
              setSelectedOption(null);
              setIsQuizFinished(false);
            }}
            className={`btn-brutal ${!isQuizMode ? 'btn-primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            {t.fcModeCards}
          </button>
          <button
            onClick={() => {
              setIsQuizMode(true);
              setSelectedOption(null);
              setCurrentQuizIndex(0);
              setQuizScore(0);
              setIsQuizFinished(false);
            }}
            className={`btn-brutal ${isQuizMode ? 'btn-ochre' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            {t.fcModeQuiz}
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
                backgroundColor: selectedCategory === cat.id ? 'var(--color-forest)' : 'var(--color-surface-card)',
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
            const tribalObj = card[selectedLang] || card.santhali || {};
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
                      backgroundColor: 'var(--color-surface-card)',
                      border: 'var(--border-thick)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge-tag badge-ochre">{card.category}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-muted)' }}>{t.fcFlipHint}</span>
                    </div>

                    <div style={{ margin: 'auto 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {card.category === 'nature' ? <Leaf size={24} color="var(--color-forest)" /> : card.category === 'numbers' ? <Hash size={24} color="var(--color-palash)" /> : <Sparkles size={24} color="#D97706" />}
                        </div>
                      </div>
                      <h3 style={{ fontSize: '1.4rem', margin: '4px 0', color: 'var(--color-slate)' }}>
                        {card.hindi}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)' }}>
                        {card.english}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-palash)', fontWeight: 600 }}>
                      {isEn ? `Tap: View ${langMeta.name}` : `क्लिक करें: ${langMeta.name} रूपांतरण`}
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
                          color: 'var(--color-forest-light)',
                        }}
                      >
                        {tribalObj.phoneticDeva}
                      </div>

                      {tribalObj.phoneticLatin && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', fontStyle: 'italic' }}>
                          Roman: {tribalObj.phoneticLatin}
                        </div>
                      )}
                    </div>

                    {/* Audio Play Button on Back */}
                    <button
                      onClick={(e) => handlePlayAudio(e, tribalObj.audioText || tribalObj.phoneticDeva, nativeText)}
                      className="btn-brutal btn-palash"
                      style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
                    >
                      <Volume2 size={16} />
                      {isEn ? 'Listen Pronunciation' : 'उच्चारण सुनें'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CLASSROOM QUIZ MODE */}
      {isQuizMode && isQuizFinished && (
        <div
          className="card-brutal"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            padding: '40px 32px',
            backgroundColor: 'var(--color-surface-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={40} color="#D97706" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--color-slate)' }}>
              {isEn ? 'Quiz Completed!' : 'प्रश्नोत्तरी पूर्ण हुई!'}
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? `You finished all ${filteredCards.length} ${langMeta.name} vocabulary questions.`
                : `आपने ${langMeta.name} शब्दावली के सभी ${filteredCards.length} प्रश्न हल कर लिए हैं।`}
            </p>
          </div>

          <div
            style={{
              padding: '20px 36px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEn ? 'Your Final Score' : 'आपका अंतिम स्कोर'}
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--color-slate)', lineHeight: 1 }}>
              {quizScore} <span style={{ fontSize: '1.5rem', color: 'var(--color-slate-muted)', fontWeight: 600 }}>/ {filteredCards.length}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
              {Math.round((quizScore / filteredCards.length) * 100)}% {isEn ? 'accuracy' : 'सटीकता'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleResetQuiz}
              className="btn-brutal btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                backgroundColor: 'var(--color-forest)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RotateCcw size={16} />
              <span>{isEn ? 'Play Again' : 'पुनः खेलें'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsQuizMode(false);
                setIsQuizFinished(false);
              }}
              className="btn-brutal"
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-slate)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
              }}
            >
              <span>{isEn ? 'Browse Flashcards' : 'फ्लैशकार्ड देखें'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ QUESTION */}
      {isQuizMode && !isQuizFinished && currentQuizCard && (
        <div
          className="card-brutal"
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
            padding: '32px',
            backgroundColor: 'var(--color-surface-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Quiz Header with Progress & Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag badge-forest">
                {isEn ? 'NIPUN Oral Quiz' : 'निपुण मौखिक प्रश्नोत्तरी'}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-muted)', padding: '3px 8px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-tint)' }}>
                {isEn ? `Q ${safeIndex + 1} of ${filteredCards.length}` : `प्रश्न ${safeIndex + 1} / ${filteredCards.length}`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontWeight: 800, color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                {t.fcQuizScore} {quizScore}
              </div>
              <button
                type="button"
                onClick={handleResetQuiz}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-slate-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={isEn ? 'Restart Quiz' : 'प्रश्नोत्तरी पुनः शुरू करें'}
              >
                <RotateCcw size={16} />
              </button>
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
            <div style={{ fontSize: '0.86rem', color: '#8C5F08', fontWeight: 600 }}>
              {isEn
                ? `What is the correct ${langMeta.name} word for:`
                : `निम्नलिखित शब्द का ${langMeta.name} भाषा में सही रूप क्या है?`}
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
            {quizOptions.map((opt, i) => {
              const isSelected = selectedOption && (selectedOption.id === opt.id || selectedOption.text === opt.text);
              const isAnswered = !!selectedOption;

              // Compute button styling
              let bgColor = 'var(--color-surface-card)';
              let borderColor = 'var(--color-border)';
              let textColor = 'var(--color-slate)';
              let opacity = 1;

              if (isAnswered) {
                if (isSelected && opt.isCorrect) {
                  // User chose correctly
                  bgColor = 'rgba(16, 185, 129, 0.16)';
                  borderColor = '#10B981';
                  textColor = '#10B981';
                } else if (isSelected && !opt.isCorrect) {
                  // User chose wrongly
                  bgColor = 'rgba(239, 68, 68, 0.14)';
                  borderColor = '#EF4444';
                  textColor = '#EF4444';
                } else if (!isSelected && opt.isCorrect) {
                  // The actual correct answer when user was wrong
                  bgColor = 'rgba(16, 185, 129, 0.08)';
                  borderColor = '#10B981';
                  textColor = '#10B981';
                } else {
                  // Unselected distractors fade out
                  bgColor = 'var(--color-surface-tint)';
                  borderColor = 'transparent';
                  textColor = 'var(--color-slate-muted)';
                  opacity = 0.45;
                }
              }

              return (
                <button
                  key={opt.id || i}
                  onClick={() => handleSelectQuizOption(opt)}
                  disabled={isAnswered}
                  className="btn-brutal"
                  style={{
                    padding: '16px 14px',
                    fontSize: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    color: textColor,
                    opacity: opacity,
                    borderRadius: 'var(--radius-lg)',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'} style={{ fontWeight: 800, fontSize: '1.3rem' }}>
                    {opt.text}
                  </span>
                  {opt.phonetic && (
                    <span style={{ fontSize: '0.80rem', color: isAnswered && opt.isCorrect ? '#10B981' : isAnswered && isSelected ? '#EF4444' : 'var(--color-slate-muted)', fontWeight: 500 }}>
                      ({opt.phonetic})
                    </span>
                  )}

                  {/* Immediate Badges */}
                  {isAnswered && isSelected && opt.isCorrect && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                      ✓ {isEn ? 'Your Choice: Correct (+1)' : 'आपका उत्तर: सही (+1 अंक)'}
                    </span>
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#EF4444', marginTop: '2px' }}>
                      ✗ {isEn ? 'Your Choice: Incorrect (0)' : 'आपका चयन: गलत उत्तर (0 अंक)'}
                    </span>
                  )}
                  {isAnswered && !isSelected && opt.isCorrect && (
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                      ✓ {isEn ? 'Correct Answer' : 'सही उत्तर यह है'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explicit Result Banner below options */}
          {selectedOption && (
            <div
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: selectedOption.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1.5px solid ${selectedOption.isCorrect ? '#10B981' : '#EF4444'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: selectedOption.isCorrect ? '#10B981' : '#EF4444',
                fontWeight: 700,
                fontSize: '0.92rem',
              }}
            >
              {selectedOption.isCorrect ? (
                <>
                  <CheckCircle2 size={20} color="#10B981" />
                  <span>
                    {isEn
                      ? `Excellent! "${selectedOption.text}" is correct (+1 point).`
                      : `शाबाश! "${selectedOption.text}" बिल्कुल सही उत्तर है (+1 अंक जोड़ा गया)।`}
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={20} color="#EF4444" />
                  <span>
                    {isEn
                      ? `Incorrect! Your choice was wrong. The true correct answer is highlighted in green above (0 points added).`
                      : `गलत उत्तर! आपका चयन सही नहीं था। सही उत्तर ऊपर हरे रंग में दिखाया गया है (कोई अंक नहीं जुड़ा)।`}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Next Button */}
          {selectedOption && (
            <button
              id="btn-quiz-next"
              type="button"
              onClick={handleNextQuiz}
              className="btn-brutal btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: 'var(--color-forest)',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(14, 91, 55, 0.25)',
              }}
            >
              <span>{safeIndex + 1 >= filteredCards.length ? (isEn ? 'View Final Results ➔' : 'अंतिम परिणाम देखें ➔') : t.fcNextQuestion}</span>
              <span>➔</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
