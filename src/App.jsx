import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TabletSimulatorBar } from './components/TabletSimulatorBar';
import { VoiceTranslator } from './components/VoiceTranslator';
import { LessonCurriculum } from './components/LessonCurriculum';
import { WorksheetStudio } from './components/WorksheetStudio';
import { FlashcardDeck } from './components/FlashcardDeck';
import { SlateAndFolklore } from './components/SlateAndFolklore';
import { DictionarySearch } from './components/DictionarySearch';
import { NeuralModelInspector } from './components/NeuralModelInspector';
import { TeacherDrawer } from './components/TeacherDrawer';
import { offlineStorage } from './services/offlineStorage';
import { toast } from 'sonner';

export default function App() {
  const [selectedLang, setSelectedLang] = useState(() => offlineStorage.getSelectedLanguage());
  const [isOffline, setIsOffline] = useState(() => {
    // Default to offline mode to showcase offline capability
    return true;
  });
  const [activeTab, setActiveTab] = useState('voice');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectLang = (langId) => {
    setSelectedLang(langId);
    offlineStorage.setSelectedLanguage(langId);
    toast.success(`सक्रिय भाषा बदली गई: ${langId.toUpperCase()}`);
  };

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    offlineStorage.setOfflineMode(nextState);
    if (nextState) {
      toast.warning('ऑफलाइन मोड सक्रिय: विद्यालय में बिना इंटरनेट सुचारु संचालन');
    } else {
      toast.info('ऑनलाइन मोड सक्रिय: केंद्रीय सर्वर से नया पाठ्यक्रम सिंक हो सकता है');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      {/* 1. Android Tablet Diagnostic & Jharkhand EVV Status Bar */}
      <TabletSimulatorBar
        isOffline={isOffline}
        toggleOffline={handleToggleOffline}
        selectedLang={selectedLang}
        onSelectLang={handleSelectLang}
      />

      {/* 2. Top Header & Navigation Bar */}
      <Navbar
        selectedLang={selectedLang}
        onSelectLang={handleSelectLang}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 3. Main Tablet Canvas */}
      <main className="tablet-canvas" style={{ flex: 1, width: '100%' }}>
        {activeTab === 'voice' && <VoiceTranslator selectedLang={selectedLang} />}
        {activeTab === 'curriculum' && <LessonCurriculum selectedLang={selectedLang} />}
        {activeTab === 'worksheets' && <WorksheetStudio selectedLang={selectedLang} />}
        {activeTab === 'flashcards' && <FlashcardDeck selectedLang={selectedLang} />}
        {activeTab === 'slate' && <SlateAndFolklore selectedLang={selectedLang} />}
        {activeTab === 'dictionary' && <DictionarySearch />}
        {activeTab === 'neural' && <NeuralModelInspector selectedLang={selectedLang} />}
      </main>

      {/* 4. Vaul Teacher Bottom Drawer */}
      <TeacherDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        selectedLang={selectedLang}
      />

      {/* 5. Official Footer */}
      <footer
        className="no-print"
        style={{
          borderTop: 'var(--border-thick)',
          backgroundColor: '#FFFFFF',
          padding: '24px 20px',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: 'var(--color-slate-muted)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-slate)', fontSize: '0.95rem' }}>
              झारखंड सरकार • उच्च एवं तकनीकी शिक्षा विभाग (Govt of Jharkhand)
            </div>
            <div>
              पलाश मातृभाषा बहुभाषी शिक्षण कार्यक्रम (PALASH MTB-MLE) • स्मार्ट एजुकेशन थीम
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span className="badge-tag badge-forest">हो (Ho)</span>
            <span className="badge-tag badge-palash">मुण्डारी (Mundari)</span>
            <span className="badge-tag badge-ochre">संताली (Santhali)</span>
            <span style={{ fontSize: '0.78rem' }}>स्मृति पदचिह्न (RAM): ~38 MB (≤2GB Tablet OK)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
