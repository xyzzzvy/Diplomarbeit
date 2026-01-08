import { Component } from '@angular/core';
import { AccessibilityService } from '../../accessability.service';
import {ThemeService} from '../../services/theme.service';

@Component({
  selector: 'app-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent {
  constructor(public accessibility: AccessibilityService, public theme: ThemeService) {}

  toggleAccessibility(): void {
    this.accessibility.toggle();
  }

  changeTheme(): void {
    this.theme.toggleTheme();
  }
}
