import { Injectable } from '@angular/core';
import { Project } from '../types/project.type';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projects: Project[] = [
    {
      id: 'ondeo',
      image: '/project-img/ondeo/0.png',
      label: 'WEBSITE',
      title: 'ONDEO',
      subtitle: 'Agence créative',
      context:
        'ONDEO est une agence spécialisée dans le montage vidéo et le motion design, souhaitant un site vitrine pour présenter ses services et ses réalisations.',
      solution:
        "Création d’un site vitrine moderne et responsive, reflétant l'identité visuelle de l’agence et mettant en valeur ses services et réalisations.",
      challenge: [
        "Réaliser la maquette en accord avec l'image et l'identité visuelle de l’agence",
        'Assurer une bonne expérience utilisateur sur tous les appareils',
        'Mettre en avant les services de l’agence de manière claire et attractive',
        'Développement avec Analog.js (Angular + SSG) pour des performances optimales',
        'Intégration de bibliothèques tierces: Email.js, AOS, Swiper, Calendly',
      ],
      outils: [
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'Figma', icon: '/stacks/figma.png' },
        { name: 'Google Analytics', icon: '/stacks/google.png' },
        { name: 'Vercel', icon: '/stacks/vercel.png' },
      ],
      images: [
        '/project-img/ondeo/1-rec.png',
        '/project-img/ondeo/4.png',
        '/project-img/ondeo/3.png',
        '/project-img/ondeo/2-rec.png',
      ],
      site: 'https://ondeo-agency.com',
    },
    {
      id: 'ecoscan',
      image: '/project-img/eco-scan/5.png',
      label: 'APPLICATION',
      title: 'ECOSCAN',
      subtitle: 'Application écoresponsable',
      context:
        'Application web écoresponsable visant à aider les utilisateurs à trier leurs déchets et à adopter des comportements plus durables, tout en rendant le processus ludique et motivant grâce à un système de points et de récompenses.',
      solution:
        'Création d’une application web intuitive permettant de scanner produits et points de dépôt pour obtenir des infos sur le tri, localiser les zones de recyclage via Google Maps et cumuler des points échangeables contre des coupons auprès d’entreprises partenaires.',
      challenge: [
        'Conception d’une base de données complète regroupant informations sur les déchets, points de dépôt, utilisateurs, entreprises et coupons.',
        'Intégration de l’API Google Maps pour localiser les points de recyclage.',
        'Mise en place d’un système de points et de récompenses pour encourager les comportements écoresponsables.',
        'Implémentation du scan de QR codes avec la dépendance Ngx-scanner.',
        'Création d’une interface utilisateur intuitive, responsive et engageante.',
      ],
      outils: [
        { name: 'Figma', icon: '/stacks/figma.png' },
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'Java', icon: '/stacks/java.png' },
        { name: 'Spring', icon: '/stacks/spring.png' },
        { name: 'Postman', icon: '/stacks/postman.png' },
        { name: 'Google Maps', icon: '/stacks/google-maps.png' },
      ],
      images: [
        '/project-img/eco-scan/6-rec.png',
        '/project-img/eco-scan/8.png',
        '/project-img/eco-scan/9.png',
        '/project-img/eco-scan/7-rec.png',
      ],
      github: 'https://github.com/Adam-Hemamou/Eco-scan',
    },
    {
      id: 'wow-game',
      image: '/project-img/wow-land/40.png',
      label: 'JEU',
      title: 'WOW LAND',
      subtitle: 'The Game',
      context:
        'Jeu de cartes interactif pour 2 joueurs, où les cartes physiques contiennent des QR codes déclenchant des actions dans l’application.',
      solution:
        'Développement d’un jeu vidéo 2D avec une logique de tour par tour, où chaque carte scannée déclenche des effets (attaque, armure, soins, poison, ...).',
      challenge: [
        'Concevoir une base de données pour enregistrer les cartes et leurs effets',
        'Implémenter la logique tour par tour et la résolution des effets via le design pattern Chain of Responsibility',
        'Centraliser la logique du jeu avec le design pattern Facade pour simplifier l’architecture',
        'Implémentation du scan de QR codes avec la dépendance Ngx-scanner.',
        'Réaliser le projet en seulement 2 jours pour un mini hackathon.',
      ],
      outils: [
        { name: 'Angular.js', icon: '/stacks/angular.png' },
        { name: 'Java', icon: '/stacks/java.png' },
        { name: 'Spring', icon: '/stacks/spring.png' },
        { name: 'Postman', icon: '/stacks/postman.png' },
      ],
      images: [
        '/project-img/wow-land/36-rec.png',
        '/project-img/wow-land/38.png',
        '/project-img/wow-land/39.png',
        '/project-img/wow-land/37-rec.png',
      ],
      github: 'https://github.com/Adam-Hemamou/card-game-front',
    },
    {
      id: 'babyplace',
      image: '/project-img/baby-place/12.png',
      label: 'APPLICATION',
      title: 'BABYPLACE',
      subtitle: 'Plateforme de mise en relation',
      context:
        'Plateforme connectant les parents aux professionnels de la petite enfance pour faciliter la recherche et la communication.',
      solution:
        'Création d’une plateforme web moderne et intuitive, permettant aux parents de rechercher et contacter des professionnels, et aux structures d’enregistrer leur crèche, gérer leurs rendez-vous et suivre leurs interactions avec les familles.',
      challenge: [
        "Conception d'une base de données pour gérer les informations des professionnels, des crèches et des parents",
        "Mise en place d'une API REST pour gérer les données avec un CRUD complet",
        'Authentification et autorisation des utilisateurs avec JWT (Parents et Professionnels)',
        "Création d'un système de prise de rendez-vous intégré pour les deux types d'utilisateurs",
        "Intégration d'un stepper pour simplifier le processus d'inscription",
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
      images: [
        '/project-img/baby-place/13-rec.png',
        '/project-img/baby-place/15.png',
        '/project-img/baby-place/16.png',
        '/project-img/baby-place/14-rec.png',
      ],
      github: 'https://github.com/Adam-Hemamou/BabyPlace',
    },
    {
      id: 'elegance',
      image: '/project-img/elegance/24.png',
      label: 'APPLICATION',
      title: "ELEGANCE x L'ORÉAL",
      subtitle: 'Hackathon national',
      context:
        'Application pour L’Oréal visant à proposer des produits adaptés aux personnes atteintes de cancer, 3°e place au hackathon',
      solution:
        "Création d’une application web intuitive permettant aux utilisateurs de trouver des produits adaptés à leur condition, avec des conseils personnalisés et un système de recommandations basé sur les besoins similaires d'autres utilisateurs.",
      challenge: [
        "Création d'une interface utilisateur intuitive et accessible",
        'Authentification et autorisation des utilisateurs avec JWT',
        "Utilisation de l'API L’Oréal pour récupérer les données des produits",
        'Création d’un questionnaire pour déterminer les produits adaptés aux besoins des utilisateurs',
        'Développement d’un système de recommandation basé sur les utilisateurs similaires (machine learning)',
        'Réaliser le projet en seulement 3 jours lors du hackathon national',
      ],
      images: [
        '/project-img/elegance/25-rec.png',
        '/project-img/elegance/27.png',
        '/project-img/elegance/28.png',
        '/project-img/elegance/26-rec.png',
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
      image: '/project-img/green-point/18.png',
      label: 'WEBSITE',
      title: 'GREENPOINT',
      subtitle: 'Générateur de bilan de CO2',
      context:
        'Site dynamique et interactif permettant aux utilisateurs d’évaluer leur empreinte carbone et de suivre leur progression écologique.',
      solution:
        'Création d’un site web moderne et dynamique avec un questionnaire interactif pour calculer l’empreinte carbone, fournir des conseils personnalisés et attribuer des points en fonction des progrès réalisés.',
      challenge: [
        'Maquettage du site avec Figma pour une interface intuitive',
        'Création d’un formulaire interactif pour collecter les données des utilisateurs',
        'Calcul de l’empreinte carbone à partir des réponses à l’aide d’une API web',
        'Mise en place d’un système de suivi des progrès et d’attribution de points pour motiver l’engagement écologique',
      ],
      images: [
        '/project-img/green-point/19-rec.png',
        '/project-img/green-point/21.png',
        '/project-img/green-point/22.png',
        '/project-img/green-point/20-rec.png',
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
