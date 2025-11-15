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
      // ✅ Page qui part - fade simple sans mouvement vertical
      query(
        ':leave',
        [
          style({
            opacity: 1,
            transform: 'translateY(0)', // ✅ Pas de mouvement
            zIndex: 1,
          }),
          animate(
            '200ms ease-in',
            style({
              opacity: 0,
              transform: 'translateY(0)', // ✅ Reste à sa place
              background: 'white',
            })
          ),
        ],
        { optional: true }
      ),

      // ✅ Page qui arrive - fade simple sans mouvement vertical
      query(
        ':enter',
        [
          style({
            opacity: 0,
            transform: 'translateY(0)', // ✅ Pas de mouvement
            background: 'white',
            zIndex: 2,
          }),
          animate(
            '300ms 100ms ease-out',
            style({
              opacity: 1,
              transform: 'translateY(0)', // ✅ Reste à sa place
              background: 'transparent',
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
