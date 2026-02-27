import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-info',
  standalone: false,
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css'
})
export class ProfileInfoComponent {
  profileName: string = "username";
  profileImageUrl: string = "./assets/profile_placeholder.png";
  profileSubline: string = "extra info"
}
