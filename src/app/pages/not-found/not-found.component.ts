import { Component } from '@angular/core';
import { DoNotClickTriggerComponent } from '../../shared/components/do-not-click/do-not-click-trigger.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [DoNotClickTriggerComponent],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {}
