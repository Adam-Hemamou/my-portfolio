import { Component, Input } from '@angular/core';
import { Stack } from '../../models/stack.type';

@Component({
  selector: 'app-stacks-card',
  imports: [],
  templateUrl: './stacks-card.component.html',
  styleUrls: ['./stacks-card.component.scss'],
})
export class StacksCardComponent {
  @Input() stack!: Stack;
}
