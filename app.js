/**
 * Nathan Courbaron — Portfolio Engine
 * SPA Navigation, Multi-language (FR/EN), LaTeX KaTeX & FX
 */

(function () {
    // ==================== DICTIONNAIRE I18N ====================
    const translations = {
        fr: {
            navHome: "Accueil",
            navProjects: "Projets",
            navAbout: "À propos & CV",
            navContact: "Contact",
            hudSolver: "SOLVER: RUNGE-KUTTA 4TH ORDER • GEODESIC INTEGRATOR",
            hudObserver: "OBSERVER: ASYMPTOTIC REGION (r → ∞)",
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
            p3Desc: "Simulateur de trajectoires de particules massives et de photons autour d'un trou noir statique. Analyse analytique et tracé numérique des puits de potentiel effectif \\( V_{\\text{eff}}(r) \\).",
            p4Title: "Solveur Numérique Runge-Kutta 4",
            p4Desc: "Bibliothèque universelle *header-only* pour l'intégration d'équations différentielles ordinaires par la méthode RK4. Architecture légère conçue pour être intégrée directement dans divers moteurs physiques.",
            aboutTitle: "Parcours & Curriculum Vitae",
            aboutDesc: "Formation académique, compétences théoriques et lecteur PDF intégré.",
            aboutP1: "Actuellement en <strong>Licence de Physique Générale</strong>, mes projets s'orientent vers l'application du calcul scientifique à l'astrophysique relativiste et à la physique théorique.",
            aboutP2: "Mon approche combine rigueur de formalisation physique (mécanique analytique, calcul tensoriel, métrique de Schwarzschild) et implémentation algorithmique optimisée en <strong>C++ moderne</strong>.",
            cvViewerTitle: "Curriculum Vitae (Format PDF)",
            cvDownloadBtn: "Télécharger le PDF",
            contactTitle: "Contact & Réseaux",
            contactDesc: "Disponible pour des opportunités de stage d'initiation à la recherche et projets de modélisation numérique."
        },
        en: {
            navHome: "Home",
            navProjects: "Projects",
            navAbout: "About & CV",
            navContact: "Contact",
            hudSolver: "SOLVER: RUNGE-KUTTA 4TH ORDER • GEODESIC INTEGRATOR",
            hudObserver: "OBSERVER: ASYMPTOTIC REGION (r → ∞)",
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
            p3Desc: "Numerical simulator for massive particles and photon trajectories around a static black hole. Analytical evaluation and plotting of the effective potential well \\( V_{\\text{eff}}(r) \\).",
            p4Title: "Runge-Kutta 4th Order Solver Library",
            p4Desc: "A universal, header-only C++11 (and later) library for numerical integration of ordinary differential equations using the 4th-order Runge-Kutta (RK4) method.",
            aboutTitle: "Background & Curriculum Vitae",
            aboutDesc: "Academic background, theoretical proficiencies, and embedded PDF viewer.",
            aboutP1: "Currently pursuing a <strong>Bachelor's degree in General Physics</strong>, my work centers on the application of scientific computing to relativistic astrophysics and theoretical physics.",
            aboutP2: "My workflow unites analytical formalism (analytical mechanics, tensor calculus, Schwarzschild metric) with performance-oriented algorithmic design in <strong>modern C++</strong>.",
            cvViewerTitle: "Curriculum Vitae (PDF format)",
            cvDownloadBtn: "Download PDF",
            contactTitle: "Contact & Network",
            contactDesc: "Available for research internship opportunities and numerical simulation projects."
        }
    };

    let currentLang = localStorage.getItem('site_lang') || 'fr';

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        localStorage.setItem('site_lang', lang);

        // Mise à jour visuelle des labels FR / EN
        document.querySelectorAll('.lang-opt').forEach(opt => {
            opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });

        // Mise à jour de tous les textes marqués data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Relance KaTeX pour recalculer les équations insérées dynamiquement
        renderKaTeX();
    }

    function toggleLanguage() {
        setLanguage(currentLang === 'fr' ? 'en' : 'fr');
    }

    // ==================== RENDU LATEX ====================
    function renderKaTeX() {
        if (window.renderMathInElement) {
            window.renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    // ==================== NAVIGATION SPA AVEC TRANSITION ====================
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

        // 1. Sortie en fondu
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

            // 2. Entrée fluide
            nextSection.classList.add('entering');
            window.scrollTo({ top: 0, behavior: 'instant' });

            void nextSection.offsetWidth; // Forcer le reflow

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

    // ==================== ÉCOUTEURS D'ÉVÉNEMENTS ====================
    document.addEventListener('click', function (e) {
        // Clic sur le bouton de langue
        const langBtn = e.target.closest('#langSwitch');
        if (langBtn) {
            e.preventDefault();
            toggleLanguage();
            return;
        }

        // On ignore les vrais liens externes (GitHub, LinkedIn, Mailto, PDF download)
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

    // ==================== INITIALISATION ====================
    function init() {
        const initialHash = window.location.hash.replace('#', '') || 'home';
        navigateTo(initialHash, false);

        // Applique la langue sauvegardée
        setLanguage(currentLang);

        // Spotlight
        window.addEventListener('pointermove', function (e) {
            const x = (e.clientX / window.innerWidth) * 100 + '%';
            const y = (e.clientY / window.innerHeight) * 100 + '%';
            document.documentElement.style.setProperty('--spotlight-x', x);
            document.documentElement.style.setProperty('--spotlight-y', y);
        });

        // 3D Tilt
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

                card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.01, 1.01, 1.01)';
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