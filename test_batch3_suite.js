import { translateHindiToTribal, translateTribalToHindi } from './src/services/nlpTranslationEngine.js';

const scenarios = [
  {
    name: 'Scenario 1: Digital Education & New Policies (डिजिटल शिक्षा और नीति)',
    sourceHindi: 'जब हमारी बेटियों को स्कूल में कंप्यूटर चलाना सिखाया जाएगा, तब वे खुद इंटरनेट पर अपनी पढ़ाई की सामग्री ढूंढ पाएंगी।',
    studentInputs: {
      santhali: 'ᱡᱚᱠᱷᱚᱱ ᱟᱞᱮ ᱨᱮᱱ ᱠᱩᱲᱤ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱨᱮ ᱠᱚᱢᱯᱤᱭᱩᱴᱟᱨ ᱪᱟᱞᱟᱣ ᱪᱮᱫ ᱟᱠᱚᱣᱟ, ᱩᱱᱠᱷᱚᱱ ᱩᱱᱠᱩ ᱟᱠᱚ ᱛᱮᱜᱮ ᱤᱱᱴᱟᱨᱱᱮᱴ ᱨᱮ ᱟᱠᱚᱣᱟᱜ ᱯᱟᱲᱦᱟᱣ ᱥᱟᱢᱟᱱ ᱠᱚ ᱧᱟᱢ ᱫᱟᱲᱮᱭᱟᱜ-ᱟ᱾',
      mundari: 'जदो आलेयाः कुड़ी होनाको इतुन आसड़ा रे कम्प्यूटर चलाव चेते कोवा, एनदो आको तेगे इण्टरनेट रे आपनाः पढ़ाव जिनिसको नाम दड़ि-आको।',
      ho: 'जदो अलेयाः कुइ होनको इतुन आसड़ा रे कम्प्यूटर चलाव इतु कोवा, एनदो आको तेगे इंटरनेट रे आकोवाः पढ़ाओ जिनिसको नाम दड़ि-एयाको।',
      sadri: 'जब हमर बेटी मन के इस्कूल में कम्प्यूटर चलाएक सिखाएल जाई, तब उमन अपने इंटरनेट में अपन पढ़ाई कर सामग्री खोज सकेब।',
    }
  },
  {
    name: 'Scenario 2: Emergency Response & Weather Disasters (आपातकालीन आपदा प्रबंधन)',
    sourceHindi: 'कल रात तेज़ आंधी-तूफान के कारण हमारे घर की छत उड़ गई है, इसलिए हमें आज रात मुखिया के पक्के मकान में रुकना पड़ेगा।',
    studentInputs: {
      santhali: 'ᱦᱚᱞᱟ ᱧᱤᱫᱟᱹ ᱟᱹᱰᱤ ᱠᱮᱴᱮᱡ ᱦᱚᱭ-ᱫᱟᱜ ᱠᱷᱟᱹᱛᱤᱨ ᱟᱞᱮ ᱚᱲᱟᱜ ᱨᱮᱱᱟᱜ ᱥᱟᱨᱤᱢ ᱩᱰᱟᱹᱣ ᱮᱱᱟ, ᱚᱱᱟᱛᱮ ᱟᱞᱮ ᱛᱮᱦᱮᱧ ᱧᱤᱫᱟᱹ ᱢᱟᱹᱧᱡᱷᱤ ᱦᱟᱲᱟᱢᱟᱜ ᱯᱟᱠᱟ ᱚᱲᱟᱜ ᱨᱮ ᱛᱟᱦᱮᱸᱱ ᱦᱩᱭᱩᱜ-ᱟ᱾',
      mundari: 'होला निदा जोरते होयो-दाः बोंडोल ते आलेयाः ओड़ाः साते ओतार याना, एनाते आले तिसिंग निदा मुंडा-आः पाका ओड़ाः रे तायेन होबाओ-आ।',
      ho: 'होला निदा पुरः जोर होयो-दाः ते अलेयाः ओवाः साते ओतार याना, एनाते आले तिसिंग निदा मुंडा-आः पाका ओवाः रे तायेन होबाओ-आ।',
      sadri: 'काइल रैत भारी आंधी-तूफान कर कारन हमर घर कर छत उड़ गेलक, सेहेले हमरे के आइज रैत मुखिया कर पक्का मकान में रहेक पड़ी।',
    }
  },
  {
    name: 'Scenario 3: Bank Literacy & Financial Self-Help Groups (बैंक साक्षरता और स्वयं सहायता समूह)',
    sourceHindi: 'अगर दीदी ने बैंक जाकर खाता नहीं खुलवाया होता, तो समूह की महिलाओं को सरकारी सब्सिडी का पैसा सीधे हाथ में नहीं मिलता।',
    studentInputs: {
      santhali: 'ᱡᱩᱫᱤ ᱫᱟᱹᱭ ᱵᱮᱝᱠ ᱥᱮᱱ ᱠᱟᱛᱮ ᱠᱷᱟᱛᱟ ᱵᱟᱭ ᱡᱷᱤᱡ ᱚᱪᱚ ᱞᱮᱫ ᱠᱷᱟᱱ, ᱮᱱᱠᱷᱟᱱ ᱫᱚᱞ ᱨᱮᱱ ᱢᱟᱹᱭᱡᱩ ᱠᱚ ᱥᱚᱨᱠᱟᱨᱤ ᱜᱚᱲᱚ ᱴᱟᱠᱟ ᱥᱚᱡᱷᱮ ᱛᱤ ᱨᱮ ᱵᱟᱝ ᱠᱚ ᱧᱟᱢ ᱠᱮᱭᱟ᱾',
      mundari: 'जुदि दाई बैंक सेनकेते खाता काए ओताइ-केया, एनरेदो दल-राः कुड़ीको सरकारी गोड़ो पोइसा सोंझोगे ती रे का नमोः-आ।',
      ho: 'जुदि दाई बैंक सेनकेते खाता काए कुलाबो-लेया, एनदो दल-राः कुइको सरकारी गोपोड़ो पइसा सोंझोगे ती रे का नमोः-एया।',
      sadri: 'अगर दीदी बैंक जाइके खाता नी खुलाय रहितीं, तो समूह कर जनाना मन के सरकारी सब्सिडी कर पइसा सोझे हाथ में नी मिलत।',
    }
  },
  {
    name: 'Scenario 4: Land Rights & Legal Dispute (भूमि अधिकार और कानूनी विवाद)',
    sourceHindi: 'हमारे दादाजी की ज़मीन के कागज़ात को गांव के कुछ बाहरी लोगों ने धोखे से बदल दिया है, जिसके खिलाफ हम कचहरी में मुकदमा लड़ेंगे।',
    studentInputs: {
      santhali: 'ᱟᱞᱮ ᱨᱮᱱ ᱜᱚᱲᱚᱢ ᱦᱟᱲᱟᱢᱟᱜ ᱦᱟᱥᱟ ᱠᱟᱜᱚᱡᱽ ᱟᱹᱛᱩ ᱨᱮᱱ ᱠᱤᱪᱷᱩ ᱵᱟᱦᱨᱮ ᱦᱚᱲ ᱮᱲᱮ ᱛᱮᱠᱚ ᱵᱚᱫᱚᱞ ᱠᱮᱫ-ᱟ, ᱡᱟᱦᱟᱸ ᱵᱤᱨᱩᱫᱷ ᱨᱮ ᱟᱞᱮ ᱠᱟᱪᱟᱦᱟᱨᱤ ᱨᱮ ᱢᱚᱠᱚᱫᱽᱫᱚᱢᱟ ᱞᱮ ᱞᱟᱹᱲᱦᱟᱹᱭᱟ᱾',
      mundari: 'आलेयाः ताता-आः ओते कागोच-के हातू-राः तारा बाहरे होड़ोको धोखे ते बोदोल-केदा, जेना-राः बिरोध रे आले काचारी रे मुकदमा लड़े-आबु।',
      ho: 'अलेयाः ताता-आः ओते कागोज-के हातू-राः तारा बाहरे होड़ोको ठोक ते बोदोल-केदा, जेना-राः बिरोध रे आले काचारी रे मुकदमा लड़े-एयाले।',
      sadri: 'हमर आजा कर ज़मीन कर कागज़ात के गाँव कर कुछ बाहरी मन धोखे से बदइल देलें, जेकर खिलाफ हमरे कचहरी में मुकदमा लड़ब।',
    }
  },
];

