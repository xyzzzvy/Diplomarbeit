import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'normal' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private themeSubject = new BehaviorSubject<ThemeMode>('normal');
  theme$ = this.themeSubject.asObservable();

  constructor() {
    // Theme aus localStorage laden
    const storedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    if (storedTheme) {
      this.themeSubject.next(storedTheme);
    }
  }

  /** aktuelles Theme */
  get current(): ThemeMode {
    return this.themeSubject.value;
  }

  /** Theme setzen */
  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem('themeMode', theme);
  }

  /** zyklisch wechseln: normal → light → dark → normal */
  toggleTheme(): void {
    const next: ThemeMode =
      this.current === 'normal'
        ? 'light'
        : this.current === 'light'
          ? 'dark'
          : 'normal';

    this.setTheme(next);
  }
}
