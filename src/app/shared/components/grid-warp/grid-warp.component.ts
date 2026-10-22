import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

// Quadrillage interactif : redessine sur un canvas le décor du mixin
// grid-backdrop (mêmes lignes, mêmes points, même pas) et le déforme sous la
// souris, comme si une bosse passait sous la surface et repoussait la grille.
// Au repos, aucune animation : le canvas n'est redessiné que pendant que la
// déformation évolue. Sans souris ou avec prefers-reduced-motion, le
// composant ne fait rien et le fond CSS d'origine reste affiché.

const LINE = 'rgba(191, 240, 0, 0.08)';
const DOT_ALPHA = 0.55;
const DOT_BOOST = 0.35; // luminosité ajoutée aux points au sommet de la bosse
const RADIUS = 110; // rayon de la bosse (px) : déplacement maximal à cette distance
const PUSH = 14; // déplacement maximal des points (px)
const FOLLOW = 0.09; // inertie du suivi du curseur (s)
const RISE = 0.25; // apparition de la bosse (s)
const FALL = 0.45; // retour au repos (s)

@Component({
  selector: 'app-grid-warp',
  standalone: true,
  template: '<canvas></canvas>',
  styles: [':host { display: block; overflow: hidden; } canvas { display: block; }'],
})
export class GridWarpComponent implements OnInit, OnDestroy {
  // Doit correspondre au pas du mixin grid-backdrop
  @Input() cell = 44;

  private host: HTMLElement = inject(ElementRef).nativeElement;
  private zone = inject(NgZone);
  private section: HTMLElement | null = null;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private dot!: HTMLCanvasElement; // point pré-rendu, identique au radial-gradient CSS
  private width = 0;
  private height = 0;
  private dpr = 1;

  // État de la bosse : position suivie (avec inertie), cible et amplitude
  private x = 0;
  private y = 0;
  private targetX = 0;
  private targetY = 0;
  private amp = 0;
  private targetAmp = 0;
  private pointer: { x: number; y: number } | null = null;

  private frame = 0;
  private last = 0;
  private visible = true;
  private cleanup: (() => void)[] = [];

  ngOnInit() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.section = this.host.parentElement;
    if (!fine || reduced || !this.section) return;

    this.canvas = this.host.querySelector('canvas')!;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;

