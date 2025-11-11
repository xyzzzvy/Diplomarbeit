import { Component } from '@angular/core';

@Component({
  selector: 'app-registration',
  standalone: false,
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  showPswd = false;

  togglePswd(): void {
    this.showPswd = !this.showPswd;
  }
}
