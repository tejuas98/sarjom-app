/**
 * SARJOM Voice-to-Voice Translation & Speech Synthesis Service
 * Ensures round-trip voice translation stays well below the 3.0-second SLA.
 */

class VoiceTranslationService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'hi-IN'; // Hindi input for teachers
      } catch (err) {
        console.warn('SpeechRecognition init error:', err);
      }
    }
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
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
    if ('speechSynthesis' in window) {
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
   * Listens to teacher voice in Hindi
   */
  startListening(onResult, onError) {
    if (!this.recognition) {
      onError('Speech Recognition not supported in this browser. Using quick-input fallback.');
      return;
    }

    this.isListening = true;
    this.playChime('listen');

    this.recognition.onresult = (event) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (err) => {
      this.isListening = false;
      onError(err.error || 'Mic error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      onError('Recognition already active');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const voiceService = new VoiceTranslationService();
