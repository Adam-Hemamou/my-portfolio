import { Component, Input } from '@angular/core';
import { Project } from '../../models/project.type';
import { Router, RouterLink } from '@angular/router';
import { BandNavigationService } from '../../services/band-navigation.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
})
export class ProjectCardComponent {
  @Input() project!: Project;

  isDesktopNav = window.innerWidth >= 1024;

  constructor(private bandNav: BandNavigationService) {}

  ngOnInit() {
    window.addEventListener('resize', () => {
      this.isDesktopNav = window.innerWidth >= 1024;
    });
  }

  onCardClick() {
    if (this.isDesktopNav) {
      this.bandNav.goToBand('project', ['/project', this.project.id]);
    }
  }
}
