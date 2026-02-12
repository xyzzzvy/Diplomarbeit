import { Chess } from 'chess.js';
import crypto from 'crypto';

let games = new Map();

function finishGame(gameId){
    //TODO: save to db
    games.delete(gameId);
}

export function registerChessRoutes(app) {

    app.post('/api/chess/create-game', (req, res) => {
        let { white, black } = req.body;

        const game = {
            id: crypto.randomUUID(),
            white: white,
            black: black,
            chess: new Chess(),
            createdAt: Date.now(),
        }

        games.set(game.id, game);

        return res.status(200).json({game: game});
    })

    app.post('/api/chess/move', (req, res) => {
        const { gameId, from, to, promotion } = req.body;

        const game = games.get(gameId);
        if(!game){
            return res.status(404).json({ error: "Game not found" });
        }

        const chess = game.chess;

        const move = chess.move({
            from: from,
            to: to,
            promotion: promotion || 'q'
        });
        if(!move) {
            return res.status(400).json({ error: "Illegal move" });
        }


        const gameOver = chess.isGameOver();
        if(gameOver){
            finishGame(gameId);
        }

        return res.status(200).json({ id: gameId, fen: chess.fen(), pgn: chess.pgn(), status: gameOver });
    });
}
