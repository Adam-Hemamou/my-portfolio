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
    group([
      query(
        ':leave',
        [
          style({
            opacity: 1,
            zIndex: 1,
            position: 'relative',
          }),
          animate('300ms ease-in', style({ opacity: 0 })),
        ],
        { optional: true }
      ),

      query(
        ':enter',
        [
          style({
            opacity: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2,
            background: 'white', // ✅ Garde le blanc plus longtemps
            overflow: 'auto',
          }),
          animate(
            '600ms 200ms ease-out', // Animation plus longue
            style({
              opacity: 1,
              background: 'white', // Garde le blanc jusqu'à la fin
            })
          ),
          // ✅ Transition du background APRÈS l'opacity
          animate(
            '100ms ease-out',
            style({
              background: 'transparent', // Transition finale
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);
