/**
 * gravitational_lens.js  (v2)
 *
 * Lentille gravitationnelle appliquée au halo du curseur, cohérente avec le
 * raytracer C++ (blackhole_tracer_3d) :
 *   - même modèle de gravité : pseudo-potentiel de Paczynski-Wiita (rs = 2M)
 *   - même intégrateur      : RK4 à pas fixe DS = 0.09, 1100 pas max
 *   - même caméra           : distance 36.53 M, FOV vertical 0.58 rad
 *
 * Principe :
 *   1. Au démarrage, on lance ~1000 rayons depuis la caméra (CPU) et on tabule la
 *      fonction de déflexion  Delta(alpha)  (alpha = angle de visée par rapport au
 *      trou noir). C'est exactement ce que fait le raytracer pour le fond.
 *   2. À chaque frame, un fragment shader inverse la lentille pour CHAQUE pixel :
 *      pixel -> alpha -> direction source -> distance au curseur -> luminosité.
 *      Toutes les images (primaire, secondaire, anneaux d'ordre supérieur) sortent
 *      automatiquement, sans raccord ni cas particulier, et la brillance de surface
 *      est conservée comme dans une vraie lentille.
 *   3. Le curseur UI (halo + point blanc) reste dessiné en 2D, non déformé.
 */

const LENS = {
    // --- identiques au raytracer C++ ---
    M: 1.0,
    RS: 2.0,
    DS: 0.09,
    MAX_STEPS: 1100,
    R_ESCAPE: 48.0,
    R_CAPTURE: 2.0 * 1.008,
    CAM_DIST: Math.hypot(36.0, 6.2),   // ORBIT_RADIUS et CAM_ALTITUDE
    FOV_V: 0.58,                       // FOV vertical total (rad)
    // --- table de déflexion ---
    TABLE_SIZE: 1024,
    ALPHA_MAX: 0.8,                    // rad, au-delà : extrapolation en 1/sin(alpha)
    LOG_W: 1e-4                        // finesse d'échantillonnage près du bord de l'ombre
};

// Réglages esthétiques (modifiables sans toucher à la physique de la table)
const STYLE = {
    // Rayon de l'anneau d'Einstein = ce facteur x rayon de l'ombre (~257 px en 1080p).
    // 1.0 = collé à l'ombre ; ~1.3 = anneau serré autour du trou noir ; 2.0 = quasi la physique brute.
    EINSTEIN_RATIO: 1.30,
    // Dispersion prismatique : écart relatif de déflexion entre les 3 teintes (0 = aucune)
    DISPERSION: 0.06,
    OPACITY: 1.3,
    // Halo attaché au curseur : son image principale est centrée sur le vrai curseur.
    HALO_RING_RADIUS: 30.0,   // px écran
    // 0 = le halo reste rond autour du curseur ; 1 = déformation complète par la lentille
    DISTORTION: 0.5
};

/* ------------------------------------------------------------------ */
/*  Tracé d'un rayon (2D dans le plan contenant l'axe caméra-trou noir) */
/* ------------------------------------------------------------------ */

// Même dérivée que computeDerivative() dans main.cpp
function lensAcc(x, z) {
    const r = Math.hypot(x, z);
    if (r <= LENS.RS) return [0, 0];
    const f = -LENS.M / ((r - LENS.RS) * (r - LENS.RS) * r);
    return [x * f, z * f];
}

/**
 * Lance un rayon depuis la caméra (0, D) avec un angle alpha par rapport à l'axe
 * caméra->trou noir. Retourne l'angle gamma (signé) de la direction finale par
 * rapport à l'axe "derrière le trou noir", ou null si le rayon est capturé /
 * n'est pas sorti en MAX_STEPS (le raytracer le laisse noir dans ce cas).
 */
