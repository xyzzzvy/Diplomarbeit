import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AIService {
  private ollamaApiUrl = "http://localhost:11434/api/generate"
  private pythonApiUrl = "";

  private http = inject(HttpClient);

  public generateResponse(question: string, fen?: string, pgn?: string): Observable<any> {
    const prompt: string = this.buildPrompt(question, fen, pgn);

    const body = {
      model: 'llama3',
      prompt: prompt,
      stream: false
    };

    return this.http.post<any>(this.ollamaApiUrl, body);
  }

  private buildPrompt(question: string, fen?: string, pgn?: string): string {
    return `You are tasked with helping chess players by answering their questions using the given metadata. If there is no metadata then answer using well-known chess principles.

question: ${question?.trim() || ''}

metadata:
- pgn: ${pgn?.trim() || ''}
- fen: ${fen?.trim() || ''}`;
  }
}
