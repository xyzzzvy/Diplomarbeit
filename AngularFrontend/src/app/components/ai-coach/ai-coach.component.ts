import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

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

  private buildSystemPromptBasic(): string {
    return `
You are a chess assistant tasked with helping users improve their chess skills by answering their questions in a thoughtful manner.
Cut to the chase and focus on answering the question.

Answer the user question given below.
Question: ${this.question.trim()}

Use the given metadata below for context. If none is given then answer using well-known chess principles.
Metadata: (FEN: ${this.fen.trim()}, PGN: ${this.pgn.trim()})

Keep your tone casual yet professional and friendly.
  `;
  }

  private buildSystemPromptLlama(): string {
    const instruction = `You are a chess assistant tasked with helping users improve their chess skills by answering their questions in a thoughtful manner. Cut to the chase and focus on answering the question. Answer the user question given below: ${this.question.trim()}`;

    // Wrap metadata in the input format your fine-tuned model expects
    const input = `[pgn: ${this.pgn.trim()}] [fen: ${this.fen.trim()}]`;

    // Build the final instruction-tuned prompt
    return `[INST] ${instruction} ${input} [/INST]`;
  }



  messages: Msg[] = [
    { role: 'ai', text: 'Hi! Ask your chess-related question! You can add FEN and PGN for additional context.' },
    //{ role: 'user', text: 'What are good basic principles to learn as a beginner?' },
  ];

  send() {
    const text = (this.question || '').trim();
    if (!text) return;

    this.messages.push({ role: 'user', text });
    this.callOllama()
    this.question = '';
  }

  private http = inject(HttpClient);       // modern style

  callOllama() {
    const prompt = this.buildSystemPromptLlama();

    const body = {
      "model": "chess-ai-coach-v1:latest",
      prompt,
      stream: false
    };

    // Step 1: push a temporary "AI is generating answer..." message
    this.messages.push({
      role: 'ai',
      text: `Please wait a minute. Model is generating answer… FEN:(${this.fen.trim()}) PGN: (${this.pgn.trim()}) Question: (${this.question})`,
    });

    // Keep a reference to this message so we can replace it
    const aiMsg = this.messages[this.messages.length - 1];

    // Step 2: call Ollama
    this.http.post<any>('http://127.0.0.1:11434/api/generate', body)
      .subscribe({
        next: (res) => {
          // Step 3: replace placeholder text with actual AI response
          aiMsg.text = res.response;
        },
        error: (err) => {
          console.error('Ollama error', err);
          aiMsg.text = 'Error contacting Ollama.';
        }
      });
  }



  /*
  useFen() {
    const f = (this.fen || '').trim();
    if (!f) return;

    this.messages.push({ role: 'user', text: `FEN: ${f}` });
    this.messages.push({ role: 'ai', text: 'Thanks! (Placeholder) I will analyze the FEN.' });
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFileName = file ? file.name : '';
    if (file) {
      this.messages.push({ role: 'user', text: `Uploaded: ${file.name}` });
      this.messages.push({ role: 'ai', text: 'Nice. (Placeholder) I will analyze the image.' });
    }
  }
  */
}
