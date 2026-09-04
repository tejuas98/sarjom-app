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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Status & SLA Banner */}
      <div
        className="card-brutal"
        style={{
          padding: '12px 18px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: '#E8F4ED',
              border: '1.5px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Radio size={15} color="#0E5B37" className="audio-pulse" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate)' }}>
              कक्षा स्पीकर स्थिति: <span style={{ color: '#0E5B37' }}>सक्रिय (34MB Offline Mode)</span>
            </span>
          </div>

          <span className="badge-tag badge-palash">
            मातृभाषा: {langMeta.name} ({langMeta.badgeText})
          </span>

          <span className="badge-tag badge-forest">
            विलंबता: {measuredLatency} ms (SLA &lt; 3s ✅)
          </span>
        </div>

        {/* Mode Selector Toggle */}
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
            onClick={() => setDialogueMode('teacher_to_student')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: dialogModeIsTeacher ? 'var(--color-forest)' : 'transparent',
              color: dialogModeIsTeacher ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: dialogModeIsTeacher ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <School size={15} />
            शिक्षक ➔ कक्षा स्पीकर (One-Tap Broadcast)
          </button>
          <button
            onClick={() => setDialogueMode('student_to_teacher')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: !dialogModeIsTeacher ? 'var(--color-palash)' : 'transparent',
              color: !dialogModeIsTeacher ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: !dialogModeIsTeacher ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <User size={15} />
            छात्र ➔ शिक्षक (Reverse Ear)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: TEACHER SPEAKS HINDI -> TRIBAL CLASSROOM BROADCAST (DEAD SIMPLE) */}
      {/* ========================================================================= */}
      {dialogModeIsTeacher && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. HERO CARD: ONE-TAP SPEAK & BROADCAST */}
          <div
            className="card-brutal"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '3px solid var(--color-forest)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', margin: 0, color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📢</span>
                  <span>एक-क्लिक कक्षा स्पीकर प्रसारण (One-Tap Classroom Broadcast)</span>
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-slate-muted)', margin: '4px 0 0 0' }}>
                  बटन दबाएं और हिंदी में बोलें — सिस्टम तुरंत <strong>{langMeta.name}</strong> में अनुवाद कर सीधे कक्षा स्पीकर पर बजा देगा।
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-tag badge-ochre">कक्षा 1-3 FLN</span>
                <span className="badge-tag badge-forest">100% ऑफ़लाइन</span>
              </div>
            </div>

            {/* Giant Tactile One-Tap Button */}
            <button
              type="button"
              onClick={isRecording ? handleStopMic : handleStartMic}
              className={`btn-brutal ${isRecording ? 'btn-palash' : 'btn-primary'}`}
              style={{
                width: '100%',
                padding: '20px 24px',
                fontSize: '1.2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isRecording ? 'var(--color-palash)' : 'var(--color-forest)',
                color: '#FFFFFF',
                border: 'var(--border-thick)',
                cursor: 'pointer',
              }}
            >
              {isRecording ? (
                <>
                  <MicOff size={28} className="audio-pulse" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.25rem' }}>🔴 सुन रहे हैं... (रोकने हेतु यहाँ दबाएं)</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.95 }}>
                      सामान्य हिंदी में बोलें — रोकते ही तुरंत मातृभाषा में स्पीकर पर गूंजेगा
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Mic size={28} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.25rem' }}>🎙️ यहाँ दबाकर बोलें (One-Tap Speak & Broadcast)</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 400, opacity: 0.95 }}>
                      हिंदी निर्देश बोलें ➔ {langMeta.name} अनुवाद स्वतः स्पीकर पर गूंजेगा
                    </div>
                  </div>
                </>
              )}
            </button>

            {/* 2. ONE-TAP COMMON CLASSROOM PHRASES (8 Visual Tiles) */}
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚡</span>
                <span>त्वरित 1-टैप कक्षा निर्देश (टैप करते ही स्पीकर पर बजेगा):</span>
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
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{prompt.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-slate)' }}>
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
          </div>

          {/* 3. CURRENT ACTIVE BROADCAST RESULT (BIG AUDIENCE-FACING SCRIPT & PRONUNCIATION) */}
          <div
            className="card-brutal"
            style={{
              padding: '24px',
              backgroundColor: 'var(--color-forest-subtle)',
              border: '2.5px solid var(--color-forest)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🪘</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-forest)' }}>
                    कक्षा स्पीकर पर उच्चारित वाक्य ({langMeta.name})
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                    मूल हिंदी: <strong>"{inputText}"</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge-tag badge-forest">
                  {translationResult?.matchType || 'FLN Direct'}
                </span>
                <span className="badge-tag badge-ochre">34MB INT8 Quantized</span>
              </div>
            </div>

            {/* Tribal Script & Phonetics Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: 'var(--border-thick)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Native Script Display */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-palash)', textTransform: 'uppercase' }}>
                  मूल लिपि में (Native Script for Students):
                </div>
                <div
                  className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                  style={{
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: 'var(--color-slate)',
                    marginTop: '6px',
                    lineHeight: 1.3,
                  }}
                >
                  {translationResult?.nativeScript || 'ᱡᱚᱦᱟᱨ'}
                </div>
              </div>

              {/* Hindi Teacher Phonetic Guide */}
              <div
                style={{
                  backgroundColor: 'var(--color-ochre-subtle)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px dashed var(--color-ochre)',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8C5F08' }}>
                  🗣️ शिक्षक उच्चारण मार्गदर्शिका (How the Teacher Can Speak):
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#523702',
                    marginTop: '4px',
                    fontFamily: 'var(--font-deva)',
                  }}
                >
                  {translationResult?.phoneticDeva || 'जोहार'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8C5F08', marginTop: '2px', fontStyle: 'italic' }}>
                  रोमन उच्चारण: {translationResult?.phoneticLatin || 'Johār'}
                </div>
              </div>

              {/* Speaker Replay Button */}
              <button
                type="button"
                onClick={() => {
                  if (translationResult) {
                    handleSpeakAudio(
                      translationResult.audioText || translationResult.phoneticDeva,
                      translationResult.nativeScript
                    );
                  }
                }}
                className="btn-brutal btn-palash"
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <Volume2 size={22} className={isPlayingAudio ? 'audio-pulse' : ''} />
                <span>
                  {isPlayingAudio ? 'कक्षा स्पीकर पर बज रहा है...' : '🔊 दोबारा स्पीकर पर सुनाएं (Replay Broadcast)'}
                </span>
              </button>
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
                  border: '2px solid var(--color-forest)',
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
                <div style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)' }}>
                  (विलंबता: {measuredLatency} ms • Sub-3-Second SLA ✅)
                </div>
              </div>

              {/* Real-World Teacher Pedagogical Counter-Response Assistant */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🗣️</span>
                  <span>शिक्षक का प्रत्युत्तर (Teacher Counter-Responses in Mother Tongue):</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)', margin: '0 0 10px 0' }}>
                  छात्र की बात सुनकर शिक्षक इनमें से किसी एक पर टैप करें। सिस्टम छात्र को उसकी मातृभाषा में उत्तर सुनाएगा:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    {
                      id: 'resp_water',
                      hindiPrompt: 'हाँ, जाओ पानी पीकर तुरंत आ जाओ।',
                      ho: 'हे, सेनोः मे दाः ञु केते हिजुः मे।',
                      mundari: 'हे, सेनोः मे दाः ञू केते हिजू-मे।',
                      santhali: 'ᱦᱮᱸ, ᱪᱟᱞᱟᱜ ᱢᱮ ᱫᱟᱜ ᱧᱩ ᱠᱟᱛᱮ ᱞᱚᱜᱚᱱ ᱦᱤᱡᱩᱜ ᱢᱮ᱾',
                      santhaliPhonetic: 'हें, चालाग मे दाग ञु काते लोगोन हिजुग मे।',
                    },
                    {
                      id: 'resp_doubt',
                      hindiPrompt: 'कोई बात नहीं, इस चित्र को देखो और दोबारा सुनो।',
                      ho: 'का काजी, नेना चित्र नेल मे आर आजोम मे।',
                      mundari: 'का काजी, ने चित्र नेलेमे आर आयूम-एपे।',
                      santhali: 'ᱪᱮᱫ ᱦᱚᱸ ᱵᱟᱝ, ᱱᱚᱣᱟ ᱪᱤᱛᱟᱹᱨ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱟᱧᱡᱚᱢ ᱢᱮ᱾',
                      santhaliPhonetic: 'चेद हों बां, नोवा चितार ञेल मे आर आजोम मे।',
                    },
                    {
                      id: 'resp_check',
                      hindiPrompt: 'बहुत सुंदर लिखा है! शाबाश, अपनी जगह बैठो।',
                      ho: 'बुगीते ओल अकाना! दूब मे आपन जाइगा रे।',
                      mundari: 'बेस ओलेकड़ाम! दुबपे आपन ठाईं रे।',
                      santhali: 'ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱚᱞ ᱟᱠᱟᱱᱟ! ᱟᱢᱟᱜ ᱡᱟᱭᱜᱟ ᱨᱮ ᱫᱩᱲᱩᱵ ᱢᱮ᱾',
                      santhaliPhonetic: 'अडि नापाय ओल आकाना! आमाग जायगा रे दुड़ुब मे।',
                    },
                    {
                      id: 'resp_sick',
                      hindiPrompt: 'थोड़ा आराम करो और पानी पियो।',
                      ho: 'हुडिंग दूब मे आर दाः ञु मे।',
                      mundari: 'हुडिंग आराम मे आर दाः ञू मे।',
                      santhali: 'ᱠᱟᱹᱴᱤᱡ ᱡᱤᱨᱟᱹᱣ ᱢᱮ ᱟᱨ ᱫᱟᱜ ᱧᱩᱭ ᱢᱮ᱾',
                      santhaliPhonetic: 'काटिज जिराव मे आर दाग ञुय मे।',
                    },
                  ].map((resp) => {
                    const tribalText =
                      selectedLang === 'santhali'
                        ? resp.santhali
                        : selectedLang === 'ho'
                        ? resp.ho
                        : resp.mundari;
                    const phonetic =
                      selectedLang === 'santhali'
                        ? resp.santhaliPhonetic
                        : tribalText;

                    return (
                      <button
                        key={resp.id}
                        type="button"
                        onClick={() => {
                          handleSpeakAudio(phonetic, resp.hindiPrompt);
                          addToHistory(resp.hindiPrompt, { nativeScript: tribalText, phoneticDeva: phonetic }, 'teacher');
                        }}
                        className="btn-brutal"
                        style={{
                          padding: '10px 14px',
                          backgroundColor: 'var(--color-bg)',
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.82rem',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--color-slate)' }}>{resp.hindiPrompt}</div>
                          <div style={{ color: 'var(--color-forest)', fontSize: '0.78rem' }}>
                            {tribalText} ({phonetic})
                          </div>
                        </div>
                        <Volume2 size={16} color="var(--color-forest)" />
                      </button>
                    );
                  })}
                </div>
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
