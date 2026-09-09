# SIH26042 Requirement-by-Requirement Compliance Decode (line-by-line, clause-by-clause)

> Evidence-based audit of the official problem statement against the **actual code** in this repository
> (verified by install/build/test/APK-inspection on 2026-09-08; see also `TECHNICAL_APPROACH_REVIEW.md`).
> Legend: ✅ fulfilled in shipped code · ⚠️ fulfilled with dependency/nuance · 🟡 partial / gap · 📄 docs-only (not in code)

---

## PART A — TITLE, word by word

| Verbatim phrase | Decode (what it obligates) | Evidence | Verdict |
| :--- | :--- | :--- | :--- |
| **"AI-Powered"** | Intelligence must do the translation, not a static phrasebook only | `nlpTranslationEngine.js`: 9-stage cascade incl. **cosine-similarity vector semantic matching** (word+bigram TF vectors, threshold 0.58), regex grammar templates, morpheme-root tables, token-level agglutinative transducer. Classical/symbolic AI + vector-space NLP — **no trained neural model runs in the shipped app** (`ml/` transformer is architecture-only, 📄) | ✅ (prototype-grade AI; be ready to defend "AI" = vector NLP + cascade, not deep learning) |
| **"Vernacular Pedagogy"** | Must teach, not just translate | Worksheet Studio (grade-wise NIPUN exercise generator), Flashcard Deck (quiz mode), Dictionary, NIPUN lesson data (`nipunCurriculum.js` with `nipunCode` outcomes), studio audio bank | ✅ (but the Lesson-Curriculum *browser UI* component is unmounted in the live 4-tab app 🟡) |
| **"Real-Time Translation Tool"** | Interactive, instant, classroom-pace | Voice Translator tab: mic → STT stream → translate → auto-broadcast audio; per-request `performance.now()` latency badge | ✅ |
| **"for Mother Tongue-Based Primary Education"** | MTB-MLE context: mother tongue first, primary grades | 4 languages (Ho, Mundari, Santhali + Sadri), Ol Chiki/Warang Chiti scripts, NIPUN FLN grade 1–3/Balvatika scoping, 80:20 scaffolding data | ✅ |

## PART B — BACKGROUND, sentence by sentence (these are constraints, not deliverables)

| Verbatim clause | Decode → design obligation | Where honoured |
| :--- | :--- | :--- |
| "Jharkhand's PALASH MTB-MLE programme has demonstrated measurable improvements…" | Align with the existing state programme, don't replace it | Branding/naming (SARJOM under PALASH), compliance docs, JEPC 80:20 formula in curriculum data |
| "scaling… bottlenecked by a shortage of teachers proficient in tribal languages including Ho, Mundari, and Santhali" | The tool must substitute for teacher language proficiency → all 3 named languages mandatory | 3 mandated languages + Sadri delivered; every output carries native script + Devanagari phonetics + Latin phonetics so a non-speaker can pronounce it |
| "languages with limited digital NLP resources" | Cannot depend on Google/Bhashini/IndicTrans2 (they lack Ho/Mundari) → must own the linguistic resource | Curated parallel lexicon (41 FLN clusters × 4 langs), 45 conversational/Hinglish entries, 20 SIH benchmark cases, classical morpheme roots (Hoffmann/Bodding/Deeney/Nowrangi) |
| "vast majority of teachers… Hindi-medium trained and lack the linguistic tools" | Source language = Hindi; zero learning curve | Hindi (and English) input; Hindi/English UI toggle; 1-tap prompt chips; phonetic guides |
| "children in over 5,000 tribal-area primary schools continue to receive instruction in a language they do not comprehend" | Scale + offline + cheap hardware | PWA + APK, no backend, small bundle (166 kB gzip JS) |

## PART C — DESCRIPTION, atomic requirements R1–R10

### R1 — "Develop an AI-assisted translation **and curriculum-generation** software suite"
* **Translation suite:** ✅ `nlpTranslationEngine.js` (1,200 LOC cascade) + `voiceTranslationService.js`.
* **Curriculum-generation:** ✅ `WorksheetStudio.jsx` auto-generates grade-specific exercises (matching / numeracy / sentence-MCQ) with a seeded generator from `TRIBAL_LEXICON` + `GRADE_CURRICULUM` competency definitions; "Generate fresh exercise" reshuffles deterministically.
* 🟡 The NIPUN **lesson-plan browser** (`LessonCurriculum.jsx`, 3 full lessons with per-step tribal translations) exists but is **not mounted** in the live app; lesson content still feeds the engine's NIPUN intent matcher (`nlpTranslationEngine.js:460`).

