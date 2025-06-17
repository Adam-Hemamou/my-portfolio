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
        stagger(100, [
          animate('600ms ease-out', style({ transform: 'translateX(0)' })),
        ]),
      ],
      { optional: true }
    ),
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0)' }),
    animate('1255ms ease-in-out', style({ transform: 'translateX(-100vw)' })),
  ]),
]);
