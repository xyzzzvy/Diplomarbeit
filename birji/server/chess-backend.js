import { Chess } from 'chess.js';
import crypto from 'crypto';

let games = new Map();

function finishGame(gameId){
    //TODO: end game, save to db
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

        return res.status(200).send(game);
    })

    app.post('/api/chess/move', (req, res) => {
        const { gameId, from, to } = req.body;
        //TODO: attempt move, apply move, error handling
    });
}
