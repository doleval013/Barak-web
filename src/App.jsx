import React, { useState, useEffect, useRef } from 'react';
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
import TeamWorkshopLanding from './components/TeamWorkshopLanding';

function App() {
  // Simple Routing
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('accessibility');
  const [isCookieBannerOpen, setIsCookieBannerOpen] = useState(false);

  // --- Helper: map path to trackable page name ---
  const getPageName = (path) => {
    if (path === '/' || path === '') return 'home';
    if (path === '/workshop' || path === '/teams') return 'workshop';
    if (path === '/admin') return 'admin';
    return path.replace(/^\//, '');
  };

  // --- Helper: parse UTM params from URL ---
  const getUtmParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
    };
  };

  // --- Helper: detect return visitor ---
  const isReturningVisitor = () => {
    const firstVisit = localStorage.getItem('barak_first_visit');
    if (firstVisit) return true;
    localStorage.setItem('barak_first_visit', new Date().toISOString());
    return false;
  };

  // Track visits
  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Admin exclusion: don't track if on admin page or if browser is marked as admin
        if (
          window.location.pathname.startsWith('/admin') ||
          sessionStorage.getItem('barak_admin_token') ||
          localStorage.getItem('barak_is_admin')
        ) {
          // Mark browser as admin permanently
          if (window.location.pathname.startsWith('/admin')) {
            localStorage.setItem('barak_is_admin', 'true');
          }
          return;
        }

        let visitId = sessionStorage.getItem('current_visit_id');

        if (!visitId) {
          if (process.env.NODE_ENV !== 'development') {
            const pageName = getPageName(window.location.pathname);
            const utmParams = getUtmParams();
            const returning = isReturningVisitor();

            const res = await fetch('/api/visit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                page: pageName,
                language: localStorage.getItem('language') || 'he',
                referrer: document.referrer || 'direct',
                utm_source: utmParams.utm_source,
                utm_medium: utmParams.utm_medium,
                utm_campaign: utmParams.utm_campaign,
                is_returning: returning,
              })
            });
            if (res.ok) {
              const data = await res.json();
              if (data.ignored) return;
              visitId = data.id;
              sessionStorage.setItem('current_visit_id', visitId);
              localStorage.setItem(`visited_${new Date().toISOString().split('T')[0]}`, 'true');
            }
          }
        }

        if (visitId && process.env.NODE_ENV !== 'development') {
          // --- Heartbeat ---
          const heartbeatInterval = setInterval(() => {
            fetch('/api/visit/heartbeat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ visitId })
            }).catch(err => console.error('Heartbeat failed', err));
          }, 30000);

          // --- Scroll Depth Tracking ---
          const scrollMilestones = new Set();
          const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            const milestones = [25, 50, 75, 100];
            for (const milestone of milestones) {
              if (scrollPercent >= milestone && !scrollMilestones.has(milestone)) {
                scrollMilestones.add(milestone);
                fetch('/api/visit/scroll', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ visitId, depth: milestone })
                }).catch(() => {});
              }
            }
          };

          window.addEventListener('scroll', handleScroll, { passive: true });
          // Fire once on load in case the page is already scrolled
          handleScroll();

          return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('scroll', handleScroll);
          };
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

  // Route: Admin Dashboard
  if (currentPath === '/admin') {
    return <AdminDashboard />;
  }

  // Route: Team Workshop Landing Page
  if (currentPath === '/teams' || currentPath === '/workshop') {
    return (
      <LanguageProvider>
        <TeamWorkshopLanding />
        <AccessibilityWidget isBannerOpen={isCookieBannerOpen} />
      </LanguageProvider>
    );
  }

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
