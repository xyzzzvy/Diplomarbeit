import { Component } from '@angular/core';

@Component({
  selector: 'app-play-against-bots',
  templateUrl: './play-against-bots.component.html',
  styleUrls: ['./play-against-bots.component.css'],
  standalone: false
})
export class PlayAgainstBotsComponent {
  toggledPanel: string = 'bots';

  switchToggle() {
    this.toggledPanel = this.toggledPanel === 'bots' ? 'chat' : 'bots';
  }
}
