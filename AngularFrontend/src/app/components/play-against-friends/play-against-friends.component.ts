import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-play-against-friends',
  standalone: false,
  templateUrl: './play-against-friends.component.html',
  styleUrl: './play-against-friends.component.css'
})
export class PlayAgainstFriendsComponent implements OnInit {
  board: string[][] = [];
  private dragFrom: { r: number; c: number } | null = null;

  ngOnInit(): void {
    this.resetBoard();
  }

  resetBoard() {
    const empty = () => Array(8).fill('');
    const blackBack = ['♜','♞','♝','♛','♚','♝','♞','♜'];
    const blackPawns = Array(8).fill('♟');
    const whitePawns = Array(8).fill('♙');
    const whiteBack = ['♖','♘','♗','♕','♔','♗','♘','♖'];

    this.board = [
      [...blackBack],
      [...blackPawns],
      empty(), empty(), empty(), empty(),
      [...whitePawns],
      [...whiteBack]
    ];
  }

  dragStart(r: number, c: number, ev: DragEvent) {
    this.dragFrom = { r, c };
    ev.dataTransfer?.setData('text/plain', JSON.stringify(this.dragFrom));
    ev.dataTransfer?.setDragImage(document.createElement('img'), 0, 0); // kein Ghost
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

    // Move (keine Zug-Logik, nur verschieben)
    this.board[from.r][from.c] = '';
    this.board[r][c] = piece;
    this.dragFrom = null;
  }
}
