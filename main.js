(function() {
    'use strict';

    // 1. Strict Dark/Light Theme Engine
    const ThemeEngine = {
        getTheme: function() {
            try { 
                return localStorage.getItem('ctx_theme') || 'dark'; 
            } catch(e) { 
                return 'dark'; 
            }
        },
        setTheme: function(theme) {
            try { localStorage.setItem('ctx_theme', theme); } catch(e) {}
            this.apply(theme);
        },
        apply: function(theme) {
            // Strictly forces data-theme to be either 'dark' or 'light'
            document.documentElement.setAttribute('data-theme', theme);
        },
        toggle: function() {
            const current = document.documentElement.getAttribute('data-theme') || this.getTheme();
            const nextTheme = current === 'dark' ? 'light' : 'dark';
            this.setTheme(nextTheme);
        }
    };

    window.addEventListener('DOMContentLoaded', () => {
        // Initialize Theme Engine state
        ThemeEngine.apply(ThemeEngine.getTheme());

        // Wire Theme Toggle Button (Upper Right)
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                ThemeEngine.toggle();
            });
        }

        // 2. Elegant Scroll-Triggered CTA Floating Bar
        const ctaBar = document.getElementById('scrollCtaBar');
        if (ctaBar) {
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                // Reveal the floating CTA bar after scrolling down 400px
                if (scrollTop > 400) {
                    ctaBar.classList.add('visible');
                } else {
                    ctaBar.classList.remove('visible');
                }
            }, { passive: true });
        }

        // 3. High-Performance Intersection Observer for Scroll Animations
        // This targets all elements with the 'reveal-up' class and triggers them as they enter the viewport
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // Triggers slightly before element enters view
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target); // Run animation exactly once
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-up').forEach(el => {
            observer.observe(el);
        });

        // Trigger initial load animations for hero elements
        setTimeout(() => {
            document.querySelectorAll('.reveal-on-load').forEach(el => {
                el.classList.add('is-visible');
            });
        }, 50);
    });
})();