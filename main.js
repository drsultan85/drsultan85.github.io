(function() {
    'use strict';

    // 1. Theme Engine Integration
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
            document.documentElement.setAttribute('data-theme', theme);
        },
        toggle: function() {
            const current = this.getTheme();
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

        // 2. Scroll-Triggered CTA Floating Bar
        const ctaBar = document.getElementById('scrollCtaBar');
        if (ctaBar) {
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if (scrollTop > 400) {
                    ctaBar.classList.add('visible');
                } else {
                    ctaBar.classList.remove('visible');
                }
            }, { passive: true });
        }

        // 3. Intersection Observer for Scroll Animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Stop observing once animated in
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    });
})();