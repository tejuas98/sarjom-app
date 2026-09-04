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
} from 'lucide-react';
import { translateHindiToTribal, getContextualSuggestions } from '../services/nlpTranslationEngine';
import { voiceService } from '../services/voiceTranslationService';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { STUDENT_TO_TEACHER_PHRASES } from '../data/classroomPhrases';
import { toast } from 'sonner';

// High-frequency 1-Tap classroom action prompts for rural teachers
const ONE_TAP_CLASSROOM_PROMPTS = [
  { id: 'otp_1', icon: '📖', label: 'किताब खोलो', phrase: 'किताब खोलो और पाठ एक पढ़ो।' },
  { id: 'otp_2', icon: '🪑', label: 'अपनी जगह बैठो', phrase: 'अपनी जगह पर बैठ जाओ।' },
  { id: 'otp_3', icon: '🌟', label: 'शाबाश / बहुत अच्छा', phrase: 'शाबाश, तुमने बहुत अच्छा किया।' },
  { id: 'otp_4', icon: '💧', label: 'पानी पीने जाओ', phrase: 'हाँ, जाओ पानी पीकर तुरंत आओ।' },
  { id: 'otp_5', icon: '🤫', label: 'शांत रहो और सुनो', phrase: 'शान्त रहो और सुनो।' },
  { id: 'otp_6', icon: '✍️', label: 'स्लेट पर लिखो', phrase: 'स्लेट पर लिखकर दिखाओ।' },
  { id: 'otp_7', icon: '🤝', label: 'नमस्ते / जोहार', phrase: 'नमस्ते / जोहार, सभी बच्चे कैसे हैं?' },
  { id: 'otp_8', icon: '🍛', label: 'मध्याह्न भोजन (MDM)', phrase: 'हाथ धोकर मध्याह्न भोजन करो।' },
];

