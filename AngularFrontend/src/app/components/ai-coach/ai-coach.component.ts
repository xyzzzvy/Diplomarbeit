import { Component } from '@angular/core';
import {AIService} from '../../services/ai.service';

type Msg = { role: 'user' | 'ai'; text: string };

@Component({
  selector: 'app-ai-coach',
  standalone: false,
  templateUrl: './ai-coach.component.html',
  styleUrls: ['./ai-coach.component.css'],
})
export class AiCoachComponent {
  fen = '';
  pgn = '';
  question = '';

  messages: Msg[] = [
    { role: 'ai', text: 'Hi! Ask your chess-related question! You can add FEN and PGN for additional context.' }
  ];

  constructor(private aiService: AIService) {}

  send() {
    const text = this.question.trim();
    if (!text) return;

    this.messages.push({ role: 'user', text });

    const aiMsg: Msg = { role: 'ai', text: 'Thinking…' };
    this.messages.push(aiMsg);
    this.question = '';

    this.aiService.generateResponse(text, this.fen, this.pgn)
      .subscribe({
        next: res => {
          aiMsg.text = res.response;
        },
        error: err => {
          console.error(err);
          aiMsg.text = 'Error contacting Ollama.';
        }
      });
  }
}