function traceRay(alpha) {
    let x = 0.0, z = LENS.CAM_DIST;
    let vx = Math.sin(alpha), vz = -Math.cos(alpha);
    const h = LENS.DS;

    for (let step = 0; step < LENS.MAX_STEPS; step++) {
        const r = Math.hypot(x, z);
        if (r <= LENS.R_CAPTURE) return null;
        if (r > LENS.R_ESCAPE) return Math.atan2(vx, -vz);

        // RK4 sur (position, vitesse)
        const [a1x, a1z] = lensAcc(x, z);
        const k1x = vx, k1z = vz;

        const [a2x, a2z] = lensAcc(x + 0.5 * h * k1x, z + 0.5 * h * k1z);
        const k2x = vx + 0.5 * h * a1x, k2z = vz + 0.5 * h * a1z;

        const [a3x, a3z] = lensAcc(x + 0.5 * h * k2x, z + 0.5 * h * k2z);
        const k3x = vx + 0.5 * h * a2x, k3z = vz + 0.5 * h * a2z;

        const [a4x, a4z] = lensAcc(x + h * k3x, z + h * k3z);
        const k4x = vx + h * a3x, k4z = vz + h * a3z;

        x  += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        z  += (h / 6) * (k1z + 2 * k2z + 2 * k3z + k4z);
        vx += (h / 6) * (a1x + 2 * a2x + 2 * a3x + a4x);
        vz += (h / 6) * (a1z + 2 * a2z + 2 * a3z + a4z);
    }
    return null;
}

/** Delta(alpha) et dDelta/dalpha (même interpolation que dans le shader). */
function deflectionAt(table, alpha) {
    const { delta, aMin, sMax, N } = table;
    const aMax = aMin + LENS.LOG_W * (Math.exp(sMax) - 1);
    if (alpha >= aMax) {
        const d = delta[N - 1] * Math.sin(aMax) / Math.sin(alpha);
        return [d, -d * Math.cos(alpha) / Math.sin(alpha)];
    }
    const x = Math.log(1 + Math.max(alpha - aMin, 0) / LENS.LOG_W) / sMax * (N - 1);
    const i = Math.min(Math.floor(x), N - 2), fr = x - i;
    const d0 = delta[i], d1 = delta[i + 1];
    return [d0 * (1 - fr) + d1 * fr, (d1 - d0) * (N - 1) / ((alpha - aMin + LENS.LOG_W) * sMax)];
}

/**
 * Construit la table Delta(alpha) = alpha - gamma(alpha), échantillonnée en
 * échelle logarithmique à partir du plus petit alpha dont le rayon s'échappe.
 */
function buildDeflectionTable() {
    const N = LENS.TABLE_SIZE;

    // Bord de l'ombre : plus petit alpha dont le rayon sort dans le budget de pas
    let lo = 0.02, hi = 0.4;
    for (let i = 0; i < 50; i++) {
        const mid = 0.5 * (lo + hi);
        if (traceRay(mid) === null) lo = mid; else hi = mid;
    }
    // Petit décalage : exactement sur la frontière, la sortie en MAX_STEPS est bruitée
    const aMin = hi + 3e-6;
    const sMax = Math.log(1 + (LENS.ALPHA_MAX - aMin) / LENS.LOG_W);

    const alphas = new Float64Array(N);
    const raw = new Float64Array(N);
    for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        alphas[i] = aMin + LENS.LOG_W * (Math.exp(u * sMax) - 1);
        const g = traceRay(alphas[i]);
        raw[i] = alphas[i] - (g === null ? 0 : g);
    }

    // Dépliage de la phase depuis les grands alpha (Delta ~ 0) vers le bord de l'ombre
    const TWO_PI = 2 * Math.PI;
    const delta = new Float32Array(N);
    delta[N - 1] = raw[N - 1] - TWO_PI * Math.round(raw[N - 1] / TWO_PI);
    for (let i = N - 2; i >= 0; i--) {
        const prev = delta[i + 1];
        delta[i] = raw[i] + TWO_PI * Math.round((prev - raw[i]) / TWO_PI);
    }

    // Gain de déflexion : place l'anneau d'Einstein (alpha = gain * Delta) au rayon voulu
    const aT = Math.atan(STYLE.EINSTEIN_RATIO * Math.tan(aMin));
    const x = Math.log(1 + (aT - aMin) / LENS.LOG_W) / sMax * (N - 1);
    const i = Math.min(Math.floor(x), N - 2), fr = x - i;
    const dT = delta[i] * (1 - fr) + delta[i + 1] * fr;
    const gain = aT / dT;

    return { delta, aMin, sMax, N, gain };
}

/* ------------------------------------------------------------------ */
/*  Shader                                                              */
/* ------------------------------------------------------------------ */

const LENS_VERT = `#version 300 es
void main() {
    // triangle plein écran
    vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const LENS_FRAG = `#version 300 es
