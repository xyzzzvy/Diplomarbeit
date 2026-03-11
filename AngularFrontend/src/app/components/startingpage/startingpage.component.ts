import { Component } from '@angular/core';

@Component({
  selector: 'app-startingpage',
  standalone: false,
  templateUrl: './startingpage.component.html',
  styleUrl: './startingpage.component.css'
})
export class StartingpageComponent {
  modes = [
    {
      title: 'Play vs Bots',
      shortText: 'Train against AI opponents',
      longText: 'Play chess against different AI bots with varying difficulty levels. This mode allows you to practice your strategies, improve your decision making and learn from mistakes without the pressure of playing against a real opponent. It is ideal for beginners as well as experienced players who want to refine their skills.',
      route: '/playAgainstBots'
    },
    {
      title: 'Play vs Friends',
      shortText: 'Challenge your friends',
      longText: 'Invite your friends and compete against them in a private chess match. This mode allows you to play together online, test your abilities against people you know and enjoy friendly competition while improving your chess skills.',
      route: '/playAgainstFriends'
    },
    {
      title: 'Play Online',
      shortText: 'Compete with players worldwide',
      longText: 'Play chess against other players from around the world. This mode matches you with opponents of different skill levels and allows you to gain real competitive experience while improving your overall gameplay.',
      route: '/playAgainstOther'
    },
    {
      title: 'AI Coach',
      shortText: 'Improve your strategy',
      longText: 'The AI Coach analyzes your moves and provides useful suggestions to improve your gameplay. It helps you understand better strategies, identify mistakes and develop a deeper understanding of chess tactics and decision making.',
      route: '/aicoach'
    },
    {
      title: 'Tournaments',
      shortText: 'Join competitive events',
      longText: 'Participate in organized chess tournaments and compete against multiple players. This mode allows you to test your skills in a competitive environment and challenge yourself against strong opponents.',
      route: '/tournaments'
    }
  ];
}
