import React, { useState, useMemo } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { voiceService } from '../services/voiceTranslationService';
import {
  Printer,
  RefreshCw,
  Volume2,
  Check,
  CheckCircle2,
  Sparkles,
  Star,
  RotateCcw,
  BookOpen,
  Hash,
  PenTool,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export function WorksheetStudio({ selectedLang, uiLang = 'hi' }) {
  // Exercise type: 'matching' | 'numeracy' | 'fillblanks' | 'tracing'
  const [worksheetType, setWorksheetType] = useState('matching');
  const [gradeLevel, setGradeLevel] = useState('grade1');
  const [seed, setSeed] = useState(1);

  // Interactive state
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState({}); // { [leftId]: rightId }
  const [interactiveAnswers, setInteractiveAnswers] = useState({});
  const [isScoreEvaluated, setIsScoreEvaluated] = useState(false);

  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  // Extract tribal word data cleanly
  const getTribalData = (item) => {
    if (!item) return { native: '', phonetic: '', audio: '' };
    const langObj = item[selectedLang] || item.santhali || {};
    const native = selectedLang === 'santhali'
      ? (langObj.nativeOlChiki || langObj.native || item.hindi)
      : (langObj.native || item.hindi);
    const phonetic = langObj.phoneticDeva || langObj.phoneticLatin || '';
    const audio = langObj.audioText || phonetic || native;
    return { native, phonetic, audio };
  };

  // 1. Matching Items (Concrete nouns only)
  const matchingItems = useMemo(() => {
    const concrete = TRIBAL_LEXICON.filter((i) =>
      ['animals', 'nature', 'family', 'numbers'].includes(i.category)
    );
    const offset = (seed * 3) % Math.max(1, concrete.length - 4);
    return concrete.slice(offset, offset + 5);
  }, [seed]);

  // Shuffled right column for matching
  const matchingRightColumn = useMemo(() => {
    const list = [...matchingItems];
    return list.sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) + seed * 5) % 11;
      const hashB = (b.id.charCodeAt(0) + seed * 5) % 11;
      return hashA - hashB;
    });
  }, [matchingItems, seed]);

  // 2. Numeracy Items (Numbers 1-5 or 1-10)
  const numberItems = useMemo(() => {
    const nums = TRIBAL_LEXICON.filter((i) => i.category === 'numbers' && i.numeral <= 10);
    const offset = (seed * 2) % Math.max(1, nums.length - 4);
    return nums.slice(offset, offset + 5);
  }, [seed]);

  // 3. Sentence Practice contextual questions
  const sentenceQuestions = useMemo(() => {
    if (selectedLang === 'santhali') {
      return [
        {
          id: 'sq_1',
          hindiPrompt: 'हाथी जंगल में रहता है।',
          englishPrompt: 'The elephant lives in the forest.',
          sentencePre: '',
          sentencePost: ' ᱵᱤᱨ ᱨᱮ ᱛᱟᱦᱮᱸᱱᱟ᱾',
          correct: 'ᱦᱟᱹᱛᱤ',
          phonetic: 'Hāti',
          options: ['ᱦᱟᱹᱛᱤ', 'ᱥᱮᱛᱟ', 'ᱦᱟᱹᱠᱩ'],
        },
        {
          id: 'sq_2',
          hindiPrompt: 'मुझे पानी पीना है।',
          englishPrompt: 'I want to drink water.',
          sentencePre: 'ᱤᱧ ᱫᱚ ',
          sentencePost: ' ᱧᱩ ᱥᱟᱱᱟᱹᱧᱟ᱾',
          correct: 'ᱫᱟᱜ',
          phonetic: 'Dāk',
          options: ['ᱫᱟᱜ', 'ᱫᱟᱠᱟ', 'ᱫᱟᱨᱮ'],
        },
        {
          id: 'sq_3',
          hindiPrompt: 'पक्षी पेड़ की डाली पर बैठता है।',
          englishPrompt: 'The bird sits on the tree.',
          sentencePre: 'ᱪᱮᱬᱮ ',
          sentencePost: ' ᱨᱮ ᱫᱩᱲᱩᱵᱼᱟ᱾',
          correct: 'ᱫᱟᱨᱮ',
          phonetic: 'Dāre',
          options: ['ᱫᱟᱨᱮ', 'ᱚᱲᱟᱜ', 'ᱜᱟᱰᱟ'],
        },
      ];
    }
    if (selectedLang === 'ho') {
      return [
        {
          id: 'sq_1',
          hindiPrompt: 'हाथी जंगल में रहता है।',
          englishPrompt: 'The elephant lives in the forest.',
          sentencePre: '',
          sentencePost: ' बिर रे ताइना।',
          correct: 'हाती',
          phonetic: 'Hāti',
          options: ['हाती', 'सेता', 'हाकु'],
        },
        {
          id: 'sq_2',
          hindiPrompt: 'मुझे पानी पीना है।',
          englishPrompt: 'I want to drink water.',
          sentencePre: 'इंग ',
          sentencePost: ' नू सनांग-तन्या।',
          correct: 'दाः',
          phonetic: 'Da-ah',
          options: ['दाः', 'मंडी', 'दारु'],
        },
        {
          id: 'sq_3',
          hindiPrompt: 'पक्षी पेड़ पर बैठता है।',
          englishPrompt: 'The bird sits on the tree.',
          sentencePre: 'चेणे ',
          sentencePost: ' रे दुब तन्या।',
          correct: 'दारु',
          phonetic: 'Daru',
          options: ['दारु', 'ओड़ाः', 'गड़ा'],
        },
      ];
    }
    if (selectedLang === 'mundari') {
      return [
        {
          id: 'sq_1',
          hindiPrompt: 'हाथी जंगल में रहता है।',
          englishPrompt: 'The elephant lives in the forest.',
          sentencePre: '',
          sentencePost: ' बीर रे तइना।',
          correct: 'हाती',
          phonetic: 'Hāti',
          options: ['हाती', 'सेता', 'हाकु'],
        },
        {
          id: 'sq_2',
          hindiPrompt: 'मुझे पानी पीना है।',
          englishPrompt: 'I want to drink water.',
          sentencePre: 'आईंग ',
          sentencePost: ' नू सनांग-तन्या।',
          correct: 'दाः',
          phonetic: 'Da-ah',
          options: ['दाः', 'मंडी', 'दारु'],
        },
        {
          id: 'sq_3',
          hindiPrompt: 'पक्षी पेड़ पर बैठता है।',
          englishPrompt: 'The bird sits on the tree.',
          sentencePre: 'चेणें ',
          sentencePost: ' रे दुब तना।',
          correct: 'दारु',
          phonetic: 'Daru',
          options: ['दारु', 'ओड़ाः', 'गड़ा'],
        },
      ];
    }
    // Sadri
    return [
      {
        id: 'sq_1',
        hindiPrompt: 'हाथी जंगल में रहता है।',
        englishPrompt: 'The elephant lives in the forest.',
        sentencePre: '',
        sentencePost: ' जंगल मे रहेला।',
        correct: 'हाथी',
        phonetic: 'Hathi',
        options: ['हाथी', 'कुकुर', 'माछ'],
      },
      {
        id: 'sq_2',
        hindiPrompt: 'मुझे पानी पीना है।',
        englishPrompt: 'I want to drink water.',
        sentencePre: 'मोके ',
        sentencePost: ' पिएक मन करत हे।',
        correct: 'पानी',
        phonetic: 'Pani',
        options: ['पानी', 'भात', 'गाछ'],
      },
      {
        id: 'sq_3',
        hindiPrompt: 'चिड़िया पेड़ पर बैठती है।',
        englishPrompt: 'The bird sits on the tree.',
        sentencePre: 'चिरई ',
        sentencePost: ' ऊपर बैसेला।',
        correct: 'गाछ',
        phonetic: 'Gaachh',
        options: ['गाछ', 'घर', 'नदी'],
      },
    ];
  }, [selectedLang]);

  // 4. Script Tracing Glyphs
  const tracingGlyphs = useMemo(() => {
    if (selectedLang === 'santhali') {
      return [
        { char: 'ᱚ', name: 'La (Vowel 1)', sound: 'A / La' },
        { char: 'ᱛ', name: 'At (Consonant)', sound: 'Ta / At' },
        { char: 'ᱜ', name: 'Ag (Guttural)', sound: 'Ga / Ag' },
        { char: 'ᱝ', name: 'Ang (Nasal)', sound: 'Nga / Ang' },
      ];
    }
    if (selectedLang === 'ho') {
      return [
        { char: '𑢹', name: 'Ho Ha', sound: 'Ha' },
        { char: '𑣉', name: 'Ho O', sound: 'O' },
        { char: '𑢵', name: 'Ho Da', sound: 'Da' },
        { char: '𑢤', name: 'Ho Ba', sound: 'Ba' },
      ];
    }
    return [
      { char: 'अ', name: 'स्वर (A)', sound: 'A' },
      { char: 'क', name: 'व्यंजन (Ka)', sound: 'Ka' },
      { char: 'म', name: 'व्यंजन (Ma)', sound: 'Ma' },
      { char: 'द', name: 'व्यंजन (Da)', sound: 'Da' },
    ];
  }, [selectedLang]);

  // Actions
  const handleShuffle = () => {
    setSeed((prev) => prev + 1);
    setMatchedPairs({});
    setMatchingSelectedLeft(null);
    setInteractiveAnswers({});
    setIsScoreEvaluated(false);
    toast.success(isEn ? 'Generated fresh exercise!' : 'नया अभ्यास तैयार किया गया!');
  };

  const handlePrint = () => {
    toast.info(isEn ? 'Opening print dialog...' : 'प्रिंट संवाद खुल रहा है...');
    window.print();
  };

  const handleSpeak = (text, label) => {
    voiceService.speakText(text, 'hi-IN');
  };

  // Tap-to-pair matching handler
  const handleLeftSelect = (item) => {
    if (matchedPairs[item.id]) return;
    setMatchingSelectedLeft(item);
    voiceService.playChime('click');
  };

  const handleRightSelect = (item) => {
    if (!matchingSelectedLeft) {
      toast.info(isEn ? 'Select a word on the left first' : 'पहले बायीं ओर से एक शब्द चुनें');
      return;
    }

    if (matchingSelectedLeft.id === item.id) {
      const newMatched = { ...matchedPairs, [matchingSelectedLeft.id]: item.id };
      setMatchedPairs(newMatched);
      setMatchingSelectedLeft(null);
      voiceService.playChime('success');
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');

      if (Object.keys(newMatched).length === matchingItems.length) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      voiceService.playChime('error');
      toast.error(isEn ? 'Try again!' : 'गलत मिलान! पुनः प्रयास करें।');
    }
  };

  const handleSelectSentenceWord = (qId, option) => {
    setInteractiveAnswers((prev) => ({ ...prev, [qId]: option }));
    voiceService.playChime('click');
  };

  const handleCheckAnswers = () => {
    setIsScoreEvaluated(true);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.55 } });
    voiceService.playChime('success');
    toast.success(t.wsCheckedToast);
  };

  const handleReset = () => {
    setMatchedPairs({});
    setMatchingSelectedLeft(null);
    setInteractiveAnswers({});
    setIsScoreEvaluated(false);
    toast.info(isEn ? 'Reset completed' : 'अभ्यास रीसेट हुआ');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ==================================================================== */}
      {/* 1. CLEAN, SLEEK TOP HEADER (ZERO NESTED BOXES)                      */}
      {/* ==================================================================== */}
      <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--color-slate)', letterSpacing: '-0.02em' }}>
              {t.wsTitle}
            </h1>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: 'var(--color-forest-subtle)',
                color: 'var(--color-forest)',
                border: '1px solid var(--color-forest-border)',
              }}
            >
              {langMeta.name} ({langMeta.badgeText})
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
            {t.wsSubtitle}
          </p>
        </div>

        {/* Action Controls: Grade + Shuffle + Print */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-slate)',
              fontSize: '0.84rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="grade1">{isEn ? 'Class 1' : 'कक्षा 1'}</option>
            <option value="grade2">{isEn ? 'Class 2' : 'कक्षा 2'}</option>
            <option value="grade3">{isEn ? 'Class 3' : 'कक्षा 3'}</option>
          </select>

          <button
            type="button"
            onClick={handleShuffle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-slate)',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={t.wsShuffleBtn}
          >
            <RefreshCw size={14} />
            <span>{t.wsShuffleBtn}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: 'var(--color-palash)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(194, 65, 12, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Printer size={15} />
            <span>{t.wsPrintBtn}</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MINIMALIST SEGMENTED TABS (CLEAN & HORIZONTAL)                    */}
      {/* ==================================================================== */}
      <nav
        className="no-print"
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'matching', label: t.wsTypeMatching, icon: Layers },
          { id: 'numeracy', label: t.wsTypeNumeracy, icon: Hash },
          { id: 'fillblanks', label: t.wsTypeFillBlanks, icon: BookOpen },
          { id: 'tracing', label: t.wsTypeTracing, icon: PenTool },
        ].map((tab) => {
          const isActive = worksheetType === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setWorksheetType(tab.id);
                setIsScoreEvaluated(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: isActive ? 'var(--color-forest)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-slate-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <TabIcon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================================================================== */}
      {/* 3. THE WORKSHEET CANVAS (AIRY, AESTHETIC, NEVER BOX-IN-BOX)          */}
      {/* ==================================================================== */}
      <main
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        {/* Printable Official Header (Shows when printed or on page) */}
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.wsEmblemGovt}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate)', margin: '4px 0 2px 0' }}>
                {worksheetType === 'matching' && (isEn ? 'Exercise 1: Word & Picture Association' : 'अभ्यास 1: शब्द एवं चित्र मिलान')}
                {worksheetType === 'numeracy' && (isEn ? 'Exercise 2: Foundational Numeracy & Counting' : 'अभ्यास 2: बुनियादी संख्या ज्ञान एवं गिनती')}
                {worksheetType === 'fillblanks' && (isEn ? 'Exercise 3: Bilingual Sentence Practice' : 'अभ्यास 3: द्विभाषी वाक्य रचना अभ्यास')}
                {worksheetType === 'tracing' && (isEn ? 'Exercise 4: Orthographic Handwriting Tracing' : 'अभ्यास 4: लिपि बनावट एवं हस्तलेखन')}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-palash)', fontWeight: 600 }}>
                {isEn ? `Medium: Hindi + ${langMeta.name}` : `माध्यम: हिंदी + ${langMeta.name}`}
              </div>
            </div>

            {/* Score & Evaluation Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-tint)' }}>
              <Star size={15} color="#EAB308" fill="#EAB308" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                {worksheetType === 'matching' && `${Object.keys(matchedPairs).length} / ${matchingItems.length}`}
                {worksheetType === 'fillblanks' && `${Object.keys(interactiveAnswers).length} / ${sentenceQuestions.length}`}
                {worksheetType === 'numeracy' && `${numberItems.length} items`}
                {worksheetType === 'tracing' && `${tracingGlyphs.length} glyphs`}
              </span>
              <button
                type="button"
                onClick={handleReset}
                style={{ background: 'none', border: 'none', color: 'var(--color-slate-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title={t.wsResetBtn}
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* EXERCISE 1: WORD MATCHING (AESTHETIC 2-COLUMN BOARD)              */}
        {/* ================================================================== */}
        {worksheetType === 'matching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? 'Tap a word in Column A, then tap its mother-tongue translation in Column B.'
                : 'कॉलम A से एक शब्द चुनें, फिर कॉलम B में उसके सही मातृभाषा शब्द पर टैप करें।'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Left: Column A */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-slate-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' }}>
                  {isEn ? 'Column A (Hindi / English)' : 'कॉलम A (हिंदी शब्द)'}
                </div>

                {matchingItems.map((item, idx) => {
                  const isSelected = matchingSelectedLeft?.id === item.id;
                  const isMatched = !!matchedPairs[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleLeftSelect(item)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isMatched
                          ? 'rgba(34, 197, 94, 0.12)'
                          : isSelected
                          ? 'rgba(194, 65, 12, 0.12)'
                          : 'var(--color-surface-tint)',
                        border: isMatched
                          ? '1px solid rgba(34, 197, 94, 0.3)'
                          : isSelected
                          ? '1.5px solid var(--color-palash)'
                          : '1px solid transparent',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                          {idx + 1}. {item.hindi}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                          {item.english}
                        </div>
                      </div>

                      {isMatched ? (
                        <Check size={18} color="#16A34A" strokeWidth={3} />
                      ) : (
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right: Column B */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' }}>
                  {isEn ? `Column B (${langMeta.name})` : `कॉलम B (${langMeta.name})`}
                </div>

                {matchingRightColumn.map((item) => {
                  const tribal = getTribalData(item);
                  const isMatched = Object.values(matchedPairs).includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleRightSelect(item)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isMatched
                          ? 'rgba(34, 197, 94, 0.12)'
                          : 'var(--color-surface-tint)',
                        border: isMatched
                          ? '1px solid rgba(34, 197, 94, 0.3)'
                          : '1px solid transparent',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div
                          className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                          style={{ fontWeight: 800, fontSize: '1.25rem', color: isMatched ? '#16A34A' : 'var(--color-forest)' }}
                        >
                          {tribal.native}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                          {tribal.phonetic}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(tribal.audio, tribal.native);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-forest)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                          }}
                          title={isEn ? 'Listen' : 'उच्चारण सुनें'}
                        >
                          <Volume2 size={16} />
                        </button>
                        {isMatched && <Check size={18} color="#16A34A" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* EXERCISE 2: NUMERACY & COUNTING (AIRY COUNT CARDS)                 */}
        {/* ================================================================== */}
        {worksheetType === 'numeracy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? 'Count the visual items and listen to the mother-tongue numeral name.'
                : 'चित्रों को गिनें एवं मातृभाषा में संख्या नाम व अंक सीखें।'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
              {numberItems.map((item) => {
                const tribal = getTribalData(item);
                const countArr = Array.from({ length: item.numeral }, (_, i) => i + 1);
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface-tint)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-palash)' }}>
                      {item.numeral}
                    </div>

                    {/* Illustrated Count Dots / Leaves */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '32px' }}>
                      {countArr.map((_, i) => (
                        <span
                          key={i}
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-forest)',
                            display: 'inline-block',
                          }}
                        />
                      ))}
                    </div>

                    <div>
                      <div
                        className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                        style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}
                      >
                        {tribal.native}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                        {tribal.phonetic} • {item.hindi}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSpeak(tribal.audio, tribal.native)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-forest)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                      }}
                    >
                      <Volume2 size={14} />
                      <span>{isEn ? 'Listen' : 'सुनें'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* EXERCISE 3: SENTENCE PRACTICE (AIRY CLOZE ROWS)                   */}
        {/* ================================================================== */}
        {worksheetType === 'fillblanks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? 'Complete each sentence by selecting the matching tribal word.'
                : 'सही जनजातीय शब्द चुनकर वाक्य पूरा करें।'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sentenceQuestions.map((q, idx) => {
                const selected = interactiveAnswers[q.id];
                const isCorrect = selected === q.correct;
                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--color-surface-tint)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                      #{idx + 1} {q.hindiPrompt} ({q.englishPrompt})
                    </div>

                    {/* Sentence with interactive blank */}
                    <div
                      className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                      style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-slate)' }}
                    >
                      <span>{q.sentencePre}</span>
                      <span
                        style={{
                          borderBottom: '2px solid var(--color-palash)',
                          padding: '0 12px',
                          color: selected ? 'var(--color-forest)' : 'var(--color-slate-muted)',
                          fontStyle: selected ? 'normal' : 'italic',
                        }}
                      >
                        {selected || '________'}
                      </span>
                      <span>{q.sentencePost}</span>
                    </div>

                    {/* Word choice chips */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {q.options.map((opt, i) => {
                        const isThisSelected = selected === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSelectSentenceWord(q.id, opt)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-pill)',
                              border: 'none',
                              backgroundColor: isScoreEvaluated && opt === q.correct
                                ? 'rgba(34, 197, 94, 0.25)'
                                : isThisSelected
                                ? 'var(--color-forest)'
                                : 'var(--color-surface)',
                              color: isThisSelected && !isScoreEvaluated ? '#FFFFFF' : 'var(--color-slate)',
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* EXERCISE 4: SCRIPT TRACING (AIRY GLYPHS)                          */}
        {/* ================================================================== */}
        {worksheetType === 'tracing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {isEn
                ? 'Practice letter handwriting along the dotted stroke guidelines.'
                : 'सुंदर हस्तलेखन हेतु अक्षरों की बनावट का अभ्यास करें।'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {tracingGlyphs.map((g, i) => (
                <div
                  key={i}
                  style={{
                    padding: '24px 18px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface-tint)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                    {g.name} ({g.sound})
                  </div>

                  <div style={{ fontSize: '3.6rem', fontWeight: 900, color: 'var(--color-palash)', margin: '4px 0' }}>
                    {g.char}
                  </div>

                  {/* Dotted stroke practice */}
                  <div
                    style={{
                      borderTop: '1px dashed var(--color-border)',
                      borderBottom: '1px dashed var(--color-border)',
                      padding: '8px 0',
                      width: '100%',
                      fontSize: '1.6rem',
                      letterSpacing: '8px',
                      color: 'var(--color-slate-muted)',
                      opacity: 0.7,
                    }}
                  >
                    {g.char} • {g.char} • {g.char}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clean Footer Controls: Check Answers */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={handleCheckAnswers}
            style={{
              padding: '8px 24px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{t.wsCheckBtn}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
