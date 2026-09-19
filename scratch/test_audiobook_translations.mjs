import { translateHindiToTribal } from '../src/services/nlpTranslationEngine.js';

const sentences = [
  "गोद लेने की एक सच्ची कहानी सुनाओ",
  "गोद लेने की एक कहानी सुनाओ",
  "दोबारा फिर तुम सो जाओगे",
  "हां फिर मैं सो जाऊंगा",
  "ठीक है यह कहानी सुनो",
  "एक समय की बात है एक राजा और एक रानी अपने महल में कुत्ते और एक बिल्ली के साथ रहते थे",
  "राजा और रानी बहुत उदास रहते थे क्योंकि उनके पास एक बच्चा नहीं था",
  "एक दिन उन्होंने एक छोटे बच्चे को गोद ले लिया और अपने महल में ले आए",
  "डैडी और मैं अस्पताल गए और तुम्हारी मां ने तुम्हें हमारी गोद में डाल दिया",
  "उसने कहा कि वह तुम्हें बहुत प्यार करती थी और तुम्हें कभी नहीं भूलेगी",
  "तुम एक नरम कंबल में आराम से सोए रहे",
  "फिर डैडी और मैं तुम्हें अपने घर ले आए"
];

for (const s of sentences) {
  console.log(`\n======================================================`);
  console.log(`SOURCE HINDI: "${s}"`);
  for (const lang of ['ho', 'mundari', 'santhali', 'sadri']) {
    const res = translateHindiToTribal(s, lang);
    console.log(`[${lang.toUpperCase()}]`);
    console.log(`  Native:   ${res.nativeScript}`);
    console.log(`  Deva:     ${res.phoneticDeva}`);
    console.log(`  Audio:    ${res.audioText}`);
  }
}
