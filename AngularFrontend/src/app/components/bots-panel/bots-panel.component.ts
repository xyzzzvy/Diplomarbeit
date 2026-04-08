import { Component, Output, EventEmitter } from '@angular/core';

export type BotCard = {
  name: string;
  level: string;
  avatar: string;
  status: 'online' | 'offline';
};

@Component({
  selector: 'app-bots-panel',
  standalone: false,
  templateUrl: './bots-panel.component.html',
  styleUrls: ['./bots-panel.component.css']
})
export class BotsPanelComponent {
  @Output() play = new EventEmitter<BotCard>();

  bots: BotCard[] = [
    { name: 'Bot 1', level: 'Easy', avatar: 'assets/bot.png', status: 'online' },
    { name: 'Bot 2', level: 'Hard', avatar: 'assets/bot.png', status: 'online' },
    { name: 'Bot 3', level: 'Medium', avatar: 'assets/bot.png', status: 'offline' }
  ];

  selectedBot: BotCard | null = null;

  selectBot(bot: BotCard) {
    this.selectedBot = bot;
  }

  onPlayClicked() {
    if (this.selectedBot) {
      this.play.emit(this.selectedBot);
    }
  }
}
