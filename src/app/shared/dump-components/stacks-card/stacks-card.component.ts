import { Component, Input } from '@angular/core';
import { Stack } from '../../types/stack.type';

@Component({
  selector: 'app-stacks-card',
  imports: [],
  templateUrl: './stacks-card.component.html',
  styleUrls: ['./stacks-card.component.scss'],
  host: { '[class.is-split]': "layout === 'split'" },
})
export class StacksCardComponent {
  @Input() stack!: Stack;
  // 'split' : icône puis nom alignés à gauche, catégorie à droite (À propos)
  @Input() layout: 'compact' | 'split' = 'compact';
}
