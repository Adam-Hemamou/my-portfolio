import { Component } from '@angular/core';
import { Project } from '../../models/project.type';
import { NgFor } from '@angular/common';
import { ProjectCardComponent } from '../../dump-components/project-card/project-card.component';

@Component({
  selector: 'app-recent-project',
  imports: [NgFor, ProjectCardComponent],
  templateUrl: './recent-project.component.html',
  styleUrls: ['./recent-project.component.scss'],
})
export class RecentProjectComponent {
  projects: Project[] = [
    {
      image: '/project-img/test.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      link: 'https://tonlien.com',
    },
    {
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
      link: 'https://tonlien.com',
    },
  ];
}
