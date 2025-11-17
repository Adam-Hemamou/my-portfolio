import { Injectable } from '@angular/core';
import {
  trigger,
  animate,
  style,
  group,
  query,
  transition,
} from '@angular/animations';

export const mobileFade = trigger('mobileFade', [
  transition('* <=> *', [
    group([
      // ✅ Page sortante - fade out pur avec scale subtil
      query(
        ':leave',
        [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: 1,
            transform: 'scale(1)',
            zIndex: 1,
          }),
          animate(
            '450ms ease-in',
            style({
              opacity: 0,
              transform: 'scale(0.98)',
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            opacity: 0,
            transform: 'scale(1.02)', // ✅ Commence légèrement plus grand
            zIndex: 2,
          }),
          animate(
            '550ms 100ms cubic-bezier(0.25, 0.8, 0.25, 1)', // ✅ Garde la belle courbe
            style({
              opacity: 1,
              transform: 'scale(1)', // ✅ Revient à la normale
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

@Injectable({
  providedIn: 'root',
})
export class MobileFadeService {
  constructor() {}
}
