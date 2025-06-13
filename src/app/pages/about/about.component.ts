import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { AnimateBandComponent } from '../../shared/components/animate-band/animate-band.component';
import { StacksCardComponent } from '../../shared/dump-components/stacks-card/stacks-card.component';
import { Stack } from '../../shared/models/stack.type';
import { NgFor, NgIf } from '@angular/common';
import { ActivityCardComponent } from '../../shared/dump-components/activity-card/activity-card.component';
import { Activity } from '../../shared/models/activity.type';
import { Router, RouterLink } from '@angular/router';
import { BandNavigationService } from '../../shared/services/band-navigation.service';

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
    NgIf,
    RouterLink,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AboutComponent {
  constructor(private bandNav: BandNavigationService) {}

  isDesktopNav = false;

  onContactClick() {
    this.bandNav.goToBand('contact');
  }

  stacks: Stack[] = [
    { name: 'Javascript', icon: '/stacks/javascript.png' },
    { name: 'Angular.js', icon: '/stacks/angular.png' },
    { name: 'React.js', icon: '/stacks/react.png' },
    { name: 'HTML5', icon: '/stacks/html5.png' },
    { name: 'CSS3', icon: '/stacks/css3.png' },
    { name: 'SASS', icon: '/stacks/sass.png' },
    { name: 'Java', icon: '/stacks/java.png' },
    { name: 'Spring', icon: '/stacks/spring.png' },
    { name: 'Maven', icon: '/stacks/maven.png' },
    { name: 'Node.js', icon: '/stacks/node.png' },
    { name: 'Express', icon: '/stacks/express.png' },
    { name: 'Jest', icon: '/stacks/jest.png' },
    { name: 'JUnit5', icon: '/stacks/junit.png' },
    { name: 'SQL', icon: '/stacks/sql.png' },
    { name: 'Postman', icon: '/stacks/postman.png' },
    { name: 'Git', icon: '/stacks/git.png' },
    { name: 'GitHub', icon: '/stacks/github.png' },
    { name: 'Figma', icon: '/stacks/figma.png' },
    { name: 'Trello', icon: '/stacks/trello.png' },
    { name: 'Bootstrap', icon: '/stacks/bootstrap.png' },
    { name: 'PrimNg', icon: '/stacks/primeng.png' },
    { name: 'Google Maps', icon: '/stacks/google-maps.png' },
    { name: 'Google Analytics', icon: '/stacks/google.png' },
    { name: 'Vercel', icon: '/stacks/vercel.png' },
  ];

  activities: Activity[] = [
    {
      img: '/activity/front-end.png',
      title: 'DÉVELOPPEMENT FRONT-END',
      description:
        "Création d'interfaces utilisateur modernes et réactives, idéales pour des applications web dynamiques & responsives.",
    },
    {
      img: '/activity/back-end.png',
      title: 'DÉVELOPPEMENT BACK-END',
      description:
        'Conception de la logique métier, assurant le fonctionnement des applications et la gestion des données.',
    },
    {
      img: '/activity/ux-ui.png',
      title: 'WEB DESIGN UX/UI',
      description:
        'Conception de maquettes interactives pour visualiser vos idées avant le développement.',
    },
    {
      img: '/activity/archi.png',
      title: 'ARCHITECTURE LOGICIELLE',
      description:
        "Conseils sur la structure et l'organisation des applications pour garantir une conception évolutive et maintenable.",
    },
    {
      img: '/activity/integration.png',
      title: 'INTEGRATION SYSTÈMES',
      description:
        'Connexion et synchronisation de divers systèmes et services externes pour une infrastructure fluide.',
    },
    {
      img: '/activity/api.png',
      title: 'INTEGRATION API TIERCES',
      description:
        'Ajout de fonctionnalités avancées en intégrant des services externes comme Google Maps et Stripe.',
    },
    {
      img: '/activity/bdd.png',
      title: 'GESTION BASE DE DONNÉES',
      description:
        'Modélisation et optimisation des bases de données SQL et NoSQL pour une gestion efficace des données.',
    },
    {
      img: '/activity/opti.png',
      title: 'OPTIMISATION & PERFORMANCE',
      description:
        'Mise en place de tests automatisés pour garantir la qualité et la stabilité des applications.',
    },
    {
      img: '/activity/seo.png',
      title: 'OPTIMISATION SEO',
      description:
        'Amélioration de la visibilité de vos sites sur les moteurs de recherche.',
    },
    {
      img: '/activity/securite.png',
      title: 'SÉCURITÉ DES APPLICATIONS',
      description:
        'Implémentation des meilleures pratiques pour sécuriser vos applications et protéger les données.',
    },
    {
      img: '/activity/support.png',
      title: 'SUPPORT & MAINTENANCE',
      description:
        "Assistance continue pour assurer la stabilité et l'évolution de vos applications.",
    },
  ];

  isDesktop = false;

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));
  }

  checkScreen() {
    this.isDesktop = window.innerWidth >= 768;
    this.isDesktopNav = window.innerWidth >= 1280;
  }

  get stackGroups(): Stack[][] {
    const size = this.isDesktop ? 12 : 6;
    const groups: Stack[][] = [];
    for (let i = 0; i < this.stacks.length; i += size) {
      groups.push(this.stacks.slice(i, i + size));
    }
    return groups;
  }
}
