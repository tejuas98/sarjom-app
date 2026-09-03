# PALASH Setu (पलाश सेतु) — Comprehensive Operating Guide & Button Reference Manual

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026%20Problem%20SIH26042-orange.svg)](https://sih.gov.in)
[![Government of Jharkhand](https://img.shields.io/badge/Client-Govt.%20of%20Jharkhand%20(DHTE)-green.svg)](https://jharkhand.gov.in)
[![100% Offline Capable](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-blue.svg)](./public/sw.js)

> **Official Operating Guide and Component-by-Component Manual for Evaluators, Government Nodal Officers, and Primary School Teachers.**

---

## Table of Contents

1. [System Overview & Execution Modes](#1-system-overview--execution-modes)
2. [Step-by-Step Installation & Quickstart](#2-step-by-step-installation--quickstart)
3. [Running on Physical Android Tablets in Tribal Schools](#3-running-on-physical-android-tablets-in-tribal-schools)
4. [Installing as a 100% Offline PWA (No Internet)](#4-installing-as-a-100-offline-pwa-no-internet)
5. [Top Diagnostic & Governance Bar — Button Breakdown](#5-top-diagnostic--governance-bar--button-breakdown)
6. [Primary Navigation & Language Switcher — Button Breakdown](#6-primary-navigation--language-switcher--button-breakdown)
7. [Module 1: Real-Time Voice Translator & Two-Way Student Ear](#7-module-1-real-time-voice-translator--two-way-student-ear)
8. [Module 2: NIPUN Bharat FLN Lesson Curriculum Studio](#8-module-2-nipun-bharat-fln-lesson-curriculum-studio)
9. [Module 3: Printable Bilingual Worksheet Studio & Audio QR](#9-module-3-printable-bilingual-worksheet-studio--audio-qr)
10. [Module 4: Touch-Optimized Visual Flashcards](#10-module-4-touch-optimized-visual-flashcards)
11. [Module 5: Digital Chalkboard Slate & Tribal Folklore](#11-module-5-digital-chalkboard-slate--tribal-folklore)
12. [Module 6: Tri-Lingual Comparative Lexicon Search](#12-module-6-tri-lingual-comparative-lexicon-search)
13. [Vaul Slide-Up Teacher Pedagogical Drawer](#13-vaul-slide-up-teacher-pedagogical-drawer)
14. [60-Second Rapid Teacher Onboarding Wizard](#14-60-second-rapid-teacher-onboarding-wizard)
15. [Troubleshooting & Frequently Asked Questions](#15-troubleshooting--frequently-asked-questions)

---

## 1. System Overview & Execution Modes

PALASH Setu is engineered to run in **three distinct execution environments**:

1. **Desktop / Laptop Web Browser** (For curriculum design, lesson planning, and worksheet printing).
2. **Classroom Tablet Simulator Mode** (Wraps the interface in an authentic **Gyanodaya 10.1" Android Tablet Bezel** with hardware borders and front camera notch).
3. **Physical Low-Cost Android Tablet / PWA** ($\le$ 2 GB RAM, Android 9.0+, operates 100% offline inside rural schools without cellular connectivity).

---

## 2. Step-by-Step Installation & Quickstart

### Prerequisites
* **Node.js**: Version 18.0.0 or higher.
* **npm**: Version 9.0.0 or higher.
* **Modern Web Browser**: Google Chrome 100+, Apple Safari 15+, or Mozilla Firefox 100+.

### 1. Clone the Repository
```bash
git clone https://github.com/tejuas98/PALASH-Setu.git
cd PALASH-Setu
```

### 2. Install Project Dependencies
```bash
npm install
```
*Note: Installs React 19, Lucide React icons, Sonner toast notifications, Vaul bottom drawer, and Vite 8.*

### 3. Start the Local Development Server
```bash
npm run dev -- --host
```
* The terminal will display:
  ```
  VITE v8.2.2  ready in ~100 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.XX:5173/
  ```

### 4. Open in Your Browser
* Open **`http://localhost:5173/`** in your browser.
* *Tip*: If you previously loaded an older cache, open in an **Incognito / Private Window** (`Cmd + Shift + N` / `Ctrl + Shift + N`) for a completely clean state.

---

## 3. Running on Physical Android Tablets in Tribal Schools

To test the application on an actual physical tablet or smartphone connected to the same local Wi-Fi router or hotspot:

1. Look at the **`Network`** URL displayed in your terminal when you ran `npm run dev -- --host` (e.g., `http://192.168.1.45:5173/`).
2. Open the Google Chrome browser on your Android tablet.
3. Type the network URL (`http://192.168.1.45:5173/`).
4. The prototype will load instantly on the physical tablet!

---

## 4. Installing as a 100% Offline PWA (No Internet)

PALASH Setu is a **Progressive Web App (PWA)** compliant with the Government of Jharkhand's zero-connectivity mandate:

1. On your tablet or phone, tap the **Chrome Menu (⋮)** or Safari **Share Button (⎋)**.
2. Select **"Add to Home Screen"** or **"Install App"**.
3. A standalone app icon named **"पलाश सेतु"** will appear on your device's home screen.
4. Turn ON Airplane Mode (disable Wi-Fi and Mobile Data).
5. Tap the **पलाश सेतु** icon. The entire application, including voice synthesis, lessons, worksheets, slate, and lexicon, opens and runs **100% offline**!

---

## 5. Top Diagnostic & Governance Bar — Button Breakdown

Located at the very top of the screen (in simulated black/slate ribbon):

| UI Element / Button | Icon / Visual | Location | Real-World Function & Classroom Purpose |
| :--- | :--- | :--- | :--- |
| **ऑफ़लाइन / ऑनलाइन टॉगल** | `WifiOff` / `Wifi` | Top Left | **Click to toggle offline mode**. Shows teachers whether the tablet is operating completely on-device or syncing with the central server. Triggers a Sonner toast notification. |
| **रैम उपयोग मॉनिटर (RAM Usage)** | `Cpu` (Green) | Top Center-Left | **Live memory telemetry**. Displays real-time RAM consumption (~34 MB of 2048 MB), proving hardware budget compliance for $\le$2GB budget tablets. |
| **स्थानीय कैश सिंक (Cache Status)** | `HardDrive` (Amber) | Top Center | **Data integrity indicator**. Confirms that all 1,240+ FLN vocabulary entries and lesson plans are stored on-device in persistent local storage. |
| **टैबलेट फ्रेम टॉगल बटन** | `📱 टैबलेट व्यू` / `फुल-स्क्रीन` | Top Right-Center | **Switches the viewport mode**. Toggles between the realistic **Gyanodaya 10.1" Tablet Bezel** (with camera notch and hardware border) and **Full-Screen Desktop view**. |
| **बैटरी व ओएस संकेतक** | `BatteryCharging` / `ShieldCheck` | Top Right | Displays tablet power level (88%) and Android Go 9.0+ compatibility status. |
| **e-Vidyavahini स्कूल चयनकर्ता** | Dropdown Selector | Second Ribbon Left | **Selects authentic Jharkhand schools**: Switches between West Singhbhum (Ho), Khunti (Mundari), and Dumka (Santhali). Automatically updates UDISE+ code and teacher ID. |
| **EVV सिंक बटन (EVV Sync)** | `RefreshCw` `EVV सिंक (Sync)` | Second Ribbon Right | **Bi-directional data synchronization**. Simulates syncing local classroom attendance and FLN milestone achievements to the state e-Vidyavahini 2.0 portal. |

---

## 6. Primary Navigation & Language Switcher — Button Breakdown

Located in the main white header bar:

| UI Element / Button | Visual Style | Function & Interaction Details |
| :--- | :--- | :--- |
| **हो (Ho - 𑢹𑣉𑣉) बटन** | Capsule Pill | Sets active language to **Ho**. Loads Ho lexicon, Warang Chiti script, and Tantnagar West Singhbhum curriculum. |
| **मुण्डारी (Mundari) बटन** | Capsule Pill | Sets active language to **Mundari**. Loads Mundari lexicon and Torpa Khunti curriculum. |
| **संताली (Santhali - ᱥᱟᱱᱛᱟᱲᱤ) बटन** | Capsule Pill | Sets active language to **Santhali**. Loads Santhali lexicon, Ol Chiki script, and Dumka curriculum. |
| **ऑफ़लाइन सक्रिय बैज** | Orange Pill (`btn-palash`) | Indicates active offline state. |
| **✨ ऑनबोर्डिंग बटन** | Green Button (`btn-forest`) | **Launches the 60-Second Rapid Teacher Onboarding Wizard Modal**. Guides first-time Hindi teachers through language setup and audio calibration. |
| **📖 शिक्षक निर्देश बटन** | Amber Button (`btn-ochre`) | **Slides up the Vaul Teacher Pedagogical Drawer** from the bottom of the screen with pronunciation tables, cultural etiquette, and classroom tips. |

---

## 7. Module 1: Real-Time Voice Translator & Two-Way Student Ear

Tab: `🎙️ संवाद <3s अनुवाद`

### A. Translation Direction Toggle
* **`[👨‍🏫 शिक्षक ➔ छात्र (Hindi to Tribal)]`**: Default mode. The teacher speaks or types in standard Hindi; PALASH Setu converts it to native tribal dialect with authentic script display and audio playback.
* **`[🧑‍🎓 छात्र ➔ शिक्षक (Tribal to Hindi)]`**: Reverse mode (**Two-Way Student Ear**). The non-tribal teacher taps this to listen to the tribal student speaking their mother tongue, translating their response back into Hindi so the teacher understands.

### B. Input & Interaction Controls
* **टेक्स्ट इनपुट बॉक्स (Input Text Area)**: Allows typing Hindi prompts directly. Pre-populated with `"नमस्ते / जोहार"`.
* **`[🎙️ माइक दबाकर बोलें (Speak)]`**: Activates tablet microphone for speech capture. Evaluates input phonetics in real-time.
* **`[✈️ अनुवाद करें (Send / Translate)]`**: Submits the query through the sub-50ms vector cosine similarity engine.
* **त्वरित कक्षा निर्देश चिप्स (One-Tap Prompt Chips)**: One-touch buttons for standard classroom communications:
  * `[जोहार (Greeting)]`: Cultural greeting.
  * `[नाम पूछें (Ask Name)]`: Inquires student's name in their dialect.
  * `[शान्त रहें (Silence)]`: Classroom discipline command.
  * `[किताब खोलें (Open Book)]`: Reading prompt.
  * `[स्लेट पर लिखो (Write)]`: Writing activity instruction.
  * `[शाबाशी (Praise)]`: Encouragement and motivation.
  * `[पानी (Water)]`: Basic welfare check.
  * `[यहाँ आओ (Come Here)]`: Gentle directional instruction.

### C. Output Display & Audio Playback
* **मूल लिपि (Native Script Display)**: Displays the tribal phrase in its official script (e.g., Ol Chiki `ᱡᱚᱦᱟᱨ` for Santhali).
* **शिक्षक हेतु हिंदी उच्चारण (Phonetic Guide)**: Provides bold Devanagari transliteration with accented Latin characters so Hindi teachers know exactly how to vocalize the phrase.
* **`[🔊 कक्षा में सुनाएं (Play Audio)]`**: Triggers high-clarity on-device speech synthesis to pronounce the phrase out loud to the classroom.

---

## 8. Module 2: NIPUN Bharat FLN Lesson Curriculum Studio

Tab: `📚 निपुण पाठ FLN योजना`

| Button / Control | Visual Location | Function & Real-World Pedagogy |
| :--- | :--- | :--- |
| **कक्षा चयनकर्ता (Class Filter)** | Tabs (Balvatika, Class 1, 2, 3) | Filters lesson plans by primary grade level according to NIPUN Bharat foundational literacy goals. |
| **सप्ताह / विषय चयन (Week Filter)** | Dropdown / Tabs | Selects specific FLN competency modules (e.g., Week 1: Oral Language & Mother-Tongue Storytelling). |
| **80:20 सेतु प्रगति चरण (Phase Tabs)** | Horizontal Stepper | Displays the Government of Jharkhand transition model: **Phase 1** (80% Mother Tongue) ➔ **Phase 2** (50:50 Bilingual Bridge) ➔ **Phase 3** (80% Hindi / English). |
| **पाठ गतिविधि कार्ड (Activity Cards)** | Expandable Blocks | Displays step-by-step 40-minute classroom activity timelines with scripted bilingual teacher prompts. |
| **`[🖨️ पाठ योजना प्रिंट करें (Print Plan)]`** | Button Top-Right | Formats the current lesson plan into a clean, printable daily pedagogical diary for the teacher. |

---

## 9. Module 3: Printable Bilingual Worksheet Studio & Audio QR

Tab: `📝 अभ्यास पत्र प्रिंट व क्यूआर`

| Button / Control | Functionality & Classroom Impact |
| :--- | :--- |
| **अभ्यास पत्र विषय चयन (Topic Selector)** | Switches worksheet themes: Letter Recognition, Number Counting, Flora & Fauna, or Daily Life. |
| **लिपि चयन टॉगल (Script Toggle)** | Toggles between **Devanagari Transliteration** (for beginners) and **Native Script** (Ol Chiki / Warang Chiti). |
| **`[📱 ऑडियो क्यूआर कोड जनरेट करें (Audio QR)]`** | Generates a scannable dynamic QR code on the worksheet. When tribal parents scan this paper with any smartphone, it plays the correct audio pronunciation at home! |
| **`[🖨️ A4 शीट प्रिंट करें (Print Worksheet)]`** | Triggers standard A4 monochrome print layout optimized for low-cost school printers. |

---

## 10. Module 4: Touch-Optimized Visual Flashcards

Tab: `🎴 फ़्लैशकार्ड सचित्र`

* **श्रेणी फ़िल्टर चिप्स (Category Chips)**: Filters cards by `परिवार (Family)`, `पशु-पक्षी (Animals)`, `कक्षा (Classroom)`, `गिनती (Numbers)`, and `पेड़-पौधे (Flora)`.
* **कार्ड फ्लिप इंटरेक्शन (Tap to Flip)**: Tapping the flashcard performs a 3D perspective flip:
  * **Front Face**: High-contrast visual illustration + Hindi word.
  * **Back Face**: Native Tribal Script + Devanagari pronunciation guide + English meaning.
* **`[🔊 उच्चारण सुनें (Audio Button)]`**: Pronounces the tribal term in high-clarity synthesized audio.
* **`[⬅️ पिछला कार्ड (Previous)]` / `[अगला कार्ड ➡️ (Next)]`**: Navigates through the 40+ curated foundational flashcards.

---

## 11. Module 5: Digital Chalkboard Slate & Tribal Folklore

Tab: `🎨 स्लेट व लोककथा सांस्कृतिक`

### A. Multi-Touch Digital Chalkboard Slate
* **खड़िया रंग चयनकर्ता (Chalk Colors)**:
  * `⚪ सफेद खड़िया (White Chalk)`: Standard writing.
  * `🟡 पीली खड़िया (Yellow Chalk)`: Highlights and vowels.
  * `🌸 गुलाबी खड़िया (Pink Chalk)`: Decorative accents.
  * `🔵 आसमानी खड़िया (Blue Chalk)`: Letter tracing.
* **खड़िया मोटाई स्लाइडर (Chalk Size Slider)**: Adjusts stroke thickness from fine pencil ($2\text{px}$) to thick classroom chalk ($16\text{px}$).
* **`[🧹 स्लेट साफ करें (Clear Slate)]`**: Simulates erasing the slate with authentic chalk dust particles.
* **`[💾 चित्र सहेजें (Download PNG)]`**: Saves student's handwriting practice as a PNG image for assessment.

### B. Tribal Folklore & Ecological Tales
* **कथा चयन कार्ड (Folklore Stories)**: Displays culturally authentic tribal folktales (e.g., *The Story of the Sacred Sal Tree*, *The Festival of Sarhul*, *The Song of the Spring Stream*).
* **`[🎧 लोककथा सुनें (Listen Story)]`**: Plays audio narration in native tribal dialect paired with bilingual Hindi translation.

---

## 12. Module 6: Tri-Lingual Comparative Lexicon Search

Tab: `📖 शब्दकोश 1,240+ शब्द`

* **सर्च इनपुट बार (Live Search Input)**: Real-time fuzzy search across Hindi, English, and Tribal terms (e.g., typing `"पेड़"`, `"water"`, or `"johar"` instantly filters the table).
* **विषय फ़िल्टर ड्रॉपडाउन (Domain Filter)**: Filters entries by domain (`सभी विषय`, `मूल FLN`, `गणित`, `विज्ञान`, `संस्कृति`).
* **`[🔊 सुनें (Play Audio)]`**: Located on each row; triggers native pronunciation for that specific lexical item.
* **लिपि स्विच (Script Display)**: Displays authentic native Ol Chiki for Santhali, and Warang Chiti/Devanagari for Ho and Mundari.

---

## 13. Vaul Slide-Up Teacher Pedagogical Drawer

Trigger: Top bar button **`[📖 शिक्षक निर्देश]`**

* **टच जेस्चर हैंडल (`Vaul Drag Handle`)**: A smooth gray handle at the top allows pulling the drawer up or swiping down to dismiss on touch tablets.
* **टैब 1: ध्वनि विज्ञान (Phonetics Guide)**: Explains tribal glottal stops, nasal vowels, and how to teach sounds that do not exist in standard Hindi.
* **टैब 2: कक्षा रणनीतियां (Pedagogical Strategies)**: Guidance on the 80:20 transitional language model without making tribal children feel intimidated.
* **टैब 3: सांस्कृतिक शिष्टाचार (Cultural Etiquette)**: Best practices for non-tribal teachers in Jharkhand primary schools.

---

## 14. 60-Second Rapid Teacher Onboarding Wizard

Trigger: Top bar button **`[✨ ऑनबोर्डिंग]`**

* **चरण 1: स्वागत व विद्यालय पुष्टि**: Verifies teacher identity and active district language (Ho / Mundari / Santhali). Tap **`[आगे बढ़ें ➡️]`**.
* **चरण 2: ऑडियो व माइक कैलिब्रेशन**:
  * Tap **`[🔊 ध्वनि परीक्षण]`**: Tests classroom speaker volume.
  * Tap **`[🎙️ माइक कैलिब्रेशन]`**: Tests ambient noise suppression for noisy rural classrooms.
  * Tap **`[आगे बढ़ें ➡️]`**.
* **चरण 3: पलाश सेतु शिक्षण प्रारंभ**: Summarizes key teaching tips. Tap **`[🚀 कक्षा शिक्षण प्रारंभ करें]`** to close the wizard and begin teaching!

---

## 15. Troubleshooting & Frequently Asked Questions

### Q1: Why did the screen look white on first load?
* **Cause**: Browsers previously cached an early development script before dependencies were deduplicated.
* **Solution**: Open an **Incognito / Private Window** (`Cmd + Shift + N` / `Ctrl + Shift + N`) or press **Cmd + Shift + R** to clear cache. The dev server now has automatic cache bypass configured.

### Q2: Does PALASH Setu need active internet in remote villages?
* **No**. All translation vectors, audio synthesis, lessons, and worksheets are bundled on-device. It functions 100% offline.

### Q3: How do I toggle between Tablet View and Full Desktop View?
* Click the **`[📱 टैबलेट व्यू]`** button in the top status bar. It toggles between the 10.1" tablet frame and full-screen desktop mode with one click.
