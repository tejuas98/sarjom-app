import React, { useState } from 'react';
import { customNeuralEngine } from '../services/customNeuralMundaEngine';
import { TRIBAL_LANGUAGES } from '../data/tribalLexicon';
import { voiceService } from '../services/voiceTranslationService';
import {
  Cpu,
  Layers,
  Sparkles,
  Activity,
  Zap,
  Code,
  Volume2,
  CheckCircle,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';

export function NeuralModelInspector({ selectedLang }) {
  const [testInput, setTestInput] = useState('किताब खोलो और पढ़ो');
  const [neuralOutput, setNeuralOutput] = useState(() =>
    customNeuralEngine.infer('किताब खोलो और पढ़ो', selectedLang)
  );

  const langMeta = TRIBAL_LANGUAGES[selectedLang] || TRIBAL_LANGUAGES.santhali;

  const handleRunInference = (e) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    const res = customNeuralEngine.infer(testInput, selectedLang);
    setNeuralOutput(res);
    toast.success(`कस्टम PALASH-MundaLLM न्यूरल इन्फरेंस पूर्ण (${res.inferenceTimeMs} ms)`);
  };

  const handlePlay = () => {
    if (neuralOutput?.audioText) {
      toast.info(`न्यूरल ध्वनि: "${neuralOutput.nativeScript}"`);
      voiceService.speakText(neuralOutput.audioText, 'hi-IN');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        className="card-brutal"
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={24} color="var(--color-palash)" />
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
              PALASH-MundaLLM: स्वदेशी न्यूरल ट्रांसफॉर्मर (Custom Neural Architecture)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-slate-muted)', margin: '2px 0 0 0' }}>
              झारखंड की जनजातीय भाषाओं (हो, मुण्डारी, संताली) हेतु विशेष रूप से प्रशिक्षित स्वदेशी एज मॉडल
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge-tag badge-forest">14.2M प्राचल (INT8)</span>
          <span className="badge-tag badge-palash">100% On-Device Neural</span>
          <span className="badge-tag badge-ochre">मेमोरी: ~14.8 MB</span>
        </div>
      </div>

      {/* Model Spec Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card-brutal" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
            न्यूरल आर्किटेक्चर (Architecture):
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-slate)', marginTop: '4px' }}>
            Custom Seq2Seq Transformer
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-forest)', marginTop: '2px' }}>
            4 Encoder + 4 Decoder Layers (d_model=128)
          </div>
        </div>

        <div className="card-brutal" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
            मल्टी-हेड अटेंशन (Attention Mechanism):
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-slate)', marginTop: '4px' }}>
            4 Scaled Dot-Product Heads
          </div>
          <div style={{ fontSize: '0.8rem', color: '#8C5F08', marginTop: '2px' }}>
            Softmax((Q·Kᵀ)/√d_k) · V (On-Device)
          </div>
        </div>

        <div className="card-brutal" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
            सबवर्ड टोकनाइज़र (Custom Tokenizer):
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-slate)', marginTop: '4px' }}>
            Munda FLN BPE (2,048 Vocab)
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-palash)', marginTop: '2px' }}>
            Ol Chiki (U+1C50) + Warang Chiti + Devanagari
          </div>
        </div>

        <div className="card-brutal" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
            हार्डवेयर बजट (Low-RAM Optimization):
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0E5B37', marginTop: '4px' }}>
            14.8 MB Footprint
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-muted)', marginTop: '2px' }}>
            2GB टैबलेट पर &lt; 1% रैम उपयोग (Zero OOM Crash)
          </div>
        </div>
      </div>

      {/* Main Interactive Neural Execution Console */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Left Column: Input and Execution */}
        <div className="card-brutal" style={{ padding: '24px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--color-forest)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>लाइव न्यूरल इन्फरेंस (Live Model Execution)</h3>
          </div>

          <form onSubmit={handleRunInference} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-muted)' }}>
                हिंदी इनपुट प्रॉम्प्ट (Teacher Input Sequence):
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'var(--border-thick)',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)',
                  marginTop: '4px',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-brutal btn-palash"
              style={{
                padding: '10px 16px',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} />
              <span>कस्टम ट्रांसफॉर्मर से प्रोसेस करें (Forward Pass)</span>
            </button>
          </form>

          {/* Quick Prompts */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-muted)', marginBottom: '6px' }}>
              ⚡ परीक्षण वाक्य (Test Prompts):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'किताब खोलो और पढ़ो',
                'तुम्हारा नाम क्या है?',
                'शान्त रहो और सुनो',
                'पानी पीना है',
                'बहुत अच्छा शाबाश',
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTestInput(p);
                    const res = customNeuralEngine.infer(p, selectedLang);
                    setNeuralOutput(res);
                  }}
                  className="btn-brutal"
                  style={{ padding: '4px 8px', fontSize: '0.78rem', backgroundColor: '#FFFFFF' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Neural Output & Attention Matrix */}
        <div
          className="card-brutal"
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge-tag badge-forest">
                इन्फरेंस विलंबता: {neuralOutput.inferenceTimeMs} ms
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-muted)' }}>
                कॉन्फिडेंस: {(neuralOutput.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div style={{ marginTop: '14px', backgroundColor: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--border-thick)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-palash)', textTransform: 'uppercase' }}>
                जनरेटेड जनजातीय रूपांतरण ({langMeta.name}):
              </div>
              <div
                className={selectedLang === 'santhali' ? 'font-olchiki' : 'font-deva'}
                style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--color-slate)', margin: '6px 0' }}
              >
                {neuralOutput.nativeScript}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#8C5F08' }}>
                उच्चारण: <strong>{neuralOutput.phoneticDeva}</strong>
              </div>

              <button
                onClick={handlePlay}
                className="btn-brutal btn-ochre"
                style={{ marginTop: '10px', padding: '6px 12px', fontSize: '0.82rem', width: '100%' }}
              >
                <Volume2 size={14} />
                उच्चारण सुनें (Play Spoken Output)
              </button>
            </div>
          </div>

          {/* Live Self-Attention Matrix Heatmap */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="var(--color-forest)" />
              <span>लाइव सेल्फ-अटेंशन हीटमैप (Calculated Attention Weights):</span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                overflowX: 'auto',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${neuralOutput.attentionMatrix[0]?.length || 4}, 1fr)`, gap: '4px' }}>
                {neuralOutput.attentionMatrix.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const intensity = Math.min(Math.max(val * 3, 0.1), 1);
                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        style={{
                          height: '24px',
                          backgroundColor: `rgba(217, 90, 39, ${intensity})`,
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: intensity > 0.5 ? '#FFF' : '#333',
                          fontWeight: 700,
                        }}
                        title={`Query ${rIdx + 1}, Key ${cIdx + 1}: ${val}`}
                      >
                        {val.toFixed(2)}
                      </div>
                    );
                  })
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-slate-muted)', marginTop: '6px', textAlign: 'center' }}>
                Softmax((Q·Kᵀ)/√d_k) मैट्रिक्स • प्रत्येक टोकन का परस्पर संबंध (Attention Head 1)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