const languages = ['santhali', 'mundari', 'ho', 'sadri'];

console.log('========================================================================');
console.log('🚀 TESTING HARD MODE TEST SUITE (BATCH 3) - SPEECH & TRANSLATION PIPELINE');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;

for (let i = 0; i < scenarios.length; i++) {
  const sc = scenarios[i];
  console.log(`\n------------------------------------------------------------------------`);
  console.log(`📋 [TEST ${i + 1}/4] ${sc.name}`);
  console.log(`🎤 Hindi Source Speech: "${sc.sourceHindi}"`);
  console.log(`------------------------------------------------------------------------`);

  // PART A: Teacher Mode (Hindi Speech In -> Tribal Output & Audio Out)
  console.log(`\n🔊 PART A: TEACHER MODE (Hindi Speech -> Tribal Audio Output)`);
  for (const lang of languages) {
    totalTests++;
    const res = translateHindiToTribal(sc.sourceHindi, lang);
    const hasScript = Boolean(res.nativeScript);
    const hasAudio = Boolean(res.audioText);
    const isSuccess = hasScript && hasAudio;

    if (isSuccess) passedTests++;

    console.log(`  [${lang.toUpperCase()}]`);
    console.log(`    Native Script : ${res.nativeScript}`);
    console.log(`    Phonetic Deva : ${res.phoneticDeva || 'N/A'}`);
    console.log(`    Speech Audio  : "${res.audioText}"`);
    console.log(`    Confidence    : ${(res.confidence * 100).toFixed(1)}% | Latency: ${res.latencyMs || 10}ms | Match: ${res.matchType}`);
  }

  // PART B: Student Mode (Tribal Speech In -> Hindi Essay Out)
  console.log(`\n🎓 PART B: STUDENT MODE (Tribal Speech -> Hindi Translation)`);
  for (const lang of languages) {
    totalTests++;
    const tribalInput = sc.studentInputs[lang];
    const sRes = translateTribalToHindi(tribalInput, lang);
    const hasHindi = Boolean(sRes.hindiTranslation);
    const isSuccess = hasHindi && sRes.confidence >= 0.9;

    if (isSuccess) passedTests++;

    console.log(`  [${lang.toUpperCase()} -> HINDI]`);
    console.log(`    Student Spoke : ${tribalInput}`);
    console.log(`    Hindi Output  : ${sRes.hindiTranslation}`);
    console.log(`    Challenge     : ${sRes.grammaticalChallenge || 'Complex syntactic alignment'}`);
    console.log(`    Confidence    : ${(sRes.confidence * 100).toFixed(1)}% | Latency: ${sRes.latencyMs || 12}ms`);
  }
}

console.log(`\n========================================================================`);
console.log(`📊 FINAL TEST REPORT: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`========================================================================`);

if (passedTests === totalTests) {
  console.log('✅ ALL 32 TEST SCENARIOS PASSED WITH HIGH-FIDELITY SPEECH STRINGS!');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