### R2 — "enables non-native speaking primary school teachers to deliver mother-tongue-based instruction in **Ho, Mundari, and Santhali** without prior language training"
* ✅ All three (plus Sadri) selectable globally; every result shows native script + Devanagari phonetic + Latin phonetic + audio; teacher-facing Hindi UI; prompt chips require no typing.
* 🟡 Nice-to-haves for "no training" (TeacherDrawer handbook, OnboardingWizard) are coded but unmounted.

### R3 — "NLP engine capable of translating standard Hindi FLN curriculum content — **including lesson scripts, activity instructions, and assessment prompts** — into contextually accurate text"
* ✅ Lesson scripts: NIPUN intent matcher + `translateContinuousLecture()` (streams sentence-by-sentence for full lesson text).
* ✅ Activity instructions: classroom-command & conversational phrase layers ("बैठ जाओ", "किताब खोलो", Hinglish "book open karo").
* ✅ Assessment prompts: SIH 3-level benchmark matcher + worksheet sentence-question banks.
* ⚠️ "Contextually accurate": true **within the curated FLN classroom domain**; out-of-vocabulary words pass through untranslated (documented token fallback). Prototype-grade coverage (~150 curated entries + fuzzy matching), not open-domain NMT.

### R4 — "…and **synthesised audio** in target tribal languages"
* ✅ Three-tier audio chain: (1) recorded **human native-speaker studio clips** (`public/audio/*.wav/mp3/m4a`) for greetings/self-intros; (2) OS neural TTS (`speechSynthesis`) speaking the tribal phonetic string with ranked Indian-voice selection; (3) offline **Web-Audio formant synthesiser** fallback when no OS voice exists.
* ⚠️ Nuance: synthetic tier pronounces tribal *phonetics* through a Hindi/English OS voice (no trained tribal TTS exists anywhere); the human clips are the fully authentic tier.

### R5 — "real-time **voice-to-voice** translation feature… teacher speaking Hindi to conduct **interactive classroom dialogue with tribal-language-speaking students**"
* ✅ Teacher→students voice loop: Web Speech STT (hi-IN, interim results) → cascade → tribal audio auto-broadcast; echo-suppression while speaking; continuous-session timer.
* ✅ Students→teacher **text** loop ("Student Ear"): `translateTribalToHindi()` with morphology breakdown & grammatical notes (Ol Chiki or Devanagari input).
* 🟡 **Students→teacher voice:** `handleStartMic` hard-codes `recognitionLang = 'hi-IN'` even in student mode while the toast says "Speak in Santhali/Ho…". The Web Speech API has **no tribal acoustic models**, so tribal *speech* input cannot actually be recognised — the closed loop works via typed/selected tribal text. This is the single largest compliance gap.

### R6 — "with latency **not exceeding three seconds**"
* ✅ Translation engine: measured **0.453 ms/call** average (1,000-iteration stress in `run_hard_tests.js`), multi-sentence lectures streamed; UI shows live measured latency; SLA flag `withinSla` computed per request.
* ⚠️ End-to-end voice round-trip adds browser STT (~1–2 s online) + TTS start — comfortably < 3 s per exchange on supported browsers, but **offline the STT leg is unavailable** (graceful fallback message invites typing; translation+audio remain < 3 s).

### R7 — "auto-generate **bilingual worksheets**… aligned to the NIPUN Bharat learning outcomes framework"
* ✅ `WorksheetStudio`: grade-wise NIPUN competency map (`GRADE_CURRICULUM`: grade 1–3 categories, number ranges), seeded auto-generation of 3 exercise types, bilingual rendering (Hindi + tribal native script + phonetics), interactive self-check scoring, `@media print` A4/300-DPI output via `window.print()`.
* ⚠️ NIPUN alignment is curated by hand in data (nipunCodes present in lesson data), not machine-verified — acceptable for prototype.

### R8 — "…and **visual flashcard sets** aligned to NIPUN Bharat"
* ✅ `FlashcardDeck`: 3-D flip cards from lexicon, category filters, quiz mode with score/accuracy, per-card native audio trigger.

