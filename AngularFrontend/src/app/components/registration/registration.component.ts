import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  selector: 'app-registration',
  standalone: false,
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  showPswd = false;
  username = '';
  password = '';
  text = '';

  togglePswd(): void {
    this.showPswd = !this.showPswd;
  }

  private http = inject(HttpClient);

  register(): void {
    const body = {
      username: this.username,
      password: this.password,
      text: this.text
    };

    this.http.post<any>('http://127.0.0.1:3000/api/auth/register', body, {
      withCredentials: true
    })
      .subscribe({
        next: (res) => {
          //this.success = 'Registration successful';
          console.log('Registered user:', res);
        },
        error: (err) => {
          console.error('Register error', err);
          //this.error = err.error?.error || 'Registration failed';
        }
      });
  }
}
