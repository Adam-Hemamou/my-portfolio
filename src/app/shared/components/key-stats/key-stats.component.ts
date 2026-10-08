import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';
import { ProjectService } from '../../services/project.service';

type KeyStat = {
  label: string;
  // Valeur affichée (animée) et valeur finale (lue par les lecteurs d'écran)
  display: string;
  final: string;
  // Absent pour une valeur non numérique (∞)
  target?: number;
  minDigits?: number;
  emoji?: string;
};

const COUNT_DURATION_MS = 1200;
const COUNT_VISIBLE_RATIO = 0.5;

@Component({
  selector: 'app-key-stats',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './key-stats.component.html',
  styleUrls: ['./key-stats.component.scss'],
})
export class KeyStatsComponent implements OnInit, OnDestroy {
  private host: HTMLElement = inject(ElementRef).nativeElement;
  private projects = inject(ProjectService).getProjects();
  private observer?: IntersectionObserver;
  private frame?: number;
  private destroyed = false;

  isVisible = false;

  // Les deux premiers chiffres sont calculés à partir des projets réels
  stats: KeyStat[] = [
    this.counter(this.projects.length, 'PROJETS PRÉSENTÉS', 2),
    this.counter(this.countTools(), 'TECHNOLOGIES UTILISÉES', 2),
    { display: '∞', final: '∞', label: 'BUGS COMBATTUS' },
    { ...this.counter(1000, 'CAFÉS SACRIFIÉS'), emoji: '☕' },
  ];

  ngOnInit() {
    const reducedMotion =
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      this.isVisible = true;
      this.showFinalValues();
      return;
    }

    // Fondu dès que la section apparaît ; comptage seulement quand
    // au moins la moitié de la section est réellement à l'écran.
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.isVisible = true;
          }
          if (entry.intersectionRatio >= COUNT_VISIBLE_RATIO) {
            this.observer?.disconnect();
            this.whenAncestorsAreStill().then(() => this.count());
          }
        }
      },
      { threshold: [0, COUNT_VISIBLE_RATIO] }
    );
    this.observer.observe(this.host);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.observer?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  // Une seule fois : incrémente les valeurs numériques de 0 à leur valeur finale
  private count() {
    if (this.destroyed) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      for (const stat of this.stats) {
        if (stat.target !== undefined) {
          stat.display = this.format(
            Math.round(stat.target * eased),
            stat.minDigits
          );
        }
      }
      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.showFinalValues();
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  private showFinalValues() {
    for (const stat of this.stats) {
      stat.display = stat.final;
    }
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

  private counter(target: number, label: string, minDigits = 1): KeyStat {
    return {
      label,
      target,
      minDigits,
      display: this.format(0, minDigits),
      final: this.format(target, minDigits),
    };
  }

  private countTools(): number {
    const names = this.projects.flatMap(
      (p) => p.outils?.map((o) => o.name) ?? []
    );
    return new Set(names).size;
  }

  // +06, +14, +1 000 (espace insécable pour les milliers)
  private format(value: number, minDigits = 1): string {
    const digits = String(value)
      .padStart(minDigits, '0')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `+${digits}`;
  }
}
