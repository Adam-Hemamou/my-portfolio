import { Component } from '@angular/core';
import { AnimateBandComponent } from '../../../shared/components/animate-band/animate-band.component';
import { MenuComponent } from '../../../shared/components/menu/menu.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProjectCardComponent } from '../../../shared/dump-components/project-card/project-card.component';
import { Project } from '../../../shared/models/project.type';
import { NgFor } from '@angular/common';
import { ProjectService } from '../../../shared/services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    NgFor,
    MenuComponent,
    AnimateBandComponent,
    ProjectCardComponent,
    FooterComponent,
  ],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  projects: Project[] = this.projectService.getProjects();

  constructor(private projectService: ProjectService) {}
}
