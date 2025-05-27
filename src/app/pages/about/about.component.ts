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
    { name: 'Javascript', icon: '/stacks/javascript.png' },
    { name: 'Angular.js', icon: '/stacks/angular.png' },
    { name: 'React.js', icon: '/stacks/react.png' },
    { name: 'HTML5', icon: '/stacks/html5.png' },
    { name: 'CSS3', icon: '/stacks/css3.png' },
    { name: 'SASS', icon: '/stacks/sass.png' },
    { name: 'Java', icon: '/stacks/java.png' },
    { name: 'Spring', icon: '/stacks/spring.png' },
    { name: 'Node.js', icon: '/stacks/node.png' },
    { name: 'Express', icon: '/stacks/express.png' },
    { name: 'Jest', icon: '/stacks/jest.png' },
    { name: 'SQL', icon: '/stacks/sql.png' },
    { name: 'Git', icon: '/stacks/git.png' },
    { name: 'GitHub', icon: '/stacks/github.png' },
    { name: 'Trello', icon: '/stacks/trello.png' },
    { name: 'Postman', icon: '/stacks/postman.png' },
    { name: 'Bootstrap', icon: '/stacks/bootstrap.png' },
    { name: 'PrimNg', icon: '/stacks/primeng.png' },
    { name: 'Google Maps', icon: '/stacks/google-maps.png' },
    { name: 'Google Analytics', icon: '/stacks/google.png' },
    { name: 'Vercel', icon: '/stacks/vercel.png' },
    { name: 'AWS', icon: '/stacks/aws.png' },
  ];

  activities: Activity[] = [
    {
      img: '/activities/front-end.png',
      title: 'DÉVELOPPEMENT FRONT-END',
      description:
        "Création d'interfaces utilisateur conviviales et réactives, idéales pour des sites vitrines ou des applications web dynamiques.",
    },
    {
      img: '/activities/piratage.png',
      title: 'DÉVELOPPEMENT BACK-END',
      description:
        'Conception de la logique métier et des fonctionnalités complexes, assurant le bon fonctionnement des applications et la gestion des données.',
    },
    {
      img: '/activities/ux-ui.png',
      title: 'WEB DESIGN UX/UI',
      description:
        'Conception de maquettes interactives pour visualiser vos idées avant le développement.',
    },
    {
      img: '/activities/archi.png',
      title: 'CONSULTING ARCHITECTURE LOGICIELLE',
      description:
        "Conseils sur la structure et l'organisation des applications pour garantir une conception évolutive et maintenable.",
    },
    {
      img: '/activities/integration.png',
      title: 'INTEGRATION SYSTÈMES',
      description:
        'Connexion et synchronisation de divers systèmes et services externes pour une infrastructure fluide.',
    },
    {
      img: '/activities/api.png',
      title: 'INTEGRATION API TIERCES',
      description:
        'Ajout de fonctionnalités avancées en intégrant des services externes comme Google Maps et Stripe.',
    },
    {
      img: '/activities/bdd.png',
      title: 'GESTION BASE DE DONNÉES',
      description:
        'Modélisation et optimisation des bases de données SQL et NoSQL pour une gestion efficace des données.',
    },
    {
      img: '/activities/opti.png',
      title: 'OPTIMISATION & PERFORMANCE',
      description:
        'Mise en place de tests automatisés pour garantir la qualité et la stabilité des applications.',
    },
    {
      img: '/activities/seo.png',
      title: 'OPTIMISATION SEO',
      description:
        'Amélioration de la visibilité de vos sites sur les moteurs de recherche.',
    },
    {
      img: '/activities/opti.png',
      title: 'OPTIMISATION & PERFORMANCE',
      description:
        'Mise en place de tests automatisés pour garantir la qualité et la stabilité des applications.',
    },
    {
      img: '/activities/securite.png',
      title: 'SÉCURITÉ DES APPLICATIONS',
      description:
        'Implémentation des meilleures pratiques pour sécuriser vos applications et protéger les données.',
    },
    {
      img: '/activities/support.png',
      title: 'SUPPORT & MAINTENANCE',
      description:
        "Assistance continue pour assurer la stabilité et l'évolution de vos applications.",
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
