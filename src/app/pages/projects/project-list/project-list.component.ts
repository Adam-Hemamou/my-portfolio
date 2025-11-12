import { Component, inject } from '@angular/core';
import { AnimateBandComponent } from '../../../shared/components/animate-band/animate-band.component';
import { MenuComponent } from '../../../shared/components/menu/menu.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProjectCardComponent } from '../../../shared/dump-components/project-card/project-card.component';
import { Project } from '../../../shared/types/project.type';
import { NgFor, NgIf } from '@angular/common';
import { ProjectService } from '../../../shared/services/project.service';
import { BandNavigationService } from '../../../shared/services/band-navigation.service';
import { RouterLink } from '@angular/router';
import { SEOService } from '../../../shared/services/seo.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MenuComponent,
    AnimateBandComponent,
    ProjectCardComponent,
    FooterComponent,
    RouterLink,
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  private seoService = inject(SEOService);
  projects: Project[] = this.projectService.getProjects();

  isDesktopNav = false;

  constructor(
    private projectService: ProjectService,
    private bandNav: BandNavigationService
  ) {}

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));
    this.seoService.updateSEO({
      title: 'Mes Projets - Adam Hemamou | Portfolio Développeur Web',
      description:
        'Découvrez mes projets de développement web : ONDEO (site vitrine), EcoScan (app écoresponsable), BabyPlace (plateforme), WOW Land (jeu) et plus.',
      keywords:
        'projets web, développement, sites vitrines, applications web, Angular, React, portfolio Adam Hemamou',
      url: 'https://ton-domaine.com/project',
    });
  }

  checkScreen() {
    this.isDesktopNav = window.innerWidth >= 1024;
  }

  onContactClick() {
    this.bandNav.goToBand('contact');
  }
}
