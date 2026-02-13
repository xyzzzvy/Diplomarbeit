import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs';

import { AccessibilityService } from './services/accessibility.service';
import { ThemeService, ThemeMode } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private subA11y?: Subscription;
  private subTheme?: Subscription;

  constructor(
    private accessibility: AccessibilityService,
    private theme: ThemeService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    // Accessibility → body class
    this.subA11y = this.accessibility.isAccessible$.subscribe(enabled => {
      if (enabled) {
        this.renderer.addClass(this.document.body, 'accessible-mode');
      } else {
        this.renderer.removeClass(this.document.body, 'accessible-mode');
      }
    });

    // Theme → body class
    this.subTheme = this.theme.theme$.subscribe(mode => {
      this.applyThemeClass(mode);
    });

    // Initial anwenden (damit nach Reload sofort stimmt)
    this.applyThemeClass(this.theme.current);
  }

  ngOnDestroy(): void {
    this.subA11y?.unsubscribe();
    this.subTheme?.unsubscribe();
  }

  private applyThemeClass(mode: ThemeMode): void {
    // zuerst alte Theme-Klassen entfernen
    this.renderer.removeClass(this.document.body, 'theme-normal');
    this.renderer.removeClass(this.document.body, 'theme-light');
    this.renderer.removeClass(this.document.body, 'theme-dark');

    // dann neue hinzufügen
    this.renderer.addClass(this.document.body, `theme-${mode}`);
  }
}
