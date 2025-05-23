import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { AnimateBandComponent } from '../../shared/components/animate-band/animate-band.component';
import { StacksCardComponent } from '../../shared/dump-components/stacks-card/stacks-card.component';
import { Stack } from '../../shared/models/stack.type';
import { NgFor } from '@angular/common';
import { ActivityCardComponent } from '../../shared/dump-components/activity-card/activity-card.component';
import { Activity } from '../../shared/models/activity.type';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    MenuComponent,
    AnimateBandComponent,
    StacksCardComponent,
    ActivityCardComponent,
    FooterComponent,
    NgFor,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AboutComponent {
  stacks: Stack[] = [
    { name: 'Javascript', icon: '/stacks/js.png' },
    { name: 'Angular.js', icon: '/stacks/angular.png' },
    { name: 'React.js', icon: '/stacks/react.png' },
    { name: 'HTML5', icon: '/stacks/html5.png' },
    { name: 'CSS3', icon: '/stacks/css3.png' },
    { name: 'SASS', icon: '/stacks/sass.png' },
    { name: 'Javascript', icon: '/stacks/js.png' },
    { name: 'Angular.js', icon: '/stacks/angular.png' },
    { name: 'React.js', icon: '/stacks/react.png' },
    { name: 'HTML5', icon: '/stacks/html5.png' },
    { name: 'CSS3', icon: '/stacks/css3.png' },
    { name: 'SASS', icon: '/stacks/sass.png' },
    { name: 'Javascript', icon: '/stacks/js.png' },
    { name: 'Angular.js', icon: '/stacks/angular.png' },
    { name: 'React.js', icon: '/stacks/react.png' },
    { name: 'HTML5', icon: '/stacks/html5.png' },
    { name: 'CSS3', icon: '/stacks/css3.png' },
    { name: 'SASS', icon: '/stacks/sass.png' },
    { name: 'React.js', icon: '/stacks/react.png' },
    { name: 'HTML5', icon: '/stacks/html5.png' },
    { name: 'CSS3', icon: '/stacks/css3.png' },
    { name: 'SASS', icon: '/stacks/sass.png' },
  ];

  activities: Activity[] = [
    {
      img: '/activities/piratage.png',
      title: 'DÉVELOPPEMENT BACK-END',
      description:
        'Conception de la logique métier et des fonctionnalités complexes, assurant le bon fonctionnement des applications et la gestion des données.',
    },
    {
      img: '/activities/piratage.png',
      title: 'DÉVELOPPEMENT BACK-END',
      description:
        'Conception de la logique métier et des fonctionnalités complexes, assurant le bon fonctionnement des applications et la gestion des données.',
    },
    {
      img: '/activities/piratage.png',
      title: 'DÉVELOPPEMENT BACK-END',
      description:
        'Conception de la logique métier et des fonctionnalités complexes, assurant le bon fonctionnement des applications et la gestion des données.',
    },
    {
      img: '/activities/piratage.png',
      title: 'DÉVELOPPEMENT BACK-END',
      description:
        'Conception de la logique métier et des fonctionnalités complexes, assurant le bon fonctionnement des applications et la gestion des données.',
    },
  ];

  get stackGroups(): Stack[][] {
    const groups: Stack[][] = [];
    for (let i = 0; i < this.stacks.length; i += 6) {
      groups.push(this.stacks.slice(i, i + 6));
    }
    return groups;
  }
}
