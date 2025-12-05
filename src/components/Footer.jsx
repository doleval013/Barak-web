import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';

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

export default function Footer({ onOpenLegal }) {
    const socialLinks = [
        { icon: Facebook, href: "https://www.facebook.com/barakaloni.dogs", label: "Facebook" },
        { icon: Instagram, href: "https://www.instagram.com/barakaloni.dogs/", label: "Instagram" },
        { icon: TikTok, href: "https://www.tiktok.com/@barakaloni", label: "TikTok" },
        { icon: Youtube, href: "https://www.youtube.com/channel/UC56vSCOnTh1K-5FkiwoIdvA/videos", label: "YouTube" },
    ];

    return (
        <footer className="glass-panel mt-20 py-12 border-x-0 border-b-0 rounded-none relative z-10">
            <div className="container text-center">



                <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm font-medium text-[var(--color-text-muted)]">
                    <button
                        onClick={() => onOpenLegal('accessibility')}
                        className="hover:text-[var(--color-accent)] transition-colors"
                    >
                        הצהרת נגישות
                    </button>
                    <span className="opacity-30">|</span>
                    <button
                        onClick={() => onOpenLegal('privacy')}
                        className="hover:text-[var(--color-accent)] transition-colors"
                    >
                        מדיניות פרטיות
                    </button>
                </div>
                <p className="text-[var(--color-text-muted)] text-sm opacity-80">
                    © {new Date().getFullYear()} ברק אלוני - סדנאות כלבנות והעצמה. כל הזכויות שמורות.
                </p>
            </div>
        </footer>
    );
}
