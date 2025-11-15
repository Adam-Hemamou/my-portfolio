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
      style({ position: 'fixed', width: '100%', height: '100%', left: 0 }),
      {
        optional: true,
      }
    ),

    group([
      // ✅ Page qui part - reste à sa position actuelle
      query(
        ':leave',
        [
          style({
            opacity: 1,
            top: '0px', // ✅ Garde sa position de scroll actuelle
            zIndex: 1,
            transform: 'translateY(0)',
          }),
          animate(
            '250ms ease-in',
            style({
              opacity: 0,
              transform: 'translateY(-20px)', // ✅ Fade vers le haut
              background: 'white',
            })
          ),
        ],
        { optional: true }
      ),

      // ✅ Page qui arrive - apparaît directement en haut
      query(
        ':enter',
        [
          style({
            opacity: 0,
            top: '0px', // ✅ Directement en haut du viewport
            zIndex: 2,
            transform: 'translateY(20px)',
            background: 'white',
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