precision highp float;
precision highp sampler2D;   // évite une troncature de la table float sur mobile

uniform sampler2D uTab;
uniform float uCanvasH;   // hauteur du canvas en pixels device
uniform float uRatio;     // pixels device par pixel CSS
uniform vec2  uBH;        // centre du trou noir (px CSS)
uniform float uF;         // focale en px CSS
uniform float uAMin;
uniform float uW;
uniform float uSMax;
uniform int   uN;
uniform float uRhoEdge;   // rayon apparent de l'ombre (px CSS)
uniform float uGain;      // gain de déflexion (esthétique)
uniform float uDisp;      // dispersion prismatique
uniform float uOpacity;
uniform float uRingR;     // rayon de l'anneau du halo (px écran)
uniform vec2  uSrc[3];    // position SOURCE du halo pour chaque teinte (px CSS)
uniform vec2  uQ;         // direction trou noir -> curseur
uniform vec4  uJac;       // (source/écran radial, tangentiel au curseur ; étirement radial, tangentiel du halo)
uniform float uFade;      // atténuation du halo quand le curseur approche de l'ombre
uniform float uRim;       // 1 quand le curseur est dans l'ombre : le bord s'illumine côté curseur
uniform vec3  uColA;      // teinte côté intérieur
uniform vec3  uColB;      // teinte centrale
uniform vec3  uColC;      // teinte côté extérieur

out vec4 outColor;

float tabAt(int i) { return texelFetch(uTab, ivec2(clamp(i, 0, uN - 1), 0), 0).r; }

// Delta(alpha) et sa dérivée dDelta/dalpha
float deflection(float alpha, out float dDelta) {
    float aMax = uAMin + uW * (exp(uSMax) - 1.0);
    if (alpha >= aMax) {
        float d = tabAt(uN - 1) * sin(aMax) / sin(alpha);
        dDelta = -d * cos(alpha) / sin(alpha);
        return d;
    }
    float s  = log(1.0 + max(alpha - uAMin, 0.0) / uW);
    float x  = (s / uSMax) * float(uN - 1);
    int   i  = int(floor(x));
    float fr = x - float(i);
    float d0 = tabAt(i), d1 = tabAt(i + 1);
    dDelta = (d1 - d0) * float(uN - 1) / ((alpha - uAMin + uW) * uSMax);
    return mix(d0, d1, fr);
}

// Gaussienne 2D anti-aliasée (largeur + empreinte d'un pixel, énergie conservée)
float blob(vec2 w, vec2 fpw, float sig, float amp) {
    vec2 s = sqrt(vec2(sig * sig) + 0.5 * fpw * fpw);
    vec2 z = w / s;
    return amp * exp(-0.5 * dot(z, z)) * (sig * sig / (s.x * s.y));
}

// Halo du curseur, exprimé en pixels écran "de conception" autour de son image principale
float halo(vec2 w, vec2 fpw) {
    float rr = length(w);
    float fm = max(fpw.x, fpw.y);
    if (rr > 260.0 + 4.0 * fm) return 0.0;

    float I = blob(w, fpw, 3.0, 0.55) + blob(w, fpw, 20.0, 0.24) + blob(w, fpw, 50.0, 0.05);

    // anneau fin : largeur mesurée le long de la normale
    vec2 n = w / max(rr, 1e-4);
    float fn = length(n * fpw);
    float w0 = 1.0;
    float wd = sqrt(w0 * w0 + 0.5 * fn * fn);
    float x = (rr - uRingR) / wd;
    return I + 0.55 * exp(-0.5 * x * x) * (w0 / wd);
}

// Luminosité vue par un pixel pour la teinte k (gain de déflexion propre à la teinte)
float shade(int k, float gain, float alpha, float rho, vec2 rh, float delta, float dD) {
    float gamma = alpha - gain * delta;
    float cg = cos(gamma);
    if (cg < 0.05) return 0.0;
    float tg = sin(gamma) / cg;

    // position du point source correspondant, projetée sur l'écran "non lentillé"
    vec2 v = uBH + rh * (uF * tg) - uSrc[k];
    vec2 qp = vec2(-uQ.y, uQ.x);

    // empreinte d'un pixel écran dans le plan source (radial / tangentiel)
    float sr = abs(1.0 - gain * dD) * uF * uF * (1.0 + tg * tg) / (uF * uF + rho * rho);
    float st = uF * abs(tg) / max(rho, 1.0);

    // on se ramène aux pixels du halo autour de l'image principale (centrée sur le curseur)
    vec2 w   = vec2(dot(v, uQ) / uJac.x, dot(v, qp) / uJac.y) / uJac.zw;
    vec2 fpw = 0.5 * vec2(sr / uJac.x, st / uJac.y) / uJac.zw;
    return halo(w, fpw);
}

