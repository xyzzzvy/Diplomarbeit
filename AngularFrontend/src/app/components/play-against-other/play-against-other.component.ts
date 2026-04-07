import {Component, OnInit} from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-play-against-other',
  standalone: false,
  templateUrl: './play-against-other.component.html',
  styleUrl: './play-against-other.component.css'
})
export class PlayAgainstOtherComponent {
  isQueued = false;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.connect(); // connect immediately
  }

  queueUp() {
    this.socketService.emit('join_game'); // join queue
    this.isQueued = true;
  }
}
