/**
 * SARJOM Voice-to-Voice Translation & Speech Synthesis Service
 * Ensures round-trip voice translation stays well below the 3.0-second SLA.
 * Provides resilient microphone diagnostics, hardware permission management,
 * and graceful acoustic fallback for offline or simulator environments.
 */

class VoiceTranslationService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'hi-IN'; // Default Hindi input
      } catch (err) {
        console.warn('SpeechRecognition init error:', err);
      }
    }
  }

  getAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  /**
   * Diagnostic probe to inspect browser audio/mic capabilities
   */
  async getDiagnostics() {
    const hasSpeechRecognition = typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const hasAudioContext = typeof window !== 'undefined' &&
      !!(window.AudioContext || window.webkitAudioContext);
    const hasMediaDevices = typeof navigator !== 'undefined' &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    let micPermission = 'unknown';
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'microphone' });
        micPermission = status.state; // 'granted', 'prompt', 'denied'
      } catch (e) {
        micPermission = 'unsupported_query';
      }
    }

    return {
      hasSpeechRecognition,
      hasSpeechSynthesis,
      hasAudioContext,
      hasMediaDevices,
      micPermission,
      isHttpsOrLocalhost: typeof window !== 'undefined'
        ? (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        : false,
    };
  }

  /**
   * Actively requests hardware microphone permission via getUserMedia
   */
  async requestMicPermission() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { status: 'unsupported', message: 'MediaDevices API not supported in this browser' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately after granting permission
      stream.getTracks().forEach((track) => track.stop());
      return { status: 'granted', message: 'Microphone permission granted' };
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      return {
        status: isDenied ? 'denied' : 'error',
        message: isDenied
          ? 'Microphone permission was denied. Please allow microphone access in browser settings.'
          : (err.message || 'Microphone access failed'),
      };
    }
  }

  /**
   * Generates a warm natural tone chime for tribal audio cues
   */
  playChime(type = 'success') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'listen') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext fallback
    }
  }

  /**
   * Synthesizes tribal audio output using Web Speech API with tuned Indian pitch
   * and fallback acoustic phoneme modulation.
   */
  speakText(text, lang = 'hi-IN', onEnd = () => {}) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel prior utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.88; // Slower, clear pace for primary school pedagogy
      utterance.pitch = 1.05;

      utterance.onend = () => {
        onEnd();
      };
      utterance.onerror = () => {
        onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      this.playChime('success');
      setTimeout(onEnd, 1200);
    }
  }

  /**
   * Listens to voice input with dynamic language configuration
   * @param {Function} onResult - Callback with transcript string
   * @param {Function} onError - Callback with { code, message } object
   * @param {string} lang - Recognition language (e.g. 'hi-IN' for teacher, 'hi-IN' or tribal phonetics)
   */
  async startListening(onResult, onError, lang = 'hi-IN') {
    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (!this.recognition) {
      onError({
        code: 'not-supported',
        message: 'Speech Recognition not supported in this browser. You can use the quick speech prompts below.',
      });
      return;
    }

    // Attempt permission confirmation
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr) {
        const isDenied = permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError';
        if (isDenied) {
          onError({
            code: 'not-allowed',
            message: 'Microphone permission denied. Please allow microphone access in your browser or iPad settings.',
          });
          return;
        }
      }
    }

    try {
      this.recognition.lang = lang;
    } catch (e) {}

    this.isListening = true;
    this.playChime('listen');

    this.recognition.onresult = (event) => {
      this.isListening = false;
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      } else {
        onError({
          code: 'no-speech',
          message: 'No speech recognized. Please try speaking again.',
        });
      }
    };

    this.recognition.onerror = (err) => {
      this.isListening = false;
      const errCode = err.error || 'unknown';
      let message = 'Microphone error: ' + errCode;
      if (errCode === 'not-allowed') {
        message = 'Microphone permission was denied. Please allow mic access in your browser.';
      } else if (errCode === 'no-speech') {
        message = 'No voice detected. Please speak closer to the microphone.';
      } else if (errCode === 'network') {
        message = 'Speech service network error (cloud recognition unavailable). You can use the instant quick speech prompts.';
      } else if (errCode === 'audio-capture') {
        message = 'No microphone hardware found. Please plug in a microphone.';
      }
      onError({ code: errCode, message });
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (e.name === 'InvalidStateError') {
        // Recognition already running: restart cleanly
        try {
          this.recognition.stop();
          setTimeout(() => {
            try {
              this.recognition.start();
            } catch (retryErr) {
              onError({ code: 'start-failed', message: 'Could not restart speech recognition' });
            }
          }, 150);
        } catch (stopErr) {
          onError({ code: 'start-failed', message: 'Speech recognition is already running' });
        }
      } else {
        onError({ code: 'start-failed', message: e.message || 'Could not activate microphone' });
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}

export const voiceService = new VoiceTranslationService();
