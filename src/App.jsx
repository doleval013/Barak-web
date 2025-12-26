import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';

import Programs from './components/Programs';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import CookieBanner from './components/CookieBanner';
import AccessibilityWidget from './components/AccessibilityWidget';
import FloatingWhatsApp from './components/FloatingWhatsApp';

function App() {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('accessibility');
  const [isCookieBannerOpen, setIsCookieBannerOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsCookieBannerOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCookieAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsCookieBannerOpen(false);
  };

  const openLegal = (tab) => {
    setLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />



          <Programs />
          <Contact />
        </main>


        <Footer onOpenLegal={openLegal} />

        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalTab}
        />
        <CookieBanner
          isVisible={isCookieBannerOpen}
          onAccept={handleCookieAccept}
          onOpenPrivacy={() => openLegal('privacy')}
        />
        <AccessibilityWidget isBannerOpen={isCookieBannerOpen} />
        <FloatingWhatsApp isBannerOpen={isCookieBannerOpen} />
      </div>
    </LanguageProvider>
  );
}

export default App;
