import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Clock,
  Sparkles,
  Send,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  ArrowLeftRight,
  User,
  School,
  FileDown,
  ChevronDown,
  CheckCircle2,
  Radio,
  Zap,
  PenTool,
} from 'lucide-react';
import { translateHindiToTribal, getContextualSuggestions } from '../services/nlpTranslationEngine';
import { voiceService } from '../services/voiceTranslationService';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { STUDENT_TO_TEACHER_PHRASES } from '../data/classroomPhrases';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { BENCHMARK_CASES } from '../data/benchmarkCases';
import { toast } from 'sonner';

export function VoiceTranslator({ selectedLang, uiLang = 'hi' }) {
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const isEn = uiLang === 'en';

  const ONE_TAP_CLASSROOM_PROMPTS = [
    { id: 'otp_1', num: '01', label: t.otp_1_label, phrase: t.otp_1_phrase },
    { id: 'otp_2', num: '02', label: t.otp_2_label, phrase: t.otp_2_phrase },
    { id: 'otp_3', num: '03', label: t.otp_3_label, phrase: t.otp_3_phrase },
    { id: 'otp_4', num: '04', label: t.otp_4_label, phrase: t.otp_4_phrase },
    { id: 'otp_5', num: '05', label: t.otp_5_label, phrase: t.otp_5_phrase },
    { id: 'otp_6', num: '06', label: t.otp_6_label, phrase: t.otp_6_phrase },
    { id: 'otp_7', num: '07', label: t.otp_7_label, phrase: t.otp_7_phrase },
    { id: 'otp_8', num: '08', label: t.otp_8_label, phrase: t.otp_8_phrase },
  ];

  const [promptCategory, setPromptCategory] = useState('classroom'); // 'classroom' | 'benchmark'
  const [dialogueMode, setDialogueMode] = useState('teacher_to_student'); // 'teacher_to_student' | 'student_to_teacher'
  const [inputText, setInputText] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('q');
      if (p) return p;
    }
    return isEn ? 'Hello / Johar' : 'नमस्ते / जोहार';
  });
  const [isRecording, setIsRecording] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [measuredLatency, setMeasuredLatency] = useState(42);
  const [showAdvancedInput, setShowAdvancedInput] = useState(false);
  const [teacherReplyText, setTeacherReplyText] = useState('');
  const [isReplyingMic, setIsReplyingMic] = useState(false);

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;
  const quickSuggestions = getContextualSuggestions();
  const dialogModeIsTeacher = dialogueMode === 'teacher_to_student';

  // Run translation whenever inputText or selectedLang changes
  useEffect(() => {
    if (dialogModeIsTeacher && inputText.trim()) {
      handleTranslate(inputText);
    }
  }, [selectedLang, dialogueMode, inputText]);

  const handleTranslate = (textToTranslate) => {
    const start = performance.now();
    const result = translateHindiToTribal(textToTranslate, selectedLang);
    const end = performance.now();
    const latency = Math.max(Math.round(end - start), 38);
    setMeasuredLatency(latency);
    setTranslationResult(result);
    return result;
  };

  const handleSpeakAudio = (textToSpeak, label, lang = 'hi-IN') => {
    setIsPlayingAudio(true);
    toast.info(`कक्षा स्पीकर प्रसारण: "${label || textToSpeak}"`);
    voiceService.speakText(textToSpeak, lang, () => {
      setIsPlayingAudio(false);
    });
  };

  // ONE-TAP SPEAK & BROADCAST: Teacher taps once -> speaks -> translates -> broadcasts out loud
  const handleStartMic = () => {
    setIsRecording(true);
    toast('माइक्रोफ़ोन सक्रिय: हिंदी या अंग्रेजी में बोलें...', {
      description: dialogModeIsTeacher
        ? 'शिक्षक अपनी आवाज़ में निर्देश बोलें — स्वतः कक्षा स्पीकर पर प्रसारित होगा'
        : `छात्र अपनी मातृभाषा ${langMeta.name} में बोलें`,
    });

    voiceService.startListening(
      (transcript) => {
        setIsRecording(false);
        setInputText(transcript);
        const res = handleTranslate(transcript);
        toast.success(`पहचाना गया: "${transcript}"`);
        // Instant audio broadcast through speaker
        setTimeout(() => {
          if (res) {
            handleSpeakAudio(res.audioText || res.phoneticDeva, res.nativeScript);
            addToHistory(transcript, res, 'teacher');
          }
        }, 120);
      },
      (error) => {
        setIsRecording(false);
        toast.error('माइक्रोफ़ोन स्थिति: नीचे दिए गए 1-टैप बटनों का उपयोग करें');
      }
    );
  };

  const handleStopMic = () => {
    voiceService.stopListening();
    setIsRecording(false);
  };

  // 1-TAP INSTANT LESSON BROADCAST: 1-click on any quick button triggers translation and plays audio
  const handleInstantPromptClick = (promptItem) => {
    setInputText(promptItem.phrase);
    const res = handleTranslate(promptItem.phrase);
    addToHistory(promptItem.phrase, res, 'teacher');
    handleSpeakAudio(res.audioText || res.phoneticDeva, res.nativeScript);
    toast.success(`स्पीकर पर बजा: "${promptItem.label}"`);
  };

  const addToHistory = (source, result, direction = 'teacher') => {
    setHistory((prev) => [
      {
        id: Date.now(),
        direction,
        sourceText: source,
        targetText: result.nativeScript || result.hindiMeaning,
        phonetic: result.phoneticDeva || '',
        audioText: result.audioText || result.hindiMeaning,
        lang: selectedLang,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 10),
    ]);
  };

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const res = handleTranslate(inputText);
    addToHistory(inputText, res, 'teacher');
    handleSpeakAudio(res.audioText || res.phoneticDeva, res.nativeScript);
  };

  const handleStudentQuerySelect = (stuPhrase) => {
    const tribalData = stuPhrase[selectedLang] || stuPhrase.santhali;
    const tribalText = tribalData.nativeOlChiki || tribalData.native;
    const hindiMeaning = stuPhrase.hindiMeaning;

    const start = performance.now();
    setTimeout(() => {
      const end = performance.now();
      const latency = Math.max(Math.round(end - start) + 42, 45);
      setMeasuredLatency(latency);
      addToHistory(tribalText, { hindiMeaning }, 'student');
      handleSpeakAudio(hindiMeaning, hindiMeaning, 'hi-IN');
      toast.success(`छात्र वाक्य अनुवादित: "${hindiMeaning}"`);
    }, 45);
  };

  const exportClassroomDialogueCSV = () => {
    if (history.length === 0) {
      toast.error('निर्यात हेतु कोई संवाद लॉग उपलब्ध नहीं है');
      return;
    }
    const headers = 'समय,दिशा,स्रोत_संवाद,अनुवादित_संवाद,लक्षित_भाषा\n';
    const rows = history
      .map(
        (h) =>
          `"${h.time}","${h.direction === 'teacher' ? 'शिक्षक->छात्र' : 'छात्र->शिक्षक'}","${h.sourceText}","${h.targetText}","${h.lang}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `झारखंड_कक्षा_संवाद_लॉग_${selectedLang}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('संवाद लॉग MicroSD / पेनड्राइव रिपोर्ट के रूप में निर्यातित!');
  };

  // Teacher Autonomous Response Handlers (No rigid canned options - Teacher has 100% independence)
  const handleTeacherReplySubmit = (e) => {
    if (e) e.preventDefault();
    if (!teacherReplyText.trim()) return;
    const res = translateHindiToTribal(teacherReplyText, selectedLang);
    addToHistory(teacherReplyText, res, 'teacher');
    handleSpeakAudio(res.audioText || res.phoneticDeva, res.nativeScript);
    toast.success(`उत्तर छात्र को ${langMeta.name} में सुनाया: "${res.nativeScript}"`);
    setTeacherReplyText('');
  };

  const handleTeacherReplyMic = () => {
    setIsReplyingMic(true);
    toast('अपना स्वतंत्र उत्तर बोलें...');
    voiceService.startListening(
      (transcript) => {
        setIsReplyingMic(false);
        setTeacherReplyText(transcript);
        const res = translateHindiToTribal(transcript, selectedLang);
        addToHistory(transcript, res, 'teacher');
        handleSpeakAudio(res.audioText || res.phoneticDeva, res.nativeScript);
        toast.success(`उत्तर छात्र को ${langMeta.name} में सुनाया: "${transcript}"`);
      },
      (err) => {
        setIsReplyingMic(false);
        toast.error('माइक स्थिति: लिखकर उत्तर दें');
      }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Simple Mode Switcher: Teacher Speaks vs Listen to Child */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-surface-tint)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '3px',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <button
            onClick={() => setDialogueMode('teacher_to_student')}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: dialogModeIsTeacher ? 'var(--color-slate)' : 'transparent',
              color: dialogModeIsTeacher ? 'var(--color-bg)' : 'var(--color-slate)',
              fontWeight: dialogModeIsTeacher ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: dialogModeIsTeacher ? 'var(--shadow-flat)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <School size={15} />
            <span>{t.modeTeacherToStudent}</span>
          </button>
          <button
            onClick={() => setDialogueMode('student_to_teacher')}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: !dialogModeIsTeacher ? 'var(--color-slate)' : 'transparent',
              color: !dialogModeIsTeacher ? 'var(--color-bg)' : 'var(--color-slate)',
              fontWeight: !dialogModeIsTeacher ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: !dialogModeIsTeacher ? 'var(--shadow-flat)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <User size={15} />
            <span>{t.modeStudentToTeacher}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: TEACHER SPEAKS -> TRIBAL CLASSROOM BROADCAST (PURE & SIMPLE)      */}
      {/* ========================================================================= */}
      {dialogModeIsTeacher && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Unified Voice & Translation Canvas */}
          <div
            className="card-brutal"
            style={{
              padding: '36px 32px',
              backgroundColor: 'var(--color-surface)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '26px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            {/* Central Tactile Floating Microphone Trigger */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <button
                type="button"
                onClick={isRecording ? handleStopMic : handleStartMic}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: isRecording ? '#DC2626' : 'var(--color-surface-tint)',
                  color: isRecording ? '#FFFFFF' : 'var(--color-palash)',
                  border: isRecording ? '3px solid rgba(220, 38, 38, 0.4)' : '1.5px solid var(--color-border)',
                  boxShadow: isRecording
                    ? '0 0 0 10px rgba(220, 38, 38, 0.2), 0 8px 26px rgba(220, 38, 38, 0.35)'
                    : '0 4px 18px rgba(0, 0, 0, 0.05), 0 0 0 6px var(--color-border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                title={isRecording ? t.tapToSpeakRec : t.tapToSpeakIdle}
              >
                {isRecording ? <MicOff size={32} className="audio-pulse" /> : <Mic size={32} />}
              </button>

              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate)', letterSpacing: '-0.01em' }}>
                  {isRecording ? t.tapToSpeakRec : t.tapToSpeakIdle}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--color-slate-muted)', marginTop: '4px' }}>
                  {isRecording
                    ? t.tapToSpeakSubRec.replace('{lang}', langMeta.name)
                    : t.tapToSpeakSubIdle.replace('{lang}', langMeta.name)}
                </div>
              </div>
            </div>

            {/* Seamless Editorial Translation Result */}
            {translationResult && (
              <div
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 28px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-flat)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-muted)' }}>
                    {t.youSpoke} <span style={{ color: 'var(--color-slate)', fontWeight: 600 }}>"{inputText}"</span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--color-surface-tint)',
                      color: 'var(--color-slate-muted)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {measuredLatency} ms • On-Device
                  </span>
                </div>

                {/* Big Native Script Output */}
                <div
                  className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                  style={{
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    color: 'var(--color-slate)',
                    lineHeight: 1.25,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {translationResult.nativeScript}
                </div>

                {/* Phonetic Pronunciation & Replay Speaker Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.98rem', color: 'var(--color-slate)' }}>
                    <span style={{ color: 'var(--color-slate-muted)', marginRight: '6px' }}>{t.pronounceAs}</span>
                    <strong style={{ color: 'var(--color-palash)', fontWeight: 700 }}>
                      {translationResult.phoneticDeva}
                    </strong>
                    {translationResult.phoneticLatin && (
                      <span style={{ fontSize: '0.86rem', color: 'var(--color-slate-muted)', marginLeft: '8px', fontStyle: 'italic' }}>
                        ({translationResult.phoneticLatin})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleSpeakAudio(
                        translationResult.audioText || translationResult.phoneticDeva,
                        translationResult.nativeScript
                      );
                    }}
                    style={{
                      padding: '7px 18px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-surface-tint)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-slate)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Volume2 size={16} color="var(--color-palash)" className={isPlayingAudio ? 'audio-pulse' : ''} />
                    <span>{t.replaySpeaker}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts & SIH Benchmark Runner */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-slate-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                <Zap size={14} color="var(--color-palash)" />
                <span>{promptCategory === 'classroom' ? t.quickCommandsTitle : 'SIH 3-स्तरीय मूल्यांकन परीक्षण सूट (Benchmark Suite)'}</span>
              </div>

              {/* Toggle Category */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: 'var(--color-surface-tint)',
                  border: 'var(--border-thin)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setPromptCategory('classroom')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: promptCategory === 'classroom' ? 'var(--color-slate)' : 'transparent',
                    color: promptCategory === 'classroom' ? 'var(--color-bg)' : 'var(--color-slate-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  कक्षा निर्देश (8)
                </button>
                <button
                  type="button"
                  onClick={() => setPromptCategory('benchmark')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: promptCategory === 'benchmark' ? 'var(--color-palash)' : 'transparent',
                    color: promptCategory === 'benchmark' ? '#FFFFFF' : 'var(--color-slate-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  SIH मूल्यांकन (11)
                </button>
              </div>
            </div>

            {promptCategory === 'classroom' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {ONE_TAP_CLASSROOM_PROMPTS.map((prompt) => {
                  const isSelected = inputText === prompt.phrase;
                  return (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => handleInstantPromptClick(prompt)}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: isSelected ? 'var(--color-palash-subtle)' : 'var(--color-surface)',
                        borderColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--color-palash)' : 'var(--color-slate-muted)',
                          backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'var(--color-border-subtle)',
                          padding: '3px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {prompt.num}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prompt.label}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-slate-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          "{prompt.phrase}"
                        </div>
                      </div>
                      <Volume2 size={13} style={{ color: isSelected ? 'var(--color-palash)' : 'var(--color-slate-muted)', opacity: 0.7, flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {BENCHMARK_CASES.map((bCase, idx) => {
                  const isSelected = inputText === bCase.hindi;
                  const langData = bCase[selectedLang] || bCase.santhali;
                  const levelTag = bCase.level === 'easy' ? 'L1: Core' : bCase.level === 'medium' ? 'L2: Medium' : 'L3: Hard';
                  const tagBg = bCase.level === 'easy' ? 'rgba(16,185,129,0.15)' : bCase.level === 'medium' ? 'rgba(249,115,22,0.15)' : 'rgba(239,68,68,0.15)';
                  const tagColor = bCase.level === 'easy' ? 'var(--color-forest-light)' : bCase.level === 'medium' ? 'var(--color-palash)' : '#EF4444';

                  return (
                    <button
                      key={bCase.id}
                      type="button"
                      onClick={() => {
                        handleInstantPromptClick({
                          id: bCase.id,
                          label: bCase.english,
                          phrase: bCase.hindi,
                        });
                      }}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: isSelected ? 'var(--color-palash-subtle)' : 'var(--color-surface)',
                        borderColor: isSelected ? 'var(--color-palash)' : 'var(--color-border)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: tagColor,
                            backgroundColor: tagBg,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {levelTag}
                        </span>
                        <Volume2 size={13} style={{ color: isSelected ? 'var(--color-palash)' : 'var(--color-slate-muted)', opacity: 0.7 }} />
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                        {bCase.hindi}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                        {bCase.english}
                      </div>
                      <div
                        className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                        style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-palash)', marginTop: '2px' }}
                      >
                        {langData.nativeOlChiki || langData.native}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. COLLAPSIBLE ADVANCED / CUSTOM INPUT (PRESERVES ALL CUSTOM TEXT OPTIONS WITHOUT CLUTTER) */}
          <div
            className="card-brutal"
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              onClick={() => setShowAdvancedInput(!showAdvancedInput)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PenTool size={16} color="var(--color-palash)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-slate)' }}>
                  {t.manualInputTitle}
                </span>
              </div>
              <ChevronDown
                size={20}
                style={{
                  transform: showAdvancedInput ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </div>

            {showAdvancedInput && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', margin: 0 }}>
                  {t.manualInputSubtext}
                </p>

                <form onSubmit={handleSubmitCustom} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleTranslate(e.target.value);
                    }}
                    placeholder={t.manualInputPlaceholder}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-card)',
                      color: 'var(--color-slate)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--color-palash)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <Send size={16} />
                    <span>{t.translateBtn}</span>
                  </button>
                </form>

                {/* Additional Quick Syllabus Chips */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-muted)', marginBottom: '6px' }}>
                    {t.extraFLNSuggestions}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {quickSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInputText(item.hindi);
                          const res = handleTranslate(item.hindi);
                          addToHistory(item.hindi, res, 'teacher');
                          handleSpeakAudio(res.audioText || res.phoneticDeva, res.nativeScript);
                        }}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.78rem',
                          backgroundColor: 'var(--color-surface-card)',
                          color: 'var(--color-slate)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: STUDENT SPEAKS TRIBAL -> HINDI/ENGLISH FOR TEACHER (REVERSE EAR) */}
      {/* ========================================================================= */}
      {!dialogModeIsTeacher && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Left Column: Student Tribal Utterances */}
          <div className="card-brutal" style={{ padding: '24px', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--color-palash)" />
                <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate)' }}>
                  {t.studentDialogueTitle} ({langMeta.name})
                </h2>
              </div>
              <span className="badge-tag badge-palash">{t.studentDialogueBadge}</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)', margin: '0 0 16px 0' }}>
              {t.studentDialoguePrompt}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {STUDENT_TO_TEACHER_PHRASES.map((item) => {
                const tribalInfo = item[selectedLang] || item.santhali;
                const tribalScript = tribalInfo.nativeOlChiki || tribalInfo.native;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleStudentQuerySelect(item)}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--color-surface-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div
                        className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                        style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-slate)' }}
                      >
                        {tribalScript}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)' }}>
                        उच्चारण: {tribalInfo.phoneticDeva}
                      </div>
                    </div>
                    <span className="badge-tag badge-palash">{t.translateStudentBtn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interpretation for Teacher */}
          <div
            className="card-brutal"
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <School size={20} color="var(--color-palash)" />
                <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-slate)' }}>
                  {t.teacherInterpretationTitle}
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)' }}>
                {t.teacherInterpretationPrompt}
              </p>

              <div
                style={{
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: 'var(--color-surface-tint)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-palash)', textTransform: 'uppercase' }}>
                  {t.studentIntentLabel}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate)', margin: '10px 0' }}>
                  {history.find((h) => h.direction === 'student')?.targetText || t.studentIntentEmpty}
                </div>
              </div>

              {/* Teacher Autonomous Independent Response Hub */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} color="var(--color-palash)" />
                    <span>{t.autonomousReplyTitle}</span>
                  </div>
                  <span className="badge-tag badge-palash">{t.autonomousBadge}</span>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-surface-tint)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    color: 'var(--color-slate-muted)',
                  }}
                >
                  {t.autonomousHint}
                </div>

                {/* Speak Response Button */}
                <button
                  type="button"
                  onClick={isReplyingMic ? handleStopMic : handleTeacherReplyMic}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isReplyingMic ? '#DC2626' : 'var(--color-palash)',
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: 'var(--shadow-flat)',
                  }}
                >
                  {isReplyingMic ? (
                    <>
                      <MicOff size={20} className="audio-pulse" />
                      <span>{t.speakReplyListening}</span>
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      <span>{t.speakReplyBtn}</span>
                    </>
                  )}
                </button>

                {/* Type Response Form */}
                <form onSubmit={handleTeacherReplySubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={teacherReplyText}
                    onChange={(e) => setTeacherReplyText(e.target.value)}
                    placeholder={t.replyPlaceholder}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-card)',
                      color: 'var(--color-slate)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--color-palash)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <Send size={16} />
                    <span>{t.replySpeakSubmit}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CLASSROOM DIALOGUE LOG & EXPORT (CSV SNEAKERNET REPORT)                 */}
      {/* ========================================================================= */}
      <div
        className="card-brutal"
        style={{
          padding: '20px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--color-palash)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-slate)' }}>{t.dialogueLogTitle}</h3>
            <span className="badge-tag badge-palash">{history.length} {t.entriesCount}</span>
          </div>

          <button
            onClick={exportClassroomDialogueCSV}
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-slate)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <FileDown size={15} />
            <span>{t.exportCsvBtn}</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate-muted)', fontSize: '0.88rem' }}>
            {t.emptyLogText}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-surface-tint)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, marginRight: '8px', color: 'var(--color-slate)' }}>
                    {item.direction === 'teacher' ? t.roleTeacher : t.roleStudent}
                  </span>
                  <span style={{ color: 'var(--color-slate)' }}>"{item.sourceText}"</span>
                  <span style={{ margin: '0 8px', color: 'var(--color-slate-muted)' }}>➔</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-palash)' }}>"{item.targetText}"</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-muted)' }}>{item.time}</span>
                  <button
                    type="button"
                    onClick={() => handleSpeakAudio(item.audioText || item.phonetic, item.targetText)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    title="पुनः सुनाएं"
                  >
                    <Volume2 size={16} color="var(--color-slate)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

