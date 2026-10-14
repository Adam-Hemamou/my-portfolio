import { Injectable } from '@angular/core';
import { Stack } from '../types/stack.type';

// Technologies maîtrisées (page À propos), aussi comptées dans les chiffres clés
@Injectable({
  providedIn: 'root',
})
export class StackService {
  private stacks: Stack[] = [
    {
      name: 'Javascript',
      icon: '/stacks/javascript.png',
      category: 'Language',
    },
    { name: 'Angular.js', icon: '/stacks/angular.png', category: 'Frontend' },
    { name: 'React.js', icon: '/stacks/react.png', category: 'Frontend' },
    { name: 'HTML5', icon: '/stacks/html5.png', category: 'Frontend' },
    { name: 'CSS3', icon: '/stacks/css3.png', category: 'Frontend' },
    { name: 'SASS', icon: '/stacks/sass.png', category: 'Styling' },
    { name: 'Java', icon: '/stacks/java.png', category: 'Language' },
    { name: 'Spring', icon: '/stacks/spring.png', category: 'Backend' },
    { name: 'Maven', icon: '/stacks/maven.png', category: 'Build Tool' },
    { name: 'Node.js', icon: '/stacks/node.png', category: 'Backend' },
    { name: 'Express', icon: '/stacks/express.png', category: 'Backend' },
    { name: 'Jest', icon: '/stacks/jest.png', category: 'Testing' },
    { name: 'JUnit5', icon: '/stacks/junit.png', category: 'Testing' },
    { name: 'SQL', icon: '/stacks/sql.png', category: 'Database' },
    { name: 'Postman', icon: '/stacks/postman.png', category: 'API Testing' },
    { name: 'Git', icon: '/stacks/git.png', category: 'Version Control' },
    { name: 'GitHub', icon: '/stacks/github.png', category: 'Version Control' },
    { name: 'Figma', icon: '/stacks/figma.png', category: 'Design' },
    {
      name: 'Trello',
      icon: '/stacks/trello.png',
      category: 'Project Management',
    },
    {
      name: 'Bootstrap',
      icon: '/stacks/bootstrap.png',
      category: 'UI Framework',
    },
    { name: 'PrimNg', icon: '/stacks/primeng.png', category: 'UI Library' },
    { name: 'Google Maps', icon: '/stacks/google-maps.png', category: 'API' },
    {
      name: 'Google Analytics',
      icon: '/stacks/google.png',
      category: 'Analytics',
    },
    { name: 'Vercel', icon: '/stacks/vercel.png', category: 'Deployment' },
  ];

  getStacks(): Stack[] {
    return this.stacks;
  }

  // Catégorie d'une technologie d'après son nom (outils des projets)
  getCategory(name: string): string | undefined {
    return this.stacks.find((stack) => stack.name === name)?.category;
  }
}
