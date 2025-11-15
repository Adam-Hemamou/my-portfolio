import { Component, OnInit, inject } from '@angular/core';
import { SEOService } from '../shared/services/seo.service';
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
        <span
          class="dev-title"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="800"
          >DÉVELOPPEUR</span
        >
        <span
          class="web-title"
          data-aos="fade-up"
          data-aos-delay="600"
          data-aos-duration="800"
          >WEB</span
        >
      </h1>
      <div class="hero-info">
        <div>
          <span
            class="portfolio-title"
            data-aos="fade-right"
            data-aos-delay="400"
            data-aos-duration="800"
            >Portfolio</span
          >
          <span
            class="portfolio-name"
            data-aos="fade-right"
            data-aos-delay="600"
            data-aos-duration="800"
            >Adam Hemamou</span
          >
        </div>
        <div
          class="open-to-work"
          data-aos="fade-right"
          data-aos-delay="800"
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
export default class HomeComponent implements OnInit {
  private seoService = inject(SEOService);

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Adam Hemamou - Développeur Full Stack Freelance | Portfolio',
      description:
        "Portfolio d'Adam Hemamou, développeur full stack freelance spécialisé en Angular, React, Node.js. Découvrez mes projets : ONDEO, EcoScan, BabyPlace et plus.",
      keywords:
        'Adam Hemamou, développeur full stack, freelance, Angular, React, JavaScript, Node.js, portfolio, développement web',
      url: 'https://adamh-dev.com',
    });
  }
}
