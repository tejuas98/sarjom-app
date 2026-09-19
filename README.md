# SARJOM App (PALASH Tribal Pedagogy)

> **Offline Multilingual Mother-Tongue Bridge for Tribal Classrooms**  
> Empowers rural teachers and primary students in Jharkhand with real-time two-way translation across **Santhali (Ol Chiki)**, **Ho (Warang Chiti / Devanagari)**, **Mundari**, and **Sadri**.

---

## Key Features

- **Real-Time Two-Way Lecture Translation**: Seamless teacher speech translation to tribal mother tongues and student speech transcription back to Hindi.
- **100% Offline Edge Execution**: Complete lexicon and morphological transduction engine running in-browser with sub-15ms latency.
- **NIPUN Bharat Aligned**: Curriculum lesson plans, interactive digital slate, bilingual worksheets, and tribal folklore storytelling.
- **Adaptive Pronunciation Coach & Flashcards**: Native audio playback and interactive classroom drills.
- **Low-End Hardware Optimized**: Tested on 2GB RAM Android tablets and offline smartphones.

---

## Tech Stack

- **Framework**: React 18, Vite
- **Styling**: Vanilla CSS (Tailored HSL design system, responsive mobile/tablet layout)
- **Icons**: Lucide React
- **Speech & Audio**: Web Audio API, Offline HTML5 Audio Bank, Web Speech Synthesis Fallback
- **PWA & Mobile**: Service Worker offline caching, Capacitor mobile support

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Automated Testing

Run the offline adoption audiobook translation benchmark (72 test cases across 4 languages):

```bash
node test_adoption_audiobook_translation.cjs
```

---

## Project Structure

```
├── public/
│   ├── audio/          # Offline audio clips (.mp3, .m4a)
│   ├── fonts/          # Tribal fonts (Noto Sans Warang Citi)
│   └── favicon.svg     # App branding
├── src/
│   ├── assets/         # App icons and graphics
│   ├── components/     # React UI components (VoiceTranslator, Flashcards, Worksheets, etc.)
│   ├── data/           # Multilingual lexicons, NIPUN curriculum, and benchmark cases
│   ├── services/       # Offline NLP translation engine & voice translation service
│   ├── App.jsx         # Root app layout and tab navigation
│   └── index.css       # Global design system and typography tokens
├── index.html          # Application entrypoint
└── vite.config.js      # Vite build configuration
```

---

## Note on Media & Benchmarks

Full historical media archives, APK binaries, and narrated demonstration videos are preserved in the [`sarjom-backup`](https://github.com/tejuas98/sarjom-backup) repository.
