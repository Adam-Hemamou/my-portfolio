import { Component, inject } from '@angular/core';
import { DoNotClickService } from '../../services/do-not-click.service';

// Bouton desktop placé dans le contenu des pages : il suit l'animation de
// navigation. Les fenêtres restent dans DoNotClickComponent (AppComponent).
@Component({
  selector: 'app-do-not-click-trigger',
  standalone: true,
  template: `
    <button
      type="button"
      class="dnc-trigger"
      aria-haspopup="dialog"
      (click)="doNotClick.open()"
    >
      <span class="dnc-dot" aria-hidden="true"></span>DO NOT CLICK
    </button>
  `,
  styleUrls: ['./do-not-click-trigger.component.scss'],
})
export class DoNotClickTriggerComponent {
  protected doNotClick = inject(DoNotClickService);
}
