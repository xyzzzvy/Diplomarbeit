import {Component, OnInit} from '@angular/core';

type PieceColor = 'white' | 'black';
type Piece = { type: string; color: PieceColor };

@Component({
  selector: 'app-play-against-bots',
  standalone: false,
  templateUrl: './play-against-bots.component.html',
  styleUrl: './play-against-bots.component.css'
})
export class PlayAgainstBotsComponent implements OnInit {
  board: (Piece | null)[][] = [];
  arrows: { symbol: string; color: 'white' | 'black' | '' }[][] = [];
  private dragFrom: { r: number; c: number } | null = null;
  private lastClicked: { r: number; c: number } | null = null;

  ngOnInit(): void {
    this.resetBoard();
  }

  // ------------------------------
  // Brett & Setup
  // ------------------------------
  resetBoard() {
    const empty = () => Array.from({ length: 8 }, () => null as Piece | null);

    const back = ['♜','♞','♝','♛','♚','♝','♞','♜'];
    const pawns = Array(8).fill('♟');

    this.board = [
      back.map(t => ({ type: t, color: 'black' as const })),
      pawns.map(t => ({ type: t, color: 'black' as const })),
      empty(), empty(), empty(), empty(),
      pawns.map(t => ({ type: t, color: 'white' as const })),
      back.map(t => ({ type: t, color: 'white' as const })),
    ];

    this.initArrows();
    this.lastClicked = null;
  }

