/**
 * PALASH Setu NIPUN Bharat FLN Curriculum Data
 * Aligned with National Mission on Foundational Literacy and Numeracy (NIPUN Bharat)
 * and Jharkhand State MTB-MLE Pedagogical Framework
 */

export const NIPUN_LESSONS = [
  {
    id: 'lesson_fln_1',
    lessonNumber: 1,
    titleHindi: 'पाठ 1: अपना परिचय और स्नेहपूर्ण अभिवादन',
    titleEnglish: 'Lesson 1: Self-Introduction & Warm Greetings',
    grade: 'बालवाटिका एवं कक्षा 1',
    theme: 'मौखिक भाषा विकास (Oral Language Development)',
    nipunCode: 'L1.1 - Oral Expression',
    durationMinutes: 30,
    learningOutcome: 'बच्चे अपनी मातृभाषा में शिक्षक का जोहार (अभिवादन) स्वीकार करेंगे और सहजता से अपना नाम बताएंगे।',
    
    // Step 1: Teacher Introduction
    teacherOpeningHindi: 'प्यारे बच्चों! कक्षा में आपका स्वागत है। आज हम एक दूसरे को नमस्ते करना सीखेंगे।',
    translations: {
      ho: {
        script: 'प्यारे होन को! क्लास रे आमा स्वागत मेनाः। तिशिङ आबु जोहार जगार एबो सेचेद-आ।',
        phoneticDeva: 'प्यारे होन को! क्लास रे आमा स्वागत मेनाह। तिशिङ आबु जोहार जगार एबो सेचेद-आ।',
        phoneticLatin: 'Pyaare hon ko! Class re aama swagat mena-ah. Tishing aabu Johār jagar ebo seched-a.',
        audioPrompt: 'Pyaare hon ko! Tishing aabu johar seched-aa',
      },
      mundari: {
        script: 'दुलार हुनको! क्लास रे आमाह स्वागत मेनाः। तिशिं आबु जोहार काजी एबो इतु-अ।',
        phoneticDeva: 'दुलार हुनको! क्लास रे आमाह स्वागत मेनाह। तिशिं आबु जोहार काजी एबो इतु-अ।',
        phoneticLatin: 'Dular hunko! Class re aamah swagat mena-ah. Tishing aabu Johār kaji ebo itu-a.',
        audioPrompt: 'Dular hunko! Tishing aabu johar kaji ebo itu-aa',
      },
      santhali: {
        scriptOlChiki: 'ᱫᱩᱞᱟᱹᱲ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱡᱚᱦᱟᱨ ᱞᱟᱹᱭ ᱟᱨ ᱧᱩᱛᱩᱢ ᱞᱟᱹᱭ ᱵᱚ ᱪᱮᱫ-ᱟ᱾',
        scriptDeva: 'दुलार गिद्रा को! तेहेञ आबो जोहार लइ आर ञुतुम लइ बो चेद-आ।',
        phoneticDeva: 'दुलार गिद्रा को! तेहेञ आबो जोहार लइ आर ञुतुम लइ बो चेद-आ।',
        phoneticLatin: 'Dular gidra ko! Tehenj aabo Johar la-ee aar nyutum la-ee bo ched-aa.',
        audioPrompt: 'Dular gidra ko! Tehenj aabo Johar laee bo ched-aa',
      },
    },

    // Step 2: Classroom Dialogue Activity
    activity: {
      name: 'गेंद लुढ़काओ और नाम बताओ (Roll Ball & Name Game)',
      instructionsHindi: 'शिक्षक एक कपड़े की गेंद बच्चे की ओर लुढ़काते हुए पूछेंगे: "तुम्हारा नाम क्या है?"',
      prompts: {
        ho: {
          teacherAsk: 'चनाम आमा नुतुम? (What is your name?)',
          childAnswer: 'अयिङ-आ नुतुम [नाम] (My name is [Name])',
        },
        mundari: {
          teacherAsk: 'आमाह नुतुम चिकाना? (What is your name?)',
          childAnswer: 'आइङ-आह नुतुम [नाम] (My name is [Name])',
        },
        santhali: {
          teacherAsk: 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱪᱮᱫ? / आमाग ञुतुम दो चेद?',
          childAnswer: 'ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ [नाम] / इञाग ञुतुम दो [नाम]',
        },
      },
    },

    // Step 3: Formative Assessment Rubric
    assessment: {
      questionHindi: 'शिक्षक छात्र से पूछते हैं: "तुम कैसे हो?"',
      expectedAnswers: {
        ho: 'बुगिना मेन-न्या (I am fine)',
        mundari: 'बेस-गे मेनान्या (I am doing well)',
        santhali: 'ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱧᱟ (Besh ge menanya)',
      },
      levels: [
        { score: 1, label: 'स्तर 1 (आरंभिक)', desc: 'संकोच करता है, केवल सिर हिलाता है।' },
        { score: 2, label: 'स्तर 2 (प्रगतिशील)', desc: 'एक शब्द में उत्तर देता है ("बेस", "बुगिना")।' },
        { score: 3, label: 'स्तर 3 (सक्षम/निपुण)', desc: 'मातृभाषा में पूर्ण वाक्य के साथ आत्मविश्वास से उत्तर देता है।' },
      ],
    },
  },

  {
    id: 'lesson_fln_2',
    lessonNumber: 2,
    titleHindi: 'पाठ 2: संख्या ज्ञान 1 से 5 (वस्तुओं को गिनना)',
    titleEnglish: 'Lesson 2: Foundational Numeracy 1 to 5 (Object Counting)',
    grade: 'कक्षा 1 एवं 2',
    theme: 'संख्या ज्ञान और गणित (Foundational Numeracy)',
    nipunCode: 'N1.2 - One-to-One Correspondence',
    durationMinutes: 35,
    learningOutcome: 'बच्चे 1 से 5 तक प्राकृतिक वस्तुओं (कंकड़, पत्तियां, इमली के बीज) को मातृभाषा में गिन सकेंगे।',

    teacherOpeningHindi: 'बच्चों, अपनी मेज पर रखे पत्तों को मेरे साथ गिनें।',
    translations: {
      ho: {
        script: 'होन को, टेबल रे ताकेन साकम को अयिङ लोः लेखा एपे।',
        phoneticDeva: 'होन को, टेबल रे ताकेन साकम को अयिङ लोह लेखा एपे।',
        phoneticLatin: 'Hon ko, table re taken sakam ko aying lo-oh lekha epe.',
        audioPrompt: 'Hon ko, sakam ko aying loh lekha epe',
      },
      mundari: {
        script: 'हुनको, टेबल रे मेनान साकम को आइङ लोः लेखा-एपे।',
        phoneticDeva: 'हुनको, टेबल रे मेनान साकम को आइङ लोह लेखा-एपे।',
        phoneticLatin: 'Hunko, table re menan sakam ko aing lo-oh lekha-epe.',
        audioPrompt: 'Hunko, sakam ko aing loh lekha epe',
      },
      santhali: {
        scriptOlChiki: 'ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ, ᱴᱮᱵᱩᱞ ᱨᱮ ᱢᱮᱱᱟᱜ ᱥᱟᱠᱟᱢ ᱠᱚ ᱤᱧ ᱥᱟᱶ ᱞᱮᱠᱷᱟᱭ ᱯᱮ᱾',
        scriptDeva: 'गिद्रा को, टेबल रे मेनाग साकाम को इञ साव लेखाए पे।',
        phoneticDeva: 'गिद्रा को, टेबल रे मेनाग साकाम को इञ साव लेखाए पे।',
        phoneticLatin: 'Gidra ko, tebul re menag sakam ko inj saw lekhay pe.',
        audioPrompt: 'Gidra ko, sakam ko inj saw lekhay pe',
      },
    },

    activity: {
      name: 'पत्ता और कंकड़ गिनती (Leaves & Stones Count)',
      instructionsHindi: 'शिक्षक 3 कंकड़ दिखाते हुए संख्या पूछेंगे।',
      prompts: {
        ho: {
          teacherAsk: 'नेना तिनः मेनाः? (यह कितना है?)',
          childAnswer: 'आपिया (3 / Three)',
        },
        mundari: {
          teacherAsk: 'नेया चिमिन मेनाः? (यह कितना है?)',
          childAnswer: 'आपिया (3 / Three)',
        },
        santhali: {
          teacherAsk: 'ᱱᱚᱣᱟ ᱛᱤᱱᱟᱹᱜ ᱢᱮᱱᱟᱜ-ᱟ? / नोवा तीनाग मेनाग-आ?',
          childAnswer: 'ᱯᱮ (3 / Pe)',
        },
      },
    },

    assessment: {
      questionHindi: 'छात्र को 4 इमली के बीज देकर पूछें: "यह कितने बीज हैं?"',
      expectedAnswers: {
        ho: 'उपुनिया (4)',
        mundari: 'उपुनिया (4)',
        santhali: 'ᱯᱩᱱ / पुन (4)',
      },
      levels: [
        { score: 1, label: 'स्तर 1', desc: 'गिनती में क्रम भूल जाता है।' },
        { score: 2, label: 'स्तर 2', desc: 'उंगली रखकर सही गिनता है लेकिन 3 और 4 में संकोच करता है।' },
        { score: 3, label: 'स्तर 3', desc: '1 से 5 तक बेझिझक सही मातृभाषा में संख्या नाम बताता है।' },
      ],
    },
  },

  {
    id: 'lesson_fln_3',
    lessonNumber: 3,
    titleHindi: 'पाठ 3: प्रकृति और पशु-पक्षी की पहचान',
    titleEnglish: 'Lesson 3: Nature, Flora, and Fauna Recognition',
    grade: 'कक्षा 2 एवं 3',
    theme: 'पर्यावरण एवं शब्दावली (Environmental Vocabulary)',
    nipunCode: 'L2.4 - Contextual Vocabulary',
    durationMinutes: 40,
    learningOutcome: 'बच्चे अपने गाँव के वातावरण में पाए जाने वाले 5 पशुओं और प्राकृतिक तत्वों के नाम अपनी मातृभाषा में बता सकेंगे।',

    teacherOpeningHindi: 'बच्चों, खिड़की से बाहर देखो। तुम्हें पेड़ और चिड़िया दिख रही है?',
    translations: {
      ho: {
        script: 'होन को, खिड़की बायरे नेल एपे। दारु आर चेणे को नेल तानपे?',
        phoneticDeva: 'होन को, खिड़की बायरे नेल एपे। दारु आर चेणे को नेल तानपे?',
        phoneticLatin: 'Hon ko, khirki baayre nel epe. Daru aar chene ko nel taanpe?',
        audioPrompt: 'Hon ko, khirki baayre nel epe. Daru aar chene nel tanpe',
      },
      mundari: {
        script: 'हुनको, खिड़की बायरे नेलेपे। दारु आर चेणें को नेलतानपे?',
        phoneticDeva: 'हुनको, खिड़की बायरे नेलेपे। दारु आर चेणें को नेलतानपे?',
        phoneticLatin: 'Hunko, khirki baayre nelepe. Daru aar chene ko nel-tanpe?',
        audioPrompt: 'Hunko, khirki baayre nelepe. Daru aar chene nel tanpe',
      },
      santhali: {
        scriptOlChiki: 'ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ, ᱠᱷᱤᱲᱠᱤ ᱵᱟᱦᱨᱮ ᱧᱮᱞ ᱯᱮ᱾ ᱫᱟᱨᱮ ᱟᱨ ᱪᱮᱬᱮ ᱠᱚ ᱧᱮᱞᱚᱜ ᱠᱟᱱᱟ?',
        scriptDeva: 'गिद्रा को, खिड़की बाहरे ञेल पे। दारे आर चेणे को ञेलोग काना?',
        phoneticDeva: 'गिद्रा को, खिड़की बाहरे ञेल पे। दारे आर चेणे को ञेलोग काना?',
        phoneticLatin: 'Gidra ko, khirki bahre nyel pe. Dare aar chene ko nyelog kana?',
        audioPrompt: 'Gidra ko, khirki bahre nyel pe. Dare aar chene nyelog kana',
      },
    },

    activity: {
      name: 'चित्र देखकर नाम बताओ (Flashcard Animal Match)',
      instructionsHindi: 'हाथी और कुत्ते का चित्र दिखाकर मातृभाषा में नाम बुलवाएं।',
      prompts: {
        ho: {
          teacherAsk: 'नेना ओकोए तानय? (यह कौन है?)',
          childAnswer: 'हाती / सेता (Elephant / Dog)',
        },
        mundari: {
          teacherAsk: 'नेया ओकोए तानाय? (यह कौन है?)',
          childAnswer: 'हाती / सेता (Elephant / Dog)',
        },
        santhali: {
          teacherAsk: 'ᱱᱚᱣᱟ ᱫᱚ ᱚᱠᱚᱭ ᱠᱟᱱᱟᱭ? / नोवा दो ओकोय कानाय?',
          childAnswer: 'ᱦᱟᱹᱛᱤ / ᱥᱮᱛᱟ (Hati / Seta)',
        },
      },
    },

    assessment: {
      questionHindi: 'मछली का चित्र दिखाकर पूछें: "यह क्या है?"',
      expectedAnswers: {
        ho: 'हाकु (Fish)',
        mundari: 'हाकु (Fish)',
        santhali: 'ᱦᱟᱹᱠᱩ / हाकु (Fish)',
      },
      levels: [
        { score: 1, label: 'स्तर 1', desc: 'केवल हिंदी में पहचानता है।' },
        { score: 2, label: 'स्तर 2', desc: 'संकेत देने पर मातृभाषा शब्द याद करता है।' },
        { score: 3, label: 'स्तर 3', desc: 'तुरंत मातृभाषा व हिंदी दोनों में सही शब्द बोलता है।' },
      ],
    },
  },
];
