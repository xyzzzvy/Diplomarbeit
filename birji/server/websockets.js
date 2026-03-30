import { Server } from 'socket.io';
import crypto from 'crypto';

export function initializeWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    let waitingRoomId = null;
    const playerRooms = new Map();

    io.on('connection', (socket) => {
        socket.on('join_game', () => {
            if (playerRooms.has(socket.id)) return;

            if (waitingRoomId) {
                const roomId = waitingRoomId;
                socket.join(roomId);
                playerRooms.set(socket.id, roomId);

                waitingRoomId = null;

                io.to(roomId).emit('game_started', {
                    roomId: roomId,
                    message: "Gegner gefunden! Das Spiel beginnt."
                });

                const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
                if (socketsInRoom.length === 2) {
                    io.to(socketsInRoom[0]).emit('assign_color', 'white');
                    io.to(socketsInRoom[1]).emit('assign_color', 'black');
                }
            } else {
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

        socket.on('send_move', (data) => {
            const { roomId, move } = data;
            socket.to(roomId).emit('receive_move', { move });
        });

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
            }
        });
    });
}