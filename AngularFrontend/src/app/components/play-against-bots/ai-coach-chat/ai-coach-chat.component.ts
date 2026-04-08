import { Component } from '@angular/core';
import { AIService } from '../../../services/ai.service'; // Make sure this path is correct!

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
  isLoading = false; // Prevents spam-clicking and shows a loading state

  messages: ChatMessage[] = [
    {
      sender: 'coach',
      text: 'Hello, I am your AI Coach. You can ask me for advice about your next move, piece development or general strategy.'
    }
  ];

  // Inject the AIService
  constructor(private aiService: AIService) {}

  sendMessage(): void {
    const trimmed = this.question.trim();
    if (!trimmed || this.isLoading) return;

    // 1. Add user message to UI
    this.messages.push({
      sender: 'user',
      text: trimmed
    });

    // 2. Clear input and set loading
    this.question = '';
    this.isLoading = true;

    // Optional: If you have FEN or PGN in this component, you can pass them here!
    const currentFen = undefined;
    const currentPgn = undefined;

    // 3. Call Ollama via AIService
    this.aiService.generateResponse(trimmed, currentFen, currentPgn).subscribe({
      next: (res) => {
        // Ollama puts the generated text inside the 'response' property
        this.messages.push({
          sender: 'coach',
          text: res.response
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error talking to Ollama:', err);
        this.messages.push({
          sender: 'coach',
          text: 'Oops! I cannot connect to my brain right now. Please make sure Ollama is running in the background.'
        });
        this.isLoading = false;
      }
    });
  }
}
