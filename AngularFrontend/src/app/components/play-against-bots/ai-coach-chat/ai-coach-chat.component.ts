import { Component } from '@angular/core';

type ChatMessage = {
  sender: 'user' | 'coach';
  text: string;
};

@Component({
  selector: 'app-ai-coach-chat',
  standalone: false,
  templateUrl: './ai-coach-chat.component.html',
  styleUrl: './ai-coach-chat.component.css'
})
export class AiCoachChatComponent {
  question = '';

  messages: ChatMessage[] = [
    {
      sender: 'coach',
      text: 'Hello, I am your AI Coach. You can ask me for advice about your next move, piece development or general strategy.'
    }
  ];

  sendMessage(): void {
    const trimmed = this.question.trim();
    if (!trimmed) return;

    this.messages.push({
      sender: 'user',
      text: trimmed
    });

    // Platzhalter-Antwort
    this.messages.push({
      sender: 'coach',
      text: 'A possible good next step could be to improve your piece activity, protect your king and look for central control.'
    });

    this.question = '';
  }
}
