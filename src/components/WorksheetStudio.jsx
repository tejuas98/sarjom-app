import React, { useState, useMemo } from 'react';
import { TRIBAL_LEXICON, TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { voiceService } from '../services/voiceTranslationService';
import {
  Printer,
  BookCheck,
  Smartphone,
  Leaf,
  RefreshCw,
  Award,
  CheckCircle2,
  Sparkles,
  QrCode,
  Volume2,
  HelpCircle,
  Hash,
  Eye,
  EyeOff,
  Tablet,
  FileText,
  Check,
  Star,
  RotateCcw,
  Sparkle,
  PenTool,
  Grid,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { ParentPhoneScanModal } from './ParentPhoneScanModal';

export function WorksheetStudio({ selectedLang, uiLang = 'hi' }) {
  // View mode: 'interactive' (tablet/smart-class friendly) or 'printable' (authentic A4 sheet)
  const [viewMode, setViewMode] = useState('interactive');

  // Exercise category format
  const [worksheetType, setWorksheetType] = useState('matching'); // 'matching' | 'numeracy' | 'fillblanks' | 'animals' | 'tracing' | 'scramble'

  // Topic filter
  const [topicFilter, setTopicFilter] = useState('all'); // 'all' | 'nature' | 'animals' | 'numbers' | 'family'

  // Grade level
  const [gradeLevel, setGradeLevel] = useState('grade1'); // 'balvatika' | 'grade1' | 'grade2' | 'grade3'

  // Teacher Answer Key visibility
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  // Randomization seed
  const [seed, setSeed] = useState(1);

  // Interactive state
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState({}); // { [leftId]: rightId }
  const [interactiveAnswers, setInteractiveAnswers] = useState({});
  const [isScoreEvaluated, setIsScoreEvaluated] = useState(false);
  const [showPhoneScanModal, setShowPhoneScanModal] = useState(false);

  // Scramble exercise state
  const [scrambleAnswer, setScrambleAnswer] = useState([]);

  const isEn = uiLang === 'en';
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  const schoolName = isEn
    ? 'Govt. Primary Model School, Khunti (Jharkhand)'
    : 'राजकीय उत्क्रमित प्राथमिक विद्यालय, खूंटी (झारखंड)';

  // Helper to extract tribal name based on selected language
  const getTribalData = (item) => {
    if (!item) return { native: '', phonetic: '', audio: '' };
    const langObj = item[selectedLang] || item.santhali || {};
    const native = selectedLang === 'santhali'
      ? (langObj.nativeOlChiki || langObj.native || item.hindi)
      : (langObj.native || item.hindi);
    const phonetic = langObj.phoneticDeva || langObj.phoneticLatin || '';
    const audio = langObj.audioText || phonetic || native;
    return { native, phonetic, audio, raw: langObj };
  };

  // 1. Concrete Vocab Items for Matching (filtered by topic)
  const availableMatchingPool = useMemo(() => {
    return TRIBAL_LEXICON.filter((i) => {
      // Keep only concrete short nouns, exclude conversational sentences
      const isConcrete = ['animals', 'nature', 'family', 'numbers'].includes(i.category);
      if (!isConcrete) return false;
      if (topicFilter === 'all') return true;
      if (topicFilter === 'numbers') return i.category === 'numbers';
      if (topicFilter === 'animals') return i.category === 'animals';
      if (topicFilter === 'nature') return i.category === 'nature';
      if (topicFilter === 'family') return i.category === 'family';
      return true;
    });
  }, [topicFilter]);

  // Take 5 items for matching based on seed
  const matchingItems = useMemo(() => {
    const pool = availableMatchingPool.length >= 5 ? availableMatchingPool : TRIBAL_LEXICON.slice(0, 10);
    const offset = (seed * 3) % Math.max(1, pool.length - 4);
    return pool.slice(offset, offset + 5);
  }, [availableMatchingPool, seed]);

  // Shuffled right column for matching
  const matchingRightColumn = useMemo(() => {
    const list = [...matchingItems];
    // Deterministic shuffle using seed
    return list.sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) + seed * 7) % 11;
      const hashB = (b.id.charCodeAt(0) + seed * 7) % 11;
      return hashA - hashB;
    });
  }, [matchingItems, seed]);

  // 2. Numeracy Items (Numbers 1-10)
  const numberItems = useMemo(() => {
    const nums = TRIBAL_LEXICON.filter((i) => i.category === 'numbers' && i.numeral <= 10);
    const offset = (seed * 2) % Math.max(1, nums.length - 4);
    return nums.slice(offset, offset + 5);
  }, [seed]);

  // 3. Animal & Nature Items
  const animalNatureItems = useMemo(() => {
    const items = TRIBAL_LEXICON.filter((i) => ['animals', 'nature'].includes(i.category));
    const offset = (seed * 2) % Math.max(1, items.length - 3);
    return items.slice(offset, offset + 4);
  }, [seed]);

  // 4. Fill in the Blanks contextual sentences
  const fillBlankQuestions = useMemo(() => {
    if (selectedLang === 'santhali') {
      return [
        {
          id: 'fb_1',
          hindiPrompt: 'हाथी जंगल में रहता है।',
          englishPrompt: 'The elephant lives in the forest.',
          sentence: '_____ ᱵᱤᱨ ᱨᱮ ᱛᱟᱦᱮᱸᱱᱟ᱾',
          correct: 'ᱦᱟᱹᱛᱤ',
          phonetic: 'Hāti',
          options: ['ᱦᱟᱹᱛᱤ', 'ᱥᱮᱛᱟ', 'ᱦᱟᱹᱠᱩ'],
        },
        {
          id: 'fb_2',
          hindiPrompt: 'मुझे पानी पीना है।',
          englishPrompt: 'I want to drink water.',
          sentence: 'ᱤᱧ ᱫᱚ _____ ᱧᱩ ᱥᱟᱱᱟᱹᱧᱟ᱾',
          correct: 'ᱫᱟᱜ',
          phonetic: 'Dāk',
          options: ['ᱫᱟᱜ', 'ᱫᱟᱠᱟ', 'ᱫᱟᱨᱮ'],
        },
        {
          id: 'fb_3',
          hindiPrompt: 'पक्षी पेड़ की डाली पर बैठता है।',
          englishPrompt: 'The bird sits on the tree branch.',
          sentence: 'ᱪᱮᱬᱮ _____ ᱨᱮ ᱫᱩᱲᱩᱵᱼᱟ᱾',
          correct: 'ᱫᱟᱨᱮ',
          phonetic: 'Dāre',
          options: ['ᱫᱟᱨᱮ', 'ᱚᱲᱟᱜ', 'ᱜᱟᱰᱟ'],
        },
      ];
    }
    if (selectedLang === 'ho') {
      return [
        {
          id: 'fb_1',
          hindiPrompt: 'हाथी जंगल में रहता है।',
          englishPrompt: 'The elephant lives in the forest.',
          sentence: '_____ बिर रे ताइना।',
          correct: 'हाती',
          phonetic: 'Hāti',
          options: ['हाती', 'सेता', 'हाकु'],
        },
        {
          id: 'fb_2',
          hindiPrompt: 'मुझे पानी पीना है।',
          englishPrompt: 'I want to drink water.',
          sentence: 'इंग _____ नू सनांग-तन्या।',
          correct: 'दाः',
          phonetic: 'Da-ah',
          options: ['दाः', 'मंडी', 'दारु'],
        },
        {
          id: 'fb_3',
          hindiPrompt: 'पक्षी पेड़ पर बैठता है।',
          englishPrompt: 'The bird sits on the tree.',
          sentence: 'चेणे _____ रे दुब तन्या।',
          correct: 'दारु',
          phonetic: 'Daru',
          options: ['दारु', 'ओड़ाः', 'गड़ा'],
        },
      ];
    }
    if (selectedLang === 'mundari') {
      return [
        {
          id: 'fb_1',
          hindiPrompt: 'हाथी जंगल में रहता है।',
          englishPrompt: 'The elephant lives in the forest.',
          sentence: '_____ बीर रे तइना।',
          correct: 'हाती',
          phonetic: 'Hāti',
          options: ['हाती', 'सेता', 'हाकु'],
        },
        {
          id: 'fb_2',
          hindiPrompt: 'मुझे पानी पीना है।',
          englishPrompt: 'I want to drink water.',
          sentence: 'आईंग _____ नू सनांग-तन्या।',
          correct: 'दाः',
          phonetic: 'Da-ah',
          options: ['दाः', 'मंडी', 'दारु'],
        },
        {
          id: 'fb_3',
          hindiPrompt: 'पक्षी पेड़ पर बैठता है।',
          englishPrompt: 'The bird sits on the tree.',
          sentence: 'चेणें _____ रे दुब तना।',
          correct: 'दारु',
          phonetic: 'Daru',
          options: ['दारु', 'ओड़ाः', 'गड़ा'],
        },
      ];
    }
    // Sadri default
    return [
      {
        id: 'fb_1',
        hindiPrompt: 'हाथी जंगल में रहता है।',
        englishPrompt: 'The elephant lives in the forest.',
        sentence: '_____ जंगल मे रहेला।',
        correct: 'हाथी',
        phonetic: 'Hathi',
        options: ['हाथी', 'कुकुर', 'माछ'],
      },
      {
        id: 'fb_2',
        hindiPrompt: 'मुझे पानी पीना है।',
        englishPrompt: 'I want to drink water.',
        sentence: 'मोके _____ पिएक मन करत हे।',
        correct: 'पानी',
        phonetic: 'Pani',
        options: ['पानी', 'भात', 'गाछ'],
      },
      {
        id: 'fb_3',
        hindiPrompt: 'चिड़िया पेड़ की डाली पर बैठती है।',
        englishPrompt: 'The bird sits on the tree.',
        sentence: 'चिरई _____ ऊपर बैसेला।',
        correct: 'गाछ',
        phonetic: 'Gaachh',
        options: ['गाछ', 'घर', 'नदी'],
      },
    ];
  }, [selectedLang]);

  // 5. Tracing Glyphs
  const tracingGlyphs = useMemo(() => {
    if (selectedLang === 'santhali') {
      return [
        { char: 'ᱚ', name: 'La (Vowel 1)', strokeHint: 'Start from top curve, loop down and right' },
        { char: 'ᱛ', name: 'At (Consonant)', strokeHint: 'Top horizontal bar, vertical stroke with right curl' },
        { char: 'ᱜ', name: 'Ag (Guttural)', strokeHint: 'Round loop on left, vertical down stem' },
        { char: 'ᱝ', name: 'Ang (Nasal)', strokeHint: 'Circular upper ring with descending hook' },
        { char: 'ᱞ', name: 'Al (Liquid)', strokeHint: 'Double arch curve descending left to right' },
      ];
    }
    if (selectedLang === 'ho') {
      return [
        { char: '𑢹', deva: 'ह', name: 'Ho Letter H', strokeHint: 'Warang Chiti upper hook with vertical base' },
        { char: '𑣉', deva: 'ओ', name: 'Ho Vowel O', strokeHint: 'Circular Warang Chiti closed loop' },
        { char: '𑢵', deva: 'द', name: 'Ho Letter D', strokeHint: 'Left curve with downward cross stem' },
        { char: '𑢤', deva: 'ब', name: 'Ho Letter B', strokeHint: 'Rounded box glyph with diagonal brace' },
      ];
    }
    return [
      { char: 'अ', deva: 'अ', name: 'स्वर वर्ण (A)', strokeHint: 'बायां दोहरा घुमाव, मध्य रेखा एवं खड़ी पाई' },
      { char: 'क', deva: 'क', name: 'व्यंजन वर्ण (Ka)', strokeHint: 'खड़ी पाई, बायां वृत्त एवं दायां हुक' },
      { char: 'म', deva: 'म', name: 'अनुनासिक वर्ण (Ma)', strokeHint: 'खड़ी पाई, बायां त्रिकोण लूप एवं योजक रेखा' },
      { char: 'द', deva: 'द', name: 'दंत्य वर्ण (Da)', strokeHint: 'छोटी खड़ी रेखा, अर्धवृत्त एवं नीचे पूंछ' },
    ];
  }, [selectedLang]);

  // 6. Word Scramble Exercise Item
  const scrambleItem = useMemo(() => {
    const target = animalNatureItems[0] || TRIBAL_LEXICON[0];
    const tribal = getTribalData(target);
    const letters = tribal.native.split('').filter((c) => c.trim() !== '');
    // Shuffled letters
    const shuffled = [...letters].sort(() => 0.5 - Math.random());
    return {
      target,
      tribal,
      correctWord: tribal.native,
      letters: shuffled,
    };
  }, [animalNatureItems, selectedLang, seed]);

  // Handlers
  const handleShuffle = () => {
    setSeed((prev) => prev + 1);
    setMatchedPairs({});
    setMatchingSelectedLeft(null);
    setInteractiveAnswers({});
    setScrambleAnswer([]);
    setIsScoreEvaluated(false);
    toast.success(isEn ? 'Generated fresh randomized worksheet!' : 'नया अभ्यास पत्र तैयार किया गया!');
  };

  const handlePrint = () => {
    toast.info(isEn ? 'Opening A4 print dialog...' : 'A4 प्रिंट संवाद खुल रहा है (Print / Save PDF)...');
    window.print();
  };

  const handleSpeak = (text, label) => {
    toast.info(isEn ? `Speaking: "${label}"` : `उच्चारण: "${label}"`);
    voiceService.speakText(text, 'hi-IN');
  };

  // Interactive Matching Logic
  const handleLeftClick = (item) => {
    if (matchedPairs[item.id]) return; // already matched
    setMatchingSelectedLeft(item);
    const tribal = getTribalData(item);
    voiceService.playChime('click');
  };

  const handleRightClick = (item) => {
    if (!matchingSelectedLeft) {
      toast.info(isEn ? 'Select an item from the left column first!' : 'पहले बाएँ कॉलम से एक शब्द चुनें!');
      return;
    }

    if (matchingSelectedLeft.id === item.id) {
      // MATCH SUCCESS!
      const newMatched = { ...matchedPairs, [matchingSelectedLeft.id]: item.id };
      setMatchedPairs(newMatched);
      setMatchingSelectedLeft(null);
      voiceService.playChime('success');
      const tribal = getTribalData(item);
      voiceService.speakText(tribal.audio, 'hi-IN');
      toast.success(isEn ? `Correct! "${matchingSelectedLeft.english}" matches "${tribal.native}"` : `सही मिलान! "${matchingSelectedLeft.hindi}" = "${tribal.native}"`);

      // Check if all matched
      if (Object.keys(newMatched).length === matchingItems.length) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      // MISMATCH
      voiceService.playChime('error');
      toast.error(isEn ? 'Not a match. Try again!' : 'गलत मिलान! पुनः प्रयास करें।');
    }
  };

  // Multiple choice selection
  const handleSelectAnswer = (qId, option) => {
    setInteractiveAnswers((prev) => ({ ...prev, [qId]: option }));
    voiceService.playChime('click');
  };

  // Scramble letter click
  const handleScrambleLetterClick = (letter, index) => {
    setScrambleAnswer((prev) => [...prev, { letter, originalIndex: index }]);
    voiceService.playChime('click');
  };

  const handleRemoveScrambleLetter = (indexToRemove) => {
    setScrambleAnswer((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    voiceService.playChime('click');
  };

  const handleCheckAll = () => {
    setIsScoreEvaluated(true);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.55 } });
    voiceService.playChime('success');
    toast.success(t.wsCheckedToast);
  };

  const handleResetInteractive = () => {
    setMatchedPairs({});
    setMatchingSelectedLeft(null);
    setInteractiveAnswers({});
    setScrambleAnswer([]);
    setIsScoreEvaluated(false);
    toast.info(isEn ? 'Exercises reset!' : 'अभ्यास रीसेट किया गया!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1150px', margin: '0 auto', width: '100%' }}>
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & PEDAGOGICAL CONCEPT BANNER                           */}
      {/* ==================================================================== */}
      <div
        className="card-brutal no-print"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Title, Language Badge, and Dual View Mode Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookCheck size={24} color="var(--color-forest)" />
              <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800, color: 'var(--color-slate)' }}>
                {t.wsTitle}
              </h2>
              <span className="badge-tag badge-forest">
                {langMeta.name} ({langMeta.badgeText})
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
              {t.wsPedagogyNote}
            </p>
          </div>

          {/* Dual View Mode Segmented Pill (Interactive Tablet vs. Printable A4) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface-tint)',
              padding: '4px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('interactive')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: viewMode === 'interactive' ? 'var(--color-forest)' : 'transparent',
                color: viewMode === 'interactive' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: viewMode === 'interactive' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Tablet size={15} />
              <span>{t.wsModeInteractive}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('printable')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                backgroundColor: viewMode === 'printable' ? 'var(--color-palash)' : 'transparent',
                color: viewMode === 'printable' ? '#FFFFFF' : 'var(--color-slate)',
                fontWeight: viewMode === 'printable' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <FileText size={15} />
              <span>{t.wsModePrintable}</span>
            </button>
          </div>
        </div>

        {/* Secondary Toolbar: Topic, Grade, Shuffle, Teacher Answer Key, QR, Print */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '14px',
          }}
        >
          {/* 6 Pedagogical Exercise Format Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'matching', label: t.wsTypeMatching, icon: Layers },
              { id: 'numeracy', label: t.wsTypeNumeracy, icon: Hash },
              { id: 'fillblanks', label: t.wsTypeFillBlanks, icon: BookCheck },
              { id: 'animals', label: t.wsTypeAnimals, icon: Sparkles },
              { id: 'tracing', label: t.wsTypeTracing, icon: PenTool },
              { id: 'scramble', label: t.wsTypeScramble, icon: Grid },
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
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: isActive ? '1px solid var(--color-forest)' : '1px solid var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-forest)' : 'var(--color-surface-tint)',
                    color: isActive ? '#FFFFFF' : 'var(--color-slate)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <TabIcon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Topic Filter Dropdown */}
            <select
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(e.target.value);
                setMatchedPairs({});
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-tint)',
                color: 'var(--color-slate)',
                fontSize: '0.80rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">{t.wsTopicAll}</option>
              <option value="numbers">{t.wsTopicNumbers}</option>
              <option value="animals">{t.wsTopicAnimals}</option>
              <option value="nature">{t.wsTopicNature}</option>
              <option value="family">{t.wsTopicFamily}</option>
            </select>

            {/* Grade Selector */}
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-tint)',
                color: 'var(--color-slate)',
                fontSize: '0.80rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="balvatika">{isEn ? 'Balvatika (Age 5-6)' : 'बालवाटिका (Age 5-6)'}</option>
              <option value="grade1">{isEn ? 'Grade 1 (Class 1)' : 'कक्षा 1 (Class 1)'}</option>
              <option value="grade2">{isEn ? 'Grade 2 (Class 2)' : 'कक्षा 2 (Class 2)'}</option>
              <option value="grade3">{isEn ? 'Grade 3 (Class 3)' : 'कक्षा 3 (Class 3)'}</option>
            </select>

            {/* Teacher Answer Key Toggle */}
            <button
              type="button"
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              style={{
                padding: '6px 12px',
                fontSize: '0.80rem',
                backgroundColor: showAnswerKey ? 'rgba(34, 197, 94, 0.18)' : 'var(--color-surface-tint)',
                color: showAnswerKey ? '#22C55E' : 'var(--color-slate)',
                border: showAnswerKey ? '1px solid #22C55E' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title={t.wsAnswerKey}
            >
              {showAnswerKey ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{t.wsAnswerKey}</span>
            </button>

            {/* Shuffle Button */}
            <button
              type="button"
              onClick={handleShuffle}
              style={{
                padding: '6px 12px',
                fontSize: '0.80rem',
                backgroundColor: 'var(--color-surface-tint)',
                color: 'var(--color-slate)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
              title={t.wsShuffleBtn}
            >
              <RefreshCw size={13} />
              <span>{isEn ? 'Shuffle' : 'नया अभ्यास'}</span>
            </button>

            {/* Rural Parent Phone Scan Companion */}
            <button
              type="button"
              onClick={() => setShowPhoneScanModal(true)}
              style={{
                padding: '6px 12px',
                fontSize: '0.80rem',
                backgroundColor: 'rgba(14, 91, 55, 0.15)',
                color: 'var(--color-forest)',
                border: '1px solid rgba(14, 91, 55, 0.35)',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              title={isEn ? 'Simulate Rural Parent QR Audio Companion' : 'ग्रामीण अभिभावक फोन ऑडियो साथी'}
            >
              <Smartphone size={13} />
              <span>{isEn ? 'Audio QR' : 'ध्वनि क्यूआर'}</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              style={{
                padding: '6px 16px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--color-palash)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: 'var(--shadow-flat)',
              }}
            >
              <Printer size={14} />
              <span>{t.wsPrintBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MODE A: INTERACTIVE TABLET / SMART-CLASS MODE                     */}
      {/* ==================================================================== */}
      {viewMode === 'interactive' && (
        <div
          className="no-print"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Header Bar with Instruction & Live Score */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-tag badge-ochre" style={{ fontSize: '0.74rem' }}>
                  {gradeLevel.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.90rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                  {worksheetType === 'matching' && (isEn ? 'Exercise: Tap an item in Column A, then tap its match in Column B!' : 'अभ्यास: कॉलम A के शब्द पर टैप करें, फिर कॉलम B के सही मातृभाषा शब्द से मिलाएँ!')}
                  {worksheetType === 'numeracy' && (isEn ? 'Exercise: Count the illustrated items and verify the tribal number name!' : 'अभ्यास: वस्तुओं को गिनें और मातृभाषा संख्या नाम व अंक पहचानें!')}
                  {worksheetType === 'fillblanks' && (isEn ? 'Exercise: Choose the right tribal word to complete each sentence!' : 'अभ्यास: सही जनजातीय शब्द चुनकर वाक्य पूरा करें!')}
                  {worksheetType === 'animals' && (isEn ? 'Exercise: Learn animals & nature in your mother tongue with native audio!' : 'अभ्यास: पशु-पक्षियों व प्रकृति के नाम अपनी मातृभाषा में सीखें व उच्चारण सुनें!')}
                  {worksheetType === 'tracing' && (isEn ? 'Exercise: Practice writing foundational script glyphs along the guidelines!' : 'अभ्यास: सुंदर हस्तलेखन हेतु अक्षरों की बनावट का अभ्यास करें!')}
                  {worksheetType === 'scramble' && (isEn ? 'Exercise: Tap the scrambled letters in order to spell the tribal word!' : 'अभ्यास: अक्षरों को सही क्रम में टैप करके सही शब्द बनाएँ!')}
                </span>
              </div>
            </div>

            {/* Live Interactive Score Counter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                backgroundColor: 'var(--color-surface-tint)',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Star size={16} color="#EAB308" fill="#EAB308" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                {worksheetType === 'matching' && `${Object.keys(matchedPairs).length} / ${matchingItems.length} ${isEn ? 'Matched' : 'मिलान पूर्ण'}`}
                {worksheetType === 'fillblanks' && `${Object.keys(interactiveAnswers).length} / ${fillBlankQuestions.length} ${isEn ? 'Answered' : 'उत्तर दिए'}`}
                {worksheetType === 'numeracy' && `${numberItems.length} ${isEn ? 'Cards' : 'कार्ड्स'}`}
                {worksheetType === 'scramble' && `${scrambleAnswer.length} / ${scrambleItem.letters.length} ${isEn ? 'Letters' : 'वर्ण'}`}
                {['animals', 'tracing'].includes(worksheetType) && (isEn ? 'Active Learning' : 'सक्रिय अभ्यास')}
              </span>

              <button
                type="button"
                onClick={handleResetInteractive}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-slate-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={t.wsResetBtn}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* INTERACTIVE EXERCISE 1: MATCHING COLUMNS (TAP-TO-PAIR)           */}
          {/* ================================================================ */}
          {worksheetType === 'matching' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column (Hindi / English) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-slate-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEn ? 'Column A: Hindi & English Concept' : 'कॉलम A: हिंदी व अंग्रेजी शब्द'}
                </div>

                {matchingItems.map((item, idx) => {
                  const isSelected = matchingSelectedLeft?.id === item.id;
                  const isMatched = !!matchedPairs[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLeftClick(item)}
                      disabled={isMatched}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-lg)',
                        border: isMatched
                          ? '2px solid #22C55E'
                          : isSelected
                          ? '2px solid var(--color-palash)'
                          : '1px solid var(--color-border)',
                        backgroundColor: isMatched
                          ? 'rgba(34, 197, 94, 0.12)'
                          : isSelected
                          ? 'rgba(249, 115, 22, 0.14)'
                          : 'var(--color-surface-card)',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.80rem', color: 'var(--color-slate-muted)', fontWeight: 700 }}>
                          {idx + 1}.
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {item.hindi}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                            {item.english}
                          </div>
                        </div>
                      </div>

                      {isMatched ? (
                        <CheckCircle2 size={18} color="#22C55E" />
                      ) : (
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: isSelected ? '3px solid var(--color-palash)' : '2px solid var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-palash)' : 'transparent',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column (Tribal Mother Tongue) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEn ? `Column B: ${langMeta.name} Mother Tongue` : `कॉलम B: ${langMeta.name} मातृभाषा शब्द`}
                </div>

                {matchingRightColumn.map((item) => {
                  const tribal = getTribalData(item);
                  const isMatched = Object.values(matchedPairs).includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRightClick(item)}
                      disabled={isMatched}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-lg)',
                        border: isMatched
                          ? '2px solid #22C55E'
                          : '1px solid var(--color-border)',
                        backgroundColor: isMatched
                          ? 'rgba(34, 197, 94, 0.12)'
                          : 'var(--color-surface-card)',
                        color: 'var(--color-slate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isMatched ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: isMatched ? '3px solid #22C55E' : '2px solid var(--color-border)',
                            backgroundColor: isMatched ? '#22C55E' : 'transparent',
                          }}
                        />
                        <div>
                          <div
                            className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                            style={{ fontWeight: 800, fontSize: '1.25rem', color: isMatched ? '#22C55E' : 'var(--color-forest)' }}
                          >
                            {tribal.native}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                            {tribal.phonetic}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                          }}
                          title={isEn ? 'Pronounce' : 'उच्चारण सुनें'}
                        >
                          <Volume2 size={16} />
                        </button>
                        {isMatched && <Check size={18} color="#22C55E" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* INTERACTIVE EXERCISE 2: NUMERACY & COUNTING (1-10)               */}
          {/* ================================================================ */}
          {worksheetType === 'numeracy' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {numberItems.map((item, idx) => {
                const tribal = getTribalData(item);
                const countArr = Array.from({ length: item.numeral }, (_, i) => i + 1);
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--color-surface-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.80rem', color: 'var(--color-slate-muted)', fontWeight: 700 }}>
                          {isEn ? `Item ${idx + 1}` : `प्रश्न ${idx + 1}`}
                        </span>
                        <span className="badge-tag badge-forest">
                          {item.hindi}
                        </span>
                      </div>

                      {/* Illustrated objects */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '12px 0' }}>
                        {countArr.map((_, i) => (
                          <span
                            key={i}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(34, 197, 94, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                            }}
                          >
                            <Leaf size={16} color="#22C55E" />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                          {isEn ? 'Tribal Number Name:' : 'मातृभाषा संख्या नाम:'}
                        </div>
                        <div
                          className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                          style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}
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
                          onClick={() => handleSpeak(tribal.audio, tribal.native)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface-tint)',
                            color: 'var(--color-forest)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Volume2 size={15} />
                        </button>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-surface-tint)',
                            border: '2px solid var(--color-palash)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            color: 'var(--color-palash)',
                          }}
                        >
                          {item.numeral}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================================================================ */}
          {/* INTERACTIVE EXERCISE 3: SENTENCE FILL-IN THE BLANKS              */}
          {/* ================================================================ */}
          {worksheetType === 'fillblanks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {fillBlankQuestions.map((q, idx) => {
                const selected = interactiveAnswers[q.id];
                const isCorrect = selected === q.correct;
                return (
                  <div
                    key={q.id}
                    style={{
                      backgroundColor: 'var(--color-surface-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                        {isEn ? `Q${idx + 1}: ${q.englishPrompt} (${q.hindiPrompt})` : `प्रश्न ${idx + 1}: ${q.hindiPrompt}`}
                      </span>
                      {showAnswerKey && (
                        <span className="badge-tag badge-forest" style={{ fontSize: '0.74rem' }}>
                          ✓ {isEn ? 'Solution:' : 'उत्तर:'} {q.correct} ({q.phonetic})
                        </span>
                      )}
                    </div>

                    <div
                      className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                      style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-slate)', letterSpacing: '0.02em' }}
                    >
                      {selected ? q.sentence.replace('_____', selected) : q.sentence}
                    </div>

                    {/* Multiple Choice Chips */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {q.options.map((opt, optIdx) => {
                        const isThisSelected = selected === opt;
                        const isThisCorrect = opt === q.correct;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: 'var(--radius-pill)',
                              border: isScoreEvaluated && isThisCorrect
                                ? '2px solid #22C55E'
                                : isThisSelected
                                ? '2px solid var(--color-palash)'
                                : '1px solid var(--color-border)',
                              backgroundColor: isScoreEvaluated && isThisCorrect
                                ? 'rgba(34, 197, 94, 0.2)'
                                : isThisSelected
                                ? 'rgba(249, 115, 22, 0.18)'
                                : 'var(--color-surface-tint)',
                              color: 'var(--color-slate)',
                              fontWeight: 700,
                              fontSize: '1rem',
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
          )}

          {/* ================================================================ */}
          {/* INTERACTIVE EXERCISE 4: ANIMALS & NATURE VOCABULARY QUIZ          */}
          {/* ================================================================ */}
          {worksheetType === 'animals' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {animalNatureItems.map((item, idx) => {
                const tribal = getTribalData(item);
                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--color-surface-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                          #{idx + 1}
                        </span>
                        <span className="badge-tag badge-ochre">{item.category.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-slate)', margin: '6px 0 2px 0' }}>
                        {item.hindi}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                        {item.english}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                          {isEn ? 'Mother Tongue:' : 'मातृभाषा शब्द:'}
                        </div>
                        <div
                          className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                          style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-forest)' }}
                        >
                          {tribal.native}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                          {tribal.phonetic}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSpeak(tribal.audio, tribal.native)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface-tint)',
                          color: 'var(--color-forest)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={isEn ? 'Listen' : 'उच्चारण सुनें'}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================================================================ */}
          {/* INTERACTIVE EXERCISE 5: ORTHOGRAPHIC SCRIPT TRACING              */}
          {/* ================================================================ */}
          {worksheetType === 'tracing' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {tracingGlyphs.map((glyphObj, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--color-forest)' }}>
                      {glyphObj.name}
                    </div>
                    <div style={{ fontSize: '3.6rem', fontWeight: 900, color: 'var(--color-palash)', margin: '8px 0', letterSpacing: '4px' }}>
                      {glyphObj.char}
                    </div>
                  </div>

                  {/* Dotted Stroke Practice Guide */}
                  <div
                    style={{
                      borderTop: '2px dashed var(--color-border)',
                      borderBottom: '2px dashed var(--color-border)',
                      padding: '10px 0',
                      color: 'var(--color-slate-muted)',
                      fontSize: '1.8rem',
                      letterSpacing: '10px',
                      opacity: 0.7,
                    }}
                  >
                    {glyphObj.char} • {glyphObj.char} • {glyphObj.char}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-muted)', fontStyle: 'italic' }}>
                    {glyphObj.strokeHint}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================================================================ */}
          {/* INTERACTIVE EXERCISE 6: WORD SCRAMBLE / ANAGRAM                  */}
          {/* ================================================================ */}
          {worksheetType === 'scramble' && (
            <div
              style={{
                backgroundColor: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div>
                <span className="badge-tag badge-forest">
                  {isEn ? 'Spelling Builder' : 'वर्ण विन्यास अभ्यास'}
                </span>
                <h3 style={{ fontSize: '1.4rem', margin: '8px 0 2px 0', color: 'var(--color-slate)' }}>
                  {scrambleItem.target.hindi} ({scrambleItem.target.english})
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)' }}>
                  {isEn ? 'Tap the scrambled letters below to assemble the tribal word in correct sequence:' : 'नीचे दिए गए अक्षरों को सही क्रम में टैप करके जनजातीय शब्द बनाएं:'}
                </p>
              </div>

              {/* Slot where tapped letters appear */}
              <div
                style={{
                  minHeight: '60px',
                  minWidth: '260px',
                  border: '2px dashed var(--color-border-focus)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-surface-tint)',
                }}
              >
                {scrambleAnswer.length === 0 ? (
                  <span style={{ color: 'var(--color-slate-muted)', fontSize: '0.86rem' }}>
                    {isEn ? '(Tap letters to slot here)' : '(अक्षर टैप कर यहाँ भरें)'}
                  </span>
                ) : (
                  scrambleAnswer.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRemoveScrambleLetter(idx)}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--color-forest)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                      }}
                      title={isEn ? 'Click to remove' : 'हटाने के लिए टैप करें'}
                    >
                      {item.letter}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled source letter tiles */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {scrambleItem.letters.map((char, idx) => {
                  const isUsed = scrambleAnswer.some((a) => a.originalIndex === idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isUsed}
                      onClick={() => handleScrambleLetterClick(char, idx)}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '10px',
                        backgroundColor: isUsed ? 'var(--color-surface-tint)' : 'var(--color-surface)',
                        color: isUsed ? 'var(--color-slate-muted)' : 'var(--color-slate)',
                        border: isUsed ? '1px dashed var(--color-border)' : '2px solid var(--color-border)',
                        fontWeight: 800,
                        fontSize: '1.35rem',
                        cursor: isUsed ? 'not-allowed' : 'pointer',
                        opacity: isUsed ? 0.4 : 1,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>

              {/* Teacher Solution */}
              {showAnswerKey && (
                <div style={{ fontSize: '0.86rem', color: '#22C55E', fontWeight: 700 }}>
                  ✓ {isEn ? 'Solution Word:' : 'सही शब्द:'} {scrambleItem.correctWord} ({scrambleItem.tribal.phonetic})
                </div>
              )}
            </div>
          )}

          {/* Bottom Evaluation Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '16px',
            }}
          >
            <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
              {isEn ? 'FLN Target: Bridge oral tribal vocabulary to standard Devanagari literacy' : 'निपुण भारत लक्ष्य: मौखिक जनजातीय शब्दावली को देवनागरी साक्षरता से जोड़ना'}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCheckAll}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{t.wsCheckBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MODE B: AUTHENTIC A4 PAPER CANVAS (PRINTABLE PHYSICAL DOCUMENT)   */}
      {/* ==================================================================== */}
      <div
        className={`worksheet-a4-sheet worksheet-printable ${viewMode === 'interactive' ? 'print-only' : ''}`}
        style={{
          width: '100%',
          maxWidth: '920px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderRadius: '8px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45), 0 2px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0',
          padding: '42px 48px',
          display: viewMode === 'interactive' ? undefined : 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
        }}
      >
        {/* Official Header: Government of Jharkhand + Emblem + Audio QR Box */}
        <div style={{ borderBottom: '2.5px solid #0F172A', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0E5B37', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {t.wsEmblemGovt}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                {t.wsEmblemDept}
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', margin: '6px 0 2px 0', letterSpacing: '-0.01em' }}>
                {isEn
                  ? 'NIPUN Bharat Foundational Learning Assessment Worksheet'
                  : 'निपुण भारत बुनियादी अधिगम अभ्यास पत्र (FLN Worksheet)'}
              </h1>
              <div style={{ fontSize: '0.86rem', color: '#D95A27', fontWeight: 700 }}>
                {isEn
                  ? `Bilingual Medium: Hindi + ${langMeta.name} (${langMeta.badgeText})`
                  : `द्विभाषी माध्यम: हिंदी + ${langMeta.name} (${langMeta.badgeText})`}
              </div>
            </div>

            {/* Audio Companion QR Box */}
            <div
              style={{
                border: '1.5px dashed #64748B',
                borderRadius: '6px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#F8FAFC',
              }}
            >
              <QrCode size={36} color="#0E5B37" />
              <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.25 }}>
                <strong style={{ color: '#0F172A' }}>{isEn ? 'Parent Audio QR' : 'ध्वनि साथी क्यूआर'}</strong>
                <br />
                {isEn ? 'Scan to listen' : 'स्कैन कर उच्चारण सुनें'}
              </div>
            </div>
          </div>
        </div>

        {/* Student & School Details Header Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            padding: '12px 16px',
            fontSize: '0.84rem',
            color: '#1E293B',
          }}
        >
          <div><strong>{t.wsSchoolLabel}</strong> {schoolName}</div>
          <div><strong>{t.wsStudentLabel}</strong> ___________________</div>
          <div><strong>{t.wsGradeLabel}</strong> {gradeLevel.toUpperCase()}</div>
          <div><strong>{t.wsDateLabel}</strong> {new Date().toLocaleDateString(isEn ? 'en-IN' : 'hi-IN')}</div>
          <div><strong>{t.wsScoreLabel}</strong> [ _____ / 10 ]</div>
        </div>

        {/* PRINTABLE CONTENT BASED ON WORKSHEET TYPE */}
        {worksheetType === 'matching' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                backgroundColor: '#FEF3C7',
                borderLeft: '4px solid #D97706',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#92400E',
              }}
            >
              {isEn
                ? `Exercise 1 (Word Matching): Draw a line connecting each Hindi word in Column A to its corresponding ${langMeta.name} word in Column B.`
                : `अभ्यास 1 (शब्द मिलान): कॉलम A के हिंदी शब्दों को कॉलम B के सही ${langMeta.name} मातृभाषा शब्दों से रेखा खींचकर मिलाएं।`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', borderBottom: '2px solid #CBD5E1', paddingBottom: '6px' }}>
                  {isEn ? 'Column A (Hindi / English)' : 'कॉलम A (हिंदी शब्द)'}
                </div>
                {matchingItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 16px',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '6px',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    <span>{idx + 1}. {item.hindi} {isEn ? `(${item.english})` : ''}</span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2.5px solid #0F172A' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontWeight: 800, color: '#0E5B37', fontSize: '0.92rem', borderBottom: '2px solid #CBD5E1', paddingBottom: '6px' }}>
                  {isEn ? `Column B (${langMeta.name} Mother Tongue)` : `कॉलम B (${langMeta.name} मातृभाषा)`}
                </div>
                {matchingRightColumn.map((item) => {
                  const tribal = getTribalData(item);
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 16px',
                        border: '1.5px solid #86EFAC',
                        borderRadius: '6px',
                        backgroundColor: '#F0FDF4',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 700,
                        color: '#166534',
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2.5px solid #16A34A' }} />
                      <span className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}>
                        {tribal.native} ({tribal.phonetic})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {worksheetType === 'numeracy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderLeft: '4px solid #16A34A',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#166534',
              }}
            >
              {isEn
                ? `Exercise 2 (Numeracy): Count the objects. Connect with the ${langMeta.name} tribal number name and write the Hindi numeral in the box.`
                : `अभ्यास 2 (संख्या ज्ञान): वस्तुओं को गिनें। ${langMeta.name} मातृभाषा संख्या नाम पहचानें और खाली डिब्बे में संख्या लिखें।`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {numberItems.map((item, idx) => {
                const tribal = getTribalData(item);
                const countArr = Array.from({ length: item.numeral }, (_, i) => i + 1);
                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                        {isEn ? `Item ${idx + 1}: ${item.english}` : `प्रश्न ${idx + 1}: ${item.hindi}`}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                        {countArr.map((_, i) => (
                          <span
                            key={i}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#DCFCE7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Leaf size={16} color="#16A34A" />
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {isEn ? 'Tribal Word:' : 'मातृभाषा शब्द:'}
                        </div>
                        <strong
                          className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                          style={{ fontSize: '1.25rem', color: '#0E5B37', fontWeight: 800 }}
                        >
                          {tribal.native}
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: '6px' }}>
                          ({tribal.phonetic})
                        </span>
                      </div>

                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          border: '2px solid #0F172A',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.2rem',
                          backgroundColor: '#F8FAFC',
                          color: '#0F172A',
                        }}
                      >
                        {showAnswerKey ? item.numeral : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {worksheetType === 'fillblanks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                backgroundColor: '#EFF6FF',
                borderLeft: '4px solid #2563EB',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#1E40AF',
              }}
            >
              {isEn
                ? `Exercise 3 (Sentence Bridging): Complete each mother-tongue sentence by choosing the correct word from the options.`
                : `अभ्यास 3 (वाक्य अभ्यास): सही जनजातीय शब्द चुनकर वाक्य पूरा करें।`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {fillBlankQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    {isEn ? `Q${idx + 1}: ${q.englishPrompt} (${q.hindiPrompt})` : `प्रश्न ${idx + 1}: ${q.hindiPrompt}`}
                  </div>

                  <div
                    className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                    style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.02em' }}
                  >
                    {showAnswerKey ? q.sentence.replace('_____', `[ ${q.correct} ]`) : q.sentence}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {q.options.map((opt, optIdx) => (
                      <span
                        key={optIdx}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1.5px solid #CBD5E1',
                          backgroundColor: '#F8FAFC',
                          color: '#0F172A',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                        }}
                      >
                        ( {String.fromCharCode(65 + optIdx)} ) {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {worksheetType === 'animals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                backgroundColor: '#FDF2F8',
                borderLeft: '4px solid #DB2777',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#9D174D',
              }}
            >
              {isEn
                ? `Exercise 4 (Fauna & Nature): Identify each animal and write its name in ${langMeta.name}.`
                : `अभ्यास 4 (पशु-पक्षी पहचान): नीचे दिए गए पशु-पक्षियों के नाम ${langMeta.name} भाषा में पहचानें व लिखें।`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {animalNatureItems.map((item, idx) => {
                const tribal = getTribalData(item);
                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {isEn ? `Item ${idx + 1}: ${item.english}` : `वस्तु ${idx + 1}: ${item.hindi}`}
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                        {item.hindi} <span style={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 500 }}>({item.english})</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {isEn ? 'Student Answer Line:' : 'उत्तर पंक्ति:'}
                      </div>
                      <div
                        style={{
                          borderBottom: '2px dotted #0F172A',
                          minHeight: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 800,
                          fontSize: '1.15rem',
                          color: '#0E5B37',
                        }}
                      >
                        {showAnswerKey ? `${tribal.native} (${tribal.phonetic})` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {worksheetType === 'tracing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderLeft: '4px solid #F59E0B',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#B45309',
              }}
            >
              {isEn
                ? `Exercise 5 (Orthographic Tracing): Trace the letter glyphs along the dots to practice handwriting.`
                : `अभ्यास 5 (लिपि अनुरेखण): दिए गए अक्षरों को बिंदुओं के ऊपर पेंसिल चलाकर सुंदर हस्तलेखन का अभ्यास करें।`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {tracingGlyphs.map((glyphObj, i) => (
                <div
                  key={i}
                  style={{
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    {glyphObj.name}
                  </div>
                  <div
                    style={{
                      fontSize: '3.2rem',
                      fontWeight: 800,
                      margin: '10px 0',
                      color: '#0E5B37',
                      letterSpacing: '2px',
                    }}
                  >
                    {glyphObj.char}
                  </div>
                  <div
                    style={{
                      borderTop: '2px dashed #94A3B8',
                      borderBottom: '2px dashed #94A3B8',
                      padding: '8px 0',
                      color: '#94A3B8',
                      fontSize: '1.6rem',
                      letterSpacing: '8px',
                    }}
                  >
                    {glyphObj.char} • {glyphObj.char} • {glyphObj.char}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {worksheetType === 'scramble' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                backgroundColor: '#FEF2F2',
                borderLeft: '4px solid #EF4444',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '0.90rem',
                fontWeight: 700,
                color: '#991B1B',
              }}
            >
              {isEn
                ? 'Exercise 6 (Letter Scramble): Arrange the letters in the correct order to spell the mother-tongue word.'
                : 'अभ्यास 6 (अक्षर संयोजन): अक्षरों को सही क्रम में रखकर सही जनजातीय शब्द लिखें।'}
            </div>

            <div style={{ border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '20px', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                {scrambleItem.target.hindi} ({scrambleItem.target.english})
              </div>
              <div style={{ margin: '14px 0', fontSize: '1.6rem', letterSpacing: '12px', fontWeight: 700, color: '#0E5B37' }}>
                {scrambleItem.letters.join('   ')}
              </div>
              <div style={{ borderBottom: '2px solid #0F172A', width: '220px', margin: '0 auto', minHeight: '34px', fontSize: '1.2rem', fontWeight: 800, color: '#0E5B37' }}>
                {showAnswerKey ? scrambleItem.correctWord : ''}
              </div>
            </div>
          </div>
        )}

        {/* Evaluation and Teacher Signature Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '2px solid #E2E8F0', paddingTop: '18px' }}>
          <div>
            <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
              {isEn ? 'Teacher Evaluation Remarks:' : 'शिक्षक मूल्यांकन टिप्पणी:'}
            </span>
            <div style={{ fontSize: '0.80rem', color: '#64748B', marginTop: '2px' }}>
              {isEn ? '☐ Grade A+ (Outstanding)  ☐ Grade A (Satisfactory)  ☐ Grade B (Remedial Needed)' : '☐ उत्कृष्ट (A+)  ☐ संतोषजनक (A)  ☐ उपचारात्मक शिक्षण आवश्यक (B)'}
            </div>
          </div>

          <div style={{ textAlign: 'right', minWidth: '160px' }}>
            <div style={{ width: '150px', borderBottom: '1.5px solid #0F172A', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
              {isEn ? 'Teacher Signature' : 'शिक्षक के हस्ताक्षर (Teacher Sign)'}
            </div>
          </div>
        </div>
      </div>

      {/* Parent Phone QR Audio Scan Simulation Modal */}
      <ParentPhoneScanModal
        isOpen={showPhoneScanModal}
        onClose={() => setShowPhoneScanModal(false)}
        selectedLang={selectedLang}
        worksheetType={worksheetType}
      />
    </div>
  );
}
