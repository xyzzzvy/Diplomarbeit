import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-play-against-bots',
  standalone: false,
  templateUrl: './play-against-bots.component.html',
  styleUrl: './play-against-bots.component.css'
})
export class PlayAgainstBotsComponent implements OnInit {
  board: string[][] = [];
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
    const empty = () => Array(8).fill('');
    const blackBack  = ['♜','♞','♝','♛','♚','♝','♞','♜'];
    const blackPawns = Array(8).fill('♟');
    const whitePawns = Array(8).fill('♙');
    const whiteBack  = ['♖','♘','♗','♕','♔','♗','♘','♖'];

    this.board = [
      [...blackBack],
      [...blackPawns],
      empty(), empty(), empty(), empty(),
      [...whitePawns],
      [...whiteBack]
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
    return this.board[r][c] === '';
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

    // einfache Verschiebung ohne Zuglogik
    this.board[from.r][from.c] = '';
    this.board[r][c] = piece;
    this.dragFrom = null;
    this.lastClicked = null;
    this.clearArrows();
  }

  // ------------------------------
  // Farben der Figuren
  // ------------------------------
  isWhite(ch: string): boolean {
    // Weiße Unicode-Figuren: ♙♖♘♗♕♔
    return '♙♖♘♗♕♔'.includes(ch);
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
  private showMovesForPiece(piece: string, r: number, c: number) {

    switch (piece) {

      // Bauern
      case '♙': { // weiß – nach oben (kleinere r)
        // 1 Schritt
        if (this.inBounds(r - 1, c) && this.isEmpty(r - 1, c)) {
          this.addArrow(r - 1, c, '↑', piece);
        }
        // 2 Schritte von der Startreihe (weiße Bauern stehen bei r=6)
        if (r === 6 && this.isEmpty(5, c) && this.isEmpty(4, c)) {
          this.addArrow(4, c, '↑', piece);
        }
        break;
      }

      case '♟': { // schwarz – nach unten (größere r)
        if (this.inBounds(r + 1, c) && this.isEmpty(r + 1, c)) {
          this.addArrow(r + 1, c, '↓', piece);
        }
        // 2 Schritte von der Startreihe (schwarze Bauern stehen bei r=1)
        if (r === 1 && this.isEmpty(2, c) && this.isEmpty(3, c)) {
          this.addArrow(3, c, '↓', piece);
        }
        break;
      }

      // Türme / Rooks
      case '♖':
      case '♜': {
        this.ray(r, c, -1, 0, '↑', piece);
        this.ray(r, c,  1, 0, '↓', piece);
        this.ray(r, c,  0,-1, '←', piece);
        this.ray(r, c,  0, 1, '→', piece);
        break;
      }

      // Läufer / Bishops
      case '♗':
      case '♝': {
        this.ray(r, c, -1,-1, '↖', piece);
        this.ray(r, c, -1, 1, '↗', piece);
        this.ray(r, c,  1,-1, '↙', piece);
        this.ray(r, c,  1, 1, '↘', piece);
        break;
      }

      // Dame / Queen
      case '♕':
      case '♛': {
        this.ray(r, c, -1, 0, '↑', piece);
        this.ray(r, c,  1, 0, '↓', piece);
        this.ray(r, c,  0,-1, '←', piece);
        this.ray(r, c,  0, 1, '→', piece);
        this.ray(r, c, -1,-1, '↖', piece);
        this.ray(r, c, -1, 1, '↗', piece);
        this.ray(r, c,  1,-1, '↙', piece);
        this.ray(r, c,  1, 1, '↘', piece);
        break;
      }

      // König / King – ein Feld rundherum, nur freie Felder
      case '♔':
      case '♚': {
        this.addIfFree(r - 1, c,     '↑', piece);
        this.addIfFree(r + 1, c,     '↓', piece);
        this.addIfFree(r,     c - 1, '←', piece);
        this.addIfFree(r,     c + 1, '→', piece);
        this.addIfFree(r - 1, c - 1, '↖', piece);
        this.addIfFree(r - 1, c + 1, '↗', piece);
        this.addIfFree(r + 1, c - 1, '↙', piece);
        this.addIfFree(r + 1, c + 1, '↘', piece);
        break;
      }

      // Springer / Knight – springen, aber nur auf freie Felder
      case '♘':
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
            this.addArrow(nr, nc, '✶', piece);
          }
        }
        break;
      }
    }
  }

  // ------------------------------
  // Pfeile setzen
  // ------------------------------

  private addArrow(r: number, c: number, arrow: string, piece: string) {
    this.arrows[r][c] = {
      symbol: arrow,
      color: this.isWhite(piece) ? 'white' : 'black'
    };
  }

  // nur wenn Feld existiert und leer ist
  private addIfFree(r: number, c: number, arrow: string, piece: string) {
    if (!this.inBounds(r, c)) return;
    if (!this.isEmpty(r, c)) return;
    this.addArrow(r, c, arrow, piece);
  }

  // Gerade / Diagonal-Linie, bricht an erster Figur ab
  private ray(r: number, c: number, dr: number, dc: number, arrow: string, piece: string) {
    for (let step = 1; step < 8; step++) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (!this.inBounds(nr, nc)) break;

      if (!this.isEmpty(nr, nc)) {
        // andere Figur im Weg → hier stoppen, kein Pfeil auf diesem Feld
        break;
      }

      this.addArrow(nr, nc, arrow, piece);
    }
  }
}
