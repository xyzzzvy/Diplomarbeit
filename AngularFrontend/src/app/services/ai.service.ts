import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AIService {
  private ollamaApiUrl = "http://localhost:11434/api/generate"
}