### R9 — "the entire application must **function offline**… after initial content synchronisation"
* ✅ PWA service worker (`public/sw.js`: network-first navigation, cache-first assets) + all linguistics/data inside the JS bundle + `localStorage` state + APK shipping `assets/public/` pre-cached ⇒ translation, worksheets, flashcards, dictionary, audio (clips + formant synth) all work with zero network.
* ⚠️ Two browser-dependent legs: mic STT (Chrome needs network — app detects `error.code==='network'` and degrades to typing) and OS TTS voices (formant synth covers absence).
* 📄 IndexedDB "encrypted" storage, EVV REST sync, QR Reed-Solomon generation appear in docs/flowcharts but are **not implemented** (persistence = localStorage). Not mandatory clauses, but remove or build before jury scrutiny.

### R10 — "on low-cost tablets (**≤ 2 GB RAM, Android 9+**)"
* ✅ Architecture fits: 166 kB gzip JS / 3.5 kB gzip CSS, no native ML runtime, no backend; Node-side heap audit ≈ 6.4 MB; Capacitor APK `minSdkVersion = 24` (Android 7+) ⇒ Android 9+ tablets supported; landscape tablet layout + mobile bottom-nav.
* ⚠️ The "34 MB RAM" proof in `benchmark_memory_and_latency.cjs` is a **modelled constant sum**, and its throughput loop never calls the engine — real evidence is the small bundle + 0.45 ms engine latency. Re-measure on physical hardware before claiming numbers.

## PART D — EXPECTED SOLUTION, deliverables E1–E6

| # | Verbatim deliverable | Evidence | Verdict |
| :--- | :--- | :--- | :--- |
| E1 | "working software application demonstrating Hindi-to-tribal translation (minimum one tribal language)" | Live app (4 tabs), 4 languages, verified build + running dev server this session | ✅ (400 % of minimum) |
| E2 | "real-time voice translation with sub-3-second latency" | Mic→STT→cascade→audio loop; 0.45 ms engine; latency badge | ✅ online / ⚠️ offline degrades to text-in |
| E3 | "autogenerated bilingual worksheet output" | WorksheetStudio generator + A4 print | ✅ |
| E4 | "full offline operation on a low-end Android tablet" | PWA SW + bundled APK (`SARJOM-v2.5-verified.apk`, 541 entries, current bundle inside) | ✅ (STT leg as above) |
| E5 | "submitted with a demo video" | `public/sarjom_live_click_demo.mp4/.gif`, `public/palash_setu_*_demo.mp4/.gif` in repo | ✅ |
| E6 | "and GitHub repository" | github.com/tejuas98/PALASH-Setu (this repo) | ✅ |

---

## PART E — SCORECARD & GAP REGISTER

**Fulfilled (code-verified):** R2, R3 (in-domain), R4, R6 (engine), R7, R8, R9 (core), R10 (architecture), E1, E3, E5, E6 → **12/16 clauses clean**
**Fulfilled with environment dependency:** R6 round-trip offline, R9 STT/TTS legs, E2, E4 → **4 clauses**
**Partial / must-fix before jury:**
1. **R5 student-side tribal speech input** — recognizer locked to `hi-IN`; tribal audio cannot be recognised (browser API limitation). *Fix options:* label student mic honestly as Hindi-assisted, or add on-device keyword/phrase matching via recorded tribal prompts, or route student input through tap-to-speak phrase chips (already exist in data).
2. **R1 curriculum UI unmounted** — mount `LessonCurriculum` (and ideally `TeacherDrawer`/`OnboardingWizard`) as a 5th tab so "curriculum-generation suite" is visible live.
3. **Docs-vs-code inflation** — FIXED on this branch: every 34 MB / 0.022 ms claim was replaced with live-measured numbers (5.8 MB engine heap, 0.6 ms avg / 1.8 ms p99 via `benchmark_memory_and_latency.cjs`), and the cloud-sync / EVV-upload narrative was removed repo-wide (zero-cloud: local storage + optional teacher-carried file export). Still open: student tribal speech (hi-IN hardcoded), curriculum UI mount, 17/18 test summary.
4. **Test suite honesty** — `run_hard_tests.js` currently 17/18 (UI-dictionary symmetry fails) yet prints "100 % SUCCESS"; fix the assertion or the summary line.

**Bottom line:** every *mandatory* clause of SIH26042 (translation ≥ 1 language, sub-3 s voice translation, bilingual worksheet autogeneration, flashcards, offline low-end tablet operation, demo video, GitHub repo) is **demonstrably implemented and runnable today**; the weaknesses are the tribal-speech-input leg of the dialogue loop, an unmounted curriculum UI, and over-claimed documentation — none of which breaks a mandatory deliverable, but all of which are jury-visible.