  private initArrows() {
    this.arrows = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => ({ symbol: '', color: '' }))
    );
  }

  private clearArrows() {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        this.arrows[r][c] = { symbol: '', color: '' };
      }
    }
  }

  // ------------------------------
  // Hilfsfunktionen für Brett
  // ------------------------------
  private inBounds(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  private isEmpty(r: number, c: number): boolean {
    return this.board[r][c] === null;
  }

  // ------------------------------
  // Drag & Drop
  // ------------------------------
  dragStart(r: number, c: number, ev: DragEvent) {
    this.dragFrom = { r, c };
    this.lastClicked = null;
    this.clearArrows();
    ev.dataTransfer?.setData('text/plain', JSON.stringify(this.dragFrom));
    ev.dataTransfer?.setDragImage(document.createElement('img'), 0, 0);
  }

  allowDrop(ev: DragEvent) {
    ev.preventDefault();
  }

  drop(r: number, c: number, ev: DragEvent) {
    ev.preventDefault();
    const dataStr = ev.dataTransfer?.getData('text/plain');
    const from = this.dragFrom || (dataStr ? JSON.parse(dataStr) : null);
    if (!from) return;

    const piece = this.board[from.r][from.c];
    if (!piece) { this.dragFrom = null; return; }

    this.board[from.r][from.c] = null;
    this.board[r][c] = piece;
    this.dragFrom = null;
    this.lastClicked = null;
    this.clearArrows();
  }

  // ------------------------------
  // Klick auf Figur → Pfeile anzeigen / ausblenden
  // ------------------------------
  onPieceClick(r: number, c: number) {
    const piece = this.board[r][c];
    if (!piece) {
      this.clearArrows();
      this.lastClicked = null;
      return;
    }

    // Zweiter Klick auf dieselbe Figur → Pfeile entfernen
    if (this.lastClicked && this.lastClicked.r === r && this.lastClicked.c === c) {
      this.clearArrows();
      this.lastClicked = null;
      return;
    }

    this.lastClicked = { r, c };
    this.clearArrows();
    this.showMovesForPiece(piece, r, c);
  }

  // ------------------------------
  // Zug-Visualisierung (nur Pfeile, keine echte Regelprüfung)
  // ------------------------------
  private showMovesForPiece(piece: Piece, r: number, c: number) {
    const pieceColor = piece.color;

    switch (piece.type) {

      // Bauern (Symbol ist bei dir immer ♟)
      case '♟': {
        if (pieceColor === 'white') {
          if (this.inBounds(r - 1, c) && this.isEmpty(r - 1, c)) {
            this.addArrow(r - 1, c, '↑', pieceColor);
          }
          if (r === 6 && this.isEmpty(5, c) && this.isEmpty(4, c)) {
            this.addArrow(4, c, '↑', pieceColor);
          }
        } else {
          if (this.inBounds(r + 1, c) && this.isEmpty(r + 1, c)) {
            this.addArrow(r + 1, c, '↓', pieceColor);
          }
          if (r === 1 && this.isEmpty(2, c) && this.isEmpty(3, c)) {
            this.addArrow(3, c, '↓', pieceColor);
          }
        }
        break;
      }

      // Turm
      case '♜': {
        this.ray(r, c, -1, 0, '↑', pieceColor);
        this.ray(r, c,  1, 0, '↓', pieceColor);
        this.ray(r, c,  0,-1, '←', pieceColor);
        this.ray(r, c,  0, 1, '→', pieceColor);
        break;
      }

      // Läufer
      case '♝': {
        this.ray(r, c, -1,-1, '↖', pieceColor);
        this.ray(r, c, -1, 1, '↗', pieceColor);
        this.ray(r, c,  1,-1, '↙', pieceColor);
        this.ray(r, c,  1, 1, '↘', pieceColor);
        break;
      }

      // Dame
      case '♛': {
        this.ray(r, c, -1, 0, '↑', pieceColor);
        this.ray(r, c,  1, 0, '↓', pieceColor);
        this.ray(r, c,  0,-1, '←', pieceColor);
        this.ray(r, c,  0, 1, '→', pieceColor);
        this.ray(r, c, -1,-1, '↖', pieceColor);
        this.ray(r, c, -1, 1, '↗', pieceColor);
        this.ray(r, c,  1,-1, '↙', pieceColor);
        this.ray(r, c,  1, 1, '↘', pieceColor);
        break;
      }

      // König
      case '♚': {
        this.addIfFree(r - 1, c,     '↑', pieceColor);
        this.addIfFree(r + 1, c,     '↓', pieceColor);
        this.addIfFree(r,     c - 1, '←', pieceColor);
        this.addIfFree(r,     c + 1, '→', pieceColor);
        this.addIfFree(r - 1, c - 1, '↖', pieceColor);
        this.addIfFree(r - 1, c + 1, '↗', pieceColor);
        this.addIfFree(r + 1, c - 1, '↙', pieceColor);
        this.addIfFree(r + 1, c + 1, '↘', pieceColor);
        break;
      }

      // Springer
      case '♞': {
        const moves = [
          [-2, -1], [-2,  1],
          [-1, -2], [-1,  2],
          [ 1, -2], [ 1,  2],
          [ 2, -1], [ 2,  1]
        ];
        for (const [dr, dc] of moves) {
          const nr = r + dr;
          const nc = c + dc;
          if (this.inBounds(nr, nc) && this.isEmpty(nr, nc)) {
            this.addArrow(nr, nc, '✶', pieceColor);
          }
        }
        break;
      }
    }
  }

  // ------------------------------
  // Pfeile setzen
  // ------------------------------
  private addArrow(r: number, c: number, arrow: string, color: 'white' | 'black') {
    this.arrows[r][c] = { symbol: arrow, color };
  }

  private addIfFree(r: number, c: number, arrow: string, color: 'white' | 'black') {
    if (!this.inBounds(r, c)) return;
    if (!this.isEmpty(r, c)) return;
    this.addArrow(r, c, arrow, color);
  }

  private ray(r: number, c: number, dr: number, dc: number, arrow: string, color: 'white' | 'black') {
    for (let step = 1; step < 8; step++) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (!this.inBounds(nr, nc)) break;
      if (!this.isEmpty(nr, nc)) break;
      this.addArrow(nr, nc, arrow, color);
    }
  }
}
