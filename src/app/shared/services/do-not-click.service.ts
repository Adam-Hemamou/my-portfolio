import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Permet d'ouvrir le parcours DO NOT CLICK depuis un autre composant (menu mobile)
@Injectable({
  providedIn: 'root',
})
export class DoNotClickService {
  private openRequests = new Subject<void>();
  readonly openRequested$ = this.openRequests.asObservable();

  open() {
    this.openRequests.next();
  }
}
