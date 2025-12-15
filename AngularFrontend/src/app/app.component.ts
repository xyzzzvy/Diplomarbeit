import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccessibilityService } from './accessability.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  constructor(
    private accessibility: AccessibilityService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.sub = this.accessibility.isAccessible$.subscribe(enabled => {
      if (enabled) {
        this.renderer.addClass(this.document.body, 'accessible-mode');
      } else {
        this.renderer.removeClass(this.document.body, 'accessible-mode');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
