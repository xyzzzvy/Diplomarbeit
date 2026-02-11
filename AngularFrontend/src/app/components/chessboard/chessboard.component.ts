import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-chessboard',
  standalone: false,
  templateUrl: './chessboard.component.html',
  styleUrl: './chessboard.component.css'
})
export class ChessboardComponent implements OnInit {
  board: string[][] = [];
  arrows: { symbol: string; color: 'white' | 'black' | '' }[][] = [];
  currentTurn: 'white' | 'black' = 'white';
  private dragFrom: { r: number; c: number } | null = null;
  private lastClicked: { r: number; c: number } | null = null;
  private hasKingMoved: { white: boolean; black: boolean } = { white: false, black: false };
  private hasRookMoved: { white: [boolean, boolean]; black: [boolean, boolean] } = { white: [false, false], black: [false, false] };

  ngOnInit(): void {
    this.resetBoard();
  }

  // ------------------------------
  // Board setup
  // ------------------------------
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

    this.initArrows();
    this.lastClicked = null;
    this.currentTurn = 'white';
    this.hasKingMoved = { white: false, black: false };
    this.hasRookMoved = { white: [false,false], black: [false,false] };
  }

  public initArrows() {
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

  public inBounds(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  public isEmpty(r: number, c: number): boolean {
    return this.board[r][c] === '';
  }

  public isWhite(ch: string): boolean {
    return '♙♖♘♗♕♔'.includes(ch);
  }

  getPieceImage(piece: string): string {
    const isWhite = this.isWhite(piece);
    const prefix = isWhite ? 'w_' : 'b_';

    const map: Record<string, string> = {
      '♙': 'pawn',
      '♟': 'pawn',
      '♖': 'rook',
      '♜': 'rook',
      '♘': 'knight',
      '♞': 'knight',
      '♗': 'bishop',
      '♝': 'bishop',
      '♕': 'queen',
      '♛': 'queen',
      '♔': 'king',
      '♚': 'king',
    };

    return `assets/pieces/${prefix}${map[piece]}.png`;
  }

  private isOpponentPiece(r: number, c: number, piece: string): boolean {
    return !this.isEmpty(r,c) && this.isWhite(this.board[r][c]) !== this.isWhite(piece);
  }

  // ------------------------------
  // Drag & Drop
  // ------------------------------
  dragStart(r: number, c: number, ev: DragEvent) {
    const piece = this.board[r][c];
    if (!piece || (this.isWhite(piece) ? 'white' : 'black') !== this.currentTurn) return;

    this.dragFrom = { r, c };
    ev.dataTransfer?.setData('text/plain', JSON.stringify(this.dragFrom));
    ev.dataTransfer?.setDragImage(document.createElement('img'), 0, 0);
  }

  allowDrop(ev: DragEvent) { ev.preventDefault(); }

  drop(r: number, c: number, ev: DragEvent) {
    ev.preventDefault();
    const dataStr = ev.dataTransfer?.getData('text/plain');
    const from = this.dragFrom || (dataStr ? JSON.parse(dataStr) : null);
    if (!from) return;

    const piece = this.board[from.r][from.c];
    if (!piece) { this.dragFrom = null; return; }

    if (!this.isValidMove(piece, from.r, from.c, r, c)) {
      this.dragFrom = null;
      return;
    }

    this.handleCastling(piece, from.r, from.c, r, c);

    this.board[from.r][from.c] = '';
    this.board[r][c] = piece;

    this.updateMovedFlags(piece, from.r, from.c);

    // Pawn promotion
    if (piece === '♙' && r === 0) this.board[r][c] = '♕';
    if (piece === '♟' && r === 7) this.board[r][c] = '♛';

    this.dragFrom = null;
    this.lastClicked = null;
    this.clearArrows();

    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
  }

  private updateMovedFlags(piece: string, r: number, c: number) {
    if (piece === '♔') this.hasKingMoved.white = true;
    if (piece === '♚') this.hasKingMoved.black = true;

    if (piece === '♖') {
      if (r === 7 && c === 0) this.hasRookMoved.white[0] = true;
      if (r === 7 && c === 7) this.hasRookMoved.white[1] = true;
    }
    if (piece === '♜') {
      if (r === 0 && c === 0) this.hasRookMoved.black[0] = true;
      if (r === 0 && c === 7) this.hasRookMoved.black[1] = true;
    }
  }

  private handleCastling(piece: string, fromR: number, fromC: number, toR: number, toC: number) {
    // White king
    if (piece === '♔' && fromR === 7 && fromC === 4) {
      if (!this.hasKingMoved.white) {
        if (toC === 6 && !this.hasRookMoved.white[1] && this.isEmpty(7,5) && this.isEmpty(7,6)) {
          this.board[7][7] = ''; this.board[7][5] = '♖';
        }
        if (toC === 2 && !this.hasRookMoved.white[0] && this.isEmpty(7,1) && this.isEmpty(7,2) && this.isEmpty(7,3)) {
          this.board[7][0] = ''; this.board[7][3] = '♖';
        }
      }
    }

    // Black king
    if (piece === '♚' && fromR === 0 && fromC === 4) {
      if (!this.hasKingMoved.black) {
        if (toC === 6 && !this.hasRookMoved.black[1] && this.isEmpty(0,5) && this.isEmpty(0,6)) {
          this.board[0][7] = ''; this.board[0][5] = '♜';
        }
        if (toC === 2 && !this.hasRookMoved.black[0] && this.isEmpty(0,1) && this.isEmpty(0,2) && this.isEmpty(0,3)) {
          this.board[0][0] = ''; this.board[0][3] = '♜';
        }
      }
    }
  }

  // ------------------------------
  // Clicking pieces to show arrows
  // ------------------------------
  onPieceClick(r: number, c: number) {
    const piece = this.board[r][c];
    if (!piece || (this.isWhite(piece) ? 'white' : 'black') !== this.currentTurn) {
      this.clearArrows();
      this.lastClicked = null;
      return;
    }

    if (this.lastClicked && this.lastClicked.r === r && this.lastClicked.c === c) {
      this.clearArrows();
      this.lastClicked = null;
      return;
    }

    this.lastClicked = { r, c };
    this.clearArrows();
    this.showMovesForPiece(piece, r, c);
  }

  private canMoveTo(piece: string, nr: number, nc: number) {
    if (!this.inBounds(nr, nc)) return false;
    if (this.isEmpty(nr, nc)) return true;
    if (this.isOpponentPiece(nr, nc, piece)) return true;
    return false;
  }

  private showMovesForPiece(piece: string, r: number, c: number) {
    switch(piece) {
      case '♙': {
        if (this.inBounds(r-1,c) && this.isEmpty(r-1,c)) this.addArrow(r-1,c,'↑',piece);
        if (r===6 && this.isEmpty(5,c) && this.isEmpty(4,c)) this.addArrow(4,c,'↑',piece);
        if (this.inBounds(r-1,c-1) && this.isOpponentPiece(r-1,c-1,piece)) this.addArrow(r-1,c-1,'↖',piece);
        if (this.inBounds(r-1,c+1) && this.isOpponentPiece(r-1,c+1,piece)) this.addArrow(r-1,c+1,'↗',piece);
        break;
      }
      case '♟': {
        if (this.inBounds(r+1,c) && this.isEmpty(r+1,c)) this.addArrow(r+1,c,'↓',piece);
        if (r===1 && this.isEmpty(2,c) && this.isEmpty(3,c)) this.addArrow(3,c,'↓',piece);
        if (this.inBounds(r+1,c-1) && this.isOpponentPiece(r+1,c-1,piece)) this.addArrow(r+1,c-1,'↙',piece);
        if (this.inBounds(r+1,c+1) && this.isOpponentPiece(r+1,c+1,piece)) this.addArrow(r+1,c+1,'↘',piece);
        break;
      }
      case '♖': case '♜': this.rayMoves(r,c,-1,0,'↑',piece); this.rayMoves(r,c,1,0,'↓',piece);
        this.rayMoves(r,c,0,-1,'←',piece); this.rayMoves(r,c,0,1,'→',piece); break;
      case '♗': case '♝': this.rayMoves(r,c,-1,-1,'↖',piece); this.rayMoves(r,c,-1,1,'↗',piece);
        this.rayMoves(r,c,1,-1,'↙',piece); this.rayMoves(r,c,1,1,'↘',piece); break;
      case '♕': case '♛': this.rayMoves(r,c,-1,0,'↑',piece); this.rayMoves(r,c,1,0,'↓',piece);
        this.rayMoves(r,c,0,-1,'←',piece); this.rayMoves(r,c,0,1,'→',piece);
        this.rayMoves(r,c,-1,-1,'↖',piece); this.rayMoves(r,c,-1,1,'↗',piece);
        this.rayMoves(r,c,1,-1,'↙',piece); this.rayMoves(r,c,1,1,'↘',piece); break;
      case '♔': case '♚': {
        const dirs: [number, number, string][] = [
          [-1,0,'↑'], [1,0,'↓'], [0,-1,'←'], [0,1,'→'],
          [-1,-1,'↖'], [-1,1,'↗'], [1,-1,'↙'], [1,1,'↘']
        ];
        for (const [dr, dc, arrow] of dirs) {
          const nr: number = r + dr;
          const nc: number = c + dc;
          if (this.canMoveTo(piece, nr, nc)) this.addArrow(nr, nc, arrow, piece);
        }
        if (!this.hasKingMoved[this.isWhite(piece) ? 'white' : 'black']) {
          if (this.canCastleKingside(this.isWhite(piece))) this.addArrow(r,6,'→',piece);
          if (this.canCastleQueenside(this.isWhite(piece))) this.addArrow(r,2,'←',piece);
        }
        break;
      }
      case '♘': case '♞': {
        const moves: [number, number][] = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for(const [dr,dc] of moves){
          const nr: number = r + dr;
          const nc: number = c + dc;
          if(this.canMoveTo(piece,nr,nc)) this.addArrow(nr,nc,'✶',piece);
        }
        break;
      }
    }
  }

  private rayMoves(r:number,c:number,dr:number,dc:number,arrow:string,piece:string){
    for(let step=1; step<8; step++){
      const nr: number = r + dr*step;
      const nc: number = c + dc*step;
      if(!this.inBounds(nr,nc)) break;
      if(!this.isEmpty(nr,nc)){
        if(this.isOpponentPiece(nr,nc,piece)) this.addArrow(nr,nc,arrow,piece);
        break;
      }
      this.addArrow(nr,nc,arrow,piece);
    }
  }

  private addArrow(r:number,c:number,arrow:string,piece:string){
    this.arrows[r][c]={symbol:arrow,color:this.isWhite(piece)?'white':'black'};
  }

  private isValidMove(piece:string,fromR:number,fromC:number,toR:number,toC:number):boolean{
    if(!this.inBounds(toR,toC)) return false;
    const arrow=this.arrows[toR][toC];
    return arrow.symbol!=='' && arrow.color === (this.isWhite(piece)?'white':'black');
  }

  private canCastleKingside(isWhite:boolean){
    const r=isWhite?7:0;
    const flags=this.hasRookMoved[isWhite?'white':'black'][1];
    return !flags && this.isEmpty(r,5) && this.isEmpty(r,6);
  }
  private canCastleQueenside(isWhite:boolean){
    const r=isWhite?7:0;
    const flags=this.hasRookMoved[isWhite?'white':'black'][0];
    return !flags && this.isEmpty(r,1) && this.isEmpty(r,2) && this.isEmpty(r,3);
  }
}
