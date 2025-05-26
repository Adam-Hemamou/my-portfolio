import { Component } from '@angular/core';
import { Project } from '../../models/project.type';
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
      image: '/project-img/test.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      context: '',
      solution: '',
      challenge: [],
      outils: [],
    },
    {
      id: 'waw-game',
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW GAME',
      subtitle: 'The Game',
      context: '',
      solution: '',
      challenge: [],
      outils: [],
    },
  ];
}
