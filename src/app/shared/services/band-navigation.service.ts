import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BandNavigationService {
  private _navigateToBand: ((route: string) => void) | null = null;

  registerHandler(fn: (route: string) => void) {
    this._navigateToBand = fn;
  }

  goToBand(route: string) {
    if (this._navigateToBand) {
      this._navigateToBand(route);
    }
  }
}
