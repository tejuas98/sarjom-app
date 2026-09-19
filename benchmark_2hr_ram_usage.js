/**
 * 2-Hour Continuous Classroom Usage Memory Profiler
 * Problem Statement: SIH26042 | Govt of Jharkhand | Low-End Hardware Certification
 * Simulates 2 continuous hours of teaching: 2,000 spoken sentences across all 4 tribal languages
 */

import { translateHindiToTribal } from './src/services/nlpTranslationEngine.js';

console.log('================================================================================');
console.log('⏱️ 2-HOUR CONTINUOUS CLASSROOM USAGE RAM BENCHMARK');
console.log('Simulating 120 Minutes of Continuous Non-Stop Translation (2,000 Utterances)');
console.log('Target Hardware: Low-End 2GB RAM Android Device (LMKD Kill Threshold: ~250-300MB)');
console.log('================================================================================\n');

const SAMPLE_UTTERANCES = [
  'बच्चों, अपनी भाषा की किताब निकालो और पहला पाठ पढ़ो।',
  'जब तक राशन कार्डधारी बायोमेट्रिक मशीन में अंगूठा नहीं लगाएंगे, तब तक मुफ्त अनाज नहीं मिलेगा।',
  'चूंकि गांव के कुछ बाहरी भू-माफियाओं ने कपटपूर्ण तरीके से खूंटकट्टी ज़मीन का अवैध हस्तांतरण कराया है...',
  'चूंकि झारखंड सरकार के जनजातीय कल्याण विभाग ने मुख्यमंत्री डाकिया योजना में सुदूरवर्ती टोलों का विकास किया है...',
  'यह आम का पेड़ है और नदी पहाड़ से निकलकर जंगल में बहती है।',
  'अब गणित की बारी है, एक से दस तक गिनती गिनो।',
  'खाना खाने से पहले साबुन से हाथ धोना चाहिए।',
  'सरहुल के पावन अवसर पर हम सब मिलकर साल के फूलों की पूजा करते हैं।'
];

const LANGUAGES = ['santhali', 'ho', 'mundari', 'sadri'];

function getMemoryMB() {
  const mem = process.memoryUsage();
  return {
    heapUsed: (mem.heapUsed / (1024 * 1024)).toFixed(2),
    heapTotal: (mem.heapTotal / (1024 * 1024)).toFixed(2),
    rss: (mem.rss / (1024 * 1024)).toFixed(2),
    external: (mem.external / (1024 * 1024)).toFixed(2),
  };
}

const TOTAL_UTTERANCES = 2000; // ~16-17 sentences/min for 120 min
const CHECKPOINTS = [
  { label: 'Baseline (0 min)', count: 0 },
  { label: '30 Minutes (500 utterances)', count: 500 },
  { label: '60 Minutes (1,000 utterances)', count: 1000 },
  { label: '90 Minutes (1,500 utterances)', count: 1500 },
  { label: '120 Minutes (2,000 utterances)', count: 2000 },
];

const results = [];
const baseMem = getMemoryMB();
results.push({ ...CHECKPOINTS[0], ...baseMem });

let currentCheckpointIdx = 1;
const tStart = performance.now();

for (let i = 1; i <= TOTAL_UTTERANCES; i++) {
  const sentence = SAMPLE_UTTERANCES[i % SAMPLE_UTTERANCES.length];
  const lang = LANGUAGES[i % LANGUAGES.length];
  
  // Forward translation
  translateHindiToTribal(sentence, lang);

  if (currentCheckpointIdx < CHECKPOINTS.length && i === CHECKPOINTS[currentCheckpointIdx].count) {
    const mem = getMemoryMB();
    results.push({ ...CHECKPOINTS[currentCheckpointIdx], ...mem });
    currentCheckpointIdx++;
  }
}

const tTotal = performance.now() - tStart;

if (global.gc) {
  global.gc();
}

const postGcMem = getMemoryMB();

console.log('📊 2-HOUR SIMULATED TIMELINE RAM USAGE:');
console.table(results.map(r => ({
  'Timeline Checkpoint': r.label,
  'Heap Used (MB)': `${r.heapUsed} MB`,
  'Heap Total (MB)': `${r.heapTotal} MB`,
  'RSS Footprint (MB)': `${r.rss} MB`,
})));

const initialHeap = parseFloat(results[0].heapUsed);
const finalHeap = parseFloat(results[results.length - 1].heapUsed);
const netDelta = (finalHeap - initialHeap).toFixed(2);

console.log('\n--------------------------------------------------------------------------------');
console.log(`⏱️ Total Time to Process 2,000 Spoken Utterances: ${tTotal.toFixed(1)} ms (${(tTotal / 1000).toFixed(2)} sec)`);
console.log(`⚡ Average Processing Latency: ${(tTotal / TOTAL_UTTERANCES).toFixed(2)} ms per sentence`);
console.log(`💾 Starting Heap: ${initialHeap} MB`);
console.log(`💾 Ending Heap (after 2 hours / 2,000 utterances): ${finalHeap} MB`);
console.log(`📈 Net Heap Growth (Delta): ${netDelta} MB`);
console.log(`🧹 Post-GC Residual Heap: ${postGcMem.heapUsed} MB`);
console.log('--------------------------------------------------------------------------------\n');
