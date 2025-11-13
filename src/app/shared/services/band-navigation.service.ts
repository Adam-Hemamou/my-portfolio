import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BandNavigationService {
  private _navigateToBand:
    | ((route: string, targetRoute?: any[]) => void)
    | null = null;

  // ✅ Garde les méthodes importantes
  registerHandler(fn: (route: string) => void) {
    this._navigateToBand = fn;
  }

  goToBand(route: string, targetRoute?: any[]) {
    if (this._navigateToBand) {
      this._navigateToBand(route, targetRoute);
    }
  }
}
