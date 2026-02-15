import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ChessService {
  private chessApiUrl= "http://localhost:3000/api/chess";

  private http = inject(HttpClient);

  public move(gameId: string, from: string, to: string, promotion?: string): Observable<{ id: string, fen: string, pgn: string, turn: string, status: boolean, moves: any[] }> {
    return this.http.post<{ id: string, fen: string, pgn: string, turn: string, status: boolean, moves: any[] }> (`${this.chessApiUrl}/move`, { gameId, from, to, promotion });
  }

  public getBaseBoard(): Observable<{ id: string, fen: string, pgn: string, turn: string, status: boolean, moves: any[] }> {
    return this.http.get<{ id: string, fen: string, pgn: string, turn: string, status: boolean, moves: any[] }>(`${this.chessApiUrl}/get-base-board`);
  }
}
