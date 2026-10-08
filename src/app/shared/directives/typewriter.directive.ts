import {
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

const CHAR_DELAY_MS = 80;

/**
 * Effet machine à écrire : le texte complet reste dans le DOM,
 * seule la partie pas encore "tapée" est rendue transparente.
 * Usage : <h1 appTypewriter="Mon titre"></h1>
 */
@Directive({
  selector: '[appTypewriter]',
  standalone: true,
})
export class TypewriterDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appTypewriter') text = '';

  private host: HTMLElement = inject(ElementRef).nativeElement;
  private zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private timer?: ReturnType<typeof setInterval>;
  private initialized = false;
  private destroyed = false;

  ngOnInit() {
    this.initialized = true;

    const reducedMotion =
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !this.text) {
      this.showFullText();
      return;
    }

    const chars = Array.from(this.text);
    const typed = document.createElement('span');
    const rest = document.createElement('span');
    rest.className = 'typewriter-rest';
    rest.textContent = this.text;
    this.host.replaceChildren(typed, rest);

    // Démarre quand le titre est réellement affiché à l'écran
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.observer?.disconnect();
          this.whenAncestorsAreStill().then(() =>
            this.type(chars, typed, rest)
          );
        }
      });
      this.observer.observe(this.host);
    });
  }

  ngOnChanges() {
    // Texte modifié après coup : on affiche directement la nouvelle valeur
    if (this.initialized) {
      this.showFullText();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.stop();
  }

  // Attend la fin réelle des animations en cours sur les parents (transition de page)
  private whenAncestorsAreStill(): Promise<unknown> {
    const running: Promise<unknown>[] = [];
    let el = this.host.parentElement;
    while (el) {
      for (const animation of el.getAnimations?.() ?? []) {
        const endTime = animation.effect?.getComputedTiming().endTime;
        if (animation.playState === 'running' && endTime !== Infinity) {
          running.push(animation.finished.catch(() => undefined));
        }
      }
      el = el.parentElement;
    }
    return Promise.all(running);
  }

  private type(chars: string[], typed: HTMLElement, rest: HTMLElement) {
    if (this.destroyed) return;
    let count = 0;
    this.timer = setInterval(() => {
      count++;
      typed.textContent = chars.slice(0, count).join('');
      rest.textContent = chars.slice(count).join('');
      if (count >= chars.length) {
        this.showFullText();
      }
    }, CHAR_DELAY_MS);
  }

  private showFullText() {
    this.stop();
    this.host.textContent = this.text;
  }

  private stop() {
    this.observer?.disconnect();
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}
