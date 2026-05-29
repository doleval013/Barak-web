import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Briefcase, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import UserMenu from './auth/UserMenu';
import GoogleSignInButton from './auth/GoogleSignInButton';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'h-20 glass-panel border-x-0 border-t-0 rounded-none' : 'h-24 bg-transparent border-transparent'
      }`}
    >
      <div className="container h-full flex items-center justify-between">
        <Logo href="#" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          
          {/* Programs Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              className="font-display font-medium text-lg relative group tracking-wide text-[var(--color-primary)] opacity-80 hover:opacity-100 transition-all flex items-center gap-1 py-2"
            >
              {t('programs')}
              <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute ${language === 'he' ? 'right-0' : 'left-0'} mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50`}
                  style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
                >
                  <a
                    href="/gefen"
                    className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {language === 'he' ? 'מוסדות חינוך' : 'Educational Institutions'}
                  </a>
                  <a
                    href="/workshop"
                    className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {language === 'he' ? 'סדנאות צוותים' : 'Team Workshops'}
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Standalone Jobs link */}
          <a
            href="/jobs"
            className="font-display font-medium text-lg relative group tracking-wide text-[var(--color-primary)] opacity-80 hover:opacity-100 transition-opacity"
          >
            {language === 'he' ? 'משרות' : 'Jobs'}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full"></span>
          </a>

          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 font-bold px-3 py-1 rounded-full transition-all ${
              isScrolled ? 'text-[var(--color-primary)] hover:bg-black/5' : 'text-[var(--color-primary)] hover:bg-white/20'
            }`}
          >
            <Globe size={20} />
            <span className="uppercase">{language === 'he' ? 'EN' : 'עב'}</span>
          </button>

          <a
            href="#contact"
            className={`btn-shine px-8 py-3 rounded-full font-bold transition-all transform hover:-translate-y-0.5 ${
              isScrolled ? 'bg-[var(--color-primary)] shadow-lg' : 'glass-panel hover:bg-white'
            }`}
            style={{ color: isScrolled ? '#ffffff' : 'var(--color-primary)' }}
          >
            <span className="relative z-20">{t('lets_talk')}</span>
          </a>

          {/* Auth: User menu or Sign-in button */}
          {!authLoading && (
            isAuthenticated ? (
              <UserMenu />
            ) : (
              <GoogleSignInButton size="medium" theme="outline" />
            )
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden z-50">
          {!authLoading && isAuthenticated && <UserMenu />}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 font-bold text-[var(--color-primary)]"
          >
            <Globe size={20} />
            <span className="uppercase text-sm">{language === 'he' ? 'EN' : 'עב'}</span>
          </button>

          <button
            className="p-2 text-[var(--color-primary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-2 md:hidden origin-top"
              style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}
            >
              {/* Programs Dropdown for Mobile */}
              <div className="flex flex-col border-b border-[var(--color-border)] pb-2">
                <button
                  onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                  className="w-full text-xl font-bold text-[var(--color-primary)] py-3 flex items-center justify-between"
                >
                  <span>{t('programs')}</span>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isMobileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col pl-4 pr-4 bg-slate-50 rounded-xl overflow-hidden"
                    >
                      <a
                        href="/gefen"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-bold text-[var(--color-primary)] py-3 hover:text-[var(--color-accent)] transition-colors border-b border-slate-100 last:border-0"
                      >
                        {language === 'he' ? 'מוסדות חינוך' : 'Educational Institutions'}
                      </a>
                      <a
                        href="/workshop"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-bold text-[var(--color-primary)] py-3 hover:text-[var(--color-accent)] transition-colors last:border-0"
                      >
                        {language === 'he' ? 'סדנאות צוותים' : 'Team Workshops'}
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other Mobile Links */}
              <a
                href="/jobs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xl font-bold text-[var(--color-primary)] py-3 border-b border-[var(--color-border)]"
              >
                {language === 'he' ? 'משרות' : 'Jobs'}
              </a>

              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-shine bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold text-center mt-2 shadow-lg"
                style={{ color: '#ffffff' }}
              >
                {t('lets_talk')}
              </a>
              {!authLoading && !isAuthenticated && (
                <div className="flex justify-center mt-2">
                  <GoogleSignInButton size="large" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
