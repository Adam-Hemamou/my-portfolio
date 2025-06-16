import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { slider } from './shared/animations/slider.animation';
import { BandAniamtionComponent } from './shared/components/band-aniamtion/band-aniamtion.component';
import { NgIf } from '@angular/common';
// import { BandAniamtionComponent } from './shared/components/animate-band/animate-band.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BandAniamtionComponent, NgIf],
  template: `
    <app-band-animation *ngIf="isDesktop"></app-band-animation>
    <main [@slider]="isDesktop ? prepareRoute(outlet) : null">
      <router-outlet #outlet="outlet"></router-outlet>
    </main>
  `,
  animations: [slider],
})
export class AppComponent {
  hasNavigated = false;
  isDesktop = window.innerWidth >= 1024;
  private firstNavigation = true;

  constructor(private router: Router) {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        if (window.innerWidth < 1024) {
          await this.smoothScrollToTop();
        }
        if (this.firstNavigation) {
          this.firstNavigation = false;
        } else {
          this.hasNavigated = true;
        }
      }
      window.addEventListener('resize', () => {
        this.isDesktop = window.innerWidth >= 1024;
      });
    });
  }

  private smoothScrollToTop(): Promise<void> {
    return new Promise((resolve) => {
      const start = window.scrollY;
      if (start === 0) {
        resolve();
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(resolve, 400);
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return this.hasNavigated && outlet.isActivated ? outlet.activatedRoute : '';
  }
}