    this.zone.runOutsideAngular(() => {
      const section = this.section!;
      const listen = (
        target: EventTarget,
        type: string,
        fn: (e: any) => void,
      ) => {
        target.addEventListener(type, fn, { passive: true });
        this.cleanup.push(() => target.removeEventListener(type, fn));
      };
      listen(section, 'pointermove', (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        this.pointer = { x: e.clientX, y: e.clientY };
        this.aim(true);
      });
      listen(section, 'pointerleave', () => {
        this.pointer = null;
        this.targetAmp = 0;
        this.start();
      });
      // Défilement sous un curseur immobile : la bosse reste sous le curseur
      listen(window, 'scroll', () => {
        if (this.pointer) this.aim(false);
      });

      const resize = new ResizeObserver(() => this.resize());
      resize.observe(this.host);
      this.cleanup.push(() => resize.disconnect());

      const io = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        if (!this.visible) {
          // Hors écran : plus de calcul, la grille retrouve son repos
          cancelAnimationFrame(this.frame);
          this.frame = 0;
          this.amp = this.targetAmp = 0;
          this.pointer = null;
          this.draw();
        }
      });
      io.observe(this.host);
      this.cleanup.push(() => io.disconnect());
    });

    this.resize();
    // Le canvas reproduit le fond : le décor CSS de la section peut s'effacer
    this.section.classList.add('has-grid-warp');
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.frame);
    this.cleanup.forEach((fn) => fn());
    this.section?.classList.remove('has-grid-warp');
  }

  // Nouvelle cible à partir de la dernière position connue du curseur
  private aim(fromMove: boolean) {
    if (!this.pointer) return;
    const rect = this.canvas.getBoundingClientRect();
    this.targetX = this.pointer.x - rect.left;
    this.targetY = this.pointer.y - rect.top;
    if (this.targetAmp === 0 && this.amp < 0.01 && fromMove) {
      // Entrée dans la section : la bosse naît sous le curseur
      this.x = this.targetX;
      this.y = this.targetY;
    }
    this.targetAmp = 1;
    this.start();
  }

  private start() {
    if (this.frame || !this.visible) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  private tick(now: number) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const ease = (tau: number) => 1 - Math.exp(-dt / tau);
    this.x += (this.targetX - this.x) * ease(FOLLOW);
    this.y += (this.targetY - this.y) * ease(FOLLOW);
    this.amp += (this.targetAmp - this.amp) * ease(this.targetAmp > this.amp ? RISE : FALL);

    const settledPos = Math.abs(this.targetX - this.x) < 0.1 && Math.abs(this.targetY - this.y) < 0.1;
    const settledAmp = Math.abs(this.targetAmp - this.amp) < 0.01;
    if (settledAmp) this.amp = this.targetAmp;
    if (settledPos) {
      this.x = this.targetX;
      this.y = this.targetY;
    }
    this.draw();
    // Plus rien n'évolue (curseur immobile ou grille revenue au repos) : arrêt
    this.frame = settledAmp && (settledPos || this.amp === 0) ? 0 : requestAnimationFrame((t) => this.tick(t));
  }

  private resize() {
    // Taille de mise en page (sans les transformations CSS d'une éventuelle
    // transition) ; canvas fixé en pixels entiers : jamais étiré, la grille
    // tombe exactement sur celle du fond CSS
    this.width = this.host.offsetWidth;
    this.height = this.host.offsetHeight;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.dot = this.makeDot();
    this.draw();
  }

  // Point du fond CSS : radial-gradient plein jusqu'à 1 px, transparent à
  // 1,6 px, centré sur un demi-pixel. Reproduit comme le navigateur le rend :
  // en haute densité, profil moyenné sur chaque pixel physique
  // (sur-échantillonnage 4×4) ; en densité 1, le navigateur l'adoucit
  // davantage (mesuré : 52 % à 1 px du centre, 27 % en diagonale, 0 à 2 px).
  private makeDot() {
    const size = 5; // px CSS
    const n = Math.round(size * this.dpr);
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = n;
    const c = sprite.getContext('2d')!;
    const img = c.createImageData(n, n);
    const center = (size / 2) * this.dpr;
    const profile = (d: number) => (d <= 1 ? 1 : d >= 1.6 ? 0 : (1.6 - d) / 0.6);
    const lowDensity = this.dpr < 1.5;
    const measured = (d: number) =>
      d <= 1 ? 1 - 0.48 * d : d <= Math.SQRT2 ? 0.52 - (0.255 * (d - 1)) / (Math.SQRT2 - 1) : Math.max(0, 0.265 * (2 - d) / (2 - Math.SQRT2));
    const sub = lowDensity ? 1 : 4;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let sum = 0;
        for (let sy = 0; sy < sub; sy++) {
          for (let sx = 0; sx < sub; sx++) {
            const dx = (x + (sx + 0.5) / sub - center) / this.dpr;
            const dy = (y + (sy + 0.5) / sub - center) / this.dpr;
            const d = Math.hypot(dx, dy);
            sum += lowDensity ? measured(d) : profile(d);
          }
        }
        const i = (y * n + x) * 4;
        img.data[i] = 191;
        img.data[i + 1] = 240;
        img.data[i + 2] = 0;
        img.data[i + 3] = Math.round((sum / (sub * sub)) * 255);
      }
    }
    c.putImageData(img, 0, 0);
    return sprite;
  }

  // Déplacement d'un point : poussée radiale vers l'extérieur, nulle au
  // centre, maximale à RADIUS, qui s'éteint sans bord (cloche gaussienne).
  // Renvoie aussi la « hauteur » de la bosse en ce point (0 à 1).
  private warp(px: number, py: number, out: { x: number; y: number; h: number }) {
    out.x = px;
    out.y = py;
    out.h = 0;
    if (this.amp === 0) return out;
    const dx = px - this.x;
    const dy = py - this.y;
    const d2 = dx * dx + dy * dy;
    const limit = RADIUS * 3.2;
    if (d2 > limit * limit) return out;
    const h = Math.exp(-d2 / (2 * RADIUS * RADIUS)) * this.amp;
    // k * r * exp(-r²/2R²) atteint PUSH en r = R
    const k = (PUSH / RADIUS) * Math.sqrt(Math.E);
    out.x = px + dx * k * h;
    out.y = py + dy * k * h;
    out.h = h;
    return out;
  }

  private draw() {
    const { ctx, cell, width, height } = this;
    if (!ctx || !width || !height) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const cols = Math.floor(width / cell);
    const rows = Math.floor(height / cell);
    const p = { x: 0, y: 0, h: 0 };
    const step = cell / 4; // lignes échantillonnées pour se courber en douceur
    // Zone déformée (au-delà, tracé droit, comme le fond CSS)
    const reach = RADIUS * 3.2;
    const active = this.amp > 0;
    const near = (a: number, center: number) => active && Math.abs(a - center) < reach;

    ctx.lineWidth = 1;
    ctx.strokeStyle = LINE;
    // Verticales puis horizontales (deux tracés) : comme les deux dégradés
    // CSS, les croisements s'additionnent
    ctx.beginPath();
    for (let i = 0; i <= cols; i++) {
      const lx = i * cell + 0.5;
      if (!near(lx, this.x)) {
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, height);
        continue;
      }
      for (let y = 0; y <= height; y += step) {
        this.warp(lx, y, p);
        if (y === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
    ctx.beginPath();
    for (let j = 0; j <= rows; j++) {
      const ly = j * cell + 0.5;
      if (!near(ly, this.y)) {
        ctx.moveTo(0, ly);
        ctx.lineTo(width, ly);
        continue;
      }
      for (let x = 0; x <= width; x += step) {
        this.warp(x, ly, p);
        if (x === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();

    // Points aux intersections, au-dessus des lignes
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        this.warp(i * cell + 0.5, j * cell + 0.5, p);
        ctx.globalAlpha = Math.min(1, DOT_ALPHA + DOT_BOOST * p.h);
        ctx.drawImage(this.dot, p.x - 2.5, p.y - 2.5, 5, 5);
      }
    }
    ctx.globalAlpha = 1;
  }
}
