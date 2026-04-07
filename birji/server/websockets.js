import { Server } from 'socket.io';
import crypto from 'crypto';
import { createGame, makeMove } from './game-manager.js';

export function initializeWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    let waitingRoomId = null;

    const playerRooms = new Map();   // socket.id -> roomId
    const roomToGame = new Map();    // roomId -> gameId

    io.on('connection', (socket) => {
        console.log('🔌 connected:', socket.id);
        // =========================
        // JOIN GAME (MATCHMAKING)
        // =========================
        socket.on('join_game', () => {
            console.log('🎮 join_game from:', socket.id);
            console.log('waitingRoomId BEFORE:', waitingRoomId);

            if (playerRooms.has(socket.id)) return;

            // If someone is already waiting → start game
            if (waitingRoomId) {
                const roomId = waitingRoomId;

                socket.join(roomId);
                playerRooms.set(socket.id, roomId);

                waitingRoomId = null;

                // 🎯 CREATE GAME
                const game = createGame('white', 'black');
                roomToGame.set(roomId, game.id);

                // 🚀 SEND INITIAL GAME STATE
                io.to(roomId).emit('game_started', {
                    roomId: roomId,
                    gameId: game.id,
                    fen: game.chess.fen(),
                    moves: game.chess.moves({ verbose: true }),
                    turn: game.chess.turn()
                });

                // 🎨 ASSIGN COLORS
                const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
                if (socketsInRoom.length === 2) {
                    io.to(socketsInRoom[0]).emit('assign_color', 'white');
                    io.to(socketsInRoom[1]).emit('assign_color', 'black');
                }

            } else {
                // No one waiting → create new room
                const newRoomId = crypto.randomUUID();

                socket.join(newRoomId);
                waitingRoomId = newRoomId;
                playerRooms.set(socket.id, newRoomId);

                socket.emit('waiting_for_opponent', {
                    roomId: newRoomId,
                    message: "Warte auf einen Gegner..."
                });
            }
        });


        // =========================
        // HANDLE MOVES (CORE LOGIC)
        // =========================
        socket.on('send_move', ({ roomId, move }) => {
            const gameId = roomToGame.get(roomId);

            if (!gameId) return;

            const result = makeMove(gameId, move);

            // ❌ illegal move
            if (!result) {
                socket.emit('invalid_move');
                return;
            }

            // ✅ send updated state to BOTH players
            io.to(roomId).emit('game_state', {
                fen: result.fen,
                moves: result.moves,
                turn: result.turn
            });
        });


        // =========================
        // DISCONNECT HANDLING
        // =========================
        socket.on('disconnect', () => {
            const roomId = playerRooms.get(socket.id);

            if (roomId) {
                socket.to(roomId).emit('opponent_disconnected', {
                    message: "Dein Gegner hat die Verbindung verloren. Du gewinnst!"
                });

                playerRooms.delete(socket.id);

                if (waitingRoomId === roomId) {
                    waitingRoomId = null;
                }

                // optional cleanup
                // roomToGame.delete(roomId);
            }
        });


    });
}