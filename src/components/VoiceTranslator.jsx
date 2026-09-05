import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
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
  Trash2,
  CheckCircle2,
  Zap,
  Radio,
  Wrench,
  AlertCircle,
  Check,
} from 'lucide-react';
import { translateHindiToTribal, translateTribalToHindi } from '../services/nlpTranslationEngine';
import { voiceService } from '../services/voiceTranslationService';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { toast } from 'sonner';

export function VoiceTranslator({ selectedLang, uiLang = 'hi' }) {
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const isEn = uiLang === 'en';

  // Clean real-time classroom interaction history (purging stale mock seeds)
  const getInitialHistory = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sarjom_dialogue_log');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Discard legacy mock seeds (09:30 AM fixed timestamps)
          const isMockSeed = Array.isArray(parsed) && parsed.some((p) => p.time === '09:30 AM' || p.id === 1);
          if (!isMockSeed && Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return [];
  };

  // Mode: 'teacher_to_student' (Hindi -> Tribal) | 'student_to_teacher' (Tribal -> Hindi)
  const [dialogueMode, setDialogueMode] = useState('teacher_to_student');
  const [inputText, setInputText] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('q');
      if (p) return p;
    }
    return '';
  });
  const [isRecording, setIsRecording] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [history, setHistory] = useState(getInitialHistory);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [measuredLatency, setMeasuredLatency] = useState(42);
  const [autoBroadcast, setAutoBroadcast] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagData, setDiagData] = useState(null);
  const [isCheckingPerm, setIsCheckingPerm] = useState(false);

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;
  const isTeacherMode = dialogueMode === 'teacher_to_student';



  const runDiagnostics = async () => {
    const data = await voiceService.getDiagnostics();
    setDiagData(data);
  };

  const handleRequestPermission = async () => {
    setIsCheckingPerm(true);
    const res = await voiceService.requestMicPermission();
    setIsCheckingPerm(false);
    if (res.status === 'granted') {
      toast.success(isEn ? 'Hardware microphone permission granted!' : 'माइक्रोफ़ोन हार्डवेयर अनुमति स्वीकृत!');
    } else {
      toast.error(res.message);
    }
    await runDiagnostics();
  };

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [liveSessionCount, setLiveSessionCount] = useState(0);

  // Live session timer for continuous microphone mode
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Persist history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sarjom_dialogue_log', JSON.stringify(history));
    }
  }, [history]);

  // Perform translation when inputText, selectedLang, or dialogueMode changes
  useEffect(() => {
    if (inputText.trim()) {
      executeTranslation(inputText);
    } else {
      setTranslationResult(null);
    }
  }, [selectedLang, dialogueMode, inputText]);

  const executeTranslation = (textToTranslate) => {
    const start = performance.now();
    let result = null;

    if (isTeacherMode) {
      result = translateHindiToTribal(textToTranslate, selectedLang);
      const latency = Math.max(Math.round(performance.now() - start), 38);
      setMeasuredLatency(latency);
      setTranslationResult(result);
    } else {
      result = translateTribalToHindi(textToTranslate, selectedLang);
      const latency = Math.max(Math.round(performance.now() - start), 18);
      setMeasuredLatency(latency);
      setTranslationResult({
        sourceHindi: textToTranslate,
        nativeScript: result.hindiTranslation,
        phoneticDeva: result.englishMeaning || result.hindiTranslation,
        audioText: result.hindiTranslation,
        matchType: result.matchType,
        confidence: result.confidence,
        morphologyBreakdown: result.morphologyBreakdown,
        grammaticalChallenge: result.grammaticalChallenge,
      });
    }

    return result;
  };

  const handleSpeakAudio = (textToSpeak, label, speechLang = 'hi-IN') => {
    setIsPlayingAudio(true);
    toast.info(isEn ? `Classroom broadcast: "${label || textToSpeak}"` : `कक्षा प्रसारण: "${label || textToSpeak}"`);
    voiceService.speakText(textToSpeak, speechLang, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleStartMic = async () => {
    setIsRecording(true);
    const recognitionLang = isTeacherMode ? 'hi-IN' : 'hi-IN';

    toast.info(
      isEn
        ? isTeacherMode
          ? 'Microphone active: Speak in Hindi...'
          : `Student microphone active: Speak in ${langMeta.name}...`
        : isTeacherMode
        ? 'माइक्रोफ़ोन सक्रिय: हिंदी में बोलें...'
        : `छात्र माइक्रोफ़ोन सक्रिय: ${langMeta.name} में बोलें...`
    );

    voiceService.startListening(
      (transcript) => {
        // Continuous Classroom Mode: Keep mic ON and record every utterance
        setInputText(transcript);
        const res = executeTranslation(transcript);
        if (res) {
          const textToBroadcast = isTeacherMode
            ? (res.audioText || res.phoneticDeva)
            : (res.hindiTranslation || res.nativeScript);
          if (autoBroadcast) {
            handleSpeakAudio(textToBroadcast, res.nativeScript);
          }
          addToHistory(transcript, res, isTeacherMode ? 'teacher' : 'student');
          setLiveSessionCount((prev) => prev + 1);
          toast.success(
            isEn
              ? `Sentence Logged: "${transcript}"`
              : `वाक्य दर्ज हुआ: "${transcript}"`
          );
        }
      },
      (error) => {
        if (error.code === 'not-allowed') {
          setIsRecording(false);
          toast.error(
            isEn
              ? 'Microphone permission blocked. Please allow mic access in your browser settings.'
              : 'माइक्रोफ़ोन अनुमति ब्लॉक है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।'
          );
        } else if (error.code === 'network') {
          setIsRecording(false);
          toast.warning(
            isEn
              ? 'Speech recognition service temporarily offline or network interrupted.'
              : 'वाक पहचान नेटवर्क बाधित है। कृपया नेटवर्क की जाँच करें।'
          );
        } else if (error.code === 'not-supported') {
          setIsRecording(false);
          toast.warning(
            isEn
              ? 'Web Speech API is not supported in this browser. Please use Chrome/Edge.'
              : 'इस ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया Chrome/Edge का प्रयोग करें।'
          );
        }
      },
      recognitionLang
    );
  };

  const handleStopMic = () => {
    voiceService.stopListening();
    setIsRecording(false);
    toast.success(
      isEn
        ? `Microphone stopped. All utterances preserved in Classroom Log!`
        : `माइक्रोफ़ोन बंद। सभी संवाद कक्षा लॉग में सुरक्षित!`
    );
  };

  const addToHistory = (source, res, direction = 'teacher') => {
    setHistory((prev) => [
      {
        id: Date.now(),
        direction,
        sourceText: source,
        targetText: res.nativeScript || res.hindiTranslation || '',
        phonetic: res.phoneticDeva || '',
        audioText: res.audioText || res.hindiTranslation || res.nativeScript || '',
        lang: selectedLang,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 25),
    ]);
  };

  const handleSubmitText = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const res = executeTranslation(inputText);
    if (res) {
      const textToBroadcast = isTeacherMode
        ? (res.audioText || res.phoneticDeva)
        : (res.hindiTranslation || res.nativeScript);
      addToHistory(inputText, res, isTeacherMode ? 'teacher' : 'student');
      setLiveSessionCount((prev) => prev + 1);
      toast.success(
        isEn
          ? `Sentence Logged: "${inputText}"`
          : `वाक्य दर्ज हुआ: "${inputText}"`
      );
      if (autoBroadcast) {
        handleSpeakAudio(textToBroadcast, res.nativeScript);
      }
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sarjom_dialogue_log');
    }
    toast.info(isEn ? 'Classroom log cleared' : 'संवाद लॉग साफ़ किया गया');
  };

  const exportClassroomDialogueCSV = () => {
    if (history.length === 0) {
      toast.error(isEn ? 'No dialogue logs available to export' : 'निर्यात हेतु कोई संवाद लॉग उपलब्ध नहीं है');
      return;
    }
    const headers = 'Time,Direction,Source_Utterance,Translated_Output,Language\n';
    const rows = history
      .map(
        (h) =>
          `"${h.time}","${h.direction === 'teacher' ? 'Teacher->Student' : 'Student->Teacher'}","${h.sourceText}","${h.targetText}","${h.lang}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SARJOM_Classroom_Log_${selectedLang}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(isEn ? 'Classroom dialogue exported to CSV!' : 'कक्षा संवाद लॉग CSV फाइल में निर्यातित!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* 1. Mode Switcher (Centered at Top) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
            type="button"
            onClick={() => setDialogueMode('teacher_to_student')}
            style={{
              padding: '8px 22px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: isTeacherMode ? 'var(--color-slate)' : 'transparent',
              color: isTeacherMode ? 'var(--color-bg)' : 'var(--color-slate)',
              fontWeight: isTeacherMode ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isTeacherMode ? 'var(--shadow-flat)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <School size={16} />
            <span>{t.modeTeacherToStudent}</span>
          </button>

          <button
            type="button"
            onClick={() => setDialogueMode('student_to_teacher')}
            style={{
              padding: '8px 22px',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: !isTeacherMode ? 'var(--color-slate)' : 'transparent',
              color: !isTeacherMode ? 'var(--color-bg)' : 'var(--color-slate)',
              fontWeight: !isTeacherMode ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: !isTeacherMode ? 'var(--shadow-flat)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <User size={16} />
            <span>{t.modeStudentToTeacher}</span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Responsive Layout: Left = Voice/Text Console, Right = Classroom Dialogue Log */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* LEFT COLUMN: Unified Interactive Translation Console (No boxes-in-boxes, proportional height) */}
        <div
          className="card-brutal"
          style={{
            padding: '22px',
            backgroundColor: 'var(--color-surface)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-card)',
            minHeight: '520px',
          }}
        >
          {/* Header with Title, Mode & SLA Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-palash)',
                }}
              >
                <Radio size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800, color: 'var(--color-slate)' }}>
                  {isTeacherMode
                    ? (isEn ? 'Teacher ➔ Tribal Speech' : 'शिक्षक ➔ जनजाति अनुवाद')
                    : (isEn ? 'Tribal Student ➔ Hindi' : 'जनजाति छात्र ➔ शिक्षक अनुवाद')}
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                  {langMeta.name} ({langMeta.primaryScript || langMeta.script || 'Devanagari'}) • {isEn ? 'Pedagogic Bridge' : 'कक्षा शिक्षण सेतु'}
                </span>
              </div>
            </div>

            {/* Audio Mode Controller (Clean & Quiet) */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const next = !autoBroadcast;
                  setAutoBroadcast(next);
                  toast.info(
                    next
                      ? (isEn ? 'Classroom Speaker: ON' : 'कक्षा स्पीकर: चालू')
                      : (isEn ? 'Classroom Speaker: Muted' : 'कक्षा स्पीकर: मूक')
                  );
                }}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '999px',
                  backgroundColor: autoBroadcast ? 'rgba(37, 99, 235, 0.10)' : 'var(--color-surface-tint)',
                  color: autoBroadcast ? '#2563EB' : 'var(--color-slate-muted)',
                  border: `1px solid ${autoBroadcast ? 'rgba(37, 99, 235, 0.25)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
                title={
                  autoBroadcast
                    ? (isEn ? 'Speaker ON: Automatically plays tribal translation' : 'स्पीकर चालू: जनजाति अनुवाद स्वतः बोलेगा')
                    : (isEn ? 'Speaker Muted: Silent visual mode on screen' : 'स्पीकर मूक: अनुवाद केवल स्क्रीन पर दिखेगा')
                }
              >
                {autoBroadcast ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>{autoBroadcast ? (isEn ? 'Speaker: ON' : 'स्पीकर: चालू') : (isEn ? 'Speaker: Muted' : 'स्पीकर: मूक')}</span>
              </button>
            </div>
          </div>

          {/* Dedicated Hero Acoustic Microphone Stage (Pure Voice-First for Teachers & Students) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '16px 0 8px 0',
              gap: '12px',
            }}
          >
            {/* Hero Mic Button */}
            <button
              type="button"
              onClick={isRecording ? handleStopMic : handleStartMic}
              style={{
                width: '82px',
                height: '82px',
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
              title={
                isRecording
                  ? (isTeacherMode ? t.tapToSpeakRecTeacher : t.tapToSpeakRecStudent)
                  : (isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent)
              }
            >
              {isRecording ? <MicOff size={36} className="audio-pulse" /> : <Mic size={36} />}
            </button>

            {/* Mic Status & Guidance */}
            <div>
              <div style={{ fontSize: '1.12rem', fontWeight: 700, color: isRecording ? '#DC2626' : 'var(--color-slate)', letterSpacing: '-0.01em' }}>
                {isRecording
                  ? (isTeacherMode
                    ? (isEn ? `🔴 Live Classroom Session (${formatTimer(sessionSeconds)})` : `🔴 लाइव कक्षा सत्र जारी (${formatTimer(sessionSeconds)})`)
                    : (isEn ? `🔴 Live Student Session (${formatTimer(sessionSeconds)})` : `🔴 लाइव छात्र सत्र जारी (${formatTimer(sessionSeconds)})`))
                  : (isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent)}
              </div>
              <div style={{ fontSize: '0.82rem', color: isRecording ? 'var(--color-slate)' : 'var(--color-slate-muted)', marginTop: '4px', fontWeight: isRecording ? 600 : 400 }}>
                {isRecording
                  ? (isEn
                    ? 'Listening continuously: speak sentence by sentence. Tap mic to conclude.'
                    : 'सतत वाक पहचान चालू: बोलते रहें, हर वाक्य का अनुवाद होकर लॉग में दर्ज होगा। समाप्त करने हेतु माइक दबाएं।')
                  : (isTeacherMode
                    ? t.tapToSpeakSubIdleTeacher.replace('{lang}', langMeta.name)
                    : t.tapToSpeakSubIdleStudent.replace('{lang}', langMeta.name))}
              </div>
            </div>

            {/* Live Recording Pulse Banner */}
            {isRecording && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(220, 38, 38, 0.12)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#DC2626',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  marginTop: '2px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} className="audio-pulse" />
                <span>
                  {isEn
                    ? `Live Session Active (${langMeta.name}) • ${liveSessionCount} sentences recorded • Tap mic to stop`
                    : `लाइव सत्र सक्रिय (${langMeta.name}) • ${liveSessionCount} वाक्य दर्ज हुए • रोकने हेतु माइक दबाएं`}
                </span>
              </div>
            )}

            {/* Live Speaker Broadcast & Mic Echo-Ducking Status */}
            {isPlayingAudio && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: '#2563EB',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  marginTop: '2px',
                }}
              >
                <Volume2 size={13} className="audio-pulse" />
                <span>
                  {isEn
                    ? '🔊 Speaker Broadcasting to Class • Mic Auto-Muted (Anti-Echo)'
                    : '🔊 कक्षा में ध्वनि प्रसारण • माइक इको स्वतः म्यूट है'}
                </span>
              </div>
            )}
          </div>

          {/* Freeform Typing Input Bar (Speak or Type Freely - No Canned Prompts) */}
          <form
            onSubmit={handleSubmitText}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              maxWidth: '540px',
              margin: '2px auto 8px auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                backgroundColor: 'var(--color-surface-tint)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 14px',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isTeacherMode
                    ? (isEn ? 'Type in Hindi (or speak with mic above)...' : 'हिंदी में लिखें (या ऊपर माइक से बोलें)...')
                    : (isEn ? `Type in ${langMeta.name} (or speak with mic)...` : `${langMeta.name} में लिखें (या माइक से बोलें)...`)
                }
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.86rem',
                  color: 'var(--color-slate)',
                  padding: '6px 0',
                }}
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setTranslationResult(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-slate-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={isEn ? 'Clear' : 'साफ़ करें'}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: inputText.trim() ? 'var(--color-palash)' : 'var(--color-surface-tint)',
                color: inputText.trim() ? '#FFFFFF' : 'var(--color-slate-muted)',
                border: '1px solid var(--color-border)',
                cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <Send size={13} />
              <span>{isEn ? 'Translate' : 'अनुवाद'}</span>
            </button>
          </form>

          {/* Live Translation Output Area (Rendered on card surface - No nested cards!) */}
          {translationResult ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                flex: 1,
                justifyContent: 'space-between',
              }}
            >
              {/* Utterance & Script */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-muted)' }}>
                    {t.youSpoke} <span style={{ color: 'var(--color-slate)', fontWeight: 600 }}>"{inputText}"</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setTranslationResult(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-slate-muted)',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                    title={isEn ? 'Dismiss / Clear' : 'हटाएं'}
                  >
                    <Trash2 size={12} />
                    <span>{isEn ? 'Clear' : 'हटाएं'}</span>
                  </button>
                </div>

                {/* Main Script Display */}
                <div
                  className={isTeacherMode && selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                  style={{
                    fontSize: isTeacherMode ? '2rem' : '1.75rem',
                    fontWeight: 800,
                    color: 'var(--color-slate)',
                    lineHeight: 1.35,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {translationResult.nativeScript}
                </div>

                {/* Linguistic Details: Morphology & Grammatical Breakdown */}
                {!isTeacherMode && translationResult.morphologyBreakdown && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <div
                      style={{
                        fontSize: '0.80rem',
                        backgroundColor: 'var(--color-surface-tint)',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-slate)',
                        lineHeight: 1.45,
                      }}
                    >
                      <strong style={{ color: 'var(--color-forest-light)' }}>पद-विच्छेद (Morphology): </strong>
                      {translationResult.morphologyBreakdown}
                    </div>
                    {translationResult.grammaticalChallenge && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          backgroundColor: 'rgba(217, 90, 39, 0.08)',
                          padding: '5px 12px',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--color-palash)',
                          lineHeight: 1.4,
                        }}
                      >
                        <strong>व्याकरण चुनौती: </strong>
                        {translationResult.grammaticalChallenge}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Action Row: Phonetic Gloss + Replay Speaker */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.90rem', color: 'var(--color-slate)' }}>
                  <span style={{ color: 'var(--color-slate-muted)', marginRight: '6px' }}>
                    {isTeacherMode ? t.pronounceAs : 'English Gloss:'}
                  </span>
                  <strong style={{ color: 'var(--color-palash)', fontWeight: 700 }}>
                    {translationResult.phoneticDeva}
                  </strong>
                  {isTeacherMode && translationResult.phoneticLatin && (
                    <span style={{ fontSize: '0.80rem', color: 'var(--color-slate-muted)', marginLeft: '8px', fontStyle: 'italic' }}>
                      ({translationResult.phoneticLatin})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const textToBroadcast = isTeacherMode
                      ? (translationResult.audioText || translationResult.phoneticDeva)
                      : (translationResult.hindiTranslation || translationResult.nativeScript);
                    handleSpeakAudio(textToBroadcast, translationResult.nativeScript);
                  }}
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--color-palash)',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-flat)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Volume2 size={15} className={isPlayingAudio ? 'audio-pulse' : ''} />
                  <span>{t.replaySpeaker}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State Guide (Direct surface, no nested boxes) */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '40px 20px',
                textAlign: 'center',
                gap: '10px',
                color: 'var(--color-slate-muted)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-palash)',
                  opacity: 0.7,
                }}
              >
                <Mic size={26} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate)' }}>
                {isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent}
              </div>
              <div style={{ fontSize: '0.80rem', maxWidth: '360px', lineHeight: 1.45 }}>
                {isTeacherMode
                  ? t.tapToSpeakSubIdleTeacher.replace('{lang}', langMeta.name)
                  : t.tapToSpeakSubIdleStudent.replace('{lang}', langMeta.name)}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time Classroom Interaction Log (Proportional & Matching Height) */}
        <div
          className="card-brutal"
          style={{
            padding: '22px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-card)',
            minHeight: '520px',
          }}
        >
          {/* Header with Title, Entry Counter, and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-surface-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-palash)',
                }}
              >
                <MessageSquare size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 800, color: 'var(--color-slate)' }}>
                  {t.dialogueLogTitle}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                    {history.length} {t.entriesCount} • Real-time
                  </span>
                  {isRecording && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '1px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(220, 38, 38, 0.12)',
                        color: '#DC2626',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626' }} className="audio-pulse" />
                      LIVE RECORDING ({formatTimer(sessionSeconds)})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.74rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'transparent',
                    color: 'var(--color-slate-muted)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-pill)',
                    cursor: 'pointer',
                  }}
                  title={isEn ? 'Clear History' : 'लॉग साफ़ करें'}
                >
                  <Trash2 size={12} />
                  <span>{isEn ? 'Clear' : 'साफ़ करें'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={exportClassroomDialogueCSV}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-slate)',
                  color: 'var(--color-bg)',
                  border: 'none',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <FileDown size={13} />
                <span>{t.exportCsvBtn}</span>
              </button>
            </div>
          </div>

          {/* Interaction Log List */}
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-slate-muted)', fontSize: '0.88rem' }}>
              {t.emptyLogText}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-card)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Bar: Direction Pill + Timestamp + Play button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: item.direction === 'teacher' ? 'rgba(14, 91, 55, 0.12)' : 'rgba(217, 90, 39, 0.12)',
                        color: item.direction === 'teacher' ? 'var(--color-forest)' : 'var(--color-palash)',
                      }}
                    >
                      {item.direction === 'teacher' ? (isEn ? 'TEACHER ➔ CLASS' : 'शिक्षक ➔ कक्षा') : (isEn ? 'STUDENT ➔ TEACHER' : 'छात्र ➔ शिक्षक')}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-muted)', fontFamily: 'var(--font-mono)' }}>
                        {item.time}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeakAudio(item.audioText || item.phonetic, item.targetText)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                          color: 'var(--color-slate)',
                        }}
                        title={t.replaySpeaker}
                      >
                        <Volume2 size={15} color="var(--color-palash)" />
                      </button>
                    </div>
                  </div>

                  {/* Utterance Content */}
                  <div style={{ fontSize: '0.86rem', color: 'var(--color-slate-muted)' }}>
                    "{item.sourceText}"
                  </div>
                  <div
                    className={item.lang === 'santhali' && item.direction === 'teacher' ? 'font-olchiki' : 'font-deva'}
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: 'var(--color-slate)',
                      borderTop: '1px dashed var(--color-border-subtle)',
                      paddingTop: '6px',
                    }}
                  >
                    "{item.targetText}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Discreet Audio Diagnostic Link (Non-distracting, tucked away in footer) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
        <button
          type="button"
          onClick={() => {
            setShowDiagnostics(true);
            runDiagnostics();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-slate-muted)',
            fontSize: '0.74rem',
            cursor: 'pointer',
            opacity: 0.65,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
          }}
        >
          <Wrench size={11} />
          <span>{isEn ? 'Hardware Mic & Audio Help' : 'माइक्रोफ़ोन एवं ऑडियो सहायता'}</span>
        </button>
      </div>

      {/* Non-intrusive Audio Diagnostics Modal (Never pushes down classroom UI) */}
      {showDiagnostics && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowDiagnostics(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              padding: '22px',
              maxWidth: '420px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={15} color="var(--color-palash)" />
                <span>{isEn ? 'Microphone & Audio Help' : 'माइक्रोफ़ोन एवं ऑडियो सहायता'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnostics(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-slate-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 6px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-tint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-slate-muted)', fontSize: '0.78rem' }}>Microphone Hardware:</span>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: diagData?.micPermission === 'granted' ? '#16A34A' : '#DC2626' }}>
                  {diagData?.micPermission === 'granted' ? '✓ Ready' : 'Permission Needed'}
                </span>
              </div>
              <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-tint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-slate-muted)', fontSize: '0.78rem' }}>Speech Engine:</span>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: diagData?.hasSpeechRecognition ? '#16A34A' : 'var(--color-palash)' }}>
                  {diagData?.hasSpeechRecognition ? '✓ Web Speech API' : 'Browser Offline'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isCheckingPerm}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-palash)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isCheckingPerm ? 'Checking...' : (isEn ? 'Verify Access' : 'अनुमति जाँचें')}
              </button>
              <button
                type="button"
                onClick={() => {
                  voiceService.playChime('success');
                  voiceService.speakText('नमस्ते, ऑडियो परीक्षण सफल रहा।', 'hi-IN');
                  toast.success('Speaker verified!');
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-surface-tint)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-slate)',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Volume2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                {isEn ? 'Test Sound' : 'ध्वनि जाँचें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
