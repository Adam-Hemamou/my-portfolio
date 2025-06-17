import { Component, Input } from '@angular/core';
import { Activity } from '../../types/activity.type';

@Component({
  selector: 'app-activity-card',
  imports: [],
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
})
export class ActivityCardComponent {
  @Input() activity!: Activity;
}
