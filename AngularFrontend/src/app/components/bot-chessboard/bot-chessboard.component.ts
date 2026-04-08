import { Component, OnInit } from '@angular/core';
import { ChessService } from '../../services/chess.service';
import { AIService } from '../../services/ai.service';
import { BotCard } from '../bots-panel/bots-panel.component'; // Pfad ggf. anpassen!

@Component({
  selector: 'bot-chessboard',
  templateUrl: './bot-chessboard.component.html',
  styleUrls: ['./bot-chessboard.component.css'],
  standalone: false
})
export class BotChessboardComponent implements OnInit {
  board: string[][] = [];
  fen: string = '';
  possibleMoves: any[] = [];
  highlightSquares: string[] = [];
  selectedSquare: string | null = null;
  gameId: string = 'test-game';
  currentTurn: 'w' | 'b' = 'w';
  promotionData: { from: string, to: string } | null = null;

  // 🔥 Speichert den aktuell gewählten Bot aus dem Panel
  currentOpponent: BotCard | null = null;

  constructor(
    private chessService: ChessService,
    private aiService: AIService,
  ) {}

  ngOnInit(): void {
    this.loadGame();
  }

  // 🔥 Wird vom Parent-HTML aufgerufen (myBoard.setBot($event))
  setBot(bot: BotCard) {
    this.currentOpponent = bot;
    console.log("Neuer Gegner festgelegt:", this.currentOpponent.name);
    // Optional: Hier könntest du das Spiel neu starten, wenn ein neuer Bot gewählt wird.
    // this.loadGame();
  }

  // 🔥 Die magische IF-Abfrage
  makeAIMove() {
    if (this.currentTurn !== 'b') return;

    if (!this.currentOpponent) {
      alert("Bitte wähle zuerst einen Bot aus der Liste aus und klicke auf Play!");
      return;
    }

    if (this.currentOpponent.name === 'Bot 2') {
      // Stockfish
      this.aiService.getBestMoveBot2(this.fen).subscribe(res => {
        this.executeMove(res.best_move);
      });
    } else {
      // AlphaZero (Default / Bot 1)
      this.aiService.getBestMoveBot1(this.fen).subscribe(res => {
        this.executeMove(res.best_move);
      });
    }
  }

  // Hilfsfunktion, damit wir den Move-Code nicht 2x schreiben müssen
  executeMove(bestMove: string) {
    if (!bestMove) return;
    const from = bestMove.substring(0, 2);
    const to = bestMove.substring(2, 4);
    const promotion = bestMove.length > 4 ? bestMove[4] : undefined;

    this.chessService.move(this.gameId, from, to, promotion || 'q')
      .subscribe(moveRes => {
        this.fen = moveRes.fen;
        this.possibleMoves = moveRes.moves;
        this.updateBoardFromFEN();
        this.currentTurn = moveRes.turn as 'w' | 'b';
      });
  }

  loadGame() {
    this.chessService.getBaseBoard().subscribe(res => {
      this.fen = res.fen;
      this.possibleMoves = res.moves;
      this.gameId = res.id;
      this.updateBoardFromFEN();
      this.currentTurn = res.turn as 'w' | 'b';
    });
  }

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

  pieceFromFEN(f: string): string {
    const map: Record<string, string> = {
      p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
      P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
    };
    return map[f] || '';
  }

  onPieceClick(row: number, col: number) {
    const square = this.squareName(row, col);
    const piece = this.board[row][col];
    if (!piece || this.isWhite(piece) !== (this.currentTurn === 'w')) {
      this.clearSelection();
      return;
    }
    if (this.selectedSquare === square) {
      this.clearSelection();
      return;
    }
    this.selectedSquare = square;
    this.highlightSquares = this.possibleMoves
      .filter(m => m.from === square)
      .map(m => m.to);
  }

  onSquareClick(row: number, col: number) {
    const square = this.squareName(row, col);
    if (this.selectedSquare && this.highlightSquares.includes(square)) {
      this.makeMove(this.selectedSquare, square);
      this.clearSelection();
      return;
    }
    this.onPieceClick(row, col);
  }

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

  makeMove(from: string, to: string, promotion?: string) {
    const move = this.possibleMoves.find(m => m.from === from && m.to === to);
    if (!move) return;

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

        setTimeout(() => this.makeAIMove(), 200);
      });
  }

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
    this.makeMove(this.promotionData.from, this.promotionData.to, piece);
    this.promotionData = null;
  }
}
