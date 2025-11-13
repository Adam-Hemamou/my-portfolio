import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { slideInBands } from '../../animations/slide-in-bands.animations';
import { BandNavigationService } from '../../services/band-navigation.service';

@Component({
  selector: 'app-band-animation',
  imports: [NgIf, NgFor, NgStyle, RouterModule],
  templateUrl: './band-aniamtion.component.html',
  styleUrls: ['./band-aniamtion.component.scss'],
  animations: [slideInBands],
})
export class BandAniamtionComponent {
  bands = [
    { name: 'Contact', route: 'contact' },
    { name: 'Mes projets', route: 'project' },
    { name: 'À propos', route: 'about' },
    { name: 'Accueil', route: '' },
  ];

  hoveredBandIndex: number | null = null;
  activeBandIndex: number | null = null;
  isVisible: boolean = true;
  currentRoute: string = '';

  constructor(private router: Router, private bandNav: BandNavigationService) {} // ✅ Garde le service

  ngOnInit() {
    // ✅ Garde registerHandler car c'est utilisé ailleurs
    this.bandNav.registerHandler(this.goToBandByRoute.bind(this));
    this.currentRoute = this.router.url.substring(1);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = this.router.url.substring(1);
      }
    });
  }

  onHover(index: number) {
    this.hoveredBandIndex = index;
  }

  onLeave() {
    this.hoveredBandIndex = null;
  }

  // ✅ Garde goToBandByRoute car c'est appelé par le service
  public goToBandByRoute(route: string, targetRoute?: any[]) {
    const index = this.bands.findIndex((b) => b.route === route);
    if (index !== -1) {
      this.onClick(index, targetRoute);
    }
  }

  onClick(index: number, targetRoute?: any[]) {
    if (this.bands[index].route === this.currentRoute && !targetRoute) {
      return;
    }

    // ✅ Supprime juste notifyBandClick()
    this.activeBandIndex = index;

    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.navigateToBand(index, targetRoute);
      }, 200);
    } else {
      this.navigateToBand(index, targetRoute);
    }
  }

  private navigateToBand(index: number, targetRoute?: any[]) {
    setTimeout(() => {
      const routeToNavigate = targetRoute ?? [this.bands[index].route];
      this.router.navigate(routeToNavigate).then(() => {
        this.isVisible = false;
        setTimeout(() => {
          this.activeBandIndex = null;
          this.isVisible = true;
          this.currentRoute = targetRoute ? 'R' : this.bands[index].route;
        }, 900);
      });
    }, 600);
  }

  shouldSlide(index: number): boolean {
    return this.hoveredBandIndex !== null && index <= this.hoveredBandIndex;
  }

  getTranslation(index: number): string {
    if (this.activeBandIndex === null) {
      if (this.hoveredBandIndex === null) {
        return 'translateX(0)';
      }
      const diff = index - this.hoveredBandIndex;
      if (diff <= 0) {
        return 'translateX(0px)';
      } else {
        return `translateX(${diff * 15}px)`;
      }
    }
    if (this.activeBandIndex !== null) {
      const distance = index * 60;
      return `translateX(${distance}px)`;
    }
    return 'translateX(0)';
  }

  getZIndex(index: number): number {
    if (this.activeBandIndex === index) {
      return 10;
    }
    return 5 - index;
  }
}
