import { Component, OnInit, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { AnimateBandComponent } from '../../shared/components/animate-band/animate-band.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { NeonRectanglesComponent } from '../../shared/components/neon-rectangles/neon-rectangles.component';
import { BandNavigationService } from '../../shared/services/band-navigation.service';
import { SEOService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    NgFor,
    MenuComponent,
    AnimateBandComponent,
    FooterComponent,
    NeonRectanglesComponent,
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  private seoService = inject(SEOService);
  private bandNav = inject(BandNavigationService);
  private router = inject(Router);

  // Liens secondaires, sous le bouton principal
  readonly links = [
    { label: 'Voir mes projets', route: 'project' },
    { label: 'Me contacter', route: 'contact' },
  ];

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Page introuvable (404) | Adam Hemamou',
      description:
        "Cette page n'existe pas ou a été déplacée. Retrouvez le portfolio d'Adam Hemamou, développeur web freelance.",
      robots: 'noindex, follow',
    });
  }

  // Vrais liens (clavier, nouvel onglet, robots) : sur ordinateur, le clic
  // simple passe par l'animation des bandes, comme le reste du site
  go(event: MouseEvent, route: string) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (window.innerWidth >= 1024) {
      this.bandNav.goToBand(route);
    } else {
      this.router.navigateByUrl('/' + route);
    }
  }
}
