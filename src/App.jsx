import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Programs from './components/Programs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import CookieBanner from './components/CookieBanner';
import AccessibilityWidget from './components/AccessibilityWidget';

function App() {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('accessibility');

  const openLegal = (tab) => {
    setLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Programs />
        <Contact />
      </main>
      <Footer onOpenLegal={openLegal} />

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalTab}
      />
      <CookieBanner onOpenPrivacy={() => openLegal('privacy')} />
      <AccessibilityWidget />
    </div>
  );
}

export default App;
