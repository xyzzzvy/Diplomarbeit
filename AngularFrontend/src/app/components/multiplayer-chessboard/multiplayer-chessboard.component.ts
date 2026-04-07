// multiplayer-chessboard.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-multiplayer-chessboard',
  templateUrl: './multiplayer-chessboard.component.html',
  styleUrls: ['./multiplayer-chessboard.component.css'],
  standalone: false
})
export class MultiplayerChessboardComponent implements OnInit {
  board: string[][] = [];
  fen: string = '';
  possibleMoves: any[] = [];
  highlightSquares: string[] = [];
  selectedSquare: string | null = null;
  gameId: string = '';
  roomId: string = '';
  currentTurn: 'w' | 'b' = 'w';
  promotionData: { from: string; to: string } | null = null;
  myColor: 'white' | 'black' | null = null;
  connected = false;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.connectSocket();
  }

  connectSocket() {
    this.socketService.connect();

    this.socketService.on('connected', (id: string) => {
      console.log('Connected with ID:', id);
      this.connected = true;
    });

    this.socketService.on('waiting_for_opponent', (data: any) => {
      console.log(data.message);
      this.roomId = data.roomId;
    });

    this.socketService.on('game_started', (data: any) => {
      console.log('Game started!', data);
      this.roomId = data.roomId;
      this.gameId = data.gameId;
      this.fen = data.fen;
      this.possibleMoves = data.moves;
      this.updateBoardFromFEN();
      this.currentTurn = data.turn;
    });

    this.socketService.on('assign_color', (color: 'white' | 'black') => {
      console.log('Assigned color:', color);
      this.myColor = color;
    });

    this.socketService.on('game_state', (data: any) => {
      this.fen = data.fen;
      this.possibleMoves = data.moves;
      this.currentTurn = data.turn;
      this.updateBoardFromFEN();
    });

    this.socketService.on('opponent_disconnected', (data: any) => {
      alert(data.message);
    });
  }

  queueUp() {
    if (!this.connected) return;
    this.socketService.emit('join_game');
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
    if (!piece || (this.isWhite(piece) ? 'white' : 'black') !== this.myColor) {
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
      this.sendMove(this.selectedSquare, square);
      this.clearSelection();
      return;
    }

    this.onPieceClick(row, col);
  }

  dragStart(row: number, col: number, ev: DragEvent) {
    const piece = this.board[row][col];
    if (!piece || (this.isWhite(piece) ? 'white' : 'black') !== this.myColor) return;
    ev.dataTransfer?.setData('text/plain', this.squareName(row, col));
    ev.dataTransfer?.setDragImage(document.createElement('img'), 0, 0);
  }

  allowDrop(ev: DragEvent) { ev.preventDefault(); }

  drop(row: number, col: number, ev: DragEvent) {
    ev.preventDefault();
    const from = ev.dataTransfer?.getData('text/plain');
    if (!from) return;
    const to = this.squareName(row, col);
    this.sendMove(from, to);
    this.clearSelection();
  }

  sendMove(from: string, to: string, promotion?: string) {
    if (!this.roomId) return;

    this.socketService.emit('send_move', {
      roomId: this.roomId,
      move: { from, to, promotion: promotion || 'q' }
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
    this.sendMove(this.promotionData.from, this.promotionData.to, piece);
    this.promotionData = null;
  }
}
