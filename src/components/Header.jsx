import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Facebook, Instagram, Youtube } from 'lucide-react';

const TikTok = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'אודות', href: '#about' },
    { name: 'תוכניות', href: '#programs' },
    { name: 'צור קשר', href: '#contact' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'h-20 glass-panel border-x-0 border-t-0 rounded-none' : 'h-24 bg-transparent border-transparent'
        }`}
    >
      <div className="container h-full flex items-center justify-between">

        <div className="logo relative z-50">
          <a href="#" className="block p-2">
            <img
              src={isScrolled ? "/assets/dog_final_v5.png?v=5" : "/assets/BARAK-ALONI-logo-1024x319.png"}
              alt="Barak Aloni Logo"
              className={`transition-all duration-500 object-contain ${isScrolled
                ? 'h-14 w-auto'
                : 'h-12 md:h-16 w-auto'
                }`}
              style={{
                filter: 'brightness(0) saturate(100%) invert(43%) sepia(93%) saturate(1516%) hue-rotate(202deg) brightness(101%) contrast(96%) drop-shadow(0 4px 6px rgba(59, 130, 246, 0.5))'
              }}
            />
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-display font-medium text-lg relative group tracking-wide text-[var(--color-primary)] opacity-80 hover:opacity-100 transition-opacity"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          <a
            href="#contact"
            className={`btn-shine px-8 py-3 rounded-full font-bold transition-all transform hover:-translate-y-0.5 ${isScrolled
              ? 'bg-[var(--color-primary)] shadow-lg'
              : 'glass-panel hover:bg-white'
              }`}
            style={{ color: isScrolled ? '#ffffff' : 'var(--color-primary)' }}
          >
            <span className="relative z-20">בואו נדבר</span>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 z-50 text-[var(--color-primary)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-4 md:hidden origin-top"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-bold text-[var(--color-primary)] py-3 border-b border-[var(--color-border)] last:border-0"
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-shine bg-[var(--color-primary)] text-white py-3 rounded-xl font-bold text-center mt-2 shadow-lg"
                style={{ color: '#ffffff' }}
              >
                בואו נדבר
              </a>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.header>
  );
}
