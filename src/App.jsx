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
import AdminDashboard from './components/AdminDashboard';

function App() {
  // Simple Routing
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (currentPath === '/admin') {
    return <AdminDashboard />;
  }

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('accessibility');
  const [isCookieBannerOpen, setIsCookieBannerOpen] = useState(false);    // Track visits

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // 1. Get Today's Date Key (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `visited_${today}`;
        const hasVisitedToday = localStorage.getItem(storageKey);

        if (!hasVisitedToday) {
          // New distinct visit for today
          if (process.env.NODE_ENV !== 'development') {
            // Send to self-hosted backend
            fetch('/api/visit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ page: 'home' })
            });
          } else {
            // Dev mode
            console.log('Dev: Tracking visit to /api/visit');
          }

          // Mark locally
          localStorage.setItem(storageKey, 'true');
        }
      } catch (err) {
        console.error(err);
      }
    };

    trackVisit();
  }, []);

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
