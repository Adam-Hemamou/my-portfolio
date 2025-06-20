import {
  trigger,
  animate,
  style,
  group,
  query,
  transition,
} from '@angular/animations';

export const slider = trigger('slider', [
  transition('* <=> *', [
    query(':enter, :leave', style({ position: 'fixed', width: '100%' }), {
      optional: true,
    }),
    group([
      query(
        ':enter',
        [
          style({ transform: 'translateX(100%)' }),
          animate('1200ms ease-in-out', style({ transform: 'translateX(0)' })),
        ],
        { optional: true }
      ),
      query(
        ':leave',
        [
          style({ transform: 'translateX(0)' }),
          animate(
            '1200ms ease-in-out',
            style({ transform: 'translateX(-100%)' })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
