import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-mini-chess-preview',
  standalone: false,
  templateUrl: './mini-chess-preview.component.html',
  styleUrl: './mini-chess-preview.component.css'
})
export class MiniChessPreviewComponent implements OnInit, OnDestroy {
  board: string[][] = [
    ['♜', '', '', '', '♚', '', '', '♜'],
    ['♟', '♟', '♟', '', '', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '♟', '', '', '', ''],
    ['', '', '', '', '♙', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '', '', '♙', '♙', '♙'],
    ['♖', '', '', '', '♔', '', '', '♖']
  ];

  private frames: string[][][] = [
    [
      ['♜', '', '', '', '♚', '', '', '♜'],
      ['♟', '♟', '♟', '', '', '♟', '♟', '♟'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '♟', '', '', '', ''],
      ['', '', '', '', '♙', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['♙', '♙', '♙', '', '', '♙', '♙', '♙'],
      ['♖', '', '', '', '♔', '', '', '♖']
    ],
    [
      ['♜', '', '', '', '♚', '', '', '♜'],
      ['♟', '♟', '♟', '', '', '♟', '♟', '♟'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '♟', '', '', '', ''],
      ['', '', '', '', '♙', '', '', ''],
      ['', '', '♘', '', '', '', '', ''],
      ['♙', '♙', '♙', '', '', '♙', '♙', '♙'],
      ['♖', '', '', '', '♔', '', '', '♖']
    ],
    [
      ['♜', '', '', '', '♚', '', '', '♜'],
      ['♟', '♟', '♟', '', '', '♟', '♟', '♟'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '♟', '', '', '', ''],
      ['', '', '', '', '♙', '', '', ''],
      ['', '', '♘', '', '', '♞', '', ''],
      ['♙', '♙', '♙', '', '', '♙', '♙', '♙'],
      ['♖', '', '', '', '♔', '', '', '♖']
    ],
    [
      ['♜', '', '', '', '♚', '', '', '♜'],
      ['♟', '♟', '♟', '', '', '♟', '♟', '♟'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '♟', '', '', '', ''],
      ['', '', '', '', '♙', '', '', ''],
      ['', '', '♘', '', '', '♞', '', ''],
      ['♙', '♙', '♙', '', '', '♙', '♙', '♙'],
      ['♖', '', '', '♕', '♔', '', '', '♖']
    ]
  ];

  private currentFrame = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
      this.board = this.frames[this.currentFrame];
    }, 1400);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  isDark(row: number, col: number): boolean {
    return (row + col) % 2 === 1;
  }

  isWhitePiece(piece: string): boolean {
    return ['♔', '♕', '♖', '♗', '♘', '♙'].includes(piece);
  }
}
