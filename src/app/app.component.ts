import { Component } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { slider } from './shared/animations/slider.animation';
import { fadeOverlay } from './shared/animations/fade-overlay.animation';
import { BandAniamtionComponent } from './shared/components/band-aniamtion/band-aniamtion.component';
import { NgIf } from '@angular/common';
import { WelcomeComponent } from './pages/welcome/welcome/welcome.component';
import { mobileFade } from './shared/services/mobile-fade.service';
import { DoNotClickComponent } from './shared/components/do-not-click/do-not-click.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BandAniamtionComponent,
    NgIf,
    WelcomeComponent,
    DoNotClickComponent,
  ],
  template: `
    <app-welcome
      *ngIf="showWelcome"
      (welcomeCompleted)="onWelcomeCompleted()"
    ></app-welcome>

    <div *ngIf="!showWelcome">
      <div
        class="browser-nav-overlay"
        *ngIf="isBrowserNavigation && isDesktop"
        [@fadeOverlay]
      ></div>

      <app-band-animation *ngIf="isDesktop"></app-band-animation>

      <!-- Fenêtres DO NOT CLICK hors de <main> : jamais prises dans les transitions.
           Le bouton, lui, est dans les pages (app-do-not-click-trigger). -->
      <app-do-not-click></app-do-not-click>

      <main
        [class.is-transitioning]="isTransitioning"
        [@slider]="isDesktop ? prepareRoute(outlet) : null"
        (@slider.start)="onSliderStart($event)"
        (@slider.done)="onSliderDone($event)"
        [@mobileFade]="!isDesktop ? prepareRoute(outlet) : null"
      >
        <router-outlet #outlet="outlet"></router-outlet>
      </main>
    </div>
  `,
  animations: [slider, fadeOverlay, mobileFade],
  styles: [
    `
      .browser-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        pointer-events: none;
      }
    `,
  ],
})
export class AppComponent {
  hasNavigated = false;
  isDesktop = window.innerWidth >= 1024;
  showWelcome = true;
  isBrowserNavigation = false;
  private firstNavigation = true;
  private runningSlides = 0;

  get isTransitioning() {
    return this.runningSlides > 0;
  }

  constructor(private router: Router) {
    window.addEventListener('popstate', () => {
      this.isBrowserNavigation = true;
    });

    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        if (this.isBrowserNavigation) {
          setTimeout(() => {
            this.isBrowserNavigation = false;
          }, 600);
        }

        // ✅ AJOUTE ça pour forcer scroll sur mobile !
        if (window.innerWidth < 1024 && !this.firstNavigation) {
          // ✅ Attendre que l'animation fade soit finie (500ms + marge)
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 5);
        }

        if (this.firstNavigation) {
          this.firstNavigation = false;
        } else {
          this.hasNavigated = true;
        }
      }
    });

    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth >= 1024;
    });
  }

  onWelcomeCompleted() {
    this.showWelcome = false;
  }

  // Seules les vraies transitions de slide (durée > 0) activent l'état
  onSliderStart(event: AnimationEvent) {
    if (event.totalTime > 0) {
      this.runningSlides++;
    }
  }

  onSliderDone(event: AnimationEvent) {
    if (event.totalTime > 0) {
      this.runningSlides = Math.max(0, this.runningSlides - 1);
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    if (!outlet.isActivated) return '';

    if (this.isBrowserNavigation) {
      return 'browserNav';
    }

    if (!this.hasNavigated) {
      return '';
    }

    return outlet.activatedRoute;
  }
}
