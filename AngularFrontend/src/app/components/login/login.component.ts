import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showpswd = false;
  password = '';
  username = '';


  toggleShowpswd() {
    this.showpswd = !this.showpswd;
  }

  private http = inject(HttpClient);

  login(): void {
    const body = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('http://127.0.0.1:3000/api/auth/login', body, {
      withCredentials: true
    })
      .subscribe({
        next: (res) => {
          //this.success = 'Login successful';
          //this.error = '';
          console.log('Logged in user:', res);
          window.alert('Login successful');
        },
        error: (err) => {
          console.error('Login error', err);
          window.alert('Login failed!');
          //this.error = err.error?.error || 'Login failed';
          //this.success = '';
        }
      });
  }
}
