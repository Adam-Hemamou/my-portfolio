import { Component } from '@angular/core';
import { AnimateBandComponent } from '../../../shared/components/animate-band/animate-band.component';
import { MenuComponent } from '../../../shared/components/menu/menu.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProjectCardComponent } from '../../../shared/dump-components/project-card/project-card.component';
import { Project } from 'src/app/shared/models/project.type';
import { NgFor } from '@angular/common';

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
    {
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
      link: 'https://tonlien.com',
    },
    {
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
      link: 'https://tonlien.com',
    },
    {
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
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
