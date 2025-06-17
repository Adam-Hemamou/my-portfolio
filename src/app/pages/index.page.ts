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
        <span class="dev-title" data-aos="fade-right" data-aos-duration="800"
          >DÉVELOPPEUR</span
        >
        <span class="web-title" data-aos="fade-right" data-aos-duration="800"
          >WEB</span
        >
      </h1>
      <div
        class="hero-info"
        data-aos="fade-right"
        data-aos-delay="200"
        data-aos-duration="800"
      >
        <div>
          <span
            class="portfolio-title"
            data-aos="fade-right"
            data-aos-delay="200"
            data-aos-duration="800"
            >Portfolio</span
          >
          <span
            class="portfolio-name"
            data-aos="fade-right"
            data-aos-delay="300"
            data-aos-duration="800"
            >Adam Hemamou</span
          >
        </div>
        <div
          class="open-to-work"
          data-aos="fade-right"
          data-aos-delay="400"
          data-aos-duration="800"
        >
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
