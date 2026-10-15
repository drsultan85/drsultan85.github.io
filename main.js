document.addEventListener("DOMContentLoaded", () => {
    
    /* ======================================================================
       1. SCROLL & NAVBAR LOGIC + AMBIENT COLOR TRANSITION
       ====================================================================== */
    const navbar = document.getElementById('navbar');
    const ambientBg = document.getElementById('ambientBg');

    const updateScrollAmbient = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;
        const progress = Math.min(Math.max(window.scrollY / docHeight, 0), 1);

        let color1, color2, color3;
        if (progress < 0.33) {
            const p = progress / 0.33;
            color1 = `hsl(${217 + p * 38}, 85%, 60%)`;
            color2 = `hsl(${265 + p * 30}, 80%, 65%)`;
            color3 = `hsl(${190 + p * 25}, 85%, 55%)`;
        } else if (progress < 0.66) {
            const p = (progress - 0.33) / 0.33;
            color1 = `hsl(${255 - p * 95}, 80%, 58%)`;
            color2 = `hsl(${295 - p * 80}, 75%, 60%)`;
            color3 = `hsl(${215 + p * 45}, 85%, 60%)`;
        } else {
            const p = (progress - 0.66) / 0.34;
            color1 = `hsl(${160 - p * 20}, 80%, 54%)`;
            color2 = `hsl(${215 - p * 55}, 85%, 60%)`;
            color3 = `hsl(${260 - p * 45}, 80%, 64%)`;
        }

        if (ambientBg) {
            ambientBg.style.setProperty('--orb-color-1', color1);
            ambientBg.style.setProperty('--orb-color-2', color2);
            ambientBg.style.setProperty('--orb-color-3', color3);

            const orb1 = ambientBg.querySelector('.orb-1');
            const orb2 = ambientBg.querySelector('.orb-2');
            const orb3 = ambientBg.querySelector('.orb-3');
            if (orb1) orb1.style.transform = `translate3d(${progress * 70}px, ${progress * 130}px, 0)`;
            if (orb2) orb2.style.transform = `translate3d(${-progress * 90}px, ${-progress * 110}px, 0)`;
            if (orb3) orb3.style.transform = `translate3d(${Math.sin(progress * Math.PI) * 80}px, ${progress * 90}px, 0)`;
        }
    };

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateScrollAmbient();
    }, { passive: true });

    updateScrollAmbient();

    // Elegant Mobile Dropdown & Outside Dismiss
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenuDropdown = document.getElementById('mobileMenuOverlay');

    const closeMobileMenu = () => {
        if (mobileMenuDropdown) mobileMenuDropdown.classList.remove('active');
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('is-active');
    };

    if (mobileMenuBtn && mobileMenuDropdown) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mobileMenuDropdown.classList.toggle('active');
            mobileMenuBtn.classList.toggle('is-active', isOpen);
            
            // Automatically close glass popover when mobile menu opens
            if (isOpen && desktopGlassPopover) {
                desktopGlassPopover.classList.add('hidden');
            }
        });

        // Dismiss when tapping anywhere outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuDropdown.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close on link click
        mobileMenuDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    /* ======================================================================
       2. SCROLL REVEAL ANIMATIONS
       ====================================================================== */
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    /* ======================================================================
       3. SPOTLIGHT HOVER EFFECT
       ====================================================================== */
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', `-1000px`);
            card.style.setProperty('--mouse-y', `-1000px`);
        });
    });

    /* ======================================================================
       4. ANIMATED METRIC COUNTERS (No < symbol)
       ====================================================================== */
    const counterElements = document.querySelectorAll('.counter-display');
    let countersAnimated = false;

    const animateCounters = () => {
        counterElements.forEach(el => {
            const target = parseFloat(el.getAttribute('data-target'));
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            const duration = 2000;
            let start = 0;
            let startTime = null;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                // Apple ease-out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = (ease * (target - start) + start).toFixed(decimals);
                el.textContent = `${prefix}${current}${suffix}`;
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
                }
            };
            requestAnimationFrame(step);
        });
    };

    const enterpriseSection = document.getElementById('enterprise');
    if (enterpriseSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.2 });
        counterObserver.observe(enterpriseSection);
    }

    /* ======================================================================
       5. INSTANT NON-BLOCKING THEME TOGGLE
       ====================================================================== */
    const themeBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    const updateLandingFavicon = (theme) => {
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const iconFilename = isDark ? 'dark-icon.png' : 'light-icon.png';
        const tabFavicon = document.getElementById('dynamic-favicon');
        if (tabFavicon && tabFavicon.getAttribute('href') !== iconFilename) {
            tabFavicon.setAttribute('href', iconFilename);
        }
    };

    const savedTheme = localStorage.getItem('ctx_landing_theme') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    htmlElement.setAttribute('data-theme', savedTheme);
    updateLandingFavicon(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('ctx_landing_theme', newTheme);
            requestAnimationFrame(() => updateLandingFavicon(newTheme));
        });
    }

    /* ======================================================================
       6. LIVE DYNAMIC TYPEWRITER & 10 TOP-LEVEL MEDICAL CASES (SHORTENED)
       ====================================================================== */
    const cases = [
        {
            query: "Acute chest pain with inferior ST elevations",
            badge: "CARDIOVASCULAR",
            icd: "ICD-10: I21.3",
            title: "ST-Elevation Myocardial Infarction (STEMI)",
            panel1Title: "Diagnostic Assessment & Acuity",
            panel1: [
                "<b>Primary Presentation:</b> Acute crushing retrosternal chest pain with diaphoresis.",
                "<b>Red Flags:</b> Hemodynamic instability indicating cardiogenic shock.",
                "<b>ECG Findings:</b> >1mm ST elevation in contiguous leads II, III, aVF."
            ],
            panel2Title: "Guideline-Directed Management",
            panel2: [
                "<b>STAT Therapy:</b> Aspirin 325mg PO chewed + Ticagrelor 180mg load.",
                "<b>Reperfusion:</b> Primary PCI within 90 minutes of first medical contact.",
                "<b>Adjunct:</b> Unfractionated Heparin 60 units/kg IV bolus."
            ]
        },
        {
            query: "Severe DKA with pH <7.30 and high anion gap",
            badge: "ENDOCRINOLOGY",
            icd: "ICD-10: E11.10",
            title: "Diabetic Ketoacidosis (DKA)",
            panel1Title: "Metabolic Profile & Acuity",
            panel1: [
                "<b>Primary Presentation:</b> Kussmaul breathing, severe dehydration, fruity breath.",
                "<b>Biochemical Triad:</b> Glucose >250 mg/dL, arterial pH <7.30, Bicarbonate <18 mEq/L.",
                "<b>Anion Gap:</b> >12 mEq/L with strongly positive beta-hydroxybutyrate."
            ],
            panel2Title: "Fluid & Electrolyte Resuscitation",
            panel2: [
                "<b>Volume Protocol:</b> 0.9% Normal Saline at 1000 mL/hr during initial hour.",
                "<b>Insulin Titration:</b> Regular Insulin 0.1 units/kg/hr infusion (Hold if K+ <3.3 mEq/L).",
                "<b>Potassium Repletion:</b> 20-30 mEq/L IV fluid once urine output confirmed."
            ]
        },
        {
            query: "Septic shock with MAP 52 mmHg refractory to fluids",
            badge: "CRITICAL CARE",
            icd: "ICD-10: R65.21",
            title: "Septic Shock / Multi-Organ Dysfunction",
            panel1Title: "Hemodynamic Assessment & Biomarkers",
            panel1: [
                "<b>Perfusion Deficit:</b> Serum Lactate >4.0 mmol/L with profound vasoplegia.",
                "<b>Diagnostic Criteria:</b> Refractory hypotension requiring vasopressors for MAP ≥65.",
                "<b>Organ Clearance:</b> Acute oliguria (<0.5 mL/kg/hr) with worsening base deficit."
            ],
            panel2Title: "Surviving Sepsis Campaign Protocol",
            panel2: [
                "<b>First-Line Pressor:</b> Norepinephrine continuous infusion at 0.05-0.5 mcg/kg/min.",
                "<b>Second-Line Adjunct:</b> Vasopressin fixed infusion at 0.03 units/min.",
                "<b>STAT Cultures & Coverage:</b> Meropenem 1g IV + Vancomycin 15-20 mg/kg load."
            ]
        },
        {
            query: "Calculate CrCl for 74yo female, 58kg, serum creatinine 2.4",
            badge: "CALCULATORS",
            icd: "ALGORITHM: CRCL",
            title: "Renal Function & Pharmacokinetic Clearance",
            panel1Title: "Mathematical Derivation (Cockcroft-Gault)",
            panel1: [
                "<b>Patient Parameters:</b> 74yo Female, Actual Weight: 58kg, Serum Creatinine: 2.4 mg/dL.",
                "<b>Formula:</b> [(140 - 74) × 58] / (72 × 2.4) × 0.85 (Female Sex Coefficient).",
                "<b>Calculated CrCl:</b> 18.8 mL/min (Stage 4 Severe Renal Impairment)."
            ],
            panel2Title: "Dosing Adjustments & Safety Matrix",
            panel2: [
                "<b>Enoxaparin (LMWH):</b> Reduce therapeutic dose to 1 mg/kg SC once daily (q24h).",
                "<b>Vancomycin:</b> 15 mg/kg loading dose, then dose strictly by pre-dialysis troughs.",
                "<b>Absolute Contraindications:</b> Discontinue Metformin and avoid systemic NSAIDs."
            ]
        },
        {
            query: "Status asthmaticus with acute severe bronchospasm",
            badge: "PULMONOLOGY",
            icd: "ICD-10: J45.902",
            title: "Status Asthmaticus / Acute Respiratory Failure",
            panel1Title: "Respiratory Mechanics & Red Flags",
            panel1: [
                "<b>Cardinal Signs:</b> Silent chest, paradoxical thoracoabdominal breathing, pulsus paradoxus.",
                "<b>Blood Gas Warning:</b> Normalizing or elevated PaCO2 indicates imminent respiratory fatigue.",
                "<b>Dynamic Hyperinflation:</b> Critical risk of barotrauma and hemodynamic collapse."
            ],
            panel2Title: "Emergency Bronchodilation Protocol",
            panel2: [
                "<b>Continuous Inhalation:</b> Albuterol 10-15 mg/hr + Ipratropium 0.5 mg continuous neb.",
                "<b>Systemic Steroids:</b> Methylprednisolone 60-125 mg IV bolus STAT.",
                "<b>Adjunctive Infusion:</b> Magnesium Sulfate 2g IV over 20 min + SubQ Terbutaline 0.25mg."
            ]
        },
        {
            query: "Heparin dosing protocol for acute pulmonary embolism",
            badge: "PHARMACOLOGY",
            icd: "ICD-10: I26.99",
            title: "Acute Pulmonary Embolism / Anticoagulation",
            panel1Title: "Thromboembolic Risk Stratification",
            panel1: [
                "<b>PESI Score High:</b> Tachycardia, hypoxemia (SpO2 89%), right ventricular strain on POCUS.",
                "<b>Hemodynamics:</b> Normotensive submassive PE without systemic cardiogenic shock.",
                "<b>Laboratory Targets:</b> Baseline aPTT, complete blood count, and platelet count."
            ],
            panel2Title: "Weight-Tiered Heparin Protocol",
            panel2: [
                "<b>STAT Bolus:</b> Unfractionated Heparin 80 units/kg IV push (max 10,000 units).",
                "<b>Maintenance Infusion:</b> 18 units/kg/hr continuous IV infusion.",
                "<b>Monitoring Schedule:</b> Check aPTT every 6 hours; titrate for goal aPTT 60-80 seconds."
            ]
        },
        {
            query: "RSI in severe trauma with anticipated difficult airway",
            badge: "ANESTHESIOLOGY",
            icd: "PROTOCOL: RSI",
            title: "Emergency Rapid Sequence Intubation",
            panel1Title: "Pre-Intubation Optimization & LEMON",
            panel1: [
                "<b>Aspiration Risk:</b> Full stomach protocol with inline manual cervical stabilization.",
                "<b>Pre-Oxygenation:</b> High-flow nasal cannula at 15 L/min for apneic oxygenation.",
                "<b>Equipment Ready:</b> Video laryngoscope, bougie, size 7.5 ETT, backup surgical airway."
            ],
            panel2Title: "Hemodynamically Neutral Drug Delivery",
            panel2: [
                "<b>Induction Agent:</b> Ketamine 1.5-2.0 mg/kg IV (preserves sympathetic vascular tone).",
                "<b>Paralytic Agent:</b> Rocuronium 1.2 mg/kg IV (alternative: Succinylcholine 1.5 mg/kg).",
                "<b>Verification:</b> Continuous waveform capnography showing 4-phase rectangular trace."
            ]
        },
        {
            query: "Hyperkalemia 7.2 mEq/L with peaked T waves on ECG",
            badge: "NEPHROLOGY",
            icd: "ICD-10: E87.5",
            title: "Severe Hyperkalemic Emergency",
            panel1Title: "Electrophysiological Threat & ECG",
            panel1: [
                "<b>ECG Progression:</b> Tall peaked T waves, flattened P waves, PR lengthening, wide QRS.",
                "<b>Fatal Risk:</b> Sine wave degeneration into ventricular fibrillation or asystole.",
                "<b>Etiology:</b> Acute on chronic renal failure with metabolic acidosis."
            ],
            panel2Title: "Three-Phase Membrane & Shift Protocol",
            panel2: [
                "<b>Phase 1 (Stabilize):</b> Calcium Gluconate 10% 30 mL (or Calcium Chloride 1g) IV over 3 min.",
                "<b>Phase 2 (Shift):</b> Regular Insulin 10 units IV + Dextrose 50% 50 mL (25g) push.",
                "<b>Phase 3 (Eliminate):</b> Furosemide 40-80mg IV + Sodium Zirconium (Lokelma) 10g PO."
            ]
        },
        {
            query: "Acute ischemic stroke within 90-minute thrombolytic window",
            badge: "NEUROLOGY",
            icd: "ICD-10: I63.9",
            title: "Acute Ischemic Stroke / Thrombolytic Protocol",
            panel1Title: "Neurovascular Triage & Non-Contrast CT",
            panel1: [
                "<b>Non-Contrast Head CT:</b> Intracranial hemorrhage ruled out; early ischemic changes.",
                "<b>Time Window:</b> Symptom onset 90 min (Well within 4.5-hour thrombolytic window).",
                "<b>Blood Pressure Target:</b> SBP <185 mmHg and DBP <110 mmHg verified before lysis."
            ],
            panel2Title: "Thrombolytic Therapy & Endovascular Transfer",
            panel2: [
                "<b>Tenecteplase (TNK):</b> 0.25 mg/kg IV bolus (max 25mg) over 5 seconds.",
                "<b>Alteplase Alternative:</b> 0.9 mg/kg total (10% bolus over 1 min, 90% over 60 min).",
                "<b>STAT Interventional:</b> Immediate CTA/CTP and transfer for emergent thrombectomy."
            ]
        },
        {
            query: "Acute anaphylactic shock with angioedema and hypotension",
            badge: "EMERGENCY",
            icd: "ICD-10: T78.2XXA",
            title: "Anaphylaxis / Severe Distributive Shock",
            panel1Title: "Diagnostic Criteria & Airway Acuity",
            panel1: [
                "<b>Multi-System Collapse:</b> Laryngeal stridor, diffuse urticaria, SBP 75 mmHg.",
                "<b>Pathophysiology:</b> Massive IgE-mediated mast cell degranulation & systemic vasodilation.",
                "<b>Airway Threat:</b> Rapidly progressive supraglottic angioedema requiring early intubation."
            ],
            panel2Title: "STAT Resuscitation Algorithm",
            panel2: [
                "<b>Immediate STAT Drug:</b> Epinephrine 1:1,000 (1 mg/mL) 0.5 mg IM in anterolateral thigh.",
                "<b>Volume Challenge:</b> Crystalloid 20-30 mL/kg rapid bolus via large-bore IVs.",
                "<b>Secondary Adjuncts:</b> Methylprednisolone 125mg IV + Diphenhydramine 50mg + Famotidine 20mg."
            ]
        }
    ];

    let currentCaseIdx = 0;
    const typewriterEl = document.getElementById("typewriterQuery");
    const contentBody = document.getElementById("mockupContentBody");
    const deckSubmitBtn = document.getElementById("deckSubmitBtn");

    const typeQuery = (text, onComplete) => {
        let i = 0;
        typewriterEl.textContent = "";
        const interval = setInterval(() => {
            if (i < text.length) {
                typewriterEl.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                setTimeout(onComplete, 1400);
            }
        }, 30);
    };

    const updateCard = (caseData) => {
        // Trigger simulated submit button press
        if (deckSubmitBtn) {
            deckSubmitBtn.classList.add("firing");
            setTimeout(() => deckSubmitBtn.classList.remove("firing"), 350);
        }

        contentBody.classList.add("switching");
        
        setTimeout(() => {
            const shortBadgeMap = {
                "CARDIOVASCULAR": "CARD",
                "ENDOCRINOLOGY": "ENDO",
                "CRITICAL CARE": "ICU",
                "CALCULATORS": "CALC",
                "PULMONOLOGY": "PULM",
                "PHARMACOLOGY": "PHARM",
                "ANESTHESIOLOGY": "ANESTH",
                "NEPHROLOGY": "NEPH",
                "NEUROLOGY": "NEUR",
                "EMERGENCY": "EMER"
            };
            const shortBadge = shortBadgeMap[caseData.badge] || caseData.badge.slice(0, 4);
            const shortIcd = caseData.icd.replace(/^(ICD-10|ALGORITHM|PROTOCOL):\s*/i, "");

            const cardBadgeEl = document.getElementById("cardBadge");
            if (cardBadgeEl) {
                cardBadgeEl.innerHTML = `<span class="tag-desktop">${caseData.badge}</span><span class="tag-mobile">${shortBadge}</span>`;
            }

            const cardIcdEl = document.getElementById("cardIcd");
            if (cardIcdEl) {
                cardIcdEl.innerHTML = `<span class="tag-desktop">${caseData.icd}</span><span class="tag-mobile">${shortIcd}</span>`;
            }
            document.getElementById("cardTitle").textContent = caseData.title;
            
            document.getElementById("cardPanel1Title").textContent = caseData.panel1Title;
            document.getElementById("cardPanel1List").innerHTML = caseData.panel1.map(item => `<li>${item}</li>`).join("");

            document.getElementById("cardPanel2Title").textContent = caseData.panel2Title;
            document.getElementById("cardPanel2List").innerHTML = caseData.panel2.map(item => `<li>${item}</li>`).join("");

            contentBody.classList.remove("switching");
        }, 300);
    };

    const runCaseCycle = () => {
        const activeCase = cases[currentCaseIdx];
        typeQuery(activeCase.query, () => {
            updateCard(activeCase);
            setTimeout(() => {
                currentCaseIdx = (currentCaseIdx + 1) % cases.length;
                runCaseCycle();
            }, 6500);
        });
    };

    if (typewriterEl && contentBody) {
        runCaseCycle();
    }

    /* ======================================================================
       7. LIQUID GLASS ENGINE & DUAL-SLIDER CONTROLLER
       ====================================================================== */
    window.applyLandingGlassDegree = function(val) {
        // Enforce 3-tier boundary: 1 = More Clear, 2 = Default, 3 = More Tinted
        let num = parseInt(val, 10);
        if (isNaN(num) || num < 1 || num > 3) num = 2;
        const degree = String(num);

        localStorage.setItem('ctx_glass_degree', degree);
        
        // Broadcast data-glass to both document root and body
        document.documentElement.setAttribute('data-glass', degree);
        document.body.setAttribute('data-glass', degree);

        const labels = { '1': 'MORE CLEAR', '2': 'DEFAULT', '3': 'MORE TINTED' };
        const label = labels[degree] || 'DEFAULT';

        // Sync Desktop Range Slider
        const desktopSlider = document.getElementById('desktopGlassSlider');
        if (desktopSlider && desktopSlider.value !== degree) {
            desktopSlider.value = degree;
        }

        // Sync Mobile Hamburger Range Slider
        const mobileSlider = document.getElementById('mobileGlassSlider');
        if (mobileSlider && mobileSlider.value !== degree) {
            mobileSlider.value = degree;
        }

        // Synchronize active dash tick styling across both bars
        ['inlineDashedRuler', 'mobileInlineDashedRuler'].forEach(rulerId => {
            const ruler = document.getElementById(rulerId);
            if (ruler) {
                ruler.querySelectorAll('.inline-dash-step').forEach(dash => {
                    if (dash.getAttribute('data-deg') === degree) {
                        dash.classList.add('is-active');
                    } else {
                        dash.classList.remove('is-active');
                    }
                });
            }
        });

        // Update button tooltip and accessible label
        const desktopGlassBtn = document.getElementById('glassQuickToggleBtn');
        if (desktopGlassBtn) {
            desktopGlassBtn.title = `Liquid Glass (${label})`;
            desktopGlassBtn.setAttribute('aria-label', `Liquid Glass (${label})`);
        }
    };

    // Initialize immediately on load (defaults to 2: DEFAULT)
    const initialGlassDegree = localStorage.getItem('ctx_glass_degree') || '2';
    window.applyLandingGlassDegree(initialGlassDegree);

    // Desktop: Inline Expanding Capsule Toggle
    const desktopGlassBtn = document.getElementById('glassQuickToggleBtn');
    const desktopExpander = document.getElementById('navGlassInlineExpander');

    if (desktopGlassBtn && desktopExpander) {
        desktopGlassBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isExpanded = desktopExpander.classList.toggle('is-expanded');

            // Close mobile menu if open
            if (isExpanded) {
                const mobDropdown = document.getElementById('mobileMenuOverlay');
                const mobBtn = document.getElementById('mobileMenuBtn');
                if (mobDropdown) mobDropdown.classList.remove('active');
                if (mobBtn) mobBtn.classList.remove('is-active');
            }
        });

        // Prevent clicks inside the chamber from closing it
        desktopExpander.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Dismiss when clicking anywhere outside
        document.addEventListener('click', (e) => {
            if (!desktopExpander.contains(e.target)) {
                desktopExpander.classList.remove('is-expanded');
            }
        });
    }

    // Bind real-time input events for instant feedback on both sliders
    const dSlider = document.getElementById('desktopGlassSlider');
    if (dSlider) {
        ['input', 'change'].forEach(evt => {
            dSlider.addEventListener(evt, (e) => {
                window.applyLandingGlassDegree(e.target.value);
            });
        });
    }

    const mSlider = document.getElementById('mobileGlassSlider');
    if (mSlider) {
        ['input', 'change'].forEach(evt => {
            mSlider.addEventListener(evt, (e) => {
                window.applyLandingGlassDegree(e.target.value);
            });
        });
    }
    
});