export function VoiceTranslator({ selectedLang }) {
  const [dialogueMode, setDialogueMode] = useState('teacher_to_student'); // 'teacher_to_student' | 'student_to_teacher'
  const [inputText, setInputText] = useState('नमस्ते / जोहार');
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
  }, [selectedLang, dialogueMode]);

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
    toast.info(`🔊 कक्षा स्पीकर प्रसारण: "${label || textToSpeak}"`);
    voiceService.speakText(textToSpeak, lang, () => {
      setIsPlayingAudio(false);
    });
  };

  // ONE-TAP SPEAK & BROADCAST: Teacher taps once -> speaks -> translates -> broadcasts out loud
  const handleStartMic = () => {
    setIsRecording(true);
    toast('🎙️ माइक्रोफ़ोन सक्रिय: हिंदी में बोलें...', {
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
    toast.success(`📢 स्पीकर पर बजा: "${promptItem.label}"`);
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
    toast('🎙️ अपना स्वतंत्र उत्तर हिंदी में बोलें...');
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
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
              backgroundColor: dialogModeIsTeacher ? 'var(--color-forest)' : 'transparent',
              color: dialogModeIsTeacher ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: dialogModeIsTeacher ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: dialogModeIsTeacher ? '0 2px 8px rgba(14, 91, 55, 0.22)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <School size={16} />
            <span>🗣️ शिक्षक ➔ कक्षा स्पीकर (One-Tap Speak)</span>
          </button>
          <button
            onClick={() => setDialogueMode('student_to_teacher')}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: !dialogModeIsTeacher ? 'var(--color-palash)' : 'transparent',
              color: !dialogModeIsTeacher ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: !dialogModeIsTeacher ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: !dialogModeIsTeacher ? '0 2px 8px rgba(217, 90, 39, 0.22)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <User size={16} />
            <span>👂 छात्र ➔ शिक्षक (Reverse Ear)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: TEACHER SPEAKS HINDI -> TRIBAL CLASSROOM BROADCAST (PURE & SIMPLE) */}
      {/* ========================================================================= */}
      {dialogModeIsTeacher && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 1. HERO CARD: THE PRIMARY CLASSROOM VOICE BUTTON */}
          <div
            className="card-brutal"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(14, 91, 55, 0.18)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03), 0 12px 30px -6px rgba(14, 91, 55, 0.06)',
            }}
          >
            {/* Big Tactile Microphone Broadcast Button */}
            <button
              type="button"
              onClick={isRecording ? handleStopMic : handleStartMic}
              className={`btn-brutal ${isRecording ? 'btn-palash' : 'btn-primary'}`}
              style={{
                width: '100%',
                padding: '22px 26px',
                fontSize: '1.25rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isRecording ? '#DC2626' : 'var(--color-forest)',
                color: '#FFFFFF',
                border: 'none',
                boxShadow: isRecording
                  ? '0 8px 28px rgba(220, 38, 38, 0.4)'
                  : '0 8px 26px rgba(14, 91, 55, 0.28)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {isRecording ? (
                <>
                  <MicOff size={32} className="audio-pulse" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.35rem' }}>🔴 सुन रहे हैं... (रोकने हेतु यहाँ दबाएं)</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 400, opacity: 0.95 }}>
                      सामान्य हिंदी में बोलें — रोकते ही तुरंत {langMeta.name} में स्पीकर पर गूंजेगा
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Mic size={32} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.35rem' }}>🎙️ यहाँ दबाकर बोलें (Tap to Speak)</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 400, opacity: 0.95 }}>
                      हिंदी में बोलें — सीधे कक्षा स्पीकर पर {langMeta.name} में गूंजेगा
                    </div>
                  </div>
                </>
              )}
            </button>

            {/* Current Spoken / Translated Sentence Display (Clean & Bold) */}
            {translationResult && (
              <div
                style={{
                  backgroundColor: 'var(--color-forest-subtle)',
                  border: '1px solid rgba(14, 91, 55, 0.20)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Hindi Source */}
                <div style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)' }}>
                  आपने बोला: <strong style={{ color: 'var(--color-slate)' }}>"{inputText}"</strong>
                </div>

                {/* Big Tribal Translation */}
                <div
                  className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                  style={{
                    fontSize: '2.3rem',
                    fontWeight: 800,
                    color: 'var(--color-forest)',
                    lineHeight: 1.25,
                  }}
                >
                  {translationResult.nativeScript}
                </div>

                {/* Teacher Speech Guide */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '8px',
                    borderTop: '1px dashed rgba(14, 91, 55, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#523702' }}>
                    🗣️ ऐसे बोलें: <span style={{ color: 'var(--color-palash)' }}>{translationResult.phoneticDeva}</span>
                    <span style={{ fontSize: '0.85rem', color: '#71717A', fontWeight: 500, marginLeft: '8px' }}>
                      ({translationResult.phoneticLatin})
                    </span>
                  </div>

                  {/* Replay Audio Button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleSpeakAudio(
                        translationResult.audioText || translationResult.phoneticDeva,
                        translationResult.nativeScript
                      );
                    }}
                    className="btn-brutal btn-palash"
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Volume2 size={18} className={isPlayingAudio ? 'audio-pulse' : ''} />
                    <span>🔊 दोबारा स्पीकर पर सुनाएं</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. INSTANT CLASSROOM COMMANDS (8 Tactile Tiles for Rural Teachers) */}
          <div
            className="card-brutal"
            style={{
              padding: '20px 24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span>
              <span>कक्षा में तुरंत बोलने वाले 8 आम निर्देश (टैप करते ही स्पीकर पर बोलेगा):</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {ONE_TAP_CLASSROOM_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleInstantPromptClick(prompt)}
                  className="btn-brutal"
                  style={{
                    padding: '12px 14px',
                    backgroundColor: inputText === prompt.phrase ? 'var(--color-forest-subtle)' : '#FFFFFF',
                    borderColor: inputText === prompt.phrase ? 'var(--color-forest)' : 'var(--color-border)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{prompt.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                      {prompt.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{prompt.phrase}"
                    </div>
                  </div>
                  <Volume2 size={16} color="var(--color-forest)" />
                </button>
              ))}
            </div>
          </div>

          {/* 4. COLLAPSIBLE ADVANCED / CUSTOM INPUT (PRESERVES ALL CUSTOM TEXT OPTIONS WITHOUT CLUTTER) */}
          <div
            className="card-brutal"
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
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
                <span style={{ fontSize: '1.1rem' }}>✍️</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-slate)' }}>
                  मैन्युअल वाक्य टाइपिंग व अतिरिक्त FLN वाक्यांश (Manual Text Typing & Full Syllabus)
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
                  यदि आप कोई विशिष्ट पाठ या लंबा वाक्य अनुवाद करना चाहते हैं, तो नीचे टाइप करके अनुवाद करें:
                </p>

                <form onSubmit={handleSubmitCustom} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      handleTranslate(e.target.value);
                    }}
                    placeholder="कस्टम हिंदी वाक्य लिखें (उदा: सभी बच्चे अपनी स्लेट निकालें)..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-thick)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-brutal btn-forest"
                    style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={16} />
                    <span>अनुवाद</span>
                  </button>
                </form>

                {/* Additional Quick Syllabus Chips */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-muted)', marginBottom: '6px' }}>
                    अतिरिक्त FLN सुझाव (Full Lexicon Suggestions):
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
                        className="btn-brutal"
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.78rem',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid var(--color-border)',
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
      {/* MODE 2: STUDENT SPEAKS TRIBAL -> HINDI FOR TEACHER (REVERSE EAR)         */}
      {/* ========================================================================= */}
      {!dialogModeIsTeacher && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Left Column: Student Tribal Utterances */}
          <div className="card-brutal" style={{ padding: '24px', backgroundColor: 'var(--color-ochre-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🧒</span>
                <h2 style={{ fontSize: '1.35rem', margin: 0, color: '#8C5F08' }}>
                  छात्र मातृभाषा संवाद ({langMeta.name})
                </h2>
              </div>
              <span className="badge-tag badge-palash">छात्र प्रत्युत्तर</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#523702', margin: '0 0 16px 0' }}>
              कक्षा में जब आदिवासी छात्र अपनी मातृभाषा में बात करें, तो उस वाक्य पर टैप करें या छात्र से माइक में बोलने को कहें:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {STUDENT_TO_TEACHER_PHRASES.map((item) => {
                const tribalInfo = item[selectedLang] || item.santhali;
                const tribalScript = tribalInfo.nativeOlChiki || tribalInfo.native;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleStudentQuerySelect(item)}
                    className="btn-brutal"
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#FFFFFF',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                    <span className="badge-tag badge-forest">अनुवाद करें ➔</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Hindi Interpretation for Teacher */}
          <div
            className="card-brutal"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <School size={20} color="var(--color-forest)" />
                <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-forest)' }}>
                  शिक्षक व्याख्या (Hindi Interpretation)
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-muted)' }}>
                छात्र द्वारा मातृभाषा में कही गई बात का तुरंत हिंदी अर्थ और ध्वनि:
              </p>

              <div
                style={{
                  marginTop: '16px',
                  padding: '20px',
                  backgroundColor: 'var(--color-forest-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(14, 91, 55, 0.22)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
                  छात्र का आशय (Meaning for Teacher):
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate)', margin: '10px 0' }}>
                  {history.find((h) => h.direction === 'student')?.targetText ||
                    'बाएं से छात्र का वाक्य चुनें या माइक में बोलने दें...'}
                </div>
              </div>

              {/* Teacher Autonomous Independent Response Hub */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🗣️</span>
                    <span>शिक्षक का स्वतंत्र उत्तर (Teacher's Autonomous Response):</span>
                  </div>
                  <span className="badge-tag badge-forest">शिक्षक की स्वायत्तता</span>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.82rem',
                    color: 'var(--color-slate-muted)',
                  }}
                >
                  💡 <strong>शिक्षक को पूर्ण स्वतंत्रता:</strong> AI शिक्षक का उत्तर तय नहीं करेगा। छात्र की बात सुनकर शिक्षक जो भी बोलना या निर्देश देना चाहें, अपनी हिंदी में बोलें या टाइप करें — सिस्टम तुरंत उसे छात्र की मातृभाषा <strong>({langMeta.name})</strong> में अनुवाद कर कक्षा स्पीकर पर सुनाएगा।
                </div>

                {/* Speak Response Button */}
                <button
                  type="button"
                  onClick={isReplyingMic ? handleStopMic : handleTeacherReplyMic}
                  className={`btn-brutal ${isReplyingMic ? 'btn-palash' : 'btn-forest'}`}
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
                  }}
                >
                  {isReplyingMic ? (
                    <>
                      <MicOff size={20} className="audio-pulse" />
                      <span>सुन रहे हैं... (रोकने हेतु पुनः दबाएं)</span>
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      <span>🎙️ अपना उत्तर बोलें (Speak Your Response in Hindi)</span>
                    </>
                  )}
                </button>

                {/* Type Response Form */}
                <form onSubmit={handleTeacherReplySubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={teacherReplyText}
                    onChange={(e) => setTeacherReplyText(e.target.value)}
                    placeholder="या अपना स्वतंत्र उत्तर यहाँ लिखें (उदा: ठीक है, 2 मिनट बाद जाना / अभी कॉपी दिखाओ)..."
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-thick)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-brutal btn-palash"
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={16} />
                    <span>सुनाएं</span>
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
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--color-forest)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>कक्षा संवाद लॉग (Classroom Interaction Log)</h3>
            <span className="badge-tag badge-ochre">{history.length} प्रविष्टियाँ</span>
          </div>

          <button
            onClick={exportClassroomDialogueCSV}
            className="btn-brutal btn-forest"
            style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileDown size={15} />
            <span>MicroSD / पेनड्राइव लॉग निर्यात (CSV)</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate-muted)', fontSize: '0.88rem' }}>
            ऊपर माइक बटन दबाकर बोलें या 1-टैप निर्देश चुनें। यहाँ कक्षा संवाद स्वतः दर्ज होता रहेगा।
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: item.direction === 'teacher' ? 'var(--color-forest-subtle)' : 'var(--color-ochre-subtle)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, marginRight: '8px' }}>
                    {item.direction === 'teacher' ? '👨‍🏫 शिक्षक:' : '🧒 छात्र:'}
                  </span>
                  <span>"{item.sourceText}"</span>
                  <span style={{ margin: '0 8px', color: 'var(--color-slate-muted)' }}>➔</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-forest)' }}>"{item.targetText}"</span>
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
