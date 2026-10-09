import { Injectable } from '@angular/core';
import { Stack } from '../types/stack.type';

// Technologies maîtrisées (page À propos), aussi comptées dans les chiffres clés
@Injectable({
  providedIn: 'root',
})
export class StackService {
  private stacks: Stack[] = [
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

  getStacks(): Stack[] {
    return this.stacks;
  }
}
