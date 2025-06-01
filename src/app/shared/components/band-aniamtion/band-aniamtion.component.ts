import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { slideInBands } from '../../animations/slide-in-bands.animations';

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

  constructor(private router: Router) {
    this.currentRoute = this.router.url.substring(1);
  }

  onHover(index: number) {
    this.hoveredBandIndex = index;
  }

  onLeave() {
    this.hoveredBandIndex = null;
  }

  onClick(index: number) {
    if (this.bands[index].route === this.currentRoute) {
      return;
    }
    this.activeBandIndex = index;
    setTimeout(() => {
      this.router.navigate([this.bands[index].route]).then((success) => {
        this.isVisible = false;
        setTimeout(() => {
          this.activeBandIndex = null;
          this.isVisible = true;
          this.currentRoute = this.bands[index].route;
        }, 1000);
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
      const distance = index * 70;
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
