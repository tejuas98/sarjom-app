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
  Printer,
  FileText,
  Trash2,
  CheckCircle2,
  Radio,
  Wrench,
  AlertCircle,
  Check,
  HardDrive,
  SlidersHorizontal,
  AudioWaveform,
} from 'lucide-react';
import { translateHindiToTribal, translateTribalToHindi } from '../services/nlpTranslationEngine';
import { voiceService } from '../services/voiceTranslationService';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { UI_TRANSLATIONS } from '../data/uiTranslations';
import { toast } from 'sonner';

export function VoiceTranslator({ selectedLang, uiLang = 'hi' }) {
  const t = UI_TRANSLATIONS[uiLang] || UI_TRANSLATIONS.hi;
  const isEn = uiLang === 'en';

  // Authentic classroom interaction history (safely persisted in device localStorage, starts clean)
  const getInitialHistory = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sarjom_dialogue_log');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Only keep real user-entered interactions, clean out any legacy mock entries
            return parsed.filter(
              (p) =>
                p &&
                typeof p === 'object' &&
                p.sourceText &&
                p.sourceText !== 'जोहार, आज हम क्या सीखेंगे?' &&
                !p.sourceText.includes('बच्चों, अपनी किताब खोलो')
            );
          }
        }
      } catch (e) {
        console.error('Error reading sarjom_dialogue_log:', e);
      }
    }
    return [];
  };

  // Mode: 'teacher_to_student' (Hindi/English -> Tribal) | 'student_to_teacher' (Tribal/Hindi/English -> Hindi)
  const [dialogueMode, setDialogueMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const m = new URLSearchParams(window.location.search).get('mode');
      if (m === 'student' || m === 'student_to_teacher') return 'student_to_teacher';
    }
    return 'teacher_to_student';
  });
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const [history, setHistory] = useState(getInitialHistory);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [measuredLatency, setMeasuredLatency] = useState(42);
  const [autoBroadcast, setAutoBroadcast] = useState(true);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagData, setDiagData] = useState(null);
  const [isCheckingPerm, setIsCheckingPerm] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('auto');
  const [voiceRate, setVoiceRate] = useState(1.05);
  const [voicePitch, setVoicePitch] = useState(1.0);

  useEffect(() => {
    const updateVoices = () => {
      const v = voiceService.getAvailableVoices();
      setAvailableVoices(v || []);
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

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
      const latency = Math.max(Math.round(performance.now() - start), 1);
      setMeasuredLatency(latency);
      setTranslationResult(result);
    } else {
      result = translateTribalToHindi(textToTranslate, selectedLang);
      const latency = Math.max(Math.round(performance.now() - start), 1);
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
    const recognitionLang = 'hi-IN';

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
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsRecording(false);
          const res = executeTranslation(transcript);
          if (res) {
            const textToBroadcast = isTeacherMode
              ? (res.phoneticDeva || res.nativeScript || res.audioText)
              : (res.hindiTranslation || res.nativeScript);
            if (autoBroadcast) {
              handleSpeakAudio(textToBroadcast, res.nativeScript);
            }
            addToHistory(transcript, res, isTeacherMode ? 'teacher' : 'student');
            setLiveSessionCount((prev) => prev + 1);
            toast.success(
              isEn
                ? `Logged: "${transcript}"`
                : `दर्ज हुआ: "${transcript}"`
            );
          }
        }
      },
      (error) => {
        setIsRecording(false);
        if (error.code === 'not-allowed') {
          toast.error(
            isEn
              ? 'Microphone permission blocked. Please click the lock icon in your address bar and allow Microphone.'
              : 'माइक्रोफ़ोन अनुमति ब्लॉक है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।'
          );
        } else if (error.code === 'network') {
          toast.info(
            isEn
              ? 'Network speech recognition unavailable in browser. You can type in the box below to translate & listen.'
              : 'ब्राउज़र में नेटवर्क वाक पहचान अनुपलब्ध है। आप नीचे लिखकर अनुवाद और जनजाति ध्वनि सुन सकते हैं।'
          );
        } else if (error.code === 'not-supported') {
          toast.warning(
            isEn
              ? 'Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari with mic enabled.'
              : 'इस ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है। कृपया Chrome, Edge, या Safari का प्रयोग करें।'
          );
        }
      },
      recognitionLang,
      () => {
        setIsRecording(false);
      }
    );
  };

  const handleStopMic = () => {
    voiceService.stopListening((finalText) => {
      if (finalText && finalText.trim()) {
        const res = executeTranslation(finalText);
        if (res) {
          const textToBroadcast = isTeacherMode
            ? (res.phoneticDeva || res.nativeScript || res.audioText)
            : (res.hindiTranslation || res.nativeScript);
          if (autoBroadcast) {
            handleSpeakAudio(textToBroadcast, res.nativeScript);
          }
          addToHistory(finalText, res, isTeacherMode ? 'teacher' : 'student');
          setLiveSessionCount((prev) => prev + 1);
        }
      }
    });
    setIsRecording(false);
    toast.success(
      isEn
        ? `Microphone stopped.`
        : `माइक्रोफ़ोन बंद किया गया।`
    );
  };

  const addToHistory = (source, res, direction = 'teacher') => {
    setHistory((prev) => {
      const newEntry = {
        id: Date.now() + Math.random(),
        direction,
        sourceText: source,
        targetText: res.nativeScript || res.hindiTranslation || '',
        phonetic: res.phoneticDeva || '',
        audioText: direction === 'teacher'
          ? (res.phoneticDeva || res.nativeScript || res.audioText || '')
          : (res.hindiTranslation || res.nativeScript || ''),
        lang: selectedLang,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updated = [newEntry, ...prev.slice(0, 99)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sarjom_dialogue_log', JSON.stringify(updated));
        } catch (e) {
          console.error('Storage write error', e);
        }
      }
      return updated;
    });
  };

  // Clean URL query parameters on initial mount so page refreshes always remain completely clean
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
    }
  }, []);

  const handleDeleteEntry = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sarjom_dialogue_log', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    toast.info(isEn ? 'Log entry deleted' : 'प्रविष्टि हटाई गई');
  };

  const handleSubmitText = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const res = executeTranslation(inputText);
    if (res) {
      const textToBroadcast = isTeacherMode
        ? (res.phoneticDeva || res.nativeScript || res.audioText)
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
    if (history.length === 0) return;
    const backup = [...history];
    setHistory([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sarjom_dialogue_log', JSON.stringify([]));
        localStorage.setItem('sarjom_cleared_by_user', 'true');
      } catch (e) {}
    }
    toast.success(isEn ? 'Classroom log cleared' : 'कक्षा संवाद लॉग साफ़ किया गया', {
      action: {
        label: isEn ? 'Undo' : 'वापस लाएं',
        onClick: () => {
          setHistory(backup);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('sarjom_dialogue_log', JSON.stringify(backup));
              localStorage.removeItem('sarjom_cleared_by_user');
            } catch (e) {}
          }
        },
      },
    });
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

  const exportClassroomDialoguePDF = () => {
    if (history.length === 0) {
      toast.error(isEn ? 'No dialogue logs available to export' : 'निर्यात हेतु कोई संवाद लॉग उपलब्ध नहीं है');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error(isEn ? 'Please allow popups to open PDF report' : 'कृपया PDF रिपोर्ट के लिए पॉप-अप की अनुमति दें');
      return;
    }

    const dateStr = new Date().toLocaleDateString(isEn ? 'en-IN' : 'hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const langName = langMeta.name;
    const scriptName = langMeta.badgeText || langMeta.primaryScript;

    const htmlContent = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'hi'}">
<head>
  <meta charset="utf-8">
  <title>SARJOM MTB-MLE Classroom Dialogue Report - ${langName}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      line-height: 1.4;
    }
    .gov-header {
      border-bottom: 2px solid #0e5b37;
      padding-bottom: 10px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .gov-title h1 {
      margin: 0;
      font-size: 1.25rem;
      color: #0e5b37;
      letter-spacing: -0.01em;
    }
    .gov-title p {
      margin: 3px 0 0;
      font-size: 0.82rem;
      color: #475569;
    }
    .meta-box {
      text-align: right;
      font-size: 0.78rem;
      color: #334155;
      line-height: 1.5;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }
    .stat-label {
      font-size: 0.68rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0e5b37;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 0.85rem;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      font-size: 0.78rem;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) { background: #fafafa; }
    .badge-teacher {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-student {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .tribal-text {
      font-size: 1.05rem;
      font-weight: 700;
      color: #0e5b37;
      margin-bottom: 2px;
    }
    .phonetic-guide {
      font-size: 0.76rem;
      color: #64748b;
      font-style: italic;
    }
    .footer-report {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 0.76rem;
      color: #64748b;
    }
    .sig-line {
      text-align: center;
      width: 200px;
      border-top: 1px solid #475569;
      padding-top: 4px;
      font-size: 0.75rem;
      color: #334155;
      font-weight: 600;
    }
    .no-print-bar {
      background: #0e5b37;
      color: #ffffff;
      padding: 10px 16px;
      margin: -16px -16px 16px -16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #ffffff;
      color: #0e5b37;
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
    }
    @media print {
      .no-print-bar { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span><strong>SARJOM MTB-MLE Report Preview</strong> • Click "Save as PDF" or Print</span>
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="gov-header">
    <div class="gov-title">
      <h1>सरजोम (SARJOM) • कक्षा संवाद एवं भाषा सेतु लॉग रिपोर्ट</h1>
      <p>स्कूली शिक्षा एवं साक्षरता विभाग, झारखंड सरकार • मातृभाषा आधारित प्राथमिक शिक्षण (MTB-MLE)</p>
    </div>
    <div class="meta-box">
      <strong>दिनांक:</strong> ${dateStr}<br>
      <strong>जनजातीय भाषा:</strong> ${langName}<br>
      <strong>स्वीकृत लिपि:</strong> ${scriptName}
    </div>
  </div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-label">कुल कक्षा संवाद</div>
      <div class="stat-val">${history.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">लक्ष्य भाषा (Target)</div>
      <div class="stat-val" style="font-size: 1rem;">${langName}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">लिपि (Script)</div>
      <div class="stat-val" style="font-size: 0.85rem;">${scriptName}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">ऑफ़लाइन स्थिति</div>
      <div class="stat-val" style="color: #10b981; font-size: 0.95rem;">100% Offline</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 65px;">समय</th>
        <th style="width: 110px;">दिशा (Direction)</th>
        <th style="width: 35%;">मूल वाक्य (Hindi Speech)</th>
        <th>जनजातीय अनुवाद व उच्चारण (Tribal Translation)</th>
      </tr>
    </thead>
    <tbody>
      ${history
        .map(
          (h) => `
        <tr>
          <td style="font-family: monospace; font-size: 0.8rem; color: #475569;">${h.time}</td>
          <td>
            <span class="${h.direction === 'teacher' ? 'badge-teacher' : 'badge-student'}">
              ${h.direction === 'teacher' ? 'शिक्षक → छात्र' : 'छात्र → शिक्षक'}
            </span>
          </td>
          <td style="font-weight: 500; color: #1e293b;">${h.sourceText}</td>
          <td>
            <div class="tribal-text">${h.targetText}</div>
            ${h.phonetic ? `<div class="phonetic-guide">ध्वनि: ${h.phonetic}</div>` : ''}
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer-report">
    <div>
      <div><strong>सिस्टम:</strong> SARJOM NIPUN-FLN Pedagogy Suite (Problem SIH26042)</div>
      <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">
        सत्यापित संदर्भ: Hoffmann (Mundari), Bodding (Santhali), Deeney (Ho), Nowrangi (Sadri)
      </div>
    </div>
    <div class="sig-line">
      हस्ताक्षर: शिक्षक / विद्यालय प्रभारी
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success(isEn ? 'PDF Print Report generated!' : 'PDF प्रिंट रिपोर्ट तैयार!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* 1. Voice Session Header: Sleek Unified Control Strip */}
      <div
        className="voice-session-controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '4px 2px',
        }}
      >
        {/* Left: Mode Switcher (Teacher vs Student) */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--color-surface-tint)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setDialogueMode('teacher_to_student')}
            style={{
              padding: '5px 14px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: isTeacherMode ? 'var(--color-palash)' : 'transparent',
              color: isTeacherMode ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: isTeacherMode ? 700 : 500,
              fontSize: '0.80rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isTeacherMode ? '0 1px 3px rgba(217, 90, 39, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <School size={14} />
            <span className="voice-mode-desktop">{t.modeTeacherToStudent}</span>
            <span className="voice-mode-mobile">{isEn ? 'Teacher' : 'शिक्षक'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDialogueMode('student_to_teacher')}
            style={{
              padding: '5px 14px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: !isTeacherMode ? 'var(--color-palash)' : 'transparent',
              color: !isTeacherMode ? '#FFFFFF' : 'var(--color-slate)',
              fontWeight: !isTeacherMode ? 700 : 500,
              fontSize: '0.80rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: !isTeacherMode ? '0 1px 3px rgba(217, 90, 39, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={14} />
            <span className="voice-mode-desktop">{t.modeStudentToTeacher}</span>
            <span className="voice-mode-mobile">{isEn ? 'Student' : 'छात्र'}</span>
          </button>
        </div>

        {/* Right: Audio Session Controls (Hindi/English, Speaker, HD Voice) */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {isTeacherMode ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface-tint)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--color-slate)',
              }}
              title={isEn ? 'Teacher Speech Input: Hindi' : 'शिक्षक इनपुट: हिंदी'}
            >
              <span>🎙️</span>
              <span>{isEn ? 'Speech: Hindi' : 'वाक इनपुट: हिंदी'}</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--color-surface-tint)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--color-palash)',
              }}
              title={isEn ? `Student Speech Input: ${langMeta.name}` : `छात्र इनपुट: ${langMeta.name}`}
            >
              <span>🎙️</span>
              <span>{isEn ? `Speech: ${langMeta.name}` : `वाक इनपुट: ${langMeta.name}`}</span>
            </div>
          )}

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
              padding: '5px 11px',
              borderRadius: '6px',
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

          {/* Natural Voice Audio Tuning & Quality Settings */}
          <button
            type="button"
            onClick={() => setShowVoiceModal(true)}
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              padding: '5px 11px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.10)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease',
            }}
            title={isEn ? 'Voice Tuning: Natural Neural Voice, Pacing & Pointers' : 'आवाज़ सेटिंग्स: प्राकृतिक न्यूरल आवाज़ एवं गति'}
          >
            <SlidersHorizontal size={13} />
            <span>{isEn ? 'HD Voice' : 'प्राकृतिक आवाज़'}</span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Responsive Layout: Left = Voice/Text Console, Right = Classroom Dialogue Log */}
      <div
        className="voice-two-column-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* LEFT COLUMN: Unified Interactive Translation Console (Disciplined modern panel) */}
        <div
          className="voice-console-card"
          style={{
            padding: '22px',
            backgroundColor: 'var(--color-surface)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'none',
            minHeight: '520px',
          }}
        >
          {/* Header with Title & Pedagogic Language Metadata */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
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
                    ? (isEn ? 'Teacher → Tribal Speech' : 'शिक्षक → जनजाति अनुवाद')
                    : (isEn ? 'Tribal Student → Hindi' : 'जनजाति छात्र → शिक्षक अनुवाद')}
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                  {langMeta.name} ({langMeta.primaryScript || langMeta.script || 'Devanagari'}) • {isEn ? 'Pedagogic Bridge' : 'कक्षा शिक्षण सेतु'}
                </span>
              </div>
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
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#DC2626' : 'var(--color-surface-tint)',
                color: isRecording ? '#FFFFFF' : 'var(--color-palash)',
                border: isRecording ? '2px solid #DC2626' : '1px solid var(--color-border)',
                boxShadow: isRecording
                  ? '0 0 0 6px rgba(220, 38, 38, 0.18), 0 4px 16px rgba(220, 38, 38, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title={
                isRecording
                  ? (isTeacherMode ? t.tapToSpeakRecTeacher : t.tapToSpeakRecStudent)
                  : (isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent)
              }
            >
              {isRecording ? <MicOff size={30} className="audio-pulse" /> : <Mic size={30} />}
            </button>

            {/* Mic Status & Guidance */}
            <div>
              <div style={{ fontSize: '1.12rem', fontWeight: 700, color: isRecording ? '#DC2626' : 'var(--color-slate)', letterSpacing: '-0.01em' }}>
                {isRecording ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} />
                    {isTeacherMode
                      ? (isEn ? `Live Classroom Session (${formatTimer(sessionSeconds)})` : `लाइव कक्षा सत्र जारी (${formatTimer(sessionSeconds)})`)
                      : (isEn ? `Live Student Session (${formatTimer(sessionSeconds)})` : `लाइव छात्र सत्र जारी (${formatTimer(sessionSeconds)})`)}
                  </span>
                ) : (
                  isTeacherMode ? t.tapToSpeakIdleTeacher : t.tapToSpeakIdleStudent
                )}
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
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(220, 38, 38, 0.12)',
                  border: '1px solid rgba(220, 38, 38, 0.3)',
                  color: '#DC2626',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  marginTop: '2px',
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#DC2626' }} className="audio-pulse" />
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
                  padding: '4px 12px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  color: '#2563EB',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  marginTop: '2px',
                }}
              >
                <Volume2 size={13} className="audio-pulse" />
                <span>
                  {isEn
                    ? 'Speaker Broadcasting to Class • Mic Auto-Muted (Anti-Echo)'
                    : 'कक्षा में ध्वनि प्रसारण • माइक इको स्वतः म्यूट है'}
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
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '4px 12px',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
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
                padding: '7px 14px',
                borderRadius: '6px',
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
                      borderRadius: '4px',
                    }}
                    title={isEn ? 'Dismiss / Clear' : 'हटाएं'}
                  >
                    <Trash2 size={12} />
                    <span>{isEn ? 'Clear' : 'हटाएं'}</span>
                  </button>
                </div>

                {/* Main Script Display */}
                <div
                  className={isTeacherMode && selectedLang === 'santhali' ? 'font-olchiki voice-result-script' : 'font-deva voice-result-script'}
                  style={{
                    fontSize: isTeacherMode ? '2rem' : '1.75rem',
                    fontWeight: 800,
                    color: 'var(--color-slate)',
                    lineHeight: 1.35,
                    letterSpacing: '-0.02em',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere',
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
                        borderRadius: '4px',
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
                          borderRadius: '4px',
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

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {!isTeacherMode && translationResult.sourceHindi && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSpeakAudio(translationResult.sourceHindi, translationResult.sourceHindi);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-surface-tint)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-slate)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                      title={isEn ? 'Listen to native tribal pronunciation' : 'मूल जनजाति उच्चारण सुनें'}
                    >
                      <Volume2 size={14} color="var(--color-palash)" />
                      <span>{isEn ? 'Hear Tribal' : 'जनजाति उच्चारण'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const textToBroadcast = isTeacherMode
                        ? (translationResult.phoneticDeva || translationResult.nativeScript || translationResult.audioText)
                        : (translationResult.hindiTranslation || translationResult.nativeScript);
                      handleSpeakAudio(textToBroadcast, translationResult.nativeScript);
                    }}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-palash)',
                      border: 'none',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      boxShadow: '0 1px 4px rgba(217, 90, 39, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Volume2 size={15} className={isPlayingAudio ? 'audio-pulse' : ''} />
                    <span>{isTeacherMode ? t.replaySpeaker : (isEn ? 'Play Hindi Translation' : 'हिंदी अनुवाद सुनें')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Clean Empty State Placeholder (No duplicate mic or text) */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '30px 16px',
                textAlign: 'center',
                color: 'var(--color-slate-muted)',
                fontSize: '0.84rem',
                borderTop: '1px dashed var(--color-border-subtle)',
                marginTop: '8px',
              }}
            >
              <span>
                {isTeacherMode
                  ? (isEn ? 'Translated tribal speech & phonetics will appear here.' : 'जनजाति अनुवाद और उच्चारण यहाँ दिखाई देगा।')
                  : (isEn ? 'Hindi translation will appear here.' : 'हिंदी अनुवाद यहाँ दिखाई देगा।')}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time Classroom Interaction Log (Disciplined modern stream) */}
        <div
          className="voice-log-card"
          style={{
            padding: '22px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'none',
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
                  borderRadius: '6px',
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-slate-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span>{history.length} {t.entriesCount}</span>
                    <span>•</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: 'var(--color-forest)',
                        fontWeight: 600,
                      }}
                      title={isEn ? 'Stored securely on this device (offline)' : 'डिवाइस में सुरक्षित (ऑफलाइन)'}
                    >
                      <HardDrive size={11} />
                      {t.savedOnDevice || (isEn ? 'Stored on device' : 'डिवाइस में सुरक्षित')}
                    </span>
                  </span>
                  {isRecording && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 7px',
                        borderRadius: '4px',
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
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={history.length === 0}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: history.length === 0 ? 'transparent' : 'rgba(220, 38, 38, 0.08)',
                  color: history.length === 0 ? 'var(--color-slate-muted)' : '#DC2626',
                  border: history.length === 0 ? '1px solid var(--color-border)' : '1px solid rgba(220, 38, 38, 0.28)',
                  borderRadius: '6px',
                  cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: history.length === 0 ? 0.45 : 1,
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
                title={
                  history.length === 0
                    ? (isEn ? 'No logs to clear' : 'मिटाने के लिए कोई लॉग नहीं है')
                    : (isEn ? 'Clear all dialogue logs (with Undo)' : 'सभी संवाद लॉग साफ़ करें (पूर्ववत विकल्प के साथ)')
                }
              >
                <Trash2 size={13} />
                <span>{t.clearLogBtn || (isEn ? 'Clear Log' : 'साफ़ करें')}</span>
              </button>

              <button
                type="button"
                onClick={exportClassroomDialoguePDF}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-forest)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: '0 1px 4px rgba(14, 91, 55, 0.25)',
                }}
                title={isEn ? 'Export / Print Official PDF Report' : 'आधिकारिक PDF रिपोर्ट प्रिंट या सहेजें'}
              >
                <Printer size={13} />
                <span>{t.exportPdfBtn || (isEn ? 'PDF Report' : 'PDF रिपोर्ट')}</span>
              </button>

              <button
                type="button"
                onClick={exportClassroomDialogueCSV}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'var(--color-surface-tint)',
                  color: 'var(--color-slate)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
                title={isEn ? 'Export raw CSV data for spreadsheets' : 'स्प्रेडशीट के लिए रॉ CSV डेटा निर्यात'}
              >
                <FileDown size={12} />
                <span>{t.exportCsvBtn || (isEn ? 'CSV Data' : 'CSV डेटा')}</span>
              </button>
            </div>
          </div>

          {/* Interaction Log List */}
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--color-slate-muted)', fontSize: '0.88rem' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.35, display: 'block' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>{t.emptyLogText}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-surface-tint)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top Bar: Direction Pill + Timestamp + Play button + Delete button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.03em',
                        backgroundColor: item.direction === 'teacher' ? 'rgba(14, 91, 55, 0.12)' : 'rgba(217, 90, 39, 0.12)',
                        color: item.direction === 'teacher' ? 'var(--color-forest)' : 'var(--color-palash)',
                      }}
                    >
                      {item.direction === 'teacher' ? (isEn ? 'TEACHER → CLASS' : 'शिक्षक → कक्षा') : (isEn ? 'STUDENT → TEACHER' : 'छात्र → शिक्षक')}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.70rem', color: 'var(--color-slate-muted)', fontFamily: 'var(--font-mono)' }}>
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
                        <Volume2 size={14} color="var(--color-palash)" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                          color: 'var(--color-slate-muted)',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-slate-muted)')}
                        title={t.deleteEntryTooltip || (isEn ? 'Delete this entry' : 'यह प्रविष्टि हटाएं')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Utterance Content */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-slate-muted)' }}>
                    "{item.sourceText}"
                  </div>
                  <div
                    className={item.lang === 'santhali' && item.direction === 'teacher' ? 'font-olchiki' : 'font-deva'}
                    style={{
                      fontSize: '1.02rem',
                      fontWeight: 700,
                      color: 'var(--color-slate)',
                      borderTop: '1px dashed var(--color-border-subtle)',
                      paddingTop: '5px',
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
                  borderRadius: '6px',
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
                  borderRadius: '6px',
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

      {/* High-Fidelity Voice Tuning & Diagnostics Modal */}
      {showVoiceModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowVoiceModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              padding: '22px',
              maxWidth: '520px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SlidersHorizontal size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--color-slate)' }}>
                    {isEn ? 'Speech Audio & Voice Settings' : 'प्राकृतिक ध्वनि एवं आवाज़ सेटिंग्स'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--color-slate-muted)' }}>
                    {isEn ? 'Tuned for natural human cadence & primary school pedagogy' : 'प्राथमिक शाला हेतु प्राकृतिक मानवीय गति व उच्चारण'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-slate-muted)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Active Synthesizer Status */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-tint)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-slate-muted)' }}>
                  {isEn ? 'Active Speech Engine:' : 'सक्रिय ध्वनि इंजन:'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {isEn ? '● Natural Neural Voice Active' : '● प्राकृतिक न्यूरल आवाज़ सक्रिय'}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-slate)' }}>
                {voiceService.getBestNaturalVoice('hi-IN')?.name || 'System Natural Voice'} ({voiceService.getBestNaturalVoice('hi-IN')?.lang || 'hi-IN'})
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-muted)', lineHeight: 1.4 }}>
                {isEn
                  ? 'High-definition on-device neural voice (Apple Lekha/Rishi or Google WaveNet) selected to prevent metallic robotic monotone.'
                  : 'धात्विक/रोबोटिक स्वर से बचने के लिए उच्च-गुणवत्ता वाली प्राकृतिक भारतीय आवाज़ (लेखा/ऋषि) स्वतः चयनित है।'}
              </div>
            </div>

            {/* Controls: Voice Selection, Speed, Warmth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Voice Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-slate)', marginBottom: '4px' }}>
                  {isEn ? 'Voice Profile:' : 'आवाज़ प्रोफ़ाइल:'}
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    voiceService.setVoicePreference(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-slate)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="auto">
                    {isEn ? 'Auto-Select Best Natural Indian Voice (Recommended)' : 'स्वतः सर्वश्रेष्ठ भारतीय आवाज़ चुनें (अनुशंसित)'}
                  </option>
                  {availableVoices
                    .filter((v) => v.lang.includes('hi') || v.lang.includes('IN') || v.lang.includes('en'))
                    .map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang}) {v.name.includes('Lekha') || v.name.includes('Rishi') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced') ? ' [HD]' : ''}
                      </option>
                    ))}
                </select>
              </div>

              {/* Speed / Pacing */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-slate)' }}>
                    {isEn ? 'Classroom Pacing (Speed):' : 'कक्षा उच्चारण गति:'}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-palash)' }}>
                    {voiceRate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={voiceRate}
                  onChange={(e) => {
                    const r = parseFloat(e.target.value);
                    setVoiceRate(r);
                    voiceService.setSpeechRate(r);
                  }}
                  style={{ width: '100%', accentColor: 'var(--color-palash)', cursor: 'pointer' }}
                />
              </div>

              {/* Pitch / Warmth */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-slate)' }}>
                    {isEn ? 'Vocal Resonance (Pitch):' : 'स्वर माधुर्य (Pitch):'}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-palash)' }}>
                    {voicePitch}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={voicePitch}
                  onChange={(e) => {
                    const p = parseFloat(e.target.value);
                    setVoicePitch(p);
                    voiceService.setSpeechPitch(p);
                  }}
                  style={{ width: '100%', accentColor: 'var(--color-palash)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Solution Architecture Roadmap */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(37, 99, 235, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEn ? 'Pedagogic Audio Architecture:' : 'ध्वनि प्रणाली वास्तुकला:'}
              </span>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.72rem', color: 'var(--color-slate-muted)', lineHeight: 1.5 }}>
                <li><b>Tier 1:</b> Studio Human Audio Bank for Core NIPUN vocabulary</li>
                <li><b>Tier 2:</b> On-Device Natural Neural Voices (Apple Lekha, Google WaveNet)</li>
                <li><b>Tier 3:</b> 100% Offline Piper WebAssembly Neural TTS</li>
                <li><b>Tier 4:</b> Digital India Bhashini AI for tribal dialects</li>
              </ul>
            </div>

            {/* Test Voice Button */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  voiceService.speakText('जोहार! नमस्ते, कक्षा में आपका स्वागत है।', 'hi-IN');
                  toast.success(isEn ? 'Testing natural speech audio...' : 'प्राकृतिक आवाज़ परीक्षण चल रहा है...');
                }}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-palash)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Volume2 size={15} />
                <span>{isEn ? 'Test Voice (जोहार! नमस्ते)' : 'आवाज़ सुनकर देखें (Play Demo)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
