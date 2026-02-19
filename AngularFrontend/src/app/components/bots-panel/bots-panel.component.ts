import { Component } from '@angular/core';

type BotCard = {
  name: string;
  level: string;
  avatar: string;
  status: 'online' | 'offline';
};

@Component({
  selector: 'app-bots-panel',
  standalone: false,
  templateUrl: './bots-panel.component.html',
  styleUrl: './bots-panel.component.css'
})
export class BotsPanelComponent {
  // Platzhalter – echte Bots kannst du später einfach aus einem Service/API laden
  bots: BotCard[] = [
    {
      name: 'Bot 1',
      level: 'Easy',
      avatar: 'assets/bot.png',
      status: 'online'
    },
    {
      name: 'Bot 2',
      level: 'Medium',
      avatar: 'assets/bot.png',
      status: 'online'
    },
    {
      name: 'Bot 3',
      level: 'Hard',
      avatar: 'assets/bot.png',
      status: 'offline'
    }
  ];
}
