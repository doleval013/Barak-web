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
        const hasVisitedToday = sessionStorage.getItem(storageKey); // Use sessionStorage to track per session for better duration tracking, or stick to localStorage but create a new visit anyway?
        // User wants "for each visit how much time...". Usually "visit" = session.
        // If I use localStorage, I only count 1 visit per day. That's fine for "Unique Visitors" but validation of "Duration" might require a session ID.
        // Let's create a NEW visit entry for every session (page load) if we want to track DURATION of that session.
        // But the previous logic was "Unique Visitors".
        // Let's keep "Unique Visitors" logic for the "Visits" count, but maybe always create a visit ID for duration tracking?
        // Okay, the backend creates a row in 'visits'. If I don't call it, I don't get a row.
        // If I only call it once per day (localStorage), then I can only track duration for that ONE visit.
        // If the user opens the page again later, no new visit row, no tracking.
        // Compromise: Use sessionStorage. One visit per session.

        if (
          window.location.pathname.startsWith('/admin') ||
          sessionStorage.getItem('barak_admin_token')
        ) {
          // Verify if we should flag this user permanently as admin-visitor?
          // For now, just don't track this session.
          return;
        }

        let visitId = sessionStorage.getItem('current_visit_id');

        if (!visitId) {
          if (process.env.NODE_ENV !== 'development') {
            const res = await fetch('/api/visit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                page: 'home',
                language: localStorage.getItem('language') || 'he',
                referrer: document.referrer || 'direct'
              })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.ignored) return; // Backend ignored it
              visitId = data.id;
              sessionStorage.setItem('current_visit_id', visitId);

              // Also mark daily unique visit for local checks if needed
              localStorage.setItem(storageKey, 'true');
            }
          }
        }

        if (visitId && process.env.NODE_ENV !== 'development') {
          // Start Heartbeat
          const interval = setInterval(() => {
            fetch('/api/visit/heartbeat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ visitId })
            }).catch(err => console.error('Heartbeat failed', err));
          }, 30000); // Every 30 seconds

          return () => clearInterval(interval);
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
