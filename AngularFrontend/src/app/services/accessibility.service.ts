import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private accessible$ = new BehaviorSubject<boolean>(false);

  isAccessible$ = this.accessible$.asObservable();

  constructor() {
    const stored = localStorage.getItem('accessibleMode');
    if (stored === 'true') {
      this.accessible$.next(true);
    }
  }

  get isAccessible(): boolean {
    return this.accessible$.value;
  }

  toggle(): void {
    const next = !this.accessible$.value;
    this.accessible$.next(next);
    localStorage.setItem('accessibleMode', String(next));
  }
}
