/**
 * SARJOM (सरजोम) — UI Translations (English & Hindi)
 * Enables bilingual interface toggle for teachers and evaluators
 * Clean minimalist typographic design system without emojis
 */

export const UI_TRANSLATIONS = {
  hi: {
    // Brand & Header
    brandTitle: 'सरजोम',
    brandSub: '(SARJOM)',
    brandTagline: 'झारखंड प्राथमिक मातृभाषा सेतु • MTB-MLE',
    offlineStatus: 'ऑफ़लाइन',
    onlineStatus: 'ऑनलाइन',
    teacherHelpBtn: 'शिक्षक सहायता',
    uiLangLabel: 'भाषा',

    // Primary Tabs
    tabVoice: 'कक्षा बोलें',
    tabWorksheets: 'कार्यपत्रक',
    tabFlashcards: 'फ़्लैशकार्ड',
    tabDictionary: 'शब्दकोश',
    tabMoreTools: 'और साधन',

    // Secondary Tools Dropdown
    tabCurriculum: 'पाठ योजना (Lessons)',
    tabSlate: 'स्लेट व लोककथा (Slate & Stories)',
    tabOrf: 'वाचन कोच (Pronunciation Coach)',
    tabNeural: 'न्यूरल विवरण (Neural Specs)',
    tabBenchmark: 'ज्यूरी मूल्यांकन (SIH Matrix)',
    btnOnboarding: '60s शिक्षक ऑनबोर्डिंग',
    btnAudioDeck: 'कक्षा ऑडियो डेक',
    btnJuryTour: 'SIH ज्यूरी टूर',

    // Voice Translator (Classroom Speak)
    modeTeacherToStudent: 'शिक्षक ➔ कक्षा स्पीकर (One-Tap Speak)',
    modeStudentToTeacher: 'छात्र ➔ शिक्षक (Reverse Ear)',
    tapToSpeakIdle: 'यहाँ दबाकर बोलें (Tap to Speak)',
    tapToSpeakSubIdle: 'हिंदी या अंग्रेजी में बोलें — सीधे कक्षा स्पीकर पर {lang} में गूंजेगा',
    tapToSpeakRec: 'सुन रहे हैं... (रोकने हेतु यहाँ दबाएं)',
    tapToSpeakSubRec: 'सामान्य बोलें — रोकते ही तुरंत {lang} में स्पीकर पर गूंजेगा',
    youSpoke: 'आपने बोला:',
    pronounceAs: 'ऐसे बोलें:',
    replaySpeaker: 'दोबारा स्पीकर पर सुनाएं',
    quickCommandsTitle: 'कक्षा में तुरंत बोलने वाले 8 आम निर्देश (टैप करते ही स्पीकर बोलेगा):',
    manualInputTitle: 'मैन्युअल वाक्य टाइपिंग व अतिरिक्त FLN वाक्यांश (Manual Text Typing)',
    manualInputSubtext: 'यदि आप कोई विशिष्ट पाठ या लंबा वाक्य अनुवाद करना चाहते हैं, तो नीचे टाइप करके अनुवाद करें:',
    manualInputPlaceholder: 'कस्टम हिंदी या अंग्रेजी वाक्य लिखें (उदा: किताब खोलो / open book)...',
    translateBtn: 'अनुवाद',
    extraFLNSuggestions: 'अतिरिक्त FLN सुझाव:',

    // Reverse Ear Mode
    studentDialogueTitle: 'छात्र मातृभाषा संवाद',
    studentDialogueBadge: 'छात्र प्रत्युत्तर',
    studentDialoguePrompt: 'कक्षा में जब आदिवासी छात्र अपनी मातृभाषा में बात करें, तो उस वाक्य पर टैप करें या छात्र से माइक में बोलने को कहें:',
    translateStudentBtn: 'अनुवाद करें ➔',
    teacherInterpretationTitle: 'शिक्षक व्याख्या (Hindi Interpretation)',
    teacherInterpretationPrompt: 'छात्र द्वारा मातृभाषा में कही गई बात का तुरंत हिंदी अर्थ और ध्वनि:',
    studentIntentLabel: 'छात्र का आशय (Meaning for Teacher):',
    studentIntentEmpty: 'बाएं से छात्र का वाक्य चुनें या माइक में बोलने दें...',
    autonomousReplyTitle: 'शिक्षक का स्वतंत्र उत्तर (Teacher\'s Autonomous Response):',
    autonomousBadge: 'शिक्षक की स्वायत्तता',
    autonomousHint: 'शिक्षक की स्वायत्तता: छात्र की बात सुनकर जो भी बोलना चाहें, अपनी भाषा में बोलें या लिखें — सिस्टम तुरंत छात्र की मातृभाषा में अनुवाद करेगा।',
    speakReplyBtn: 'अपना उत्तर बोलें (Speak Your Response)',
    speakReplyListening: 'सुन रहे हैं... (रोकने हेतु पुनः दबाएं)',
    replyPlaceholder: 'या अपना स्वतंत्र उत्तर यहाँ लिखें...',
    replySpeakSubmit: 'सुनाएं',

    // Dialogue Log
    dialogueLogTitle: 'कक्षा संवाद लॉग (Classroom Interaction Log)',
    entriesCount: 'प्रविष्टियाँ',
    exportCsvBtn: 'MicroSD / पेनड्राइव लॉग निर्यात (CSV)',
    emptyLogText: 'माइक बटन दबाकर बोलें या 1-टैप निर्देश चुनें। यहाँ कक्षा संवाद स्वतः दर्ज होता रहेगा।',
    roleTeacher: 'शिक्षक:',
    roleStudent: 'छात्र:',

    // 8 Instant Prompts
    otp_1_label: 'किताब खोलो',
    otp_1_phrase: 'किताब खोलो और पाठ एक पढ़ो।',
    otp_2_label: 'अपनी जगह बैठो',
    otp_2_phrase: 'अपनी जगह पर बैठ जाओ।',
    otp_3_label: 'शाबाश / बहुत अच्छा',
    otp_3_phrase: 'शाबाश, तुमने बहुत अच्छा किया।',
    otp_4_label: 'पानी पीने जाओ',
    otp_4_phrase: 'हाँ, जाओ पानी पीकर तुरंत आओ।',
    otp_5_label: 'शांत रहो और सुनो',
    otp_5_phrase: 'शान्त रहो और सुनो।',
    otp_6_label: 'स्लेट पर लिखो',
    otp_6_phrase: 'स्लेट पर लिखकर दिखाओ।',
    otp_7_label: 'नमस्ते / जोहार',
    otp_7_phrase: 'नमस्ते / जोहार, सभी बच्चे कैसे हैं?',
    otp_8_label: 'मध्याह्न भोजन (MDM)',
    otp_8_phrase: 'हाथ धोकर मध्याह्न भोजन करो।',

    // Drawer
    drawerTitle: 'शिक्षक सहायता एवं MTB-MLE टूल्स',
    drawerSub: 'झारखंड प्राथमिक विद्यालय शिक्षण मार्गदर्शन व अतिरिक्त साधन',
    axiomsTitle: 'झारखंड पलाश शिक्षा के 3 स्वर्णिम नियम (Pedagogical Axioms):',
    phoneticsTitle: 'भाषा ध्वनिविज्ञान (Phonetic Guide for Teachers):',
    emergencyTitle: 'प्राथमिक स्वास्थ्य व आपातकालीन संवाद (Health Emergency Phrases):',

    // Footer
    footerGovt: 'झारखंड सरकार • उच्च एवं तकनीकी शिक्षा विभाग (Govt of Jharkhand)',
    footerProject: 'सरजोम मातृभाषा बहुभाषी शिक्षण कार्यक्रम (SARJOM MTB-MLE) • टीम कारासुनों (Team Karasuno)',
    footerDevBarToggle: 'तकनीकी सिमुलेटर बार',
    footerDevBarHide: 'हार्डवेयर बार छुपाएं',
  },

  en: {
    // Brand & Header
    brandTitle: 'SARJOM',
    brandSub: '(सरजोम)',
    brandTagline: 'Jharkhand Primary Vernacular Bridge • MTB-MLE',
    offlineStatus: 'Offline',
    onlineStatus: 'Online',
    teacherHelpBtn: 'Teacher Help',
    uiLangLabel: 'Language',

    // Primary Tabs
    tabVoice: 'Classroom Speak',
    tabWorksheets: 'Worksheets',
    tabFlashcards: 'Flashcards',
    tabDictionary: 'Dictionary',
    tabMoreTools: 'More Tools',

    // Secondary Tools Dropdown
    tabCurriculum: 'Lesson Plans',
    tabSlate: 'Slate & Tribal Stories',
    tabOrf: 'Fluency & Pronunciation Coach',
    tabNeural: 'Neural Model Specs',
    tabBenchmark: 'SIH Jury Matrix',
    btnOnboarding: '60s Teacher Guide',
    btnAudioDeck: 'Classroom Audio Deck',
    btnJuryTour: 'SIH Jury Tour',

    // Voice Translator (Classroom Speak)
    modeTeacherToStudent: 'Teacher ➔ Class Speaker (One-Tap Speak)',
    modeStudentToTeacher: 'Student ➔ Teacher (Reverse Ear)',
    tapToSpeakIdle: 'Tap Here to Speak & Broadcast',
    tapToSpeakSubIdle: 'Speak in English or Hindi — broadcasts directly in {lang} on speaker',
    tapToSpeakRec: 'Listening... (Tap to stop & broadcast)',
    tapToSpeakSubRec: 'Speak naturally — broadcasts in {lang} as soon as you stop',
    youSpoke: 'You Spoke:',
    pronounceAs: 'Pronounce as:',
    replaySpeaker: 'Play Again on Speaker',
    quickCommandsTitle: '8 Instant Classroom Commands (Tap to broadcast immediately):',
    manualInputTitle: 'Manual Text Typing & Full Syllabus (English / Hindi)',
    manualInputSubtext: 'Type any custom phrase or textbook sentence to translate into tribal tongue:',
    manualInputPlaceholder: 'Type in English or Hindi (e.g., Open book / किताब खोलो)...',
    translateBtn: 'Translate',
    extraFLNSuggestions: 'Extended FLN Suggestions:',

    // Reverse Ear Mode
    studentDialogueTitle: 'Student Vernacular Utterances',
    studentDialogueBadge: 'Student Response',
    studentDialoguePrompt: 'When a tribal child speaks in their mother tongue, tap the phrase or let them speak into the mic:',
    translateStudentBtn: 'Translate ➔',
    teacherInterpretationTitle: 'Teacher Interpretation',
    teacherInterpretationPrompt: 'Instant meaning and phonetics of what the child communicated:',
    studentIntentLabel: 'Meaning for Teacher:',
    studentIntentEmpty: 'Select a phrase from left or let child speak into mic...',
    autonomousReplyTitle: "Teacher's Autonomous Response:",
    autonomousBadge: 'Teacher Autonomy',
    autonomousHint: 'Teacher Autonomy: Express your instructions in English or Hindi — SARJOM instantly speaks it in the child\'s native language.',
    speakReplyBtn: 'Speak Your Response (English / Hindi)',
    speakReplyListening: 'Listening... (Tap again to finish & speak)',
    replyPlaceholder: 'Or type your autonomous response here (e.g. Yes, go after 2 mins)...',
    replySpeakSubmit: 'Broadcast',

    // Dialogue Log
    dialogueLogTitle: 'Classroom Interaction Log',
    entriesCount: 'entries',
    exportCsvBtn: 'Export Log to MicroSD / USB (CSV)',
    emptyLogText: 'Tap the mic above or click 1-tap commands. Spoken interactions will be logged here automatically.',
    roleTeacher: 'Teacher:',
    roleStudent: 'Student:',

    // 8 Instant Prompts
    otp_1_label: 'Open Book',
    otp_1_phrase: 'Open your book and read lesson one.',
    otp_2_label: 'Sit Down',
    otp_2_phrase: 'Please sit down in your place.',
    otp_3_label: 'Well Done / Great Job',
    otp_3_phrase: 'Well done! You did very good work.',
    otp_4_label: 'Go Drink Water',
    otp_4_phrase: 'Yes, go drink water and come right back.',
    otp_5_label: 'Be Quiet & Listen',
    otp_5_phrase: 'Please be quiet and listen carefully.',
    otp_6_label: 'Write on Slate',
    otp_6_phrase: 'Write it on your slate and show me.',
    otp_7_label: 'Hello / Johar',
    otp_7_phrase: 'Hello / Johar, how are all the children today?',
    otp_8_label: 'Midday Meal (MDM)',
    otp_8_phrase: 'Wash your hands and proceed for midday meal.',

    // Drawer
    drawerTitle: 'Teacher Support & MTB-MLE Handbook',
    drawerSub: 'Jharkhand Primary Vernacular Teaching Guidance & Diagnostics',
    axiomsTitle: '3 Golden Axioms of Jharkhand Vernacular Pedagogy:',
    phoneticsTitle: 'Phonetic Guide for Non-Native Teachers:',
    emergencyTitle: 'Classroom Health & Emergency Phrases:',

    // Footer
    footerGovt: 'Government of Jharkhand • Department of Higher & Technical Education',
    footerProject: 'SARJOM Vernacular Pedagogy Platform (MTB-MLE) • Team Karasuno',
    footerDevBarToggle: 'Technical Simulator Bar',
    footerDevBarHide: 'Hide Hardware Bar',
  },
};
