/**
 * SARJOM (सरजोम) — Comprehensive UI Translations (English & Hindi)
 * Clean, distraction-free typographic system aligned strictly with Problem Statement SIH26042.
 */

export const UI_TRANSLATIONS = {
  hi: {
    // Brand & Header
    brandTitle: 'सरजोम (SARJOM)',
    brandSub: '',
    brandTagline: 'झारखंड प्राथमिक मातृभाषा सेतु • MTB-MLE',
    offlineStatus: 'ऑफ़लाइन',
    onlineStatus: 'ऑनलाइन',
    uiLangLabel: 'भाषा',

    // Core Tabs
    tabVoice: 'कक्षा संवाद (Voice & Text)',
    tabWorksheets: 'द्विभाषी कार्यपत्रक',
    tabFlashcards: 'दृश्य फ्लैशकार्ड',
    tabDictionary: 'शब्दकोश',

    // Voice Translator (Classroom Dialogue)
    modeTeacherToStudent: 'शिक्षक बोलें (हिंदी → मातृभाषा)',
    modeStudentToTeacher: 'छात्र बोलें (मातृभाषा → हिंदी)',
    
    // Teacher Mode
    tapToSpeakIdleTeacher: 'माइक दबाकर बोलें (Tap to Speak)',
    tapToSpeakSubIdleTeacher: 'हिंदी या अंग्रेजी में बोलें — तुरंत {lang} में अनुवाद होकर स्पीकर पर बोलेगा',
    tapToSpeakRecTeacher: 'माइक चालू है... (रोकने के लिए पुनः दबाएं)',
    tapToSpeakSubRecTeacher: 'बोलना समाप्त करते ही स्वतः {lang} में अनुवाद होगा',
    
    // Student Mode
    tapToSpeakIdleStudent: 'छात्र माइक दबाकर बोलें (Student Speak)',
    tapToSpeakSubIdleStudent: 'छात्र अपनी मातृभाषा ({lang}), हिंदी या अंग्रेजी में बोलें — शिक्षक को हिंदी में सुनाई देगा',
    tapToSpeakRecStudent: 'छात्र की आवाज़ सुन रहे हैं...',
    tapToSpeakSubRecStudent: 'मातृभाषा या हिंदी में बोलने दें — रोकते ही स्पष्ट हिंदी अर्थ मिलेगा',

    // Result Card
    youSpoke: 'बोला गया वाक्य:',
    pronounceAs: 'उच्चारण ध्वनि:',
    replaySpeaker: 'स्पीकर पर सुनाएं',
    onDeviceTag: 'ऑन-डिवाइस • <100ms',

    // Text Input Area
    textInputTitle: 'पाठ टाइपिंग (Text Input & Translation)',
    textInputPlaceholderTeacher: 'हिंदी या अंग्रेजी वाक्य लिखें या पेस्ट करें...',
    textInputPlaceholderStudent: 'मातृभाषा, हिंदी या अंग्रेजी वाक्य लिखें...',
    translateBtn: 'अनुवाद करें',

    // Dialogue Log
    dialogueLogTitle: 'कक्षा संवाद लॉग (Interaction Log)',
    entriesCount: 'प्रविष्टियाँ',
    exportPdfBtn: 'PDF रिपोर्ट',
    exportCsvBtn: 'CSV डेटा',
    clearLogBtn: 'साफ़ करें',
    savedOnDevice: 'डिवाइस में सुरक्षित',
    deleteEntryTooltip: 'यह प्रविष्टि हटाएं',
    emptyLogText: 'माइक बटन दबाकर बोलें या ऊपर टाइप करें। कक्षा संवाद यहाँ स्वतः दर्ज होता रहेगा।',
    roleTeacher: 'शिक्षक:',
    roleStudent: 'छात्र:',

    // Worksheets
    wsTitle: 'द्विभाषी अभ्यास पत्र (Bilingual Worksheets)',
    wsSubtitle: 'मातृभाषा आधारित बुनियादी अधिगम (MTB-MLE) • प्राथमिक कक्षा अभ्यास सामग्री',
    wsTypeMatching: 'शब्द मिलान',
    wsTypeNumeracy: 'गिनती व संख्या ज्ञान',
    wsTypeFillBlanks: 'वाक्य अभ्यास',
    wsTypeTracing: 'लिपि लेखन',
    wsGradeLabel: 'कक्षा:',
    wsShuffleBtn: 'नया अभ्यास',
    wsPrintBtn: 'प्रिंट / PDF',
    wsCheckBtn: 'जाँचें',
    wsResetBtn: 'रीसेट',
    wsCheckedToast: 'बहुत बढ़िया! सभी उत्तर सही हैं।',
    wsCheckToastAllCorrect: 'शानदार! सभी उत्तर 100% सही हैं।',
    wsCheckToastPartial: 'आपने {count} में से {total} सही किए हैं। शेष भी हल करें।',
    wsCheckToastIncomplete: 'कृपया पहले सभी प्रश्नों का उत्तर दें!',
    wsMatchSelectHint: 'कॉलम A या B से कोई भी शब्द चुनें, फिर उसका सही जोड़ा मिलाएँ।',
    wsMatchPairSuccess: 'सही जोड़ी!',
    wsMatchPairError: 'गलत मिलान! पुनः प्रयास करें।',
    wsMatchUnpair: 'जोड़ी हटाएं',
    wsCountPrompt: 'चित्रों को गिनें और सही संख्या चुनें:',
    wsCountCorrect: 'शाबाश! सही उत्तर!',
    wsCountTryAgain: 'पुनः गिनें!',
    wsSchoolLabel: 'विद्यालय:',
    wsStudentLabel: 'विद्यार्थी का नाम:',
    wsDateLabel: 'दिनांक:',
    wsScoreLabel: 'प्राप्तांक:',
    wsEmblemGovt: 'झारखंड सरकार • स्कूली शिक्षा एवं साक्षरता विभाग',
    wsEmblemDept: 'निपुण भारत मातृभाषा शिक्षण सेतु (MTB-MLE)',


    // Flashcards Deck
    fcTitle: 'दृश्य बहुभाषी फ्लैशकार्ड्स',
    fcSubtitle: 'चित्र, मातृभाषा लिपि एवं ऑडियो उच्चारण के साथ संवादात्मक कार्ड्स',
    fcModeCards: 'कार्ड्स ब्राउज़ करें',
    fcModeQuiz: 'संवादात्मक क्विज़ खेलें',
    fcFlipHint: 'कार्ड पलटने के लिए टैप करें',
    fcNextQuestion: 'अगला प्रश्न →',
    fcQuizScore: 'आपका स्कोर:',
    fcCatAll: 'सभी कार्ड्स',
    fcCatGreetings: 'अभिवादन',
    fcCatNumbers: 'संख्याएँ',
    fcCatNature: 'प्रकृति',
    fcCatAnimals: 'पशु-पक्षी',
    fcCatFamily: 'परिवार',
    fcCatClassroom: 'कक्षा निर्देश',

    // Dictionary
    dictTitle: 'बहुभाषी शब्दकोश (Multilingual Lexicon)',
    dictSubtitle: '10,000+ प्रामाणिक जनजातीय शब्द, रूपात्मक व्याकरण एवं NIPUN भारत संदर्भ',
    dictSearchPlaceholder: 'हिंदी, अंग्रेजी या जनजातीय भाषा में खोजें...',
    dictAllDistricts: 'सभी जिले',
    dictSelectLanguage: 'मातृभाषा चुनें:',
    dictEntriesFound: 'शब्द मिले',
    dictEmptyState: 'कोई शब्द नहीं मिला। अन्य शब्द खोजें या फ़िल्टर बदलें।',
    dictCategoryLabel: 'श्रेणी:',
    dictDistrictLabel: 'प्रचलित जिला:',
    dictDevanagariLabel: 'देवनागरी:',
    dictPhoneticLabel: 'ध्वन्यात्मक:',
    dictAudioBtn: 'उच्चारण सुनें',
    dictNoResults: 'कोई परिणाम नहीं मिला',
  },

  en: {
    // Navigation & App Header
    appTitle: 'SARJOM',
    appSubtitle: 'Tribal Mother Tongue Classroom Pedagogic Bridge',
    badgeOfficial: 'Official MTB-MLE Platform',
    badgeOffline: '100% Offline Ready',
    teacherProfile: 'Teacher Profile',
    switchLang: 'Language',
    tabVoice: 'Classroom Voice',
    tabWorksheets: 'Worksheets',
    tabFlashcards: 'Flashcards',
    tabDictionary: 'Dictionary',

    // Voice Translator (Classroom Dialogue)
    modeTeacherToStudent: 'Teacher Speaks (Hindi → Tribal)',
    modeStudentToTeacher: 'Student Speaks (Tribal → Hindi)',

    // Teacher Mode
    tapToSpeakIdleTeacher: 'Tap to Speak',
    tapToSpeakSubIdleTeacher: 'Speak in Hindi or English — instantly broadcasts in {lang} on classroom speaker',
    tapToSpeakRecTeacher: 'Microphone Listening... (Tap to stop)',
    tapToSpeakSubRecTeacher: 'Speak naturally — automatically broadcasts in {lang} when finished',

    // Student Mode
    tapToSpeakIdleStudent: 'Student Speak (Mother Tongue)',
    tapToSpeakSubIdleStudent: 'Child speaks in their mother tongue ({lang}) — translates into Hindi for the teacher',
    tapToSpeakRecStudent: 'Listening to child...',
    tapToSpeakSubRecStudent: 'Let child speak in tribal tongue — translates to Hindi upon stopping',

    // Result Card
    youSpoke: 'Input Utterance:',
    pronounceAs: 'Pronounce As:',
    replaySpeaker: 'Broadcast on Speaker',
    onDeviceTag: 'On-Device • <100ms',

    // Text Input Area
    textInputTitle: 'Text Input & Translation',
    textInputPlaceholderTeacher: 'Type or paste Hindi/English text (e.g., Open your book and read lesson one)...',
    textInputPlaceholderStudent: 'Type or paste tribal vernacular phrase...',
    translateBtn: 'Translate & Speak',

    // Dialogue Log
    dialogueLogTitle: 'Classroom Interaction Log',
    entriesCount: 'entries',
    exportPdfBtn: 'PDF Report',
    exportCsvBtn: 'CSV Data',
    clearLogBtn: 'Clear Log',
    savedOnDevice: 'Stored on device',
    deleteEntryTooltip: 'Delete this entry',
    emptyLogText: 'Tap the microphone above or type text. Classroom interactions will be logged here automatically.',
    roleTeacher: 'Teacher:',
    roleStudent: 'Student:',

    // Worksheets
    wsTitle: 'Bilingual Worksheets',
    wsSubtitle: 'Mother Tongue-Based (MTB-MLE) Foundational Learning Exercises',
    wsTypeMatching: 'Word Matching',
    wsTypeNumeracy: 'Counting & Numbers',
    wsTypeFillBlanks: 'Sentence Practice',
    wsTypeTracing: 'Script Tracing',
    wsGradeLabel: 'Grade:',
    wsShuffleBtn: 'Shuffle',
    wsPrintBtn: 'Print / Save PDF',
    wsCheckBtn: 'Check Answers',
    wsResetBtn: 'Reset',
    wsCheckedToast: 'Great job! Exercise evaluated successfully.',
    wsCheckToastAllCorrect: 'Outstanding! All answers are 100% correct.',
    wsCheckToastPartial: 'You got {count} of {total} correct. Complete the remaining questions!',
    wsCheckToastIncomplete: 'Please answer all questions before checking!',
    wsMatchSelectHint: 'Tap any word in Column A or B, then tap its matching pair.',
    wsMatchPairSuccess: 'Correct match!',
    wsMatchPairError: 'Not a match, try again!',
    wsMatchUnpair: 'Unpair',
    wsCountPrompt: 'Count the illustrated items and tap the correct number:',
    wsCountCorrect: 'Great job! Correct answer!',
    wsCountTryAgain: 'Count again!',
    wsSchoolLabel: 'School:',
    wsStudentLabel: 'Student Name:',
    wsDateLabel: 'Date:',
    wsScoreLabel: 'Score:',
    wsEmblemGovt: 'Government of Jharkhand • School Education & Literacy Department',
    wsEmblemDept: 'NIPUN Bharat Mother Tongue Learning Bridge (MTB-MLE)',


    // Flashcards Deck
    fcTitle: 'Visual Multilingual Flashcards',
    fcSubtitle: 'Interactive flashcards with visual imagery, tribal script, and audio pronunciation',
    fcModeCards: 'Browse Cards',
    fcModeQuiz: 'Interactive Quiz',
    fcFlipHint: 'Tap card to flip',
    fcNextQuestion: 'Next Question ➔',
    fcQuizScore: 'Your Score:',
    fcCatAll: 'All Cards',
    fcCatGreetings: 'Greetings',
    fcCatNumbers: 'Numbers',
    fcCatNature: 'Nature',
    fcCatAnimals: 'Animals',
    fcCatFamily: 'Family',
    fcCatClassroom: 'Classroom Instructions',

    // Dictionary
    dictTitle: 'Jharkhand Tri-Lingual FLN Dictionary',
    dictSubtitle: 'Instant search across Hindi, English, and 4 tribal languages (Ho, Mundari, Santhali, Sadri)',
    dictSearchPlaceholder: 'Search by Hindi, English, or phonetics (e.g., water, elephant, johar, 1, mother)...',
    dictBadgeAllLangs: 'Ho • Mundari • Santhali • Sadri',
    dictColHindi: 'Hindi',
    dictColEnglish: 'English',
    dictColHo: 'Ho',
    dictColMundari: 'Mundari',
    dictColSanthali: 'Santhali',
    dictColSadri: 'Sadri',
    dictAudioBtn: 'Listen',

    // Footer
    footerGovt: 'Government of Jharkhand • Department of Higher & Technical Education',
    footerProject: 'SARJOM Primary Vernacular Education Bridge (MTB-MLE)',
    footerDevBarToggle: 'Hardware Simulator Bar',
    footerDevBarHide: 'Hide Hardware Bar',
  },
};
