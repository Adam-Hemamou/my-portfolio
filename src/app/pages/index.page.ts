import { Component } from '@angular/core';
import { MenuComponent } from '../shared/components/menu/menu.component';
import { AnimateBandComponent } from '../shared/components/animate-band/animate-band.component';
import { RecentProjectComponent } from '../shared/components/recent-project/recent-project.component';
import { FooterComponent } from '../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MenuComponent,
    AnimateBandComponent,
    RecentProjectComponent,
    FooterComponent,
  ],
  template: `
    <app-menu></app-menu>
    <div class="hero-parent">
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
    </div>
    <div class="home-band">
      <app-animate-band></app-animate-band>
    </div>
    <app-recent-project></app-recent-project>
    <app-footer></app-footer>
  `,
})
export default class HomeComponent {}
