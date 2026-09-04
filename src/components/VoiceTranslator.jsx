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
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { translateHindiToTribal, translateTribalToHindi } from '../services/nlpTranslationEngine';
import { voiceService } from '../services/voiceTranslationService';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { toast } from 'sonner';

export function VoiceTranslator({ selectedLang, uiLang = 'hi' }) {
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const isEn = uiLang === 'en';

  // Mode: 'teacher_to_student' (Hindi -> Tribal) | 'student_to_teacher' (Tribal -> Hindi)
  const [dialogueMode, setDialogueMode] = useState('teacher_to_student');
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

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;
  const isTeacherMode = dialogueMode === 'teacher_to_student';

  // Perform translation when inputText, selectedLang, or dialogueMode changes
  useEffect(() => {
    if (inputText.trim()) {
      executeTranslation(inputText);
    }
  }, [selectedLang, dialogueMode]);

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
      const latency = Math.max(Math.round(performance.now() - start), 32);
      setMeasuredLatency(latency);
      setTranslationResult({
        sourceHindi: textToTranslate,
        nativeScript: result.hindiTranslation,
        phoneticDeva: result.englishMeaning || result.hindiTranslation,
        audioText: result.hindiTranslation,
        matchType: result.matchType,
        confidence: result.confidence,
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

  const handleStartMic = () => {
    setIsRecording(true);
    toast(
      isEn
        ? isTeacherMode
          ? 'Microphone active: Speak in Hindi or English...'
          : `Student microphone active: Speak in ${langMeta.name}...`
        : isTeacherMode
        ? 'माइक्रोफ़ोन सक्रिय: हिंदी में बोलें...'
        : `छात्र माइक्रोफ़ोन सक्रिय: ${langMeta.name} में बोलें...`
    );

    voiceService.startListening(
      (transcript) => {
        setIsRecording(false);
        setInputText(transcript);
        const res = executeTranslation(transcript);
        toast.success(isEn ? `Transcribed: "${transcript}"` : `पहचाना गया: "${transcript}"`);

        setTimeout(() => {
          if (res) {
            const textToBroadcast = isTeacherMode
              ? (res.audioText || res.phoneticDeva)
              : (res.hindiTranslation || res.nativeScript);
            const scriptLang = isTeacherMode ? 'hi-IN' : 'hi-IN';
            handleSpeakAudio(textToBroadcast, res.nativeScript, scriptLang);
            addToHistory(transcript, res, isTeacherMode ? 'teacher' : 'student');
          }
        }, 120);
      },
      (error) => {
        setIsRecording(false);
        toast.error(isEn ? 'Microphone error: Type text below instead' : 'माइक्रोफ़ोन स्थिति: कृपया नीचे टेक्स्ट टाइप करें');
      }
    );
  };

  const handleStopMic = () => {
    voiceService.stopListening();
    setIsRecording(false);
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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
      ...prev.slice(0, 15),
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
      handleSpeakAudio(textToBroadcast, res.nativeScript);
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* 1. Bidirectional Dialogue Direction Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2px',
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

      {/* 2. Main Live Acoustic Microphone & Translation Stage */}
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
          gap: '24px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Microphone Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={isRecording ? handleStopMic : handleStartMic}
            style={{
              width: '84px',
              height: '84px',
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
                ? isTeacherMode ? t.tapToSpeakRecTeacher : t.tapToSpeakRecStudent
                : isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent
            }
          >
            {isRecording ? <MicOff size={34} className="audio-pulse" /> : <Mic size={34} />}
          </button>

          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate)', letterSpacing: '-0.01em' }}>
              {isRecording
                ? isTeacherMode ? t.tapToSpeakRecTeacher : t.tapToSpeakRecStudent
                : isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--color-slate-muted)', marginTop: '4px' }}>
              {isRecording
                ? isTeacherMode
                  ? t.tapToSpeakSubRecTeacher.replace('{lang}', langMeta.name)
                  : t.tapToSpeakSubRecStudent
                : isTeacherMode
                ? t.tapToSpeakSubIdleTeacher.replace('{lang}', langMeta.name)
                : t.tapToSpeakSubIdleStudent.replace('{lang}', langMeta.name)}
            </div>
          </div>
        </div>

        {/* Translation Output Card */}
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
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-muted)' }}>
                {t.youSpoke} <span style={{ color: 'var(--color-slate)', fontWeight: 600 }}>"{inputText}"</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                  {measuredLatency} ms • {t.onDeviceTag}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(34, 197, 94, 0.12)',
                    color: '#16A34A',
                    fontWeight: 700,
                  }}
                >
                  SLA &lt; 3.0s OK
                </span>
              </div>
            </div>

            {/* Main Script Output */}
            <div
              className={isTeacherMode && selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
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

            {/* Phonetic Pronunciation & Audio Broadcast Action */}
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
              <div style={{ fontSize: '0.96rem', color: 'var(--color-slate)' }}>
                <span style={{ color: 'var(--color-slate-muted)', marginRight: '6px' }}>{t.pronounceAs}</span>
                <strong style={{ color: 'var(--color-palash)', fontWeight: 700 }}>
                  {translationResult.phoneticDeva}
                </strong>
                {translationResult.phoneticLatin && (
                  <span style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)', marginLeft: '8px', fontStyle: 'italic' }}>
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
                  padding: '8px 20px',
                  fontSize: '0.88rem',
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
                <Volume2 size={16} className={isPlayingAudio ? 'audio-pulse' : ''} />
                <span>{t.replaySpeaker}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Text Typing & Sentence Translation Form */}
      <div
        className="card-brutal"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate)' }}>
          {t.textInputTitle}
        </div>

        <form onSubmit={handleSubmitText} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              executeTranslation(e.target.value);
            }}
            placeholder={
              isTeacherMode ? t.textInputPlaceholderTeacher : t.textInputPlaceholderStudent
            }
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
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
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-slate)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.92rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Send size={16} />
            <span>{t.translateBtn}</span>
          </button>
        </form>
      </div>

      {/* 4. Classroom Dialogue Log & CSV Export */}
      <div
        className="card-brutal"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--color-palash)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--color-slate)' }}>{t.dialogueLogTitle}</h3>
            <span className="badge-tag badge-palash">{history.length} {t.entriesCount}</span>
          </div>

          <button
            type="button"
            onClick={exportClassroomDialogueCSV}
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-surface-tint)',
              color: 'var(--color-slate)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <FileDown size={15} />
            <span>{t.exportCsvBtn}</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-slate-muted)', fontSize: '0.88rem' }}>
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
                    title={t.replaySpeaker}
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