void main() {
    vec2 p = vec2(gl_FragCoord.x, uCanvasH - gl_FragCoord.y) / uRatio;
    vec2 d = p - uBH;
    float rho = length(d);

    // Ombre : aucun rayon ne vient de là (identique au fond raytracé)
    float edge = smoothstep(uRhoEdge - 0.5, uRhoEdge + 1.0, rho);
    if (edge <= 0.0 || (uFade <= 0.0 && uRim <= 0.0)) { outColor = vec4(0.0); return; }

    float alpha = atan(rho, uF);
    float dD;
    float delta = deflection(alpha, dD);
    vec2 rh = d / max(rho, 1e-4);

    // Trois teintes, trois déflexions légèrement différentes -> liseré prismatique
    float Ia = shade(0, uGain * (1.0 - uDisp), alpha, rho, rh, delta, dD);
    float Ib = shade(1, uGain,                 alpha, rho, rh, delta, dD);
    float Ic = shade(2, uGain * (1.0 + uDisp), alpha, rho, rh, delta, dD);

    float k = uOpacity * edge * uFade;
    vec3 col = (Ia * uColA + Ib * uColB + Ic * uColC) * k;
    col += vec3(0.35) * max(Ib - 1.0, 0.0) * edge * uFade;   // coeur chaud

    // Curseur dans l'ombre : le trou noir "attrape" le halo, le bord s'illumine dans sa direction
    if (uRim > 0.0) {
        float dth = atan(abs(rh.x * uQ.y - rh.y * uQ.x), dot(rh, uQ));
        float ang = exp(-0.5 * (dth / 0.30) * (dth / 0.30));
        float rad = rho - uRhoEdge;
        float gA = exp(-max(rad, 0.0) / 5.0), gB = exp(-max(rad, 0.0) / 9.0), gC = exp(-max(rad, 0.0) / 16.0);
        col += (gA * uColA + gB * uColB + gC * uColC) * (0.85 * ang * uRim * edge);
    }

    float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
    outColor = vec4(min(col, vec3(a)), a);   // alpha prémultiplié
}`;

/* ------------------------------------------------------------------ */
/*  Moteur                                                              */
/* ------------------------------------------------------------------ */

// Ordre des couches : vidéo (0) < overlay (1) < HALO (5) < contenu <main> (10) < HUD (20) < nav (50) < CURSEUR.
const LAYERS = { HALO: 5, CURSOR: 2147483647 };

class CursorLensingEngine {
    constructor() {
        this.canvas = document.getElementById('lensSimulationCanvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'lensSimulationCanvas';
            document.body.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');

        // Couche du halo : sous le contenu (texte, boutons), au-dessus du fond
        Object.assign(this.canvas.style, {
            position: 'fixed', inset: '0', width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: String(LAYERS.HALO)
        });

        // Couche du curseur : au-dessus de TOUT (boutons, nav, etc.)
        this.cursorCanvas = document.createElement('canvas');
        this.cursorCanvas.id = 'lensCursorCanvas';
        Object.assign(this.cursorCanvas.style, {
            position: 'fixed', inset: '0', width: '100vw', height: '100vh',
            pointerEvents: 'none', zIndex: String(LAYERS.CURSOR)
        });
        document.body.appendChild(this.cursorCanvas);
        this.cctx = this.cursorCanvas.getContext('2d');

        this.mouseX = -1000; this.mouseY = -1000;
        this.curX = -1000;   this.curY = -1000;
        this.isActive = false;
        this.lastT = performance.now();

        this.initGL();
        this.initEvents();
        this.resize();
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    /* ---------- WebGL2 hors écran (recopié dans le canvas 2D existant) ---------- */
    initGL() {
        this.gl = null;
        const glCanvas = document.createElement('canvas');
        const gl = glCanvas.getContext('webgl2', {
            alpha: true, premultipliedAlpha: true, antialias: false, depth: false
        });
        if (!gl) {
            console.warn('[lens] WebGL2 indisponible : seul le curseur UI est affiché.');
            return;
        }

        const compile = (type, src) => {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, src);
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                console.error('[lens] shader :', gl.getShaderInfoLog(sh));
                return null;
            }
            return sh;
        };
        const vs = compile(gl.VERTEX_SHADER, LENS_VERT);
        const fs = compile(gl.FRAGMENT_SHADER, LENS_FRAG);
        if (!vs || !fs) return;

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('[lens] link :', gl.getProgramInfoLog(prog));
            return;
        }

        // Table de déflexion (calcul CPU unique, quelques dizaines de ms)
        this.table = buildDeflectionTable();
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, this.table.N, 1, 0, gl.RED, gl.FLOAT, this.table.delta);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.useProgram(prog);
        this.u = {};
        for (const n of ['uTab', 'uCanvasH', 'uRatio', 'uBH', 'uF', 'uAMin', 'uW', 'uSMax', 'uN',
            'uRhoEdge', 'uGain', 'uDisp', 'uOpacity', 'uRingR', 'uSrc', 'uQ', 'uJac',
            'uFade', 'uRim', 'uColA', 'uColB', 'uColC']) {
            this.u[n] = gl.getUniformLocation(prog, n);
        }
        gl.uniform1i(this.u.uTab, 0);
        gl.uniform1f(this.u.uAMin, this.table.aMin);
        gl.uniform1f(this.u.uW, LENS.LOG_W);
        gl.uniform1f(this.u.uSMax, this.table.sMax);
        gl.uniform1i(this.u.uN, this.table.N);
        gl.uniform1f(this.u.uGain, this.table.gain);
        gl.uniform1f(this.u.uDisp, STYLE.DISPERSION);
        gl.uniform1f(this.u.uOpacity, STYLE.OPACITY);
        gl.uniform1f(this.u.uRingR, STYLE.HALO_RING_RADIUS);
        // menthe (intérieur), cyan #00f0ff (centre), bleu-violet (extérieur)
        gl.uniform3f(this.u.uColA, 0.00, 0.50, 0.40);
        gl.uniform3f(this.u.uColB, 0.00, 0.70, 0.85);
        gl.uniform3f(this.u.uColC, 0.20, 0.30, 0.60);

        gl.disable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0);
        this.glCanvas = glCanvas;
        this.gl = gl;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth, h = window.innerHeight;
        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.ctx.scale(dpr, dpr);
        this.cursorCanvas.width = w * dpr;
        this.cursorCanvas.height = h * dpr;
        this.cctx.scale(dpr, dpr);

        // Le trou noir est au centre exact de la vue
        this.bhX = w * 0.5;
        this.bhY = h * 0.5;

        // Focale (px CSS) : même règle que le raytracer (FOV vertical 0.58 rad).
        // Équivaut à l'ancien scale = innerHeight / 1080.
        this.focal = (h * 0.5) / Math.tan(LENS.FOV_V * 0.5);

        if (this.gl) {
            this.glRatio = Math.min(dpr, 2);
            this.glCanvas.width = Math.round(w * this.glRatio);
            this.glCanvas.height = Math.round(h * this.glRatio);
            this.gl.viewport(0, 0, this.glCanvas.width, this.glCanvas.height);
            this.rhoEdge = this.focal * Math.tan(this.table.aMin);
        }
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
        // 'pointerleave' ne se déclenche pas sur window : on l'écoute sur <html>
        document.documentElement.addEventListener('pointerleave', () => { this.isActive = false; });
    }

    /**
     * Le halo est paramétré par la position de son IMAGE PRINCIPALE : elle est centrée sur le vrai
     * curseur. On remonte la lentille pour trouver la position source correspondante (une par
     * teinte), et le jacobien local pour que le halo garde une taille de conception.
     */
    updateHaloMapping() {
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        const f = this.focal;
        const qx = this.curX - this.bhX, qy = this.curY - this.bhY;
        const rc = Math.hypot(qx, qy);
        const qh = rc > 1e-3 ? [qx / rc, qy / rc] : [1, 0];

        // Le curseur dans l'ombre : le halo reste accroché au bord (aucun rayon ne vient de l'intérieur)
        const rEff = Math.max(rc, this.rhoEdge + 1.0);
        const alpha = Math.atan(rEff / f);
        const [delta, dD] = deflectionAt(this.table, alpha);

        const g = this.table.gain, disp = STYLE.DISPERSION;
        const src = new Float32Array(6);
        [g * (1 - disp), g, g * (1 + disp)].forEach((gk, k) => {
            const gam = clamp(alpha - gk * delta, -1.5, 1.5);
            const t = f * Math.tan(gam);
            src[2 * k] = this.bhX + qh[0] * t;
            src[2 * k + 1] = this.bhY + qh[1] * t;
        });

        const tg = Math.tan(clamp(alpha - g * delta, -1.5, 1.5));
        const srC = clamp(Math.abs(1 - g * dD) * f * f * (1 + tg * tg) / (f * f + rEff * rEff), 0.15, 8);
        const stC = clamp(f * Math.abs(tg) / rEff, 0.15, 8);
        const k = STYLE.DISTORTION;
        const ar = clamp(Math.pow(1 / srC, k), 0.55, 1.9);
        const at = clamp(Math.pow(1 / stC, k), 0.55, 1.9);

        const t = clamp((rc / this.rhoEdge - 0.30) / 0.65, 0, 1);
        const fade = t * t * (3 - 2 * t);

        // 1 dans l'ombre, 0 à l'extérieur (transition autour du bord)
        const u = clamp((rc / this.rhoEdge - 0.75) / 0.30, 0, 1);
        const rim = 1 - u * u * (3 - 2 * u);

        return { src, qh, jac: [srC, stC, ar, at], fade, rim };
    }

    drawLens() {
        const gl = this.gl;
        if (!gl) return;
        const m = this.updateHaloMapping();
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(this.u.uCanvasH, this.glCanvas.height);
        gl.uniform1f(this.u.uRatio, this.glRatio);
        gl.uniform2f(this.u.uBH, this.bhX, this.bhY);
        gl.uniform1f(this.u.uF, this.focal);
        gl.uniform1f(this.u.uRhoEdge, this.rhoEdge);
        gl.uniform2fv(this.u.uSrc, m.src);
        gl.uniform2f(this.u.uQ, m.qh[0], m.qh[1]);
        gl.uniform4f(this.u.uJac, m.jac[0], m.jac[1], m.jac[2], m.jac[3]);
        gl.uniform1f(this.u.uFade, m.fade);
        gl.uniform1f(this.u.uRim, m.rim);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        this.ctx.drawImage(this.glCanvas, 0, 0, window.innerWidth, window.innerHeight);
    }

    render(now) {
        const dpr = window.devicePixelRatio || 1;
        const dt = Math.min(0.05, (now - this.lastT) / 1000);
        this.lastT = now;
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
        this.cctx.clearRect(0, 0, this.cursorCanvas.width / dpr, this.cursorCanvas.height / dpr);

        if (this.isActive) {
            // Suivi fluide indépendant de la fréquence d'affichage (≈ 0.40 par frame à 60 Hz)
            const k = 1 - Math.exp(-dt * 30);
            this.curX += (this.mouseX - this.curX) * k;
            this.curY += (this.mouseY - this.curY) * k;

            // 1. Images lentillées du halo source
            this.drawLens();

            // 2. Curseur UI invariant (jamais déformé)
            this.cctx.save();
            this.cctx.beginPath();
            this.cctx.arc(this.curX, this.curY, 14, 0, Math.PI * 2);
            this.cctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
            this.cctx.lineWidth = 1.8;
            this.cctx.shadowColor = '#00f0ff';
            this.cctx.shadowBlur = 8;
            this.cctx.stroke();

            this.cctx.beginPath();
            this.cctx.arc(this.curX, this.curY, 2.5, 0, Math.PI * 2);
            this.cctx.fillStyle = '#ffffff';
            this.cctx.shadowColor = '#ffffff';
            this.cctx.shadowBlur = 5;
            this.cctx.fill();
            this.cctx.restore();
        }

        requestAnimationFrame(this.render);
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new CursorLensingEngine());
    } else {
        new CursorLensingEngine();
    }
}
if (typeof module !== 'undefined') module.exports = { LENS, STYLE, traceRay, buildDeflectionTable, deflectionAt };