import { Component } from '@angular/core';

@Component({
  selector: 'app-animate-band',
  standalone: true,
  imports: [],
  templateUrl: './animate-band.component.html',
  styleUrls: ['./animate-band.component.scss'],
})
export class AnimateBandComponent {
  readonly groups = [0, 1];
  readonly copies = [0, 1];
}
