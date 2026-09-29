/**
 * Nathan Courbaron — Portfolio Engine
 * SPA Router, i18n (FR/EN), KaTeX LaTeX, Live Telemetry,
 * Proper Time Dilation & Complete Physics Easter Eggs.
 */

(function () {
    // ==================== DICTIONNAIRE I18N ====================
    const translations = {
        fr: {
            navHome: "Accueil",
            navProjects: "Projets",
            navAbout: "À propos & CV",
            navContact: "Contact",
            heroDesc: "Étudiant en physique générale & calcul scientifique. Conception de simulations relativistes, intégration numérique de géodésiques et algorithmes graphiques C++ haute performance.",
            heroBtnProjects: "Explorer les simulations →",
            heroBtnCv: "Consulter le CV",
            projectsTitle: "Simulations & Travaux Numériques",
            projectsDesc: "Calcul scientifique, relativité générale et rendu graphique haute performance en C++.",
            badgeBackground: "Simulation de fond",
            p1Title: "Rendu Relativiste & Orbite Caméra 3D",
            p1Desc: "Moteur de rendu en C++20 visualisant un trou noir avec son disque d'accrétion sous une trajectoire orbitale à 360°. Conversion des images avec un rendu dithered deux tons.",
            p2Title: "Tracé de Rayons en Espace-Temps Courbe",
            p2Desc: "Intégration numérique RK4 des géodésiques nulles \\( \\frac{d^2 x^\\mu}{d\\lambda^2} + \\Gamma^\\mu_{\\alpha\\beta} \\frac{dx^\\alpha}{d\\lambda} \\frac{dx^\\beta}{d\\lambda} = 0 \\). Prise en compte du décalage Doppler relativiste, du redshift gravitationnel et tramage Floyd-Steinberg.",
            p3Title: "Trajectoires & Potentiel Effectif",
            p3Desc: "Simulateur de trajectoires de particules massives et de photons autour d'un trou noir statique. Analyse analytique et tracé numérique des puits de potentiel effectif \\(V_{\\text{eff}}(r) \\).",
            p4Title: "Solveur Numérique Runge-Kutta 4",
            p4Desc: "Bibliothèque universelle pour l'intégration d'équations différentielles ordinaires par la méthode RK4. Architecture légère conçue pour être intégrée directement dans divers moteurs physiques.",
            aboutTitle: "Parcours & Curriculum Vitae",
            aboutDesc: "Formation académique, compétences théoriques.",
            aboutP1: "Actuellement en <strong id=\"physicsEasterEgg\" style=\"cursor: help;\">Licence de Physique générale</strong>, mes projets s'orientent vers l'application du calcul scientifique à l'astrophysique relativiste et à la physique théorique.",
            aboutP2: "Mon approche combine rigueur de formalisation physique (mécanique analytique, calcul tensoriel, métrique de Schwarzschild) et implémentation algorithmique optimisée en <strong>C++ moderne</strong>.",
            aboutBooks: "La relativité générale est pour moi un apprentissage <strong>autonome</strong>, mené à partir de <em>A First Course in General Relativity</em> (B. Schutz) et de <em>Relativité générale pour débutants</em> (M. Le Bellac), complétés par <em>An Introduction to Modern Astrophysics</em> (B. W. Carroll & D. A. Ostlie) pour l'astrophysique. Mes projets en sont la mise en pratique numérique.",
            cvViewerTitle: "Curriculum Vitae (Format PDF)",
            cvDownloadBtn: "Télécharger le PDF",
            contactTitle: "Contact & Réseaux",
            contactDesc: "Disponible pour des opportunités de stage d'initiation à la recherche et projets de modélisation numérique.",

            // --- Attributs / accessibilité ---
            langAria: "Changer de langue",
            tensorTitle: "Cliquez pour perturber la métrique",
            calabiTitle: "Compactification spatiale",
            clockCoordTitle: "Temps coordonné (observateur à l'infini)",
            clockProperTitle: "Temps propre sous le curseur",
            cvFrameTitle: "Curriculum Vitae de Nathan Courbaron",

            // --- HUD ---
            hudMetric: "MÉTRIQUE",
            hudCoord: "COORD. LOCALE",
            hudLapse: "LAPSE",
            hudRedshift: "DÉCALAGE VERS LE ROUGE",

            // --- Section secrète : singularité ---
            singTag: "VIOLATION DE LA CENSURE COSMIQUE",
            singTitle: "Intérieur de l'Horizon (\\( r &lt; 2M \\))",
            singCoords: "Coordonnées de Kruskal-Szekeres : la singularité \\( r = 0 \\) correspond à \\( U \\cdot V = 1 \\)",
            singCard1Title: "Métrique Inversée",
            singCard1Text: "Dans cette région, la coordonnée radiale \\( r \\) devient de genre temps et \\( t \\) de genre espace : la singularité n'est plus un lieu, mais un instant inéluctable.",
            singCard2Title: "Invariants de Courbure",
            singCard2Text: "Le scalaire de Kretschmann diverge irrémédiablement vers l'infini au point central :",
            singBack: "&larr; Traverser le pont d'Einstein-Rosen (Retour)",

            // --- Messages des easter eggs ---
            toastPhysics: "Signature métrique : \\(\\eta_{\\mu\\nu} = \\text{diag}(-1, 1, 1, 1) \\) &bull; Symboles de Christoffel calculés.",
            toastHorizon: "ALERTE : traversée de l'horizon des événements ! (\\( r &lt; 2M \\))",
            toastKerr: "Horizon des événements dissous : \\( a/M > 1 \\) &bull; État de singularité nue !",
            toastCalabiOn: "Variété de Calabi-Yau à 6 dimensions compactifiée à l'échelle des cordes \\( M_s \\)",
            toastCalabiOff: "Espace-temps décompactifié à 3+1 dimensions",
            toastKonami: "EFFONDREMENT GRAVITATIONNEL COMPLET : singularité atteinte !",
            tensorMsgs: [
                "GW260929 : amplitude de déformation \\( h \\sim 10^{-21} \\) détectée par interférométrie laser",
                "Métrique perturbée : \\( \\delta g_{\\mu\\nu} = h_{\\mu\\nu} e^{i k_\\alpha x^\\alpha} \\)",
                "Conservation de l'énergie ADM : flux tensoriel évacué à l'infini",
                "Échelle de Planck sondée : \\( \\ell_P = \\sqrt{\\frac{\\hbar G}{c^3}} \\approx 1.616 \\times 10^{-35}\\,\\text{m} \\)"
            ]
        },
        en: {
            navHome: "Home",
            navProjects: "Projects",
            navAbout: "About & CV",
            navContact: "Contact",
            heroDesc: "Undergraduate student in general physics & scientific computing. Developing relativistic simulations, numerical geodesic integration, and high-performance C++ graphics algorithms.",
            heroBtnProjects: "Explore Simulations →",
            heroBtnCv: "View Resume",
            projectsTitle: "Simulations & Numerical Works",
            projectsDesc: "Scientific computing, general relativity, and high-performance rendering in modern C++.",
            badgeBackground: "Background simulation",
            p1Title: "Relativistic Rendering & 3D Camera Orbit",
            p1Desc: "A C++20 ray tracer rendering a stylized black hole with an accretion disk, seen by a camera in a full 360° orbit. Frames are converted to a two-tone ordered-dither look.",
            p2Title: "Curved Spacetime Ray Marching",
            p2Desc: "RK4 numerical integration of null geodesics \\( \\frac{d^2 x^\\mu}{d\\lambda^2} + \\Gamma^\\mu_{\\alpha\\beta} \\frac{dx^\\alpha}{d\\lambda} \\frac{dx^\\beta}{d\\lambda} = 0 \\). Accounting for relativistic Doppler shift, gravitational redshift, and Floyd-Steinberg error diffusion dithering.",
            p3Title: "Orbital Trajectories & Effective Potential",
            p3Desc: "Numerical simulator for massive particles and photon trajectories around a static black hole. Analytical evaluation and plotting of the effective potential well \\(V_{\\text{eff}}(r) \\).",
            p4Title: "Runge-Kutta 4th Order Solver Library",
            p4Desc: "A universal, header-only C++11 (and later) library for numerical integration of ordinary differential equations using the 4th-order Runge-Kutta (RK4) method. Its lightweight architecture is designed to plug directly into a variety of physics engines.",
            aboutTitle: "Background & Curriculum Vitae",
            aboutDesc: "Academic background, theoretical proficiencies.",
            aboutP1: "Currently pursuing a <strong id=\"physicsEasterEgg\" style=\"cursor: help;\">Bachelor's degree in General Physics</strong>, my work centers on the application of scientific computing to relativistic astrophysics and theoretical physics.",
            aboutP2: "My workflow unites analytical formalism (analytical mechanics, tensor calculus, Schwarzschild metric) with performance-oriented algorithmic design in <strong>modern C++</strong>.",
            aboutBooks: "General relativity is a <strong>self-directed</strong> study for me, built on <em>A First Course in General Relativity</em> (B. Schutz) and <em>Relativité générale pour débutants</em> (M. Le Bellac), complemented by <em>An Introduction to Modern Astrophysics</em> (B. W. Carroll & D. A. Ostlie) for the astrophysics. My projects are the numerical practice of that study.",
            cvViewerTitle: "Curriculum Vitae (PDF format)",
            cvDownloadBtn: "Download PDF",
            contactTitle: "Contact & Network",
            contactDesc: "Available for research internship opportunities and numerical simulation projects.",

            // --- Attributes / accessibility ---
            langAria: "Switch language",
            tensorTitle: "Click to perturb the metric",
            calabiTitle: "Spatial compactification",
            clockCoordTitle: "Coordinate time (observer at infinity)",
            clockProperTitle: "Proper time under the cursor",
            cvFrameTitle: "Nathan Courbaron's Curriculum Vitae",

            // --- HUD ---
            hudMetric: "METRIC",
            hudCoord: "LOCAL COORD",
            hudLapse: "LAPSE",
            hudRedshift: "REDSHIFT",

            // --- Secret section: singularity ---
            singTag: "COSMIC CENSORSHIP VIOLATION",
            singTitle: "Inside the Horizon (\\( r &lt; 2M \\))",
            singCoords: "Kruskal-Szekeres coordinates: the singularity \\( r = 0 \\) corresponds to \\( U \\cdot V = 1 \\)",
            singCard1Title: "Inverted Metric",
            singCard1Text: "Inside the horizon, the radial coordinate \\( r \\) becomes timelike and \\( t \\) becomes spacelike: the singularity is no longer a place, but an unavoidable moment in time.",
            singCard2Title: "Curvature Invariants",
            singCard2Text: "The Kretschmann scalar diverges irreversibly to infinity at the central point:",
            singBack: "&larr; Cross the Einstein-Rosen bridge (Back)",

            // --- Easter egg messages ---
            toastPhysics: "Metric signature: \\(\\eta_{\\mu\\nu} = \\text{diag}(-1, 1, 1, 1) \\) &bull; Christoffel symbols computed.",
            toastHorizon: "WARNING: crossing the event horizon! (\\( r &lt; 2M \\))",
            toastKerr: "Event horizon dissolved: \\( a/M > 1 \\) &bull; Naked singularity state!",
            toastCalabiOn: "6-dimensional Calabi-Yau manifold compactified at the string scale \\( M_s \\)",
            toastCalabiOff: "Spacetime decompactified back to 3+1 dimensions",
            toastKonami: "COMPLETE GRAVITATIONAL COLLAPSE: singularity reached!",
            tensorMsgs: [
                "GW260929: strain amplitude \\( h \\sim 10^{-21} \\) detected by laser interferometry",
                "Perturbed metric: \\( \\delta g_{\\mu\\nu} = h_{\\mu\\nu} e^{i k_\\alpha x^\\alpha} \\)",
                "ADM energy conservation: tensor flux radiated away to infinity",
                "Planck scale probed: \\( \\ell_P = \\sqrt{\\frac{\\hbar G}{c^3}} \\approx 1.616 \\times 10^{-35}\\,\\text{m} \\)"
            ]
        }
    };

    let currentLang = 'fr';
    try {
        const saved = localStorage.getItem('site_lang');
        if (saved && translations[saved]) currentLang = saved;
    } catch (_) { /* stockage indisponible (navigation privée, etc.) */ }

    // Traduction d'une clé dans la langue courante (repli sur le français)
    function t(key) {
        const v = translations[currentLang][key];
        return v !== undefined ? v : translations.fr[key];
    }

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        try { localStorage.setItem('site_lang', lang); } catch (_) {}
        document.documentElement.lang = lang;

        document.querySelectorAll('.lang-opt').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key] !== undefined) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Attributs traduisibles : data-i18n-title / data-i18n-aria
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.getAttribute('data-i18n-title'));
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
        });

        renderKaTeX();
        attachDynamicEasterEggs();
    }

    function toggleLanguage() {
        setLanguage(currentLang === 'fr' ? 'en' : 'fr');
    }

    // ==================== RENDU LATEX ====================
    function renderKaTeX(root) {
        if (window.renderMathInElement) {
            window.renderMathInElement(root || document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '\\(', right: '\\)', display: false }
                ],
                throwOnError: false
            });
        }
    }

    // ==================== NAVIGATION SPA ====================
    let isTransitioning = false;

    function navigateTo(targetId, updateHistory) {
        if (updateHistory === undefined) updateHistory = true;
        if (isTransitioning) return;

        const currentSection = document.querySelector('.view-section.active');
        const nextSection = document.getElementById(targetId);

        if (!nextSection || currentSection === nextSection) return;

        isTransitioning = true;

        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === targetId);
        });

        if (currentSection) {
            currentSection.style.opacity = '0';
            currentSection.style.transform = 'translateY(-12px) scale(0.98)';
            currentSection.style.filter = 'blur(4px)';
        }

        setTimeout(() => {
            if (currentSection) {
                currentSection.classList.remove('active');
                currentSection.style.opacity = '';
                currentSection.style.transform = '';
                currentSection.style.filter = '';
            }

            nextSection.classList.add('entering');
            window.scrollTo({ top: 0, behavior: 'instant' });

            void nextSection.offsetWidth;

            nextSection.classList.remove('entering');
            nextSection.classList.add('active');

            if (updateHistory) {
                history.pushState(null, '', '#' + targetId);
            }

            setTimeout(() => {
                isTransitioning = false;
            }, 350);
        }, 180);
    }

    // ==================== ÉVÉNEMENTS GLOBAUX ====================
    document.addEventListener('click', function (e) {
        const langBtn = e.target.closest('#langSwitch');
        if (langBtn) {
            e.preventDefault();
            toggleLanguage();
            return;
        }

        if (e.target.closest('a')) {
            return;
        }

        const navBtn = e.target.closest('.nav-btn');
        if (navBtn) {
            const target = navBtn.getAttribute('data-target');
            if (target) {
                e.preventDefault();
                navigateTo(target);
                return;
            }
        }

        const actionBtn = e.target.closest('[data-navigate]');
        if (actionBtn) {
            const navTarget = actionBtn.getAttribute('data-navigate');
            if (navTarget) {
                e.preventDefault();
                navigateTo(navTarget);
                return;
            }
        }
    });

    window.addEventListener('popstate', function () {
        const hash = window.location.hash.replace('#', '') || 'home';
        navigateTo(hash, false);
    });

    // Toast de notification
    function showToast(message, duration = 3500) {
        const toast = document.getElementById('gravToast');
        if (!toast) return;
        toast.innerHTML = message;
        renderKaTeX(toast);
        toast.classList.add('visible');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove('visible'), duration);
    }

    function attachDynamicEasterEggs() {
        const physicsEgg = document.getElementById('physicsEasterEgg');
        if (physicsEgg && !physicsEgg._bound) {
            physicsEgg._bound = true;
            physicsEgg.addEventListener('click', () => {
                showToast(t('toastPhysics'), 4000);
            });
        }
    }

    // ==================== INITIALISATION ====================
    function init() {
        const initialHash = window.location.hash.replace('#', '') || 'home';
        navigateTo(initialHash, false);

        setLanguage(currentLang);

        // Relance de sécurité pour la vidéo d'arrière-plan
        const bgVideo = document.querySelector('.video-background');
        if (bgVideo) {
            bgVideo.play().catch(() => {
                window.addEventListener('pointerdown', () => bgVideo.play(), { once: true });
            });
        }

        // Télémétrie & Horloges
        const telR = document.getElementById('telemetry-r');
        const telAlpha = document.getElementById('telemetry-alpha');
        const telZ = document.getElementById('telemetry-z');
        const clockCoordEl = document.getElementById('clock-coord');
        const clockProperEl = document.getElementById('clock-proper');

        let tCoord = 0;
        let tauProper = 0;
        let lastFrameTime = performance.now();
        let currentAlpha = 1.0;

        function updateRelativityTelemetry(rPixels) {
            const r_M = Math.max(2.01, (rPixels / 75) * 2);
            const alpha = Math.sqrt(1 - (2 / r_M));
            const z = (1 / alpha) - 1;

            if (telR) telR.textContent = r_M.toFixed(2);
            if (telAlpha) telAlpha.textContent = alpha.toFixed(3);
            if (telZ) telZ.textContent = z < 10 ? z.toFixed(2) : '> 10';

            return alpha;
        }

        function formatClock(seconds) {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            const ms = Math.floor((seconds % 1) * 100);
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
        }

        window.addEventListener('pointermove', function (e) {
            const x = (e.clientX / window.innerWidth) * 100 + '%';
            const y = (e.clientY / window.innerHeight) * 100 + '%';
            document.documentElement.style.setProperty('--spotlight-x', x);
            document.documentElement.style.setProperty('--spotlight-y', y);

            // Calcul du lapse sous la souris
            const bhX = window.innerWidth * 0.50;
            const bhY = window.innerHeight * 0.53;
            const dx = e.clientX - bhX;
            const dy = e.clientY - bhY;
            const r = Math.sqrt(dx * dx + dy * dy);
            currentAlpha = updateRelativityTelemetry(r);
        });

        // Clic au centre de la singularité pour ouvrir la section secrète
        window.addEventListener('click', function (e) {
            const bhX = window.innerWidth * 0.50;
            const bhY = window.innerHeight * 0.53;
            const dist = Math.sqrt(Math.pow(e.clientX - bhX, 2) + Math.pow(e.clientY - bhY, 2));

            // Ne pas déclencher quand on clique sur un bouton, lien ou la navigation
            if (e.target.closest('a, button, .btn, nav, .tensor-badge')) return;

            const currentSection = document.querySelector('.view-section.active');
            if (dist < 35 && currentSection && currentSection.id === 'home') {
                navigateTo('singularity');
                showToast(t('toastHorizon'), 4000);
            }
        });

        // Horloge différentielle
        function updateClockLoop() {
            const now = performance.now();
            const dt = (now - lastFrameTime) / 1000;
            lastFrameTime = now;

            tCoord += dt;
            tauProper += dt * currentAlpha;

            if (clockCoordEl) clockCoordEl.textContent = formatClock(tCoord);
            if (clockProperEl) clockProperEl.textContent = formatClock(tauProper);

            requestAnimationFrame(updateClockLoop);
        }
        requestAnimationFrame(updateClockLoop);

        // ==================== EASTER EGGS ====================

        // 1. Tenseur d'Einstein
        const tensorBadge = document.getElementById('tensorEgg');
        if (tensorBadge) {
            let eggIdx = 0;

            tensorBadge.addEventListener('click', () => {
                const msgs = t('tensorMsgs');
                showToast(msgs[eggIdx % msgs.length], 3600);
                eggIdx++;
            });
        }

        // 2. Compactification Calabi-Yau & Théorie des Cordes
        const calabiEgg = document.getElementById('calabiEgg');
        if (calabiEgg) {
            let tenD = false; // état explicite (plutôt que de chercher "10" dans le HTML rendu par KaTeX)
            calabiEgg.addEventListener('click', () => {
                tenD = !tenD;
                calabiEgg.innerHTML = tenD
                    ? 'DIM: \( D = 10 \) <span class="hidden-dims">[Heterotic \( E_8 \times E_8 \)]</span>'
                    : 'DIM: \( D = 3+1 \) <span class="hidden-dims">(+6)</span>';
                renderKaTeX(calabiEgg);
                showToast(t(tenD ? 'toastCalabiOn' : 'toastCalabiOff'), 3200);
            });
        }

        // 3. Maj+clic sur les cartes de projets : singularité nue de Kerr
        //    (le double-clic déclenchait deux ouvertures du lien GitHub)
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.shiftKey) return;
                e.preventDefault();
                card.style.borderColor = '#ef4444';
                card.style.boxShadow = '0 0 35px rgba(239, 68, 68, 0.4)';
                showToast(t('toastKerr'), 3200);
                setTimeout(() => {
                    card.style.borderColor = '';
                    card.style.boxShadow = '';
                }, 2800);
            });
        });

        // 4. Konami Code (Haut, Haut, Bas, Bas, Gauche, Droite, Gauche, Droite, B, A)
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;

        window.addEventListener('keydown', (e) => {
            if (!e.key) return;
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    konamiIndex = 0;
                    // Sur <html> : un filtre sur <body> casserait les éléments position:fixed
                    const root = document.documentElement;
                    root.style.transition = 'filter 1.2s ease';
                    root.style.filter = 'invert(1) hue-rotate(180deg) contrast(1.4)';
                    showToast(t('toastKonami'), 4500);
                    setTimeout(() => {
                        root.style.filter = '';
                    }, 5000);
                }
            } else {
                // Une mauvaise touche relance la séquence (mais peut être le 1er ArrowUp)
                konamiIndex = (key === konamiCode[0]) ? 1 : 0;
            }
        });

        // ==================== TILT 3D CARTES PROJETS ====================
        const tiltCards = document.querySelectorAll('[data-tilt]');
        tiltCards.forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--card-mouse-x', x + 'px');
                card.style.setProperty('--card-mouse-y', y + 'px');

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3.5;
                const rotateY = ((x - centerX) / centerX) * 3.5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
            });

            card.addEventListener('pointerleave', function () {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                card.style.setProperty('--card-mouse-x', '-500px');
                card.style.setProperty('--card-mouse-y', '-500px');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
