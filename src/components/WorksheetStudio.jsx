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
  XCircle,
  Star,
  RotateCcw,
  BookOpen,
  Hash,
  PenTool,
  Layers,
  X,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Counting illustrations (authentic rural/tribal items)
const COUNT_ITEMS_ICONS = ['🍎', '🍃', '🌸', '🥭', '🐟', '🌳', '🐦', '⭐', '🥥', '🌻'];

export function WorksheetStudio({ selectedLang, uiLang = 'hi' }) {
  // Exercise type: 'matching' | 'numeracy' | 'fillblanks' | 'tracing'
  const [worksheetType, setWorksheetType] = useState('matching');
  const [gradeLevel, setGradeLevel] = useState('grade1');
  const [seed, setSeed] = useState(1);

  // 1. Matching state (Bidirectional, pair tracking, shake animation)
  // activeSelection: { side: 'left' | 'right', item }
  const [activeSelection, setActiveSelection] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState({}); // { [leftId]: rightId }
  const [pairNumberMap, setPairNumberMap] = useState({}); // { [leftId]: number 1..5 }
  const [shakeCardId, setShakeCardId] = useState(null);

  // 2. Numeracy / Counting state
  const [numeracyAnswers, setNumeracyAnswers] = useState({}); // { [itemId]: selectedNumber }
  const [tappedCounts, setTappedCounts] = useState({}); // { [itemId]: [1, 2, 3...] }

  // 3. Sentence practice state
  const [interactiveAnswers, setInteractiveAnswers] = useState({}); // { [qId]: selectedWord }
  const [isScoreEvaluated, setIsScoreEvaluated] = useState(false);

  // 4. Script tracing state
  const [practicedGlyphs, setPracticedGlyphs] = useState({});

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

  // 1. Matching Items (5 concrete nouns)
  const matchingItems = useMemo(() => {
    const concrete = TRIBAL_LEXICON.filter((i) =>
      ['animals', 'nature', 'family', 'classroom'].includes(i.category)
    );
    const offset = (seed * 3) % Math.max(1, concrete.length - 4);
    return concrete.slice(offset, offset + 5);
  }, [seed]);

  // Shuffled right column for matching
  const matchingRightColumn = useMemo(() => {
    const list = [...matchingItems];
    // Deterministic shuffle with seed
    return list.sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * 17 + seed * 13) % 23;
      const hashB = (b.id.charCodeAt(0) * 17 + seed * 13) % 23;
      return hashA - hashB;
    });
  }, [matchingItems, seed]);

  // 2. Numeracy Items (Numbers 1-5 for Grade 1, 1-10 for Grade 2/3)
  const numberItems = useMemo(() => {
    const maxNum = gradeLevel === 'grade1' ? 5 : 10;
    const nums = TRIBAL_LEXICON.filter((i) => i.category === 'numbers' && i.numeral <= maxNum);
    const offset = (seed * 2) % Math.max(1, nums.length - 4);
    return nums.slice(offset, offset + Math.min(5, nums.length));
  }, [seed, gradeLevel]);

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
        { char: 'ᱚ', name: 'La (Vowel 1)', sound: 'A / La', guide: 'Stroke 1: Top loop ➔ Stroke 2: Down curve' },
        { char: 'ᱛ', name: 'At (Consonant)', sound: 'Ta / At', guide: 'Stroke 1: Vertical line ➔ Stroke 2: Hook' },
        { char: 'ᱜ', name: 'Ag (Guttural)', sound: 'Ga / Ag', guide: 'Stroke 1: Rounded cap ➔ Stroke 2: Stem' },
        { char: 'ᱝ', name: 'Ang (Nasal)', sound: 'Nga / Ang', guide: 'Stroke 1: Loop ➔ Stroke 2: Right arc' },
      ];
    }
    if (selectedLang === 'ho') {
      return [
        { char: '𑢹', name: 'Ho Ha', sound: 'Ha', guide: 'Warang Chiti: Horizontal bar ➔ Left drop' },
        { char: '𑣉', name: 'Ho O', sound: 'O', guide: 'Warang Chiti: Circular eye ➔ Tail' },
        { char: '𑢵', name: 'Ho Da', sound: 'Da', guide: 'Warang Chiti: Arch ➔ Bottom horizontal' },
        { char: '𑢤', name: 'Ho Ba', sound: 'Ba', guide: 'Warang Chiti: Vertical stem ➔ Double curve' },
      ];
    }
    return [
      { char: 'अ', name: 'स्वर (A)', sound: 'A', guide: 'रेखा 1: अर्धगोलाकार ➔ रेखा 2: मध्य रेखा ➔ रेखा 3: खड़ी रेखा' },
      { char: 'क', name: 'व्यंजन (Ka)', sound: 'Ka', guide: 'रेखा 1: खड़ी रेखा ➔ रेखा 2: गोला ➔ रेखा 3: वक्र' },
      { char: 'म', name: 'व्यंजन (Ma)', sound: 'Ma', guide: 'रेखा 1: खड़ी रेखा ➔ रेखा 2: गांठ ➔ रेखा 3: आड़ी रेखा' },
      { char: 'द', name: 'व्यंजन (Da)', sound: 'Da', guide: 'रेखा 1: छोटी रेखा ➔ रेखा 2: अर्धवृत्त ➔ रेखा 3: पूँछ' },
    ];
  }, [selectedLang]);

  // ==========================================================================
  // ACTIONS & HANDLERS
  // ==========================================================================
  const handleShuffle = () => {
    setSeed((prev) => prev + 1);
    setActiveSelection(null);
    setMatchedPairs({});
    setPairNumberMap({});
    setNumeracyAnswers({});
    setTappedCounts({});
    setInteractiveAnswers({});
    setIsScoreEvaluated(false);
    toast.success(isEn ? 'Generated fresh exercise!' : 'नया अभ्यास तैयार किया गया!');
  };

  const handlePrint = () => {
    toast.info(isEn ? 'Opening clean A4 printable view...' : 'प्रिंट / A4 संवाद खुल रहा है...');
    window.print();
  };

  const handleSpeak = (text) => {
    voiceService.speakText(text, 'hi-IN');
  };

  // --------------------------------------------------------------------------
  // 1. BI-DIRECTIONAL WORD MATCHING HANDLER
  // --------------------------------------------------------------------------
  const handleCardClick = (side, item) => {
    // If card is already matched
    if (side === 'left' && matchedPairs[item.id]) {
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      return;
    }
    if (side === 'right' && Object.values(matchedPairs).includes(item.id)) {
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      return;
    }

    voiceService.playChime('click');

    // Case A: Nothing is currently selected -> select this card
    if (!activeSelection) {
      setActiveSelection({ side, item });
      return;
    }

    // Case B: Clicked the same card again -> unselect
    if (activeSelection.side === side && activeSelection.item.id === item.id) {
      setActiveSelection(null);
      return;
    }

    // Case C: Clicked another card on the SAME side -> switch selection
    if (activeSelection.side === side) {
      setActiveSelection({ side, item });
      return;
    }

    // Case D: Clicked opposite side -> ATTEMPT MATCH
    const leftItem = activeSelection.side === 'left' ? activeSelection.item : item;
    const rightItem = activeSelection.side === 'right' ? activeSelection.item : item;

    if (leftItem.id === rightItem.id) {
      // CORRECT MATCH!
      const currentCount = Object.keys(matchedPairs).length + 1;
      const nextMatched = { ...matchedPairs, [leftItem.id]: rightItem.id };
      const nextNumbers = { ...pairNumberMap, [leftItem.id]: currentCount };

      setMatchedPairs(nextMatched);
      setPairNumberMap(nextNumbers);
      setActiveSelection(null);

      voiceService.playChime('success');
      const tribal = getTribalData(leftItem);
      voiceService.speakText(tribal.audio, 'hi-IN');

      toast.success(`${t.wsMatchPairSuccess}: ${leftItem.hindi} ↔ ${tribal.native}`);
    } else {
      // MISMATCH!
      voiceService.playChime('error');
      setShakeCardId(item.id);
      toast.error(t.wsMatchPairError);
      setTimeout(() => {
        setShakeCardId(null);
        setActiveSelection(null);
      }, 600);
    }
  };

  const handleUnpair = (leftId, e) => {
    e.stopPropagation();
    const nextPairs = { ...matchedPairs };
    delete nextPairs[leftId];
    const nextNumbers = { ...pairNumberMap };
    delete nextNumbers[leftId];
    setMatchedPairs(nextPairs);
    setPairNumberMap(nextNumbers);
    toast.info(t.wsMatchUnpair);
  };

  // --------------------------------------------------------------------------
  // 2. COUNTING / NUMERACY HANDLERS
  // --------------------------------------------------------------------------
  const handleTapCountDot = (itemId, dotIndex, targetNum) => {
    voiceService.playChime('click');
    const existing = tappedCounts[itemId] || [];
    let updated;
    if (existing.includes(dotIndex)) {
      updated = existing.filter((idx) => idx !== dotIndex);
    } else {
      updated = [...existing, dotIndex];
    }
    setTappedCounts((prev) => ({ ...prev, [itemId]: updated }));

    // Speak count number aloud
    const currentCount = updated.length;
    if (currentCount > 0) {
      const matchNumItem = TRIBAL_LEXICON.find((i) => i.category === 'numbers' && i.numeral === currentCount);
      if (matchNumItem) {
        const tribal = getTribalData(matchNumItem);
        voiceService.speakText(tribal.audio, 'hi-IN');
      }
    }
  };

  const handleSelectNumberAnswer = (item, chosenNum) => {
    setNumeracyAnswers((prev) => ({ ...prev, [item.id]: chosenNum }));

    if (chosenNum === item.numeral) {
      voiceService.playChime('success');
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      toast.success(`${t.wsCountCorrect} (${item.numeral} = ${tribal.native})`);
    } else {
      voiceService.playChime('error');
      toast.error(t.wsCountTryAgain);
    }
  };

  // --------------------------------------------------------------------------
  // 3. SENTENCE PRACTICE HANDLERS
  // --------------------------------------------------------------------------
  const handleSelectSentenceWord = (qId, option) => {
    setInteractiveAnswers((prev) => ({ ...prev, [qId]: option }));
    voiceService.playChime('click');
    setIsScoreEvaluated(false); // reset until checked
  };

  // --------------------------------------------------------------------------
  // 4. INTELLIGENT & CONTEXT-AWARE "CHECK ANSWERS" HANDLER (ZERO FALSE CHEERS!)
  // --------------------------------------------------------------------------
  const handleCheckAnswers = () => {
    // === EXERCISE 1: WORD MATCHING ===
    if (worksheetType === 'matching') {
      const matchedCount = Object.keys(matchedPairs).length;
      const total = matchingItems.length;

      if (matchedCount === 0) {
        toast.info(t.wsCheckToastIncomplete);
        voiceService.playChime('click');
        return;
      }

      if (matchedCount < total) {
        toast.warning(t.wsCheckToastPartial.replace('{count}', matchedCount).replace('{total}', total));
        voiceService.playChime('error');
        return;
      }

      // Strict verification: Ensure every pair is 100% matched to the correct item
      const isAllValid = matchingItems.every((item) => matchedPairs[item.id] === item.id);
      if (!isAllValid) {
        toast.error(isEn ? 'Some pairs are incorrect! Please review and fix.' : 'कुछ जोड़ियाँ गलत हैं! कृपया सुधारें।');
        voiceService.playChime('error');
        return;
      }

      // All 5 correctly matched!
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
      voiceService.playChime('success');
      toast.success(t.wsCheckToastAllCorrect);
      return;
    }

    // === EXERCISE 2: NUMERACY & COUNTING ===
    if (worksheetType === 'numeracy') {
      const total = numberItems.length;
      const answeredKeys = Object.keys(numeracyAnswers);

      if (answeredKeys.length === 0) {
        toast.info(t.wsCheckToastIncomplete);
        voiceService.playChime('click');
        return;
      }

      const correctCount = numberItems.filter((i) => numeracyAnswers[i.id] === i.numeral).length;

      if (answeredKeys.length < total) {
        toast.warning(t.wsCheckToastPartial.replace('{count}', answeredKeys.length).replace('{total}', total));
        voiceService.playChime('error');
        return;
      }

      if (correctCount === total) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        voiceService.playChime('success');
        toast.success(t.wsCheckToastAllCorrect);
      } else {
        voiceService.playChime('error');
        toast.error(t.wsCheckToastPartial.replace('{count}', correctCount).replace('{total}', total));
      }
      return;
    }

    // === EXERCISE 3: SENTENCE PRACTICE ===
    if (worksheetType === 'fillblanks') {
      const total = sentenceQuestions.length;
      const answeredKeys = Object.keys(interactiveAnswers);

      if (answeredKeys.length === 0) {
        toast.info(t.wsCheckToastIncomplete);
        voiceService.playChime('click');
        return;
      }

      if (answeredKeys.length < total) {
        toast.warning(t.wsCheckToastIncomplete);
        voiceService.playChime('error');
        return;
      }

      const correctCount = sentenceQuestions.filter((q) => interactiveAnswers[q.id] === q.correct).length;
      setIsScoreEvaluated(true);

      if (correctCount === total) {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 } });
        voiceService.playChime('success');
        toast.success(t.wsCheckToastAllCorrect);
      } else {
        voiceService.playChime('error');
        toast.error(t.wsCheckToastPartial.replace('{count}', correctCount).replace('{total}', total));
      }
      return;
    }

    // === EXERCISE 4: SCRIPT TRACING ===
    if (worksheetType === 'tracing') {
      const total = tracingGlyphs.length;
      const count = Object.keys(practicedGlyphs).length;
      toast.info(isEn ? `Practiced ${count} of ${total} glyphs.` : `आपने ${count} में से ${total} अक्षरों का अभ्यास किया।`);
    }
  };

  const handleReset = () => {
    setActiveSelection(null);
    setMatchedPairs({});
    setPairColorMap({});
    setNumeracyAnswers({});
    setTappedCounts({});
    setInteractiveAnswers({});
    setIsScoreEvaluated(false);
    setPracticedGlyphs({});
    toast.info(isEn ? 'Exercise reset' : 'अभ्यास रीसेट हुआ');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ==================================================================== */}
      {/* 1. CLEAN TOP HEADER (NO BOX-IN-BOX)                                  */}
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
            onChange={(e) => {
              setGradeLevel(e.target.value);
              handleReset();
            }}
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
                setActiveSelection(null);
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
      {/* 3. THE WORKSHEET CANVAS (SINGLE ELEVATED SURFACE)                    */}
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
        {/* Printable Official Header (Shows when printed or on screen) */}
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

            {/* Score & Evaluation Progress Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-tint)' }}>
              <Star size={15} color="#EAB308" fill="#EAB308" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                {worksheetType === 'matching' && `${Object.keys(matchedPairs).length} / ${matchingItems.length} matched`}
                {worksheetType === 'numeracy' && `${Object.keys(numeracyAnswers).length} / ${numberItems.length} solved`}
                {worksheetType === 'fillblanks' && `${Object.keys(interactiveAnswers).length} / ${sentenceQuestions.length} completed`}
                {worksheetType === 'tracing' && `${Object.keys(practicedGlyphs).length} / ${tracingGlyphs.length} practiced`}
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
        {/* EXERCISE 1: WORD MATCHING (ROBUST, BI-DIRECTIONAL, IDENTIFIERS)   */}
        {/* ================================================================== */}
        {worksheetType === 'matching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
                {t.wsMatchSelectHint}
              </p>
              {activeSelection && (
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(194, 65, 12, 0.15)', color: 'var(--color-palash)' }}>
                  {isEn
                    ? `Selected "${activeSelection.item.hindi}" — Now tap matching in ${activeSelection.side === 'left' ? 'Column B' : 'Column A'}`
                    : `चयनित: "${activeSelection.item.hindi}" — अब ${activeSelection.side === 'left' ? 'कॉलम B' : 'कॉलम A'} से मिलान करें`}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Left Column A */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-slate-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' }}>
                  {isEn ? 'Column A (Hindi / English)' : 'कॉलम A (हिंदी / अंग्रेजी)'}
                </div>

                {matchingItems.map((item, idx) => {
                  const isSelected = activeSelection?.side === 'left' && activeSelection?.item.id === item.id;
                  const isMatched = !!matchedPairs[item.id];
                  const pairNum = pairNumberMap[item.id];

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick('left', item)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isMatched
                          ? 'rgba(16, 185, 129, 0.08)'
                          : isSelected
                          ? 'rgba(194, 65, 12, 0.12)'
                          : 'var(--color-surface-tint)',
                        border: isMatched
                          ? '1.5px solid rgba(16, 185, 129, 0.4)'
                          : isSelected
                          ? '2px solid var(--color-palash)'
                          : shakeCardId === item.id
                          ? '2px solid #EF4444'
                          : '1px solid transparent',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-slate-muted)' }}>
                          {idx + 1}.
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                            {item.hindi}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                            {item.english}
                          </div>
                        </div>
                      </div>

                      {/* Right indicator: Clean Pair Badge or Selection Ring */}
                      {isMatched ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(16, 185, 129, 0.14)',
                              color: '#10B981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            ✓ {isEn ? `Pair ${pairNum}` : `जोड़ी ${pairNum}`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleUnpair(item.id, e)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-slate-muted)', cursor: 'pointer', padding: '2px' }}
                            title={t.wsMatchUnpair}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                            transition: 'all 0.15s ease',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column B */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: '4px' }}>
                  {isEn ? `Column B (${langMeta.name})` : `कॉलम B (${langMeta.name})`}
                </div>

                {matchingRightColumn.map((item, idx) => {
                  const tribal = getTribalData(item);
                  const isSelected = activeSelection?.side === 'right' && activeSelection?.item.id === item.id;
                  const isMatched = Object.values(matchedPairs).includes(item.id);
                  const matchedLeftKey = Object.keys(matchedPairs).find((k) => matchedPairs[k] === item.id);
                  const pairNum = matchedLeftKey ? pairNumberMap[matchedLeftKey] : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick('right', item)}
                      style={{
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isMatched
                          ? 'rgba(16, 185, 129, 0.08)'
                          : isSelected
                          ? 'rgba(194, 65, 12, 0.12)'
                          : 'var(--color-surface-tint)',
                        border: isMatched
                          ? '1.5px solid rgba(16, 185, 129, 0.4)'
                          : isSelected
                          ? '2px solid var(--color-palash)'
                          : shakeCardId === item.id
                          ? '2px solid #EF4444'
                          : '1px solid transparent',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-forest)' }}>
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <div>
                          <div
                            className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                            style={{ fontWeight: 800, fontSize: '1.25rem', color: isMatched ? '#10B981' : 'var(--color-forest)' }}
                          >
                            {tribal.native}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                            {tribal.phonetic}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(tribal.audio);
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

                        {isMatched ? (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(16, 185, 129, 0.14)',
                              color: '#10B981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                            }}
                          >
                            ✓ {isEn ? `Pair ${pairNum}` : `जोड़ी ${pairNum}`}
                          </span>
                        ) : (
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                              transition: 'all 0.15s ease',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* EXERCISE 2: NUMERACY & COUNTING (INTERACTIVE OBJECTS + QUIZ)       */}
        {/* ================================================================== */}
        {worksheetType === 'numeracy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: 0 }}>
              {t.wsCountPrompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {numberItems.map((item, idx) => {
                const tribal = getTribalData(item);
                const icon = COUNT_ITEMS_ICONS[idx % COUNT_ITEMS_ICONS.length];
                const countArr = Array.from({ length: item.numeral }, (_, i) => i + 1);
                const currentTaps = tappedCounts[item.id] || [];
                const studentAnswer = numeracyAnswers[item.id];
                const isSolved = studentAnswer !== undefined;
                const isCorrect = studentAnswer === item.numeral;

                // 3 Strictly Unique Multiple Choice options
                const maxChoices = gradeLevel === 'grade1' ? 5 : 10;
                const choiceSet = new Set([item.numeral]);
                if (item.numeral + 1 <= maxChoices) choiceSet.add(item.numeral + 1);
                if (item.numeral - 1 >= 1) choiceSet.add(item.numeral - 1);
                if (item.numeral + 2 <= maxChoices) choiceSet.add(item.numeral + 2);
                if (item.numeral - 2 >= 1) choiceSet.add(item.numeral - 2);
                let fallback = 1;
                while (choiceSet.size < 3 && fallback <= maxChoices) {
                  choiceSet.add(fallback);
                  fallback++;
                }
                const choices = Array.from(choiceSet).slice(0, 3).sort((a, b) => a - b);

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '20px 24px',
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: isSolved
                        ? isCorrect
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)'
                        : 'var(--color-surface-tint)',
                      border: isSolved
                        ? isCorrect
                          ? '1.5px solid rgba(16, 185, 129, 0.35)'
                          : '1.5px solid rgba(239, 68, 68, 0.35)'
                        : '1px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Header of Count Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--color-slate-muted)' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                          {isEn ? `Count the ${icon} items:` : `${icon} वस्तुओं को गिनें:`}
                        </div>
                      </div>

                      {/* Native Tribal Audio Button */}
                      <button
                        type="button"
                        onClick={() => handleSpeak(tribal.audio)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-forest)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        <Volume2 size={15} />
                        <span>{tribal.native} ({tribal.phonetic})</span>
                      </button>
                    </div>

                    {/* Interactive Countable Objects (Tap each item to count) */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--color-surface)',
                      }}
                    >
                      {countArr.map((dotNum) => {
                        const isTapped = currentTaps.includes(dotNum);
                        return (
                          <button
                            key={dotNum}
                            type="button"
                            onClick={() => handleTapCountDot(item.id, dotNum, item.numeral)}
                            style={{
                              fontSize: '2rem',
                              background: isTapped ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                              border: isTapped ? '2px solid #10B981' : '2px dashed var(--color-border)',
                              borderRadius: 'var(--radius-lg)',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              transform: isTapped ? 'scale(1.12)' : 'scale(1)',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              lineHeight: 1,
                            }}
                            title={isEn ? `Tap to count item ${dotNum}` : `गिनने के लिए दबाएँ: वस्तु ${dotNum}`}
                          >
                            <span>{icon}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isTapped ? '#10B981' : 'var(--color-slate-muted)', marginTop: '4px' }}>
                              {dotNum}
                            </span>
                          </button>
                        );
                      })}

                      <div style={{ marginLeft: 'auto', fontSize: '0.80rem', color: 'var(--color-slate-muted)', fontStyle: 'italic' }}>
                        {isEn ? `Counted: ${currentTaps.length} of ${item.numeral}` : `गिना गया: ${currentTaps.length} / ${item.numeral}`}
                      </div>
                    </div>

                    {/* Answer Selection Chips: How Many? */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                        {isEn ? 'How many did you count?' : 'आपने कुल कितने गिने? सही संख्या चुनें:'}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {choices.map((choiceNum) => {
                          const isThisChoice = studentAnswer === choiceNum;
                          return (
                            <button
                              key={choiceNum}
                              type="button"
                              onClick={() => handleSelectNumberAnswer(item, choiceNum)}
                              style={{
                                minWidth: '44px',
                                height: '40px',
                                padding: '0 16px',
                                borderRadius: 'var(--radius-pill)',
                                border: isThisChoice
                                  ? choiceNum === item.numeral
                                    ? '2px solid #10B981'
                                    : '2px solid #EF4444'
                                  : '1px solid var(--color-border)',
                                backgroundColor: isThisChoice
                                  ? choiceNum === item.numeral
                                    ? '#10B981'
                                    : '#EF4444'
                                  : 'var(--color-surface)',
                                color: isThisChoice ? '#FFFFFF' : 'var(--color-slate)',
                                fontSize: '1rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {choiceNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
                const isAnswered = !!selected;
                const isCorrect = selected === q.correct;

                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '18px 22px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isScoreEvaluated
                        ? isCorrect
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)'
                        : 'var(--color-surface-tint)',
                      border: isScoreEvaluated
                        ? isCorrect
                          ? '1.5px solid rgba(16, 185, 129, 0.35)'
                          : '1.5px solid rgba(239, 68, 68, 0.35)'
                        : '1px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                        #{idx + 1} {q.hindiPrompt} ({q.englishPrompt})
                      </div>
                      {isScoreEvaluated && (
                        <span style={{ fontSize: '0.80rem', fontWeight: 800, color: isCorrect ? '#10B981' : '#EF4444' }}>
                          {isCorrect ? '✓ सही उत्तर' : `✗ सही शब्द: ${q.correct}`}
                        </span>
                      )}
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
                                ? 'rgba(16, 185, 129, 0.25)'
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {tracingGlyphs.map((g, i) => {
                const isPracticed = !!practicedGlyphs[g.char];
                return (
                  <div
                    key={i}
                    style={{
                      padding: '24px 18px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isPracticed ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-surface-tint)',
                      border: isPracticed ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
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

                    <div style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                      {g.guide}
                    </div>

                    {/* Dotted stroke practice line */}
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

                    <button
                      type="button"
                      onClick={() => {
                        setPracticedGlyphs((prev) => ({ ...prev, [g.char]: !prev[g.char] }));
                        voiceService.playChime('success');
                        toast.success(isEn ? `Practiced ${g.char}` : `${g.char} का अभ्यास पूरा हुआ!`);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: 'none',
                        backgroundColor: isPracticed ? '#10B981' : 'var(--color-surface)',
                        color: isPracticed ? '#FFFFFF' : 'var(--color-slate)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isPracticed ? '✓ अभ्यास पूर्ण' : 'अभ्यास मार्क करें'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Footer Controls: Real Intelligent "Check Answers" Button */}
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
