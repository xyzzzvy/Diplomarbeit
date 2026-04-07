// game-manager.js
import { Chess } from 'chess.js';
import crypto from 'crypto';

export const games = new Map();

export function createGame(white, black) {
    const game = {
        id: crypto.randomUUID(),
        white,
        black,
        chess: new Chess(),
    };

    games.set(game.id, game);
    return game;
}

export function makeMove(gameId, move) {
    const game = games.get(gameId);
    if (!game) return null;

    const result = game.chess.move(move);
    if (!result) return null;

    return {
        fen: game.chess.fen(),
        moves: game.chess.moves({ verbose: true }),
        turn: game.chess.turn(),
        gameOver: game.chess.isGameOver()
    };
}