// chess.js
import { Chess } from 'chess.js';

export function registerChessRoutes(app) {

    /**
     * Create a new game
     */
    app.post('/api/chess/new', (req, res) => {
        const chess = new Chess();

        res.json({
            fen: chess.fen(),
            turn: chess.turn()
        });
    });

    /**
     * Validate and make a move
     * Move format:
     * {
     *   fen: string,
     *   piece: "p|n|b|r|q|k",
     *   from: "e2",
     *   to: "e4",
     *   promotion?: "q|r|b|n"
     * }
     */
    app.post('/api/chess/move', (req, res) => {
        const { fen, piece, from, to, promotion } = req.body;

        if (!fen || !piece || !from || !to) {
            return res.status(400).json({ error: 'fen, piece, from and to are required' });
        }

        const chess = new Chess(fen);

        // Optional sanity check: piece on square
        const boardPiece = chess.get(from);
        if (!boardPiece || boardPiece.type !== piece) {
            return res.status(400).json({
                error: 'Piece does not match piece on board'
            });
        }

        // Attempt move
        const move = chess.move({
            from,
            to,
            promotion: promotion || 'q'
        });

        if (!move) {
            return res.status(400).json({ error: 'Illegal move' });
        }

        // Game state checks
        const gameOver = chess.isGameOver();
        const result = {
            fen: chess.fen(),
            pgn: chess.pgn(),
            move,
            turn: chess.turn(),
            inCheck: chess.inCheck(),
            inCheckmate: chess.isCheckmate(),
            inStalemate: chess.isStalemate(),
            insufficientMaterial: chess.isInsufficientMaterial(),
            repetition: chess.isThreefoldRepetition(),
            gameOver
        };

        // Determine winner (if game over)
        if (gameOver) {
            if (chess.isCheckmate()) {
                result.winner = move.color === 'w' ? 'white' : 'black';
            } else {
                result.winner = 'draw';
            }
        }

        res.json(result);
    });
}
