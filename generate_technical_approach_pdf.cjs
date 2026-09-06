const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Ultra-Fidelity 16:9 Presentation Slide matching User's Reference Slide Exactly
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SARJOM: Technical Approach Slide (SIH 2025/2026)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

    @page {
      size: 16in 9in;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #000000;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
    }

    .slide {
      width: 1920px;
      height: 1080px;
      position: relative;
      background: #ffffff;
      padding: 24px 44px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
    }

    /* ======================================================== */
    /* TOP HEADER: OVAL BADGE | TITLE | SIH EMBLEM              */
    /* ======================================================== */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      position: relative;
    }

    .team-badge-wrap {
      width: 260px;
    }

    .team-oval {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 3px solid #3b429f;
      border-radius: 9999px;
      padding: 6px 26px;
      background: #ffffff;
    }

    .team-oval-title {
      font-size: 19px;
      font-weight: 900;
      color: #000000;
      line-height: 1.1;
    }

    .team-oval-sub {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      line-height: 1.1;
    }

    .header-title-wrap {
      text-align: center;
      flex: 1;
    }

    .main-title {
      font-size: 48px;
      font-weight: 900;
      color: #000000;
      letter-spacing: 2px;
      font-family: 'Inter', serif, sans-serif;
      text-transform: uppercase;
    }

    .sih-badge-wrap {
      width: 320px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 14px;
    }

    .sih-emblem-svg {
      width: 72px;
      height: 72px;
    }

    .sih-text {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .sih-text .line1 {
      font-size: 18px;
      font-weight: 900;
      color: #2b3990;
      line-height: 1.1;
      letter-spacing: 0.5px;
    }

    .sih-text .line2 {
      font-size: 18px;
      font-weight: 900;
      color: #2b3990;
      line-height: 1.1;
      letter-spacing: 0.5px;
    }

    .sih-text .year {
      font-size: 26px;
      font-weight: 900;
      color: #047857;
      line-height: 1.1;
      margin-top: 2px;
    }

    /* ======================================================== */
    /* MAIN TWO-COLUMN LAYOUT                                   */
    /* ======================================================== */
    .main-grid {
      display: grid;
      grid-template-columns: 640px 1fr;
      gap: 28px;
      flex: 1;
      height: calc(1080px - 140px);
    }

    /* -------------------------------------------------------- */
    /* LEFT COLUMN: TECH STACK & LOGOS                          */
    /* -------------------------------------------------------- */
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 18px;
      height: 100%;
    }

    /* Tech Stack Box */
    .tech-stack-box {
      border: 2.5px solid #000000;
      border-radius: 36px;
      padding: 24px 30px;
      background: #ffffff;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .tech-stack-header {
      font-size: 30px;
      font-weight: 900;
      color: #1a429b;
      text-decoration: underline;
      text-decoration-thickness: 3px;
      text-underline-offset: 6px;
      margin-bottom: 12px;
    }

    .tech-list {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 9px;
      font-size: 15px;
      line-height: 1.36;
      color: #000000;
    }

    .tech-list li {
      position: relative;
      padding-left: 20px;
    }

    .tech-list li::before {
      content: "•";
      position: absolute;
      left: 0;
      top: -2px;
      font-size: 26px;
      color: #000000;
      font-weight: 900;
    }

    .tech-list strong {
      font-weight: 900;
      color: #000000;
    }

    .sub-item {
      margin-left: 16px;
      margin-top: 3px;
      font-size: 14px;
      color: #1e293b;
    }

    /* Logos Container */
    .logos-box {
      border: 2.5px solid #000000;
      border-radius: 36px;
      padding: 14px 20px;
      background: #ffffff;
      height: 240px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .logos-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px 10px;
      align-items: center;
      justify-items: center;
    }

    .logo-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-align: center;
    }

    .logo-cell svg, .logo-cell img {
      height: 38px;
      width: auto;
      max-width: 90px;
      object-fit: contain;
    }

    .logo-cell span {
      font-size: 11px;
      font-weight: 800;
      color: #334155;
    }

    /* -------------------------------------------------------- */
    /* RIGHT COLUMN: FLOWCHART & 3 STAGES                       */
    /* -------------------------------------------------------- */
    .right-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }

    /* Flowchart Canvas Area */
    .flowchart-board {
      position: relative;
      background: #ffffff;
      flex: 1;
      height: 590px;
      border-radius: 20px;
    }

    /* Flowchart Nodes */
    .fn {
      position: absolute;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      font-family: 'Inter', sans-serif;
      z-index: 2;
    }

    .fn-blue-pill {
      background: #c7d2fe;
      border: 1.5px solid #818cf8;
      color: #1e1b4b;
      font-weight: 800;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 14px;
    }

    .fn-blue-box {
      background: #dbeafe;
      border: 1.5px solid #60a5fa;
      color: #1e3a8a;
      font-weight: 800;
      font-size: 13.5px;
      padding: 6px 12px;
    }

    .fn-green-box {
      background: #dcfce7;
      border: 1.5px solid #4ade80;
      color: #14532d;
      font-weight: 800;
      font-size: 13px;
      padding: 8px 12px;
    }

    .fn-orange-box {
      background: #ffedd5;
      border: 1.5px solid #fb923c;
      color: #7c2d12;
      font-weight: 800;
      font-size: 13px;
      padding: 8px 12px;
    }

    .fn-yellow-box {
      background: #fef9c3;
      border: 1.5px solid #facc15;
      color: #713f12;
      font-weight: 800;
      font-size: 12.5px;
      padding: 6px 10px;
    }

    .fn-red-box {
      background: #ffe4e6;
      border: 1.5px solid #f87171;
      color: #881337;
      font-weight: 800;
      font-size: 12.5px;
      padding: 6px 10px;
    }

    /* Hexagon / Diamond Decisions */
    .fn-decision {
      background: #fef08a;
      border: 2px solid #eab308;
      border-radius: 14px;
      color: #713f12;
      font-weight: 900;
      font-size: 13px;
      padding: 6px 14px;
      clip-path: polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%);
    }

    /* -------------------------------------------------------- */
    /* BOTTOM 3-STAGE HORIZONTAL SECTION                        */
    /* -------------------------------------------------------- */
    .three-stages-grid {
      display: grid;
      grid-template-columns: 350px 1fr 340px;
      gap: 16px;
      height: 250px;
    }

    .stage-card {
      border: 2.5px solid #000000;
      border-radius: 28px;
      padding: 12px 18px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      position: relative;
    }

    .stage-title {
      font-size: 17px;
      font-weight: 900;
      color: #000000;
      margin-bottom: 6px;
      text-align: center;
    }

    .stage-subtitle {
      font-size: 12.5px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 4px;
      text-align: center;
    }

    .stage-pill-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }

    .stage-pill {
      border: 1.5px solid #000000;
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 800;
      text-align: center;
      background: #ffffff;
      color: #000000;
    }

    .stage-pill-blue {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1e3a8a;
    }

    .stage-desc {
      font-size: 11px;
      color: #475569;
      font-weight: 700;
      text-align: center;
      margin-top: 4px;
    }

    /* SVG Connecting Wire Overlay */
    .wire-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }

    /* 2nd page guide for PDF */
    .page-2 {
      width: 1920px;
      height: 1080px;
      padding: 36px 50px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: avoid;
    }

    .p2-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1a429b;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .p2-title {
      font-size: 32px;
      font-weight: 900;
      color: #000000;
    }

    .p2-sub {
      font-size: 15px;
      font-weight: 700;
      color: #047857;
    }

    .p2-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }

    .p2-card {
      border: 2px solid #cbd5e1;
      border-radius: 20px;
      padding: 22px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .p2-card h3 {
      font-size: 18px;
      font-weight: 900;
      color: #1e40af;
      border-bottom: 1.5px solid #94a3b8;
      padding-bottom: 6px;
    }

    .p2-card p, .p2-card li {
      font-size: 13.5px;
      line-height: 1.45;
      color: #1e293b;
    }

    .p2-card ul {
      margin-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pitch-box {
      background: #eff6ff;
      border: 2px solid #2563eb;
      border-radius: 18px;
      padding: 18px 24px;
      margin-top: 18px;
      font-size: 15.5px;
      line-height: 1.55;
      color: #1e3a8a;
    }
  </style>
</head>
<body>

  <!-- ========================================================== -->
  <!-- SLIDE 1: PIXEL-PERFECT 16:9 TECHNICAL APPROACH SLIDE      -->
  <!-- ========================================================== -->
  <div class="slide">

    <!-- TOP HEADER BAR -->
    <div class="header-bar">
      <!-- Team Oval Badge Top Left -->
      <div class="team-badge-wrap">
        <div class="team-oval">
          <span class="team-oval-title">NextGen</span>
          <span class="team-oval-sub">Innovators</span>
        </div>
      </div>

      <!-- Center Title -->
      <div class="header-title-wrap">
        <h1 class="main-title">TECHNICAL APPROACH</h1>
      </div>

      <!-- Smart India Hackathon 2025/2026 Emblem Top Right -->
      <div class="sih-badge-wrap">
        <svg class="sih-emblem-svg" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="#2b3990" stroke-width="3" fill="#ffffff"/>
          <!-- Brain / Circuit Lightbulb Motif -->
          <path d="M50 16 C34 16 22 28 22 44 C22 55 28 64 36 70 L36 80 L64 80 L64 70 C72 64 78 55 78 44 C78 28 66 16 50 16 Z" fill="#ea580c"/>
          <path d="M38 80 L62 80 L58 90 L42 90 Z" fill="#1e293b"/>
          <path d="M35 44 C35 34 42 26 50 26" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
          <circle cx="50" cy="44" r="5" fill="#ffffff"/>
          <circle cx="40" cy="56" r="4" fill="#ffffff"/>
          <circle cx="60" cy="56" r="4" fill="#ffffff"/>
          <line x1="50" y1="44" x2="40" y2="56" stroke="#ffffff" stroke-width="2"/>
          <line x1="50" y1="44" x2="60" y2="56" stroke="#ffffff" stroke-width="2"/>
          <line x1="50" y1="16" x2="50" y2="8" stroke="#ea580c" stroke-width="3"/>
          <line x1="22" y1="26" x2="14" y2="18" stroke="#ea580c" stroke-width="3"/>
          <line x1="78" y1="26" x2="86" y2="18" stroke="#ea580c" stroke-width="3"/>
        </svg>
        <div class="sih-text">
          <span class="line1">SMART INDIA</span>
          <span class="line2">HACKATHON</span>
          <span class="year">2025</span>
        </div>
      </div>
    </div>

    <!-- MAIN TWO-COLUMN BODY -->
    <div class="main-grid">

      <!-- ====================================================== -->
      <!-- LEFT COLUMN: TECH STACK BULLETS & LOGOS GRID           -->
      <!-- ====================================================== -->
      <div class="left-col">

        <!-- Tech Stack Card -->
        <div class="tech-stack-box">
          <div class="tech-stack-header">Technology Stack</div>
          <ul class="tech-list">
            <li>
              <strong>Mobile App:</strong> React 19, Vite, Capacitor Native Android (Universal APK)
            </li>
            <li>
              <strong>Backend / Architecture:</strong> 100% Offline Edge Service Worker, CacheStorage
            </li>
            <li>
              <strong>AI/ML &amp; Voice Tools:</strong>
              <div class="sub-item">
                - <strong>Speech / Audio:</strong> IndicWav2Vec Acoustic Model, Web Audio Formant Synthesizer
              </div>
              <div class="sub-item">
                - <strong>Translation:</strong> AI4Bharat IndicTrans2 (INT8 ONNX), Jim Cummins Dual-Iceberg
              </div>
            </li>
            <li>
              <strong>Data Processing:</strong> Pandas, NumPy, CIIL 12,000+ Tribal Lexicon, NIPUN Matrix
            </li>
            <li>
              <strong>Target Languages:</strong> Santhali (Ol Chiki), Ho (Warang Chiti), Mundari, Kudmali, Sadri
            </li>
            <li>
              <strong>Classroom Hardware:</strong> Low-cost 2GB Android Tablets, e-Vidyavahini 2.0 Edge
            </li>
            <li>
              <strong>Database &amp; Storage:</strong> IndexedDB, SQLite Offline Cache / Firebase Sync
            </li>
            <li>
              <strong>Security &amp; Privacy:</strong> 100% On-Device DPDP Act 2023 Isolation, Keystore v2+v3
            </li>
            <li>
              <strong>Pedagogical Standard:</strong> NEP 2020 MTB-MLE, NCF-FS &amp; NIPUN Bharat 80:20
            </li>
            <li>
              <strong>Output Modalities:</strong> Native Script Display, Offline TTS, 300 DPI Audio QR Print
            </li>
          </ul>
        </div>

        <!-- Tech Logos Card -->
        <div class="logos-box">
          <div class="logos-grid">
            <!-- Firebase -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#FFA000" d="M3.89 15.67L6.44 2.89a.57.57 0 0 1 1.07-.11l2.44 4.67z"/>
                <path fill="#F57C00" d="M14.07 7.37L10 2.21a.57.57 0 0 0-1 0L3.89 15.67l6.63 3.73a1.44 1.44 0 0 0 1.41 0l8.18-4.6z"/>
                <path fill="#FFCA28" d="M20.11 14.8l-4.57-8.62a.57.57 0 0 0-1 0l-4.59 8.62 4.62 2.6a1.44 1.44 0 0 0 1.41 0z"/>
              </svg>
              <span>Firebase</span>
            </div>

            <!-- NumPy -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#4D77CF" d="M4 4h7v7H4z"/>
                <path fill="#013243" d="M13 4h7v7h-7z"/>
                <path fill="#4DABF7" d="M4 13h7v7H4z"/>
                <path fill="#228BE6" d="M13 13h7v7h-7z"/>
              </svg>
              <span>NumPy</span>
            </div>

            <!-- OCR Badge -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="4" fill="#2563eb"/>
                <text x="12" y="15" fill="#ffffff" font-size="8" font-weight="900" text-anchor="middle">OCR</text>
              </svg>
              <span>OCR</span>
            </div>

            <!-- Power BI -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <rect x="4" y="10" width="3.5" height="10" rx="1" fill="#F2C811"/>
                <rect x="10.2" y="6" width="3.5" height="14" rx="1" fill="#ECA500"/>
                <rect x="16.5" y="2" width="3.5" height="18" rx="1" fill="#D97706"/>
              </svg>
              <span>Power BI</span>
            </div>

            <!-- Python -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#3776AB" d="M11.9 2c-3.1 0-5 1.5-5 3.5v2.5h5v1H4.5C2.5 9 1 10.9 1 14s1.5 5 4.5 5h1.5v-2.2c0-2.3 2-4.3 4.3-4.3h4.6c.9 0 1.6-.7 1.6-1.6V5.5c0-2-1.9-3.5-5-3.5zm-1.4 1.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z"/>
                <path fill="#FFD43B" d="M12.1 22c3.1 0 5-1.5 5-3.5V16h-5v-1h7.4c2 0 3.5-1.9 3.5-5s-1.5-5-4.5-5h-1.5v2.2c0 2.3-2 4.3-4.3 4.3H8.1c-.9 0-1.6.7-1.6 1.6v5.4c0 2 1.9 3.5 5 3.5zm1.4-1.5a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z"/>
              </svg>
              <span>Python</span>
            </div>

            <!-- React -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#00D8FF" stroke-width="1.6"/>
                <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#00D8FF" stroke-width="1.6" transform="rotate(60 12 12)"/>
                <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#00D8FF" stroke-width="1.6" transform="rotate(120 12 12)"/>
                <circle cx="12" cy="12" r="2" fill="#00D8FF"/>
              </svg>
              <span>React</span>
            </div>

            <!-- GitHub -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="#181717">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </div>

            <!-- LinkedIn -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2"/>
                <text x="8" y="17" fill="#ffffff" font-size="14" font-weight="900">in</text>
              </svg>
              <span>LinkedIn</span>
            </div>

            <!-- Google Cloud -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#4285F4" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                <path fill="#34A853" d="M19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
              </svg>
              <span>Google Cloud</span>
            </div>

            <!-- AWS -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#FF9900" d="M18.7 17.3c-2.3 1.7-5.5 2.6-8.4 2.6-3.9 0-7.5-1.5-10.2-4-.2-.2-.2-.5 0-.7.3-.3.7-.3 1 0 2.4 2.2 5.6 3.6 9.2 3.6 2.6 0 5.5-.8 7.6-2.3.4-.3.9.1.8.8z"/>
                <path fill="#FF9900" d="M19.6 15.7c-.3-.4-1.8-.2-2.7-.1-.3 0-.4-.2-.2-.4 1.1-1.3 2.9-.9 3.2-.5.3.4 0 2.2-1 3.2-.2.2-.4.1-.4-.1.1-.9.6-1.7 1.1-2.1z"/>
                <path fill="#232F3E" d="M12.9 6.2h2.2v9.3h-2.2zM7.4 11.2c0-1.4 1-2.2 2.6-2.2 1.1 0 1.8.2 2.3.5v1.7c-.5-.4-1.2-.6-2-.6-.9 0-1.3.4-1.3 1 0 1.4 3.7.8 3.7 3.8 0 1.5-1.1 2.3-2.9 2.3-1.3 0-2.2-.3-2.9-.8v-1.8c.6.5 1.5.8 2.4.8 1 0 1.6-.4 1.6-1.1 0-1.5-3.5-.9-3.5-3.6z"/>
              </svg>
              <span>AWS</span>
            </div>

            <!-- AICTE -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#b45309" stroke-width="2"/>
                <path d="M12 6 L14 10 L18 10 L15 13 L16 17 L12 14.5 L8 17 L9 13 L6 10 L10 10 Z" fill="#d97706"/>
              </svg>
              <span>AICTE</span>
            </div>

            <!-- AI4Bharat / Anuvadini -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#047857" stroke-width="2"/>
                <path d="M12 3 L12 21 M3 12 L21 12 M5.5 5.5 L18.5 18.5 M18.5 5.5 L5.5 18.5" stroke="#ea580c" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="#047857"/>
              </svg>
              <span>AI4Bharat</span>
            </div>

            <!-- MongoDB -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#47A248" d="M12 1.5s-.3.3-.7.7C9.9 3.5 4.5 9 4.5 14.3c0 4.7 3.8 8.2 7.5 8.2 3.7 0 7.5-3.5 7.5-8.2C19.5 9 14.1 3.5 12.7 2.2c-.4-.4-.7-.7-.7-.7zm-.1 3.3c.7.8 4.7 5.3 4.7 9.5 0 3.2-2.3 5.9-4.7 6.4V4.8z"/>
              </svg>
              <span>MongoDB</span>
            </div>

            <!-- Node.js -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#339933" d="M12 2l8.5 4.9v9.8L12 21.6 3.5 16.7V6.9L12 2zm0 2.3L5.5 7.9v8.2l6.5 3.6 6.5-3.6V7.9L12 4.3z"/>
                <path fill="#339933" d="M12 7.5l4 2.3v4.4l-4 2.3-4-2.3V9.8l4-2.3z"/>
              </svg>
              <span>Node.js</span>
            </div>

            <!-- ChatGPT / AI -->
            <div class="logo-cell">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#10a37f" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="#10a37f"/>
                <path d="M12 3v5M12 16v5M3 12h5M16 12h5" stroke="#10a37f" stroke-width="2"/>
              </svg>
              <span>OpenAI</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ====================================================== -->
      <!-- RIGHT COLUMN: FLOWCHART + BOTTOM 3 STAGES              -->
      <!-- ====================================================== -->
      <div class="right-col">

        <!-- Flowchart Canvas Area (Exact replication of User Image 1) -->
        <div class="flowchart-board" style="height: 520px;">

          <!-- Connecting Wire Vectors -->
          <svg class="wire-svg" viewBox="0 0 1190 520">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#000000" />
              </marker>
            </defs>

            <!-- Line: User Opens App -> Camera/Audio Capture -->
            <line x1="200" y1="42" x2="200" y2="62" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: Camera/Audio Capture -> Image/Audio Preprocessing -->
            <line x1="200" y1="108" x2="200" y2="130" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: Image Preprocessing -> Text Detection -->
            <line x1="200" y1="194" x2="200" y2="218" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: Text Detection -> Text Regions Detected? -->
            <line x1="200" y1="272" x2="200" y2="296" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: Text Regions Detected? -> Script Identification -->
            <line x1="200" y1="342" x2="200" y2="366" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Horizontal Line: Text Regions Detected? -> Script Recognized? -->
            <line x1="320" y1="319" x2="490" y2="319" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: Script Recognized? -> OCR Text Extraction -->
            <line x1="600" y1="342" x2="600" y2="366" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: Script Recognized? -> Right Side Flow: Text Extracted? -->
            <path d="M 710 319 L 780 319 L 780 50" fill="none" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Branches from Text Extracted? diamond: -->
            <!-- Branch 1 (Left): Extraction Failed Retry Options -->
            <path d="M 700 24 L 590 24 L 590 74" fill="none" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Branch 2 (Center): No Text Found Error Message -->
            <line x1="780" y1="48" x2="780" y2="74" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Branch 3 (Right): ML Transliteration Processing -->
            <path d="M 860 24 L 1020 24 L 1020 74" fill="none" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line from Extraction Failed & No Text Found -> Retry Capture -->
            <path d="M 590 130 L 590 170 L 630 170" fill="none" stroke="#000000" stroke-width="2"/>
            <path d="M 780 130 L 780 170 L 800 170" fill="none" stroke="#000000" stroke-width="2"/>
            <line x1="780" y1="130" x2="780" y2="154" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Line: ML Transliteration Processing -> Display Transliterated Text Output -->
            <line x1="1020" y1="130" x2="1020" y2="154" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Wire from Display Output & OCR Text Extraction to Actions: Audio Playback & Save Option -->
            <path d="M 920 185 L 780 185 L 780 366" fill="none" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>
            <line x1="1020" y1="216" x2="1020" y2="366" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>
            <line x1="710" y1="388" x2="730" y2="388" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Convergence: Audio Playback & Save Option -> Process Complete -->
            <path d="M 790 410 L 790 458 L 820 458" fill="none" stroke="#000000" stroke-width="2"/>
            <path d="M 1020 410 L 1020 458 L 1000 458" fill="none" stroke="#000000" stroke-width="2"/>
            <line x1="820" y1="458" x2="830" y2="458" stroke="#000000" stroke-width="2" marker-end="url(#arrow)"/>
          </svg>

          <!-- Flow Node: User Opens App -->
          <div class="fn fn-blue-pill" style="left: 110px; top: 6px; width: 180px; height: 36px;">
            👤 User Opens App
          </div>

          <!-- Flow Node: Camera / Voice Capture -->
          <div class="fn fn-blue-box" style="left: 95px; top: 62px; width: 210px; height: 46px;">
            📷 🎙️ Camera / Voice Capture
          </div>

          <!-- Flow Node: Image & Audio Preprocessing -->
          <div class="fn fn-green-box" style="left: 65px; top: 130px; width: 270px; height: 64px;">
            🖼️ 🔊 Image Preprocessing<br>
            <span style="font-size: 11px; font-weight: 600; color: #166534;">Resize, Enhance, Noise Reduction</span>
          </div>

          <!-- Flow Node: Text Detection -->
          <div class="fn fn-orange-box" style="left: 75px; top: 218px; width: 250px; height: 54px;">
            🧠 Text Detection<br>
            <span style="font-size: 11px; font-weight: 600; color: #9a3412;">YOLO / Computer Vision</span>
          </div>

          <!-- Flow Node: Text Regions Detected? (Decision) -->
          <div class="fn fn-decision" style="left: 80px; top: 296px; width: 240px; height: 46px;">
            Text Regions<br>Detected?
          </div>

          <!-- Flow Node: Script Identification -->
          <div class="fn fn-green-box" style="left: 65px; top: 366px; width: 270px; height: 44px;">
            📝 Script Identification<br>
            <span style="font-size: 10.5px; font-weight: 700; color: #166534;">Devanagari, Tamil, Telugu, etc</span>
          </div>

          <!-- Flow Node: Script Recognized? (Decision) -->
          <div class="fn fn-decision" style="left: 490px; top: 296px; width: 220px; height: 46px;">
            Script<br>Recognized?
          </div>

          <!-- Flow Node: OCR Text Extraction -->
          <div class="fn fn-blue-box" style="left: 485px; top: 366px; width: 230px; height: 44px;">
            📝 OCR Text Extraction
          </div>

          <!-- Flow Node: Text Extracted? (Decision Top Right) -->
          <div class="fn fn-decision" style="left: 690px; top: 4px; width: 180px; height: 44px;">
            Text<br>Extracted?
          </div>

          <!-- Flow Node: Extraction Failed -->
          <div class="fn fn-yellow-box" style="left: 490px; top: 74px; width: 200px; height: 56px;">
            ⚠️ Extraction Failed<br>
            <span style="font-size: 10.5px; font-weight: 700; color: #854d0e;">Retry Options</span>
          </div>

          <!-- Flow Node: No Text Found -->
          <div class="fn fn-red-box" style="left: 710px; top: 74px; width: 180px; height: 56px;">
            ❌ No Text Found<br>
            <span style="font-size: 10.5px; font-weight: 700; color: #9f1239;">Error Message</span>
          </div>

          <!-- Flow Node: Retry Capture -->
          <div class="fn fn-blue-pill" style="left: 630px; top: 154px; width: 170px; height: 36px;">
            🔄 Retry Capture
          </div>

          <!-- Flow Node: ML Transliteration Processing -->
          <div class="fn fn-green-box" style="left: 920px; top: 74px; width: 200px; height: 56px; background: #fef3c7; border-color: #f59e0b;">
            🧠 ML<br>Transliteration Processing
          </div>

          <!-- Flow Node: Display Transliterated Text Output -->
          <div class="fn fn-green-box" style="left: 920px; top: 154px; width: 200px; height: 62px;">
            💻 Display Transliterated<br>Text Output
          </div>

          <!-- Flow Node: Audio Playback Option -->
          <div class="fn fn-yellow-box" style="left: 730px; top: 366px; width: 160px; height: 44px;">
            🔊 Audio<br>Playback Option
          </div>

          <!-- Flow Node: Save Translation Option -->
          <div class="fn fn-yellow-box" style="left: 920px; top: 366px; width: 200px; height: 44px;">
            💾 Save<br>Translation Option
          </div>

          <!-- Flow Node: Process Complete -->
          <div class="fn fn-blue-box" style="left: 810px; top: 436px; width: 190px; height: 44px; border-color: #3b82f6;">
            ✅ Process<br>Complete
          </div>

        </div>

        <!-- ==================================================== -->
        <!-- BOTTOM 3-STAGE HORIZONTAL BOXES                      -->
        <!-- (Input Stage | Processing Stage | Output Stage)      -->
        <!-- ==================================================== -->
        <div class="three-stages-grid">

          <!-- BOX 1: Input Stage -->
          <div class="stage-card">
            <div class="stage-title">Input Stage</div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; flex: 1;">
              <div class="stage-subtitle">Signboard / Textbook<br>(Any Script) ➔ Camera OCR</div>
              <div style="display: flex; align-items: center; gap: 12px; margin: 4px 0;">
                <!-- Highway Signboard graphic -->
                <svg width="74" height="32" viewBox="0 0 74 32">
                  <rect width="74" height="32" rx="4" fill="#047857"/>
                  <rect x="2" y="2" width="70" height="28" rx="2" fill="none" stroke="#ffffff" stroke-width="1.5"/>
                  <text x="37" y="16" fill="#ffffff" font-size="8.5" font-weight="900" text-anchor="middle">NAGPUR 15</text>
                  <path d="M54 23 L64 23 L59 19 Z" fill="#ffffff"/>
                </svg>
                <span style="font-size: 22px; font-weight: 900;">➔</span>
                <!-- Camera Icon SVG -->
                <svg width="42" height="34" viewBox="0 0 24 24" fill="#000000">
                  <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                </svg>
              </div>
              <div class="stage-desc">Optical character recognition</div>
            </div>
          </div>

          <!-- BOX 2: Processing Stage -->
          <div class="stage-card">
            <div class="stage-title">Processing Stage</div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; flex: 1; width: 100%;">
              <div class="stage-subtitle">Script Conversion Engine</div>
              <div style="display: flex; align-items: center; gap: 14px; width: 100%; justify-content: center;">
                <!-- Gear SVG -->
                <svg width="44" height="44" viewBox="0 0 24 24" fill="#64748b">
                  <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"/>
                </svg>
                <div class="stage-pill-row" style="flex: 1; max-width: 290px;">
                  <div class="stage-pill">Input Script Analysis</div>
                  <div class="stage-pill">Character Mapping &amp; Transliteration</div>
                  <div class="stage-pill" style="background: #f1f5f9;">Target Script Synthesis</div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOX 3: Output Stage -->
          <div class="stage-card">
            <div class="stage-title">Output Stage</div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; flex: 1;">
              <div class="stage-subtitle">Output in Chosen Script</div>
              <!-- Desktop Display Monitor SVG -->
              <svg width="68" height="52" viewBox="0 0 68 52" fill="none">
                <rect x="4" y="2" width="60" height="38" rx="4" stroke="#000000" stroke-width="3" fill="#ffffff"/>
                <line x1="4" y1="32" x2="64" y2="32" stroke="#000000" stroke-width="2"/>
                <rect x="30" y="40" width="8" height="8" fill="#000000"/>
                <line x1="20" y1="48" x2="48" y2="48" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <div class="stage-desc">User Selected Language / Alphabet</div>
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>

  <!-- ========================================================== -->
  <!-- PAGE 2: ARCHITECTURAL DEEP-DIVE & 30-SEC JURY DEFENSE     -->
  <!-- ========================================================== -->
  <div class="page-2">
    <div class="p2-header">
      <div>
        <div class="p2-title">SARJOM Technical Approach: Engineering Deep-Dive</div>
        <div class="p2-sub">SIH 2026 Problem SIH26042 · Client: Govt. of Jharkhand (DHTE) · Team NextGen Innovators</div>
      </div>
      <div>
        <span style="background: #1e40af; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 14px;">100% OFFLINE EDGE PROTOTYPE</span>
      </div>
    </div>

    <div class="p2-grid">
      <!-- Card 1 -->
      <div class="p2-card">
        <h3>1. Input &amp; Acoustic DSP Processing</h3>
        <p><strong>Overcoming Tin-Roof Monsoon Noise:</strong> Jharkhand forest schools experience heavy ambient noise (75–82 dB) on corrugated metal classroom roofs.</p>
        <ul>
          <li><strong>Web Audio DSP Noise Gate:</strong> Biquad bandpass filter restricts incoming frequencies strictly to human vocal fundamentals (300 Hz – 3,400 Hz).</li>
          <li><strong>16 kHz PCM Acoustic Stream:</strong> Operates directly on low-cost 2GB Android tablets with zero cloud speech roundtrips.</li>
          <li><strong>Echo Cancellation (AEC):</strong> Tablet speaker broadcasts native pronunciations without re-triggering microphone feedback loops.</li>
          <li><strong>Tactile Fallback:</strong> If acoustic SNR &lt; 12 dB, teachers tap 1-touch prompt chips to bypass speech without stopping instruction.</li>
        </ul>
      </div>

      <!-- Card 2 -->
      <div class="p2-card">
        <h3>2. Edge AI &amp; Munda Morphology Engine</h3>
        <p><strong>Beyond Shallow Word Lookup:</strong> Austroasiatic Munda tongues (Santhali, Ho, Mundari) are polysynthetic and agglutinative.</p>
        <ul>
          <li><strong>AI4Bharat IndicTrans2 INT8:</strong> Dynamically quantized transformer runtime executes in browser memory in ~34 MB of RAM (sub-50ms latency).</li>
          <li><strong>Dual-Iceberg Cognitive Bridge:</strong> Maps BICS (basic conversational fluency) into CALP (cognitive academic language proficiency) in Hindi.</li>
          <li><strong>80:20 Scaffolding:</strong> Balvatika starts at 80% tribal mother tongue; gradually inverts to 80% standard Hindi by Grade 3 per NIPUN Bharat.</li>
          <li><strong>Unicode 5.1 Matrix:</strong> Authentic glyph mappings for Ol Chiki (U+1C50), Warang Chiti (U+118A0), and Devanagari.</li>
        </ul>
      </div>

      <!-- Card 3 -->
      <div class="p2-card">
        <h3>3. Multi-Modal Output &amp; Take-Home Audio</h3>
        <p><strong>Closing the Forest Hamlet Homework Gap:</strong> Village parents are often non-literate and lack internet connectivity.</p>
        <ul>
          <li><strong>Offline Formant Speech Synthesis:</strong> Emulates human vocal tract formant resonance (F1: 620Hz, F2: 1720Hz) directly via Web Audio API.</li>
          <li><strong>Dynamic Audio QR Worksheets:</strong> Reed-Solomon Error Correction Level M vector QR codes printed at 300 DPI encode lesson audio.</li>
          <li><strong>Universal Android APK:</strong> V1, V2, and V3 APK signed, installable on any low-cost Android 9+ tablet or phone.</li>
          <li><strong>e-Vidyavahini 2.0 Sneakernet Sync:</strong> Formative scores queue in IndexedDB for weekly MicroSD/USB block synchronization.</li>
        </ul>
      </div>
    </div>

    <!-- Pitch Script -->
    <div class="pitch-box">
      <strong>🎙️ 30-Second Evaluator Presentation Script:</strong><br>
      "Respected Jury, our Technical Approach is engineered specifically for remote tribal schools in Jharkhand: <strong>zero internet, 2GB Android tablets, and 80-decibel monsoon classroom noise</strong>.<br>
      As demonstrated in our system flowchart, the teacher speaks in Hindi or inputs text. Our <strong>Web Audio DSP Noise Gate</strong> instantly filters tin-roof rumble. Our <strong>AI4Bharat IndicTrans2 INT8 engine</strong> runs 100% on-device inside client memory in under 35 megabytes of RAM—requiring <strong>zero cloud API calls</strong>. It translates instructions into authentic Santhali Ol Chiki, Ho Warang Chiti, and Mundari using Jim Cummins' Dual-Iceberg scaffolding. The app speaks the phrase aloud offline using our <strong>formant synthesizer</strong>, displays authentic native glyphs, and generates <strong>take-home Audio QR worksheets</strong> for non-literate village parents. It is packaged into a universal Android APK and complies 100% with the DPDP Act 2023."
    </div>
  </div>

</body>
</html>
`;

(async () => {
  try {
    const htmlPath = path.join(__dirname, 'technical_approach_slide.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('✅ Created technical_approach_slide.html');

    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // 1. High-Resolution 16:9 Presentation Slide PNG Screenshot
    const pngPath = path.join(__dirname, 'technical_approach_slide_16x9.png');
    const artifactPngPath = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f/technical_approach_slide_16x9.png';
    
    const slideElement = await page.$('.slide');
    if (slideElement) {
      await slideElement.screenshot({ path: pngPath, type: 'png' });
      fs.copyFileSync(pngPath, artifactPngPath);
      console.log('✅ Slide 16:9 PNG screenshot saved at:', pngPath);
      console.log('✅ Artifact copy saved at:', artifactPngPath);
    }

    // 2. Widescreen 16:9 PDF
    const pdfPath = path.join(__dirname, 'TECHNICAL_APPROACH_SLIDE.pdf');
    const artifactPdfPath = '/Users/toru/.gemini/antigravity-ide/brain/3f9ebd6b-c3b8-49ee-abe4-de0b5c3b0d3f/TECHNICAL_APPROACH_SLIDE.pdf';

    await page.pdf({
      path: pdfPath,
      width: '16in',
      height: '9in',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    fs.copyFileSync(pdfPath, artifactPdfPath);
    console.log('✅ 16:9 Presentation PDF created at:', pdfPath);
    console.log('✅ Artifact PDF copy saved at:', artifactPdfPath);

    await browser.close();
    console.log('🎉 All Technical Approach deliverables successfully generated!');
  } catch (err) {
    console.error('❌ Error generating technical approach assets:', err);
    process.exit(1);
  }
})();
