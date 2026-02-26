import { Component, OnInit } from '@angular/core';
import { ChessService } from '../../services/chess.service';

@Component({
  selector: 'app-new-chessboard',
  templateUrl: './new-chessboard.component.html',
  styleUrls: ['./new-chessboard.component.css'],
  standalone: false
})
export class NewChessboardComponent implements OnInit {
  board: string[][] = [];                 // 8x8 board array
  fen: string = '';                       // current FEN
  possibleMoves: any[] = [];              // from chess.js backend
  highlightSquares: string[] = [];        // squares to highlight
  selectedSquare: string | null = null;
  gameId: string = 'test-game';           // example, can be dynamic
  currentTurn: 'w' | 'b' = 'w';          // track whose turn
  promotionData: { from: string, to: string } | null = null;

  constructor(private chessService: ChessService) {}

  ngOnInit(): void {
    this.loadGame();
  }

  // Load initial board from backend
  loadGame() {
    this.chessService.getBaseBoard().subscribe(res => {
      this.fen = res.fen;
      this.possibleMoves = res.moves;
      this.gameId = res.id;            // temporary game ID
      this.updateBoardFromFEN();
      this.currentTurn = res.turn as 'w' | 'b';
    });
  }


  // Convert FEN to 2D board array
  updateBoardFromFEN() {
    const rows = this.fen.split(' ')[0].split('/');
    this.board = rows.map(row => {
      const expanded: string[] = [];
      for (const char of row) {
        if (/\d/.test(char)) {
          expanded.push(...Array(Number(char)).fill(''));
        } else {
          expanded.push(this.pieceFromFEN(char));
        }
      }
      return expanded;
    });
  }

  // Map FEN char to piece symbol
  pieceFromFEN(f: string): string {
    const map: Record<string, string> = {
      p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
      P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
    };
    return map[f] || '';
  }

  // Clicking a piece
  onPieceClick(row: number, col: number) {
    const square = this.squareName(row, col);
    const piece = this.board[row][col];
    if (!piece || this.isWhite(piece) !== (this.currentTurn === 'w')) {
      this.clearSelection();
      return;
    }

    // Toggle selection
    if (this.selectedSquare === square) {
      this.clearSelection();
      return;
    }

    this.selectedSquare = square;
    this.highlightSquares = this.possibleMoves
      .filter(m => m.from === square)
      .map(m => m.to);
  }

  // Click on a square: if a piece is already selected and this square is a legal move, make the move
  onSquareClick(row: number, col: number) {
    const square = this.squareName(row, col);
    //console.log('Click on square:', square, 'Selected:', this.selectedSquare, 'Highlights:', this.highlightSquares);

    if (this.selectedSquare && this.highlightSquares.includes(square)) {
      //console.log('Making move:', this.selectedSquare, '->', square);
      this.makeMove(this.selectedSquare, square);
      this.clearSelection();
      return;
    }

    this.onPieceClick(row, col);
  }



  // Drag & Drop
  dragStart(row: number, col: number, ev: DragEvent) {
    const piece = this.board[row][col];
    if (!piece || this.isWhite(piece) !== (this.currentTurn === 'w')) return;
    ev.dataTransfer?.setData('text/plain', this.squareName(row, col));
    ev.dataTransfer?.setDragImage(document.createElement('img'), 0, 0);
  }

  allowDrop(ev: DragEvent) { ev.preventDefault(); }

  drop(row: number, col: number, ev: DragEvent) {
    ev.preventDefault();
    const from = ev.dataTransfer?.getData('text/plain');
    if (!from) return;
    const to = this.squareName(row, col);
    this.makeMove(from, to);
    this.clearSelection();
  }

  // Make move via ChessService
  makeMove(from: string, to: string, promotion?: string) {
    const move = this.possibleMoves.find(m => m.from === from && m.to === to);
    if (!move) return;

    // If this move includes promotion flag from chess.js
    if (move.promotion && !promotion) {
      this.openPromotionDialog(from, to);
      return;
    }

    this.chessService.move(this.gameId, from, to, promotion || 'q')
      .subscribe(res => {
        this.fen = res.fen;
        this.possibleMoves = res.moves;
        this.updateBoardFromFEN();
        this.currentTurn = res.turn as 'w' | 'b';
      });
  }

  // Helpers
  squareName(row: number, col: number) {
    const files = 'abcdefgh';
    return files[col] + (8 - row);
  }

  isWhite(piece: string) {
    return '♙♖♘♗♕♔'.includes(piece);
  }

  clearSelection() {
    this.selectedSquare = null;
    this.highlightSquares = [];
  }

  highlightClass(row: number, col: number) {
    return this.highlightSquares.includes(this.squareName(row, col)) ? 'highlight' : '';
  }

  getPieceImage(piece: string) {
    const prefix = this.isWhite(piece) ? 'w_' : 'b_';
    const map: Record<string, string> = {
      '♙': 'pawn','♟':'pawn','♖':'rook','♜':'rook','♘':'knight','♞':'knight',
      '♗':'bishop','♝':'bishop','♕':'queen','♛':'queen','♔':'king','♚':'king'
    };
    return `assets/pieces/${prefix}${map[piece]}.png`;
  }

  openPromotionDialog(from: string, to: string) {
    this.promotionData = { from, to };
  }

  selectPromotion(piece: 'q' | 'r' | 'b' | 'n') {
    if (!this.promotionData) return;

    this.makeMove(
      this.promotionData.from,
      this.promotionData.to,
      piece
    );

    this.promotionData = null;
  }
}
