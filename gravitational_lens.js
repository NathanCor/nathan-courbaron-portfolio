/**
 * gravitational_lens.js
 * Lentille gravitationnelle de Schwarzschild appliquée au halo du curseur.
 * - Centre optique rigoureusement fixé à (50%, 50%).
 * - L'équation de lentille s'applique à deux anneaux sources virtuels.
 * - Le curseur UI (halo + point blanc) reste invariant et non affecté par la gravité.
 */

class CursorLensingEngine {
    constructor() {
        this.canvas = document.getElementById('lensSimulationCanvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'lensSimulationCanvas';
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');

        // Position de la sonde (souris)
        this.mouseX = -1000;
        this.mouseY = -1000;
        this.curX = -1000;
        this.curY = -1000;
        this.isActive = false;

        this.initEvents();
        this.resize();
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);

        // La caméra C++ cible l'origine, le trou noir est au centre exact
        this.bhX = window.innerWidth * 0.50;
        this.bhY = window.innerHeight * 0.50;

        // Paramètres optiques (calibrés sur l'échelle de ton raytracer 1080p)
        const scale = window.innerHeight / 1080;
        this.thetaE = 250 * scale; // Rayon d'Einstein apparent (b_c ~ 5.2M)
        this.rs = 100 * scale;     // Horizon numérique (r_s = 2M)
    }

    initEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('pointermove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if (!this.isActive) {
                this.curX = this.mouseX;
                this.curY = this.mouseY;
                this.isActive = true;
            }
        });
        window.addEventListener('pointerleave', () => {
            this.isActive = false;
        });
    }

    /**
     * Projette un cercle source (halo virtuel) dans le plan de l'observateur
     * via la solution exacte de la lentille de Schwarzschild.
     */
    drawLensedRing(sourceX, sourceY, radius, color, lineWidth, shadowBlur) {
        const steps = 300; // Haute résolution pour lisser l'arc
        const dpr = window.devicePixelRatio || 1;

        // ==================== 1. IMAGE PRIMAIRE (Thêta +) ====================
        this.ctx.beginPath();
        let prevX = -10000, prevY = -10000;

        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * Math.PI * 2;

            // Coordonnées du point sur le cercle source (Beta)
            const betaX = (sourceX - this.bhX) + radius * Math.cos(angle);
            const betaY = (sourceY - this.bhY) + radius * Math.sin(angle);
            const beta = Math.sqrt(betaX * betaX + betaY * betaY);
            const bSafe = Math.max(beta, 0.001);

            // Racine positive de l'équation de lentille
            const thetaPlus = (beta + Math.sqrt(beta * beta + 4 * this.thetaE * this.thetaE)) / 2;

            // Projection écran
            const px = this.bhX + (betaX / bSafe) * thetaPlus;
            const py = this.bhY + (betaY / bSafe) * thetaPlus;

            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                // Coupe le trait si l'anneau passe de l'autre côté de la singularité
                if (Math.abs(px - prevX) > this.thetaE || Math.abs(py - prevY) > this.thetaE) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            }
            prevX = px;
            prevY = py;
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = shadowBlur;
        this.ctx.stroke();

        // ==================== 2. IMAGE SECONDAIRE (Thêta -) ====================
        this.ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const angle = (i / steps) * Math.PI * 2;
            const betaX = (sourceX - this.bhX) + radius * Math.cos(angle);
            const betaY = (sourceY - this.bhY) + radius * Math.sin(angle);
            const beta = Math.sqrt(betaX * betaX + betaY * betaY);
            const bSafe = Math.max(beta, 0.001);

            // Racine négative (produit l'arc inversé à l'intérieur)
            const thetaMinus = (beta - Math.sqrt(beta * beta + 4 * this.thetaE * this.thetaE)) / 2;

            const px = this.bhX + (betaX / bSafe) * thetaMinus;
            const py = this.bhY + (betaY / bSafe) * thetaMinus;

            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                if (Math.abs(px - prevX) > this.thetaE || Math.abs(py - prevY) > this.thetaE) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            }
            prevX = px;
            prevY = py;
        }

        // Rendu visuel atténué pour l'image secondaire
        this.ctx.globalAlpha = 0.45;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth * 0.7;
        this.ctx.shadowBlur = Math.max(0, shadowBlur - 4);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
    }

    render() {
        const dpr = window.devicePixelRatio || 1;
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

        if (this.isActive) {
            // Suivi fluide du mouvement de la souris
            this.curX += (this.mouseX - this.curX) * 0.40;
            this.curY += (this.mouseY - this.curY) * 0.40;

            // ==================== 1. MASQUE DE LA SINGULARITÉ (HORIZON) ====================
            this.ctx.save();
            this.ctx.beginPath();
            // Masque couvrant l'écran SAUF le centre du trou noir (pour bloquer la lumière sous r_s)
            this.ctx.rect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
            this.ctx.arc(this.bhX, this.bhY, this.rs, 0, Math.PI * 2, true); // Anti-horaire = trou
            this.ctx.clip();

            // Trace les deux halos virtuels d'arrière-plan soumis à la gravité
            // Halo principal brillant (rayon virtuel 12)
            this.drawLensedRing(this.curX, this.curY, 12, '#00f0ff', 2.0, 10);
            // Halo extérieur fin et diffus (rayon virtuel 24)
            this.drawLensedRing(this.curX, this.curY, 24, '#00f0ff', 0.8, 4);

            this.ctx.restore(); // On retire le masque pour l'UI

            // ==================== 2. CURSEUR UI FIXÉ (INVARIANT PHYSIQUE) ====================
            this.ctx.save();

            // Halo cyan invariant fixé à la souris (ne se déforme jamais)
            this.ctx.beginPath();
            this.ctx.arc(this.curX, this.curY, 14, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
            this.ctx.lineWidth = 1.8;
            this.ctx.shadowColor = '#00f0ff';
            this.ctx.shadowBlur = 8;
            this.ctx.stroke();

            // Point blanc central de précision
            this.ctx.beginPath();
            this.ctx.arc(this.curX, this.curY, 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = 5;
            this.ctx.fill();

            this.ctx.restore();
        }

        requestAnimationFrame(this.render);
    }
}

// Initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CursorLensingEngine());
} else {
    new CursorLensingEngine();
}