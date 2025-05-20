import { Component } from '@angular/core';
import { MenuComponent } from '../shared/menu/menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  template: `
    <app-menu></app-menu>
    <h1 class="hero-title">
      <span class="dev-title">DÉVELOPPEUR</span>
      <span class="web-title">WEB</span>
    </h1>
    <div class="hero-info">
      <div>
        <span class="portfolio-title">Portfolio</span>
        <span class="portfolio-name">Adam Hemamou</span>
      </div>
      <div class="open-to-work">
        <span class="dot"></span>
        <span>Open to work</span>
      </div>
    </div>
  `,
})
export default class HomeComponent {}
