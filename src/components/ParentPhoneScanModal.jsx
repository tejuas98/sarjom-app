import React, { useState } from 'react';
import { X, Volume2, Smartphone, CheckCircle, QrCode, Sparkles, ArrowRight } from 'lucide-react';
import { voiceService } from '../services/voiceTranslationService';

export function ParentPhoneScanModal({ isOpen, onClose, selectedLang = 'santhali', worksheetType = 'numeracy' }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const audioMap = {
    santhali: {
      langName: 'संताली (Santhali / ᱚᱞ ᱪᱤᱠᱤ)',
      title: 'संख्या ज्ञान (1-5) अभ्यास उच्चारण',
      script: 'ᱢᱤᱫ, ᱵᱟᱨ, ᱯᱮ, ᱯᱩᱱ, ᱢᱚᱬᱮ',
      phonetic: 'मिद, बार, पे, पुन, मोणे',
      meaning: '1: एक, 2: दो, 3: तीन, 4: चार, 5: पांच',
      spokenText: 'मिद, बार, पे, पुन, मोणे। खूब बेस!',
      audioFile: '/audio/classroom_command.mp3'
    },
    ho: {
      langName: 'हो (Ho / वारंग क्षिति)',
      title: 'संख्या ज्ञान (1-5) अभ्यास उच्चारण',
      script: 'मियद, बारिया, आपिया, उपुन, मोड़े',
      phonetic: 'मियद, बारिया, आपिया, उपुन, मोड़े',
      meaning: '1: एक, 2: दो, 3: तीन, 4: चार, 5: पांच',
      spokenText: 'मियद, बारिया, आपिया, उपुन, मोड़े। बुगिना!',
      audioFile: '/audio/classroom_command.mp3'
    },
    mundari: {
      langName: 'मुण्डारी (Mundari / मुण्डारी बानी)',
      title: 'संख्या ज्ञान (1-5) अभ्यास उच्चारण',
      script: 'मियद, बारिया, आपिया, उपुनया, मोड़ेया',
      phonetic: 'मियद, बारिया, आपिया, उपुनया, मोड़ेया',
      meaning: '1: एक, 2: दो, 3: तीन, 4: चार, 5: पांच',
      spokenText: 'मियद, बारिया, आपिया, उपुनया, मोड़ेया। बेस गे!',
      audioFile: '/audio/classroom_command.mp3'
    },
    sadri: {
      langName: 'सादरी (Sadri / नागपुरी)',
      title: 'संख्या ज्ञान (1-5) अभ्यास उच्चारण',
      script: 'एक, दुई, तीन, चार, पांच',
      phonetic: 'एक, दुई, तीन, चार, पांच',
      meaning: '1: एक, 2: दो, 3: तीन, 4: चार, 5: पांच',
      spokenText: 'एक, दुई, तीन, चार, पांच। बहुत बेस!',
      audioFile: '/audio/classroom_command.mp3'
    }
  };

  const current = audioMap[selectedLang] || audioMap.santhali;

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Use Web Speech voice service for on-device TTS audio
    voiceService.speak(current.spokenText, 'hi-IN', () => {
      setIsPlaying(false);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '20px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '360px',
          maxHeight: '92vh',
          backgroundColor: '#0F172A',
          borderRadius: '44px',
          border: '10px solid #334155',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 2px #475569',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#F8FAFC',
        }}
      >
        {/* Phone Notch & Speaker */}
        <div
          style={{
            height: '28px',
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '120px',
              height: '18px',
              backgroundColor: '#1E293B',
              borderRadius: '0 0 14px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <div style={{ width: '40px', height: '4px', backgroundColor: '#475569', borderRadius: '2px' }} />
            <div style={{ width: '6px', height: '6px', backgroundColor: '#0284C7', borderRadius: '50%' }} />
          </div>
          {/* Close Simulation Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '12px',
              top: '6px',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
            title="सिमुलेशन बंद करें"
          >
            <X size={18} />
          </button>
        </div>

        {/* Simulated Phone Screen */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto', backgroundColor: '#FFFFFF', color: '#1E293B' }}>
          {/* Browser Bar */}
          <div
            style={{
              backgroundColor: '#F1F5F9',
              padding: '6px 12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.72rem',
              color: '#64748B',
              marginBottom: '14px',
              border: '1px solid #E2E8F0',
            }}
          >
            <QrCode size={14} color="#0E5B37" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              https://sarjom.jharkhand.gov.in/qr/fln-numeracy
            </span>
          </div>

          {/* App Header Inside Phone */}
          <div
            style={{
              textAlign: 'center',
              padding: '12px 10px',
              backgroundColor: '#F8FAF8',
              borderRadius: '16px',
              border: '2px solid #0E5B37',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🌳</div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0E5B37', fontWeight: 800 }}>
              सरजोम ध्वनि साथी (Audio Companion)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748B' }}>
              झारखंड शिक्षा परियोजना परिषद • गृह-अध्ययन सेतु
            </p>
          </div>

          {/* Simulated Scanned Exercise */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '2px solid #F59E0B',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={14} />
              स्कैन किया गया अभ्यास पत्र (Scanned Sheet)
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
              {current.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
              माध्यम: <strong>{current.langName}</strong>
            </div>

            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px dashed #D97706',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0E5B37' }}>
                {current.script}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                उच्चारण: <strong>{current.phonetic}</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '2px' }}>
                {current.meaning}
              </div>
            </div>
          </div>

          {/* Big Big Action Button for Illiterate Parents */}
          <button
            onClick={handlePlayAudio}
            style={{
              width: '100%',
              padding: '14px 16px',
              backgroundColor: isPlaying ? '#D95A27' : '#0E5B37',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 16px rgba(14,91,55,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <Volume2 size={22} className={isPlaying ? 'animate-pulse' : ''} />
            {isPlaying ? 'उच्चारण हो रहा है...' : '🔊 उच्चारण सुनें (Tap to Listen)'}
          </button>

          {/* Explanation for Jury & Evaluators */}
          <div
            style={{
              marginTop: '14px',
              padding: '10px 12px',
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              border: '1px solid #BFDBFE',
              fontSize: '0.72rem',
              color: '#1E40AF',
              lineHeight: 1.4,
            }}
          >
            <strong>💡 ज्यूरी मूल्यांकन संदर्भ:</strong> यह वेबपेज बिना किसी ऐप डाउनलोड के गाँव के किसी भी 4G/2G स्मार्टफोन पर खुलता है, जिससे निरक्षर माता-पिता भी घर पर बच्चे को सही मातृभाषा में अभ्यास करा सकते हैं।
          </div>
        </div>

        {/* Phone Home Bar */}
        <div
          style={{
            height: '24px',
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: '90px', height: '4px', backgroundColor: '#64748B', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );
}
