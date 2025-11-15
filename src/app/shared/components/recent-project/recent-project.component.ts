import { Component } from '@angular/core';
import { Project } from '../../types/project.type';
import { NgFor } from '@angular/common';
import { ProjectCardComponent } from '../../dump-components/project-card/project-card.component';

@Component({
  selector: 'app-recent-project',
  standalone: true,
  imports: [NgFor, ProjectCardComponent],
  templateUrl: './recent-project.component.html',
  styleUrls: ['./recent-project.component.scss'],
})
export class RecentProjectComponent {
  projects: Project[] = [
    {
      id: 'ondeo',
      image: '/project-img/ondeo/0.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      context: '',
      solution: '',
      challenge: [],
      outils: [],
      images: [],
    },
    {
      id: 'ecoscan',
      image: '/project-img/eco-scan/5.png',
      label: 'APPLICATION',
      title: 'ECOSCAN',
      subtitle: 'Application écoresponsable',
      context: '',
      solution: '',
      challenge: [],
      outils: [],
      images: [],
    },
  ];
}
