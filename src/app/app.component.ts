import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { slider } from './shared/animations/slider.animation';
import { fadeOverlay } from './shared/animations/fade-overlay.animation';
import { BandAniamtionComponent } from './shared/components/band-aniamtion/band-aniamtion.component';
import { NgIf } from '@angular/common';
import { WelcomeComponent } from './pages/welcome/welcome/welcome.component';
import { mobileFade } from './shared/services/mobile-fade.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BandAniamtionComponent, NgIf, WelcomeComponent],
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

      <main
        [@slider]="isDesktop ? prepareRoute(outlet) : null"
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
          window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // // ✅ Force le scroll quand l'animation termine
  // (@mobileFade.done)="onMobileFadeDone()"

  // onMobileFadeDone() {
  //   if (!this.isDesktop && this.hasNavigated) {
  //     window.scrollTo(0, 0);
  //     document.documentElement.scrollTop = 0;
  //     document.body.scrollTop = 0;
  //   }
  // }

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
