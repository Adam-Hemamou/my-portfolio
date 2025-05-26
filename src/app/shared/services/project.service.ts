import { Injectable } from '@angular/core';
import { Project } from '../models/project.type';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projects: Project[] = [
    {
      id: 'ondeo',
      image: '/project-img/test.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      context:
        'Création du site vitrine de l’agence ONDEO, spécialisée dans la création de sites web et d’applications mobiles.',
      solution:
        'Création d’un site vitrine moderne et responsive, mettant en avant les services de l’agence.',
      challenge: [
        'Créer un design moderne et épuré',
        'Assurer une bonne expérience utilisateur sur tous les appareils',
        'Mettre en avant les services de l’agence de manière claire et attractive',
      ],
      outils: [
        { name: 'Javascript', icon: '/stacks/js.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'HTML5', icon: '/stacks/html5.png' },
      ],
      site: 'https://ondeo-angency.com',
    },
    {
      id: 'waw-game',
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
      context:
        'Développement d’un jeu vidéo inspiré de l’univers de WAW, un projet fictif de jeu vidéo.',
      solution:
        'Création d’un jeu vidéo en 2D avec des graphismes pixel art, mettant en avant les personnages et l’univers de WAW.',
      challenge: [
        'Créer un gameplay fluide et intuitif',
        'Développer des graphismes attrayants en pixel art',
      ],
      outils: [
        { name: 'Javascript', icon: '/stacks/js.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'HTML5', icon: '/stacks/html5.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/card-game-front',
    },
    {
      id: 'ondeo',
      image: '/project-img/test.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      context:
        'Création du site vitrine de l’agence ONDEO, spécialisée dans la création de sites web et d’applications mobiles.',
      solution:
        'Création d’un site vitrine moderne et responsive, mettant en avant les services de l’agence.',
      challenge: [
        'Créer un design moderne et épuré',
        'Assurer une bonne expérience utilisateur sur tous les appareils',
        'Mettre en avant les services de l’agence de manière claire et attractive',
      ],
      outils: [
        { name: 'Javascript', icon: '/stacks/js.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'HTML5', icon: '/stacks/html5.png' },
      ],
      site: 'https://ondeo-angency.com',
    },
    {
      id: 'waw-game',
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
      context:
        'Développement d’un jeu vidéo inspiré de l’univers de WAW, un projet fictif de jeu vidéo.',
      solution:
        'Création d’un jeu vidéo en 2D avec des graphismes pixel art, mettant en avant les personnages et l’univers de WAW.',
      challenge: [
        'Créer un gameplay fluide et intuitif',
        'Développer des graphismes attrayants en pixel art',
      ],
      outils: [
        { name: 'Javascript', icon: '/stacks/js.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'HTML5', icon: '/stacks/html5.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/card-game-front',
    },
    {
      id: 'ondeo',
      image: '/project-img/test.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      context:
        'Création du site vitrine de l’agence ONDEO, spécialisée dans la création de sites web et d’applications mobiles.',
      solution:
        'Création d’un site vitrine moderne et responsive, mettant en avant les services de l’agence.',
      challenge: [
        'Créer un design moderne et épuré',
        'Assurer une bonne expérience utilisateur sur tous les appareils',
        'Mettre en avant les services de l’agence de manière claire et attractive',
      ],
      outils: [
        { name: 'Javascript', icon: '/stacks/js.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'HTML5', icon: '/stacks/html5.png' },
      ],
      site: 'https://ondeo-angency.com',
    },
    {
      id: 'waw-game',
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WAW',
      subtitle: 'The Game',
      context:
        'Développement d’un jeu vidéo inspiré de l’univers de WAW, un projet fictif de jeu vidéo.',
      solution:
        'Création d’un jeu vidéo en 2D avec des graphismes pixel art, mettant en avant les personnages et l’univers de WAW.',
      challenge: [
        'Créer un gameplay fluide et intuitif',
        'Développer des graphismes attrayants en pixel art',
      ],
      outils: [
        { name: 'Javascript', icon: '/stacks/js.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'HTML5', icon: '/stacks/html5.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/card-game-front',
    },
  ];

  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
}
