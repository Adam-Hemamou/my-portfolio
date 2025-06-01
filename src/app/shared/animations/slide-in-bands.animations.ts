import {
  animate,
  group,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const slideInBands = trigger('slideInBands', [
  transition(':enter', [
    query(
      '.band',
      [
        style({ transform: 'translateX(500%)' }),
        stagger(70, [
          animate('400ms ease-out', style({ transform: 'translateX(0)' })),
        ]),
      ],
      { optional: true }
    ),
  ]),
  transition(':leave', [
    query(
      '.band',
      [
        // Toutes les bandes partent en même temps, durée identique à l'animation de page
        animate('3990ms ease-in', style({ transform: 'translateX(-30000%)' })),
      ],
      { optional: true }
    ),
  ]),
]);
