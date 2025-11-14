import {
  trigger,
  animate,
  style,
  group,
  query,
  transition,
} from '@angular/animations';

export const mobileFade = trigger('mobileFade', [
  transition('void => *', []),
  transition('* => void', []),
  transition('* => browserNav', []),
  transition('browserNav => *', []),
  transition('* <=> *', [
    query(
      ':enter, :leave',
      style({
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
      }),
      { optional: true }
    ),

    group([
      query(
        ':leave',
        [
          style({
            opacity: 1,
            transform: 'translateY(0)',
            zIndex: 1,
          }),
          animate(
            '250ms ease-in',
            style({
              opacity: 0,
              transform: 'translateY(8px)',
              background: 'white',
            })
          ),
        ],
        { optional: true }
      ),

      query(
        ':enter',
        [
          style({
            opacity: 0,
            transform: 'translateY(-10px)',
            background: 'white',
            zIndex: 2,
          }),
          animate(
            '400ms 150ms ease-out',
            style({
              opacity: 1,
              transform: 'translateY(0)',
              background: 'transparent',
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
