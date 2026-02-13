import { Chess } from 'chess.js';
import crypto from 'crypto';

let games = new Map();
let matchmakingQueue = [];

function finishGame(gameId){
    //TODO: save to db
    games.delete(gameId);
}

function createGame(white, black){
    const game = {
        id: crypto.randomUUID(),
        white: white,
        black: black,
        chess: new Chess(),
        createdAt: Date.now(),
    }

    games.set(game.id, game);
    return games[game.id];
}

export function registerChessRoutes(app) {

    app.post('/api/chess/queue-up/:user', (req, res) => {
        const user = req.params.user;
        matchmakingQueue.push(user);
        //TODO: connect to websocket to actually create queue and match once >2 users
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

        return res.status(200).json({ id: gameId, fen: chess.fen(), pgn: chess.pgn(), status: gameOver,  moves: chess.moves({ verbose: true })});
    });
}
