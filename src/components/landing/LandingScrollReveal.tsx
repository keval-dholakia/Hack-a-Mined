// src/app/_landing/LandingScrollReveal.tsx
// Client component — handles scroll reveal and counter animations.
// Isolated here so the rest of the landing is pure server components.

'use client';

import { useEffect } from 'react';

export default function LandingScrollReveal() {
    useEffect(() => {
        // ── Scroll reveal ──────────────────────────────────────
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
            observer.observe(el);
        });

        // ── Sim bar animation on scroll ────────────────────────
        const barObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll<HTMLElement>('[data-width]').forEach((bar) => {
                            const target = bar.dataset.width ?? '0%';
                            bar.style.width = '0%';
                            requestAnimationFrame(() => {
                                setTimeout(() => { bar.style.width = target; }, 100);
                            });
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        document.querySelectorAll('[class*="simPreview"]').forEach((el) => {
            barObserver.observe(el);
        });

        // ── Nav scroll tint ────────────────────────────────────
        const handleScroll = () => {
            const nav = document.querySelector('nav');
            if (!nav) return;
            nav.style.borderBottomColor =
                window.scrollY > 60 ? 'rgba(42,45,62,0.8)' : 'var(--border)';
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            barObserver.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return null;
}