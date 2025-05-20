import { Component } from '@angular/core';
import { MenuComponent } from '../shared/menu/menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  template: `
    <app-menu></app-menu>
    <h1>Bienvenue sur mon portfolio</h1>
    <p>Je suis Adam, développeur Angular & Java.</p>
  `,
})
export default class HomeComponent {}
