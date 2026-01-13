import { Component } from '@angular/core';

type Msg = { role: 'user' | 'ai'; text: string };

@Component({
  selector: 'app-ai-coach',
  standalone: false,
  templateUrl: './ai-coach.component.html',
  styleUrls: ['./ai-coach.component.css'],
})
export class AiCoachComponent {
  fen = '';
  draft = '';
  selectedFileName = '';

  messages: Msg[] = [
    { role: 'ai', text: 'Hi! Send me a FEN or upload a PNG, and ask your question.' },
    { role: 'user', text: 'Can you help me find a good plan?' },
  ];

  send() {
    const text = (this.draft || '').trim();
    if (!text) return;

    this.messages.push({ role: 'user', text });
    this.draft = '';

    // Placeholder answer (später echte AI Logik)
    this.messages.push({ role: 'ai', text: 'Got it. (Placeholder) I will analyze this position soon.' });
  }

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
}
