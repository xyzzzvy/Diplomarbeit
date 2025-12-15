import { Component } from '@angular/core';
import { AccessibilityService } from '../../accessability.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  constructor(public accessibility: AccessibilityService) {}

  toggleAccessibility(): void {
    this.accessibility.toggle();
  }
}
