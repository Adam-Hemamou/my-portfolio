import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import type { SculptureScene } from './sculpture-scene';

const MAX_FRAME_DELTA = 0.05;

@Component({
  selector: 'app-hero-sculpture',
  standalone: true,
  template: '',
  styleUrls: ['./hero-sculpture.component.scss'],
  host: { 'aria-hidden': 'true' },
})
export class HeroSculptureComponent implements AfterViewInit, OnDestroy {
  private host: HTMLElement = inject(ElementRef).nativeElement;
  private zone = inject(NgZone);

  private sculpture?: SculptureScene;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private removalObserver?: MutationObserver;
  private motionQuery?: MediaQueryList;
  private frame?: number;
  private lastTime = 0;
  private isOnScreen = true;
  private reducedMotion = false;
  private destroyed = false;

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;
    // Hors zone Angular : aucune détection de changements à chaque image
    this.zone.runOutsideAngular(() => this.init());
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.motionQuery?.removeEventListener('change', this.onMotionChange);
    window.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('visibilitychange', this.syncLoop);

    // Changement de route : Angular détruit le composant tout de suite, mais
    // garde la page sortante dans le DOM pendant son animation :leave (slider
    // desktop, fondu mobile). La sculpture reste donc affichée et animée
    // jusqu'au retrait effectif du nœud, puis tout est libéré.
    if (!this.sculpture || !this.host.isConnected) {
      this.release();
      return;
    }
    // Hors zone Angular, comme la boucle : sinon chaque mutation du DOM
    // pendant la transition relancerait la détection de changements, qui
    // modifierait le DOM à son tour (boucle sans fin)
    this.zone.runOutsideAngular(() => {
      this.removalObserver = new MutationObserver(() => {
        if (!this.host.isConnected) this.release();
      });
      this.removalObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
      if (!this.reducedMotion) this.start();
    });
  }

  // Libère la boucle et toutes les ressources Three.js / WebGL
  private release() {
    this.stop();
    this.removalObserver?.disconnect();
    this.removalObserver = undefined;
    this.sculpture?.canvas.removeEventListener(
      'webglcontextlost',
      this.onContextLost,
    );
    this.sculpture?.dispose();
    this.sculpture = undefined;
  }

  private async init() {
    if (!this.supportsWebGL()) {
      this.host.classList.add('is-unavailable');
      return;
    }

    try {
      // Three.js est chargé à part : le bundle initial n'est pas alourdi
      const { createSculptureScene } = await import('./sculpture-scene');
      // Le maillage est calculé sur le processeur (~0,1 s) : on attend un
      // moment calme pour ne pas saccader les animations d'entrée du hero
      await this.whenIdle();
      if (this.destroyed) return;
      const lowPower = window.matchMedia('(max-width: 1023px)').matches;
      this.sculpture = createSculptureScene(this.host, lowPower);
    } catch {
      this.host.classList.add('is-unavailable');
      return;
    }

    this.sculpture.canvas.addEventListener(
      'webglcontextlost',
      this.onContextLost,
    );

    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = this.motionQuery.matches;
    this.motionQuery.addEventListener('change', this.onMotionChange);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();

    // La boucle ne tourne que si le hero est à l'écran et l'onglet visible
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.isOnScreen = entries[entries.length - 1].isIntersecting;
      this.syncLoop();
    });
    this.intersectionObserver.observe(this.host);
    document.addEventListener('visibilitychange', this.syncLoop);

    // Réaction à la souris uniquement avec un vrai pointeur (pas au tactile)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove', this.onPointerMove, {
        passive: true,
      });
    }

    this.host.classList.add('is-ready');
    this.syncLoop();
  }

  private whenIdle(): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => resolve(), { timeout: 1200 });
      } else {
        setTimeout(resolve, 300);
      }
    });
  }

  private supportsWebGL(): boolean {
    try {
      const context = document.createElement('canvas').getContext('webgl2');
      context?.getExtension('WEBGL_lose_context')?.loseContext();
      return !!context;
    } catch {
      return false;
    }
  }

  private resize() {
    const { clientWidth, clientHeight } = this.host;
    if (!this.sculpture || !clientWidth || !clientHeight) return;
    this.sculpture.resize(clientWidth, clientHeight);
    this.sculpture.render(0);
  }

  private syncLoop = () => {
    if (this.isOnScreen && !document.hidden && !this.reducedMotion) {
      this.start();
    } else {
      this.stop();
    }
  };

  private start() {
    if (this.frame !== undefined || !this.sculpture) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private stop() {
    if (this.frame === undefined) return;
    cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }

  private tick = (now: number) => {
    const delta = Math.min((now - this.lastTime) / 1000, MAX_FRAME_DELTA);
    this.lastTime = now;
    this.sculpture?.render(delta);
    this.frame = requestAnimationFrame(this.tick);
  };

  private onPointerMove = (event: PointerEvent) => {
    this.sculpture?.setPointer(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1,
    );
  };

  // prefers-reduced-motion : image fixe, sans boucle ni suivi de la souris
  private onMotionChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    if (event.matches) this.sculpture?.setPointer(0, 0);
    this.syncLoop();
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.host.classList.add('is-unavailable');
  };
}
