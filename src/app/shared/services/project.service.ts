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
        'Assurer une bonne expérience utilisateur sur tous les appareils',
        'Mettre en avant les services de l’agence de manière claire et attractive',
        'Développement avec Analog.js (Angular + SSG) pour des performances optimales',
        'Intégraton de biblotheque tierces: Email.js, AOS, Swiper',
      ],
      outils: [
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'Figma', icon: '/stacks/figma.png' },
        { name: 'Google Analytics', icon: '/stacks/google.png' },
        { name: 'Vercel', icon: '/stacks/vercel.png' },
      ],
      site: 'https://ondeo-angency.com',
    },
    {
      id: 'ecoscan',
      image: '/project-img/test.png',
      label: 'APPLICATION',
      title: 'ECOSCAN',
      subtitle: 'Application ecorésponsable',
      context:
        'Développement d’une application web pour aider les utilisateurs à réduire leur empreinte carbone en scannant les codes-barres des produits.',
      solution:
        'Création d’une application web intuitive et facile à utiliser, permettant aux utilisateurs de scanner les codes-barres des produits pour obtenir des informations sur leur méthode de recyclage.',
      challenge: [
        "Conception d'une base de données pour stocker les informations sur les déchets",
        "Utiliser de l'API google maps pour localiser les points de recyclage",
        'Utilisation de la dependence Ngx-scanner afin de scanner les Qr codes sur les déchets',
        'Créer une interface utilisateur intuitive, dynamique & responsive',
      ],
      outils: [
        { name: 'Figma', icon: '/stacks/figma.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'Java', icon: '/stacks/java.png' },
        { name: 'Spring', icon: '/stacks/spring.png' },
        { name: 'Postman', icon: '/stacks/postman.png' },
        { name: 'Google Maps', icon: '/stacks/google-maps.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/Eco-scan',
    },
    {
      id: 'wow-game',
      image: '/project-img/test.png',
      label: 'JEU',
      title: 'WOW LAND',
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
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'Java', icon: '/stacks/java.png' },
        { name: 'Spring', icon: '/stacks/spring.png' },
        { name: 'Postman', icon: '/stacks/postman.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/card-game-front',
    },
    {
      id: 'babyplace',
      image: '/project-img/test.png',
      label: 'APPLICATION',
      title: 'BABYPLACE',
      subtitle: 'Plateforme de mise en relation',
      context:
        "Développement d'une plateforme visant à connecter des professionnels de la petite enfance avec des parents",
      solution:
        'Création d’une plateforme web moderne et intuitive, facilitant la mise en relation entre les parents et les professionnels de la petite enfance.',
      challenge: [
        "Conception d'une base de données pour stocker les informations sur les professionnels et les parents",
        "Mise ne place d'une API REST pour gérer les données avec un CRUD complet",
        'Authentification et autorisation des utilisateurs avec JWT (Parents et Professionnels)',
        "Création d'un systeme de prise de rendez-vous",
        "Integration d'une bibliotheque afin d'utiliser un stepper pour l'inscription",
        'Assurer une bonne expérience utilisateur sur tous les appareils',
      ],
      outils: [
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'Node.js', icon: '/stacks/node.png' },
        { name: 'Express', icon: '/stacks/express.png' },
        { name: 'Bootstrap', icon: '/stacks/bootstrap.png' },
        { name: 'SQL', icon: '/stacks/sql.png' },
        { name: 'Postman', icon: '/stacks/postman.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/BabyPlace',
    },
    {
      id: 'elegance',
      image: '/project-img/test.png',
      label: 'APPLICATION',
      title: "ELEGANCE x L'Oreal",
      subtitle: 'Hackathon L’Oréal',
      context:
        'Application pour L’Oréal visant à proposer des produits adaptés aux personnes atteintes de cancer, 3°e place au hackathon',
      solution:
        "Création d'une application web permettant aux utilisateurs de trouver des produits cosmétiques adaptés à leur condition, avec des conseils et des recommandations personnalisées.",
      challenge: [
        "Création d'une interface utilisateur intuitive et accessible",
        'Authentification et autorisation des utilisateurs avec JWT',
        "Utilisation de l'API L’Oréal pour récupérer les données des produits",
        "Mise un place d'un questionnaire pour trouver les produits adaptés aux besoins des utilisateurs",
        "Mise en place d'un système de recommandation basé sur d'autres utilisateurs ayant des besoins similaires",
      ],
      outils: [
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'Node.js', icon: '/stacks/node.png' },
        { name: 'Express', icon: '/stacks/express.png' },
        { name: 'Bootstrap', icon: '/stacks/bootstrap.png' },
      ],
      github: 'https://github.com/Adam-Hemamou/Elegance',
    },
    {
      id: 'green-point',
      image: '/project-img/test.png',
      label: 'WEBSITE',
      title: 'GREENPOINT',
      subtitle: 'Générateur de bilan de CO2',
      context:
        'Site dynamique pour calculer l’empreinte carbone d’un l’utilisateur',
      solution:
        "Création d’un site web permettant aux utilisateurs de calculer leur empreinte carbone en fonction de leurs habitudes de consommation avec des axes d'amelioration.",
      challenge: [
        'Maquettage du site avec Figma',
        'Création d’un formulaire dynamique pour collecter les données des utilisateurs',
        "Calcul de l’empreinte carbone en fonction des données saisies à l'aide d'une API web",
      ],
      outils: [
        { name: 'React.js', icon: '/stacks/react.png' },
        { name: 'Bootstrap', icon: '/stacks/bootstrap.png' },
        { name: 'Figma', icon: '/stacks/figma.png' },
        { name: 'Trello', icon: '/stacks/trello.png' },
      ],

      github: 'https://github.com/Adam-Hemamou/Green-Point',
    },
  ];

  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
}
