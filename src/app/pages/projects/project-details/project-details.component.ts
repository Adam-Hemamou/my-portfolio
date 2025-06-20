import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { Project } from '../../../shared/types/project.type';
import { MenuComponent } from '../../../shared/components/menu/menu.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AnimateBandComponent } from '../../../shared/components/animate-band/animate-band.component';
import { NgFor, NgIf } from '@angular/common';
import { StacksCardComponent } from '../../../shared/dump-components/stacks-card/stacks-card.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    MenuComponent,
    AnimateBandComponent,
    StacksCardComponent,
    FooterComponent,
    NgIf,
    NgFor,
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProjectDetailsComponent {
  project!: Project | undefined;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.project = id ? this.projectService.getProjectById(id) : undefined;
  }
}
