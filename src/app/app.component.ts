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
  isDesktop = window.innerWidth >= 1280;

  constructor(private router: Router) {
    // Toujours scroll instantané en haut sur navigation
    this.router.events.subscribe((event) => {
      // if (event instanceof NavigationEnd) {
      //   window.scrollTo({ top: 0, behavior: 'auto' });
      // }

      window.addEventListener('resize', () => {
        this.isDesktop = window.innerWidth >= 1280;
      });
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
}
