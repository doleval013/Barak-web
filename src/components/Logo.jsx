import React, { useState, useEffect } from 'react';

/**
 * Reusable Logo component with scroll behavior
 * - Shows full logo when at top of page
 * - Shows dog icon when scrolled down
 */
export default function Logo({ href = "/", className = "" }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Check initial state
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const logoFilter = 'brightness(0) saturate(100%) invert(43%) sepia(93%) saturate(1516%) hue-rotate(202deg) brightness(101%) contrast(96%) drop-shadow(0 4px 6px rgba(59, 130, 246, 0.5))';

    return (
        <div className={`logo relative z-50 ${className}`}>
            <a href={href} className="block p-2 hover:opacity-80 transition-opacity">
                <img
                    src={isScrolled ? "/assets/dog_final_v5.png?v=5" : "/assets/BARAK-ALONI-logo-1024x319.png"}
                    alt="Barak Aloni Logo"
                    className={`transition-all duration-500 object-contain ${isScrolled ? 'h-14 w-auto' : 'h-12 md:h-16 w-auto'
                        }`}
                    style={{ filter: logoFilter }}
                />
            </a>
        </div>
    );
}